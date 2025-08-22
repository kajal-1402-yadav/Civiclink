from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.utils.timezone import localtime
from .models import CustomUser, Issue ,Comment
from .serializers import UserSerializer, IssueSerializer ,CommentSerializer
from .classify import classify_issue_image
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import DestroyAPIView
import os
import tempfile
import traceback
from PIL import Image


#  Create User (Signup)
class CreateUserView(generics.CreateAPIView):
    """Public signup endpoint.
    Creates a new user with role fixed to 'reporter'.
    Password hashing is handled in the serializer/model create_user.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        serializer.save(role='reporter')

#  Report Issue (by Reporter)
class ReportIssueView(generics.CreateAPIView):
    """Authenticated reporters create a new Issue.
    After saving, we optionally classify the uploaded image to auto-set category.
    Animated images are rejected in create(); classification thresholds apply.
    """
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        issue = serializer.save(reporter=self.request.user)

        predicted_category = None
        confidence = None

        if issue.image:
            try:
                try:
                    with Image.open(issue.image.path) as im:
                        is_animated = getattr(im, "is_animated", False) or getattr(im, "n_frames", 1) > 1
                except Exception:
                    is_animated = False

                if is_animated:
                    # Skip classification for animated images; treat as unknown
                    predicted_category, confidence = "unknown", 0.0
                else:
                    # Client may send a tentative category+confidence from precheck
                    client_cat = self.request.data.get("category")
                    client_conf = self.request.data.get("confidence")
                    parsed_conf = None
                    if client_conf is not None:
                        try:
                            parsed_conf = float(client_conf)
                        except (TypeError, ValueError):
                            parsed_conf = None

                    def passes_threshold(cat, conf):
                        # Enforce server-side thresholds. 'other' requires higher confidence.
                        if cat not in VALID_CATEGORIES or conf is None:
                            return False
                        if cat == "other":
                            return conf >= 0.6
                        return conf >= 0.5

                    if passes_threshold(client_cat, parsed_conf):
                        predicted_category, confidence = client_cat, parsed_conf
                    else:
                        image_path = issue.image.path
                        predicted_category, confidence = classify_issue_image(
                            image_path, threshold=0.5, other_threshold=0.6
                        )
                if predicted_category in VALID_CATEGORIES:
                    issue.category = predicted_category
                issue.save()
                print(f"[DL] Image classified as: {predicted_category} ({confidence*100:.2f}% confidence)")
            except Exception as e:
                print(f"[DL] Image classification failed: {e}")

        self.extra_response_data = {
            "category": predicted_category,
            "confidence": confidence,
        }

    def create(self, request, *args, **kwargs):
        """Override to hard-block animated images at upload time.
        We read bytes to detect animation, then reset file pointer.
        """
        uploaded = request.FILES.get('image')
        if uploaded is not None:
            raw = uploaded.read()
            try:
                if is_animated_bytes(raw):
                    return Response({
                        "error": "Animated images are not allowed",
                        "reason": "animated_image"
                    }, status=status.HTTP_400_BAD_REQUEST)
            finally:
                try:
                    uploaded.seek(0)
                except Exception:
                    pass

        response = super().create(request, *args, **kwargs)
        if hasattr(self, 'extra_response_data'):
            response.data.update(self.extra_response_data)
        return response



# Allowed ML categories. The UI and thresholds rely on this list.
VALID_CATEGORIES = ['water', 'road', 'electricity', 'garbage', 'other']

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_image(request):
    """Predict category for an uploaded image (no DB write).
    Rejects/flags animated images, applies thresholds ('other' stricter).
    Returns: category, confidence, and is_unknown flag.
    """
    uploaded_file = request.FILES.get('image')
    if not uploaded_file:
        return Response({"error": "No image uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    raw = uploaded_file.read()
    try:
        if is_animated_bytes(raw):
            return Response({
                "category": "unknown",
                "confidence": 0.0,
                "is_unknown": True,
                "reason": "animated_image"
            })
    finally:
        try:
            uploaded_file.seek(0)
        except Exception:
            pass

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        for chunk in uploaded_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        try:
            with Image.open(tmp_path) as im:
                is_animated = getattr(im, "is_animated", False) or getattr(im, "n_frames", 1) > 1
        except Exception:
            is_animated = False

        if is_animated:
            return Response({
                "category": "unknown",
                "confidence": 0.0,
                "is_unknown": True,
                "reason": "animated_image"
            })

        # Run classifier with explicit thresholds
        category, confidence = classify_issue_image(tmp_path, threshold=0.5, other_threshold=0.6)

        if category not in VALID_CATEGORIES:
            category = "unknown"
            confidence = 0.0
            is_unknown = True
        else:
            if category == "other" and confidence < 0.6:
                category = "unknown"
                confidence = 0.0
                is_unknown = True
            else:
                is_unknown = category == "unknown" or confidence < 0.5

        return Response({
            "category": category,
            "confidence": confidence,
            "is_unknown": is_unknown
        })

    except Exception as e:
        print("[ERROR] Image classification failed:")
        traceback.print_exc()
        return Response({
            "category": "unknown",
            "confidence": 0.0,
            "is_unknown": True,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


class UpdateIssueView(generics.RetrieveUpdateAPIView):
    """Reporters can edit their own issues; admins can edit any.
    If admin marks Resolved/Closed, we record who resolved it.
    """
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins can update any issue; reporters can update only their own
        if getattr(self.request.user, 'role', None) == 'admin':
            return Issue.objects.all()
        return Issue.objects.filter(reporter=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        # If an admin resolves the issue, record who resolved it
        try:
            if instance.status in ('Resolved', 'Closed') and getattr(self.request.user, 'role', None) == 'admin':
                if instance.resolved_by_id != self.request.user.id:
                    instance.resolved_by = self.request.user
                    instance.save(update_fields=['resolved_by'])
        except Exception:
            pass

class DeleteIssueView(DestroyAPIView):
    """Allow a reporter to delete only their own issues."""
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(reporter=self.request.user)
    
    
    def perform_destroy(self, instance):
        instance.delete()  


class MyIssuesView(generics.ListAPIView):
    """List only the authenticated user's own issues."""
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(reporter=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upvote_issue(request, issue_id):
    """Toggle an upvote on an issue.
    - Self-vote is a no-op: 200 with unchanged count, user_has_voted=False.
    - Otherwise toggles presence in issue.upvotes ManyToMany.
    Always returns current upvotes_count and user_has_voted.
    """
    user = request.user
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND)

    if issue.reporter == user:
        # No-op for self-vote: do not treat as error, do not change counts
        return Response({
            "message": "Self-vote not allowed",
            "upvotes_count": issue.upvotes.count(),
            "user_has_voted": False,
        }, status=status.HTTP_200_OK)

    if issue.upvotes.filter(pk=user.pk).exists():
        issue.upvotes.remove(user)
        return Response({
            "message": "Vote removed",
            "upvotes_count": issue.upvotes.count(),
            "user_has_voted": False,
        }, status=status.HTTP_200_OK)

    issue.upvotes.add(user)
    return Response({
        "message": "Vote added",
        "upvotes_count": issue.upvotes.count(),
        "user_has_voted": True,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_vote_issue(request, issue_id):
    """Legacy explicit remove endpoint (kept for compatibility)."""
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
    voted_issues = user.upvoted_issues.all()

    data = [
        {
            "issue_id": issue.id,
            "issue_title": issue.title,
        }
        for issue in voted_issues
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_issue_detail(request, issue_id):
    """Return a public detail payload for a single issue including
    current upvotes count and whether the requesting user has voted.
    """
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
        "resolved_by_username": issue.resolved_by.username if issue.resolved_by else None,
        "image": issue.image.url if issue.image else None,
        "address": issue.address,
    }
    return Response(data, status=status.HTTP_200_OK)

    
@api_view(['GET'])
@permission_classes([AllowAny])
def public_issues(request):
    """Unauthenticated list of all issues (for community feed)."""
    issues = Issue.objects.all() 
    serializer = IssueSerializer(issues, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def comments_view(request, issue_id):
    """List or create comments for a given issue.
    GET returns all comments; POST creates a new comment by the user.
    """
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
    """Delete a comment owned by the authenticated user."""
    try:
        comment = Comment.objects.get(id=comment_id)
        if comment.user != request.user:
            return Response({"error": "You can only delete your own comments."}, status=403)

        comment.delete()
        return Response({"message": "Comment deleted"}, status=204)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found"}, status=404)


 


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """Return basic profile information for the authenticated user."""
    profile_picture_url = (
        request.build_absolute_uri(request.user.profile_picture.url)
        if request.user.profile_picture
        else None
    )

    return Response({
        "username": request.user.username,
        "email": request.user.email,
        "role": request.user.role,
        "date_joined": request.user.date_joined.isoformat(), 
        "profile_picture": profile_picture_url,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    """Update username, email, password, and/or profile picture for the
    authenticated user. Password is re-hashed via set_password.
    """
    user = request.user
    data = request.data

    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data and data['password'].strip() != "":
        user.set_password(data['password'])

    if 'profile_picture' in request.FILES:
        user.profile_picture = request.FILES['profile_picture']

    user.save()

    serializer = UserSerializer(user, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_comment(request, comment_id):
    """Edit comment text for a comment owned by the authenticated user."""
    try:
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_comments(request):
    """List the authenticated user's recent comments with count."""
    user = request.user
    comments = Comment.objects.filter(user=user).order_by('-created_at')
    serializer = CommentSerializer(comments, many=True)
    return Response({
        'count': comments.count(),
        'comments': serializer.data[:10],  
    })


@api_view(['GET'])
@permission_classes([AllowAny])  
def recent_activity(request):
    """Public endpoint: recent issues for the home page activity section."""
    issues = Issue.objects.select_related('reporter').order_by('-created_at')[:5]  
    data = [
        {
            "id": issue.id,
            "title": issue.title,
            "description": issue.description,
            "category": issue.category,
            "status": issue.status,
            "created_at": localtime(issue.created_at).isoformat(),  
            "reporter": issue.reporter.username
        }
        for issue in issues
    ]
    return Response(data)


def is_animated_bytes(data: bytes) -> bool:
    """Detect common animated formats by signature without full decode.
    Supports GIF, APNG, and WebP (VP8X) animation flag.
    """
    try:
        if data[:6] in (b"GIF87a", b"GIF89a"):
            return True

        idx = data.find(b"VP8X")
        if idx != -1 and idx + 9 < len(data):
            flags = data[idx + 8]
            if flags & 0x02:
                return True

        if data.startswith(b"\x89PNG\r\n\x1a\n") and b"acTL" in data:
            return True
    except Exception:
        pass
    return False
