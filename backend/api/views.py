from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .permissions import IsAdmin
\
from .models import CustomUser, Issue ,Comment
from .serializers import UserSerializer, IssueSerializer ,CommentSerializer
from .classify import classify_issue_image
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import DestroyAPIView

# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync



#  Inline Admin permission
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class CreateAdminView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # You can restrict this later

    def perform_create(self, serializer):
        serializer.save(role='admin')



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

class DeleteIssueView(DestroyAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # reporters can only delete their own issues
        return Issue.objects.filter(reporter=self.request.user)
    
    
    def perform_destroy(self, instance):
        instance.delete()  # T


#  View issues created by current user
class MyIssuesView(generics.ListAPIView):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(reporter=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upvote_issue(request, issue_id):
    user = request.user
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND)

    if issue.upvotes.filter(pk=user.pk).exists():
        return Response({"message": "Already voted"}, status=status.HTTP_400_BAD_REQUEST)

    issue.upvotes.add(user)
    return Response({"message": "Vote added"}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_vote_issue(request, issue_id):
    user = request.user
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND)

    if issue.upvotes.filter(pk=user.pk).exists():
        issue.upvotes.remove(user)
        return Response({"message": "Vote removed"}, status=status.HTTP_200_OK)
    else:
        return Response({"message": "No vote to remove"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_voted_issues(request):
    user = request.user
    # Get issue IDs the user has voted on
    voted_issue_ids = user.upvoted_issues.values_list('id', flat=True)
    data = [{"issueId": issue_id} for issue_id in voted_issue_ids]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_issue_detail(request, issue_id):
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND)

    user_has_voted = issue.upvotes.filter(pk=request.user.pk).exists()

    data = {
        "id": issue.id,
        "title": issue.title,
        "description": issue.description,
        "status": issue.status,
        "category": issue.category,
        "priority": issue.priority,
        "created_at": issue.created_at.isoformat(),
        "upvotes_count": issue.upvotes.count(),
        "user_has_voted": user_has_voted,
        "reporter_username": issue.reporter.username if issue.reporter else None,
        "image": issue.image.url if issue.image else None,
        "address": issue.address,
    }
    return Response(data, status=status.HTTP_200_OK)

    
@api_view(['GET'])
@permission_classes([AllowAny])
def public_issues(request):
    issues = Issue.objects.all() 
    serializer = IssueSerializer(issues, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def comments_view(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)

    if request.method == "GET":
        comments = Comment.objects.filter(issue=issue).order_by("created_at")
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, issue=issue)
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_issue_status(request, pk):
    try:
        issue = Issue.objects.get(pk=pk)

        # Optional: restrict who can change status
        if issue.reporter != request.user and request.user.role != 'admin':
            return Response({"error": "Not authorized to update this issue"}, status=403)

        new_status = request.data.get("status")
        valid_statuses = [choice[0] for choice in Issue.STATUS_CHOICES]

        if new_status == "Closed" and request.user.role != "admin":
            return Response({"error": "Only admin can close issues"}, status=403)


        issue.status = new_status
        issue.save()
        return Response({"message": "Status updated", "status": issue.status}, status=200)

    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    profile_picture_url = (
        request.build_absolute_uri(request.user.profile_picture.url)
        if request.user.profile_picture
        else None
    )

    return Response({
        "username": request.user.username,
        "email": request.user.email,
        "role": request.user.role,
        "date_joined": request.user.date_joined.isoformat(),  # ✅ must be iso string
        "profile_picture": profile_picture_url,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    data = request.data

    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data and data['password'].strip() != "":
        user.set_password(data['password'])

    # ✅ Handle profile picture upload
    if 'profile_picture' in request.FILES:
        user.profile_picture = request.FILES['profile_picture']

    user.save()

    serializer = UserSerializer(user, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_comment(request, comment_id):
    try:
        # Only allow editing own comments
        comment = Comment.objects.get(id=comment_id, user=request.user)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found or permission denied."}, status=status.HTTP_404_NOT_FOUND)

    text = request.data.get("text", "").strip()
    if not text:
        return Response({"error": "Text cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

    comment.text = text
    comment.save()
    serializer = CommentSerializer(comment)
    return Response(serializer.data, status=status.HTTP_200_OK)