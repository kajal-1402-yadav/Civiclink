from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .permissions import IsAdmin
from .models import CustomUser, Issue ,Comment
from .serializers import UserSerializer, IssueSerializer ,CommentSerializer
from .classify import classify_issue_image
from rest_framework.decorators import api_view, permission_classes


#  Inline Admin permission
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

# 👤 Create User (Signup)
class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        # Force all registered users to be 'reporter'
        serializer.save(role='reporter')

#  Report Issue (by Reporter)
class ReportIssueView(generics.CreateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        issue = serializer.save(reporter=self.request.user)

        predicted_category = None
        confidence = None

        if issue.image:
            try:
                image_path = issue.image.path
                predicted_category, confidence = classify_issue_image(image_path)  # ✅ DL Model result
                issue.category = predicted_category
                issue.save()
                print(f"[DL] ✅ Image classified as: {predicted_category} ({confidence*100:.2f}% confidence)")
            except Exception as e:
                print(f"[DL] ❌ Image classification failed: {e}")

        # ✅ Store for response
        self.extra_response_data = {
            "category": predicted_category,
            "confidence": confidence,
        }

        # ✅ WebSocket: Notify all listening clients about the new issue
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "issues",  # Channel group name (you'll later subscribe to this group from frontend WebSocket)
            {
                "type": "send_new_issue",  # This triggers the method `send_new_issue()` in your consumer.py
                "message": f"New issue reported: {issue.title}",
            }
        )


    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # ✅ Append DL result to the response
        if hasattr(self, 'extra_response_data'):
            response.data.update(self.extra_response_data)
        return response

#Update issue


class UpdateIssueView(generics.RetrieveUpdateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # ✅ Only allow reporters to update their own issues
        return Issue.objects.filter(reporter=self.request.user)




#  View issues created by current user
class MyIssuesView(generics.ListAPIView):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(reporter=self.request.user)

#  View all issues
class AllIssuesView(generics.ListAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]  # Or AllowAny if public

#  Admin resolves an issue
class ResolveIssueView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            issue = Issue.objects.get(pk=pk)
        except Issue.DoesNotExist:
            return Response({'error': 'Issue not found'}, status=404)

        if issue.status == 'resolved':   # ✅ Correct comparison
            return Response({'message': 'Already resolved'}, status=400)

        issue.status = 'resolved'   # ✅ Correct update
        issue.resolved_by = request.user
        issue.save()
        return Response({'message': 'Issue marked as resolved'})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    return Response({
        "username": request.user.username,
        "role": request.user.role,
    })


@api_view(['POST'])
def upvote_issue(request, issue_id):
    try:
        issue = Issue.objects.get(id=issue_id)
        issue.upvotes += 1
        issue.save()
        return Response({"upvotes": issue.upvotes}, status=status.HTTP_200_OK)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def downvote_issue(request, issue_id):
    try:
        issue = Issue.objects.get(id=issue_id)
        issue.downvotes += 1
        issue.save()
        return Response({"downvotes": issue.downvotes}, status=status.HTTP_200_OK)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
@api_view(['GET'])
@permission_classes([AllowAny])
def public_issues(request):
    issues = Issue.objects.all() 
    serializer = IssueSerializer(issues, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def comments_view(request, issue_id):
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        comments = Comment.objects.filter(issue=issue).order_by("created_at")
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(issue=issue, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)

        # Optional: Only allow user to delete their own comment
        if comment.user != request.user:
            return Response({"error": "You can only delete your own comments."}, status=403)

        comment.delete()
        return Response({"message": "Comment deleted"}, status=204)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found"}, status=404)


