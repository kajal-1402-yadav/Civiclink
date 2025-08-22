from django.urls import path
from .views import (
    CreateUserView,
    ReportIssueView,
    MyIssuesView,
    user_info,
    UpdateIssueView,
    DeleteIssueView,
    upvote_issue,
    remove_vote_issue,
    get_issue_detail,
    user_voted_issues,
    public_issues,
    delete_comment,
    comments_view,
    update_comment,
    update_user,
    my_comments,
    recent_activity,
    predict_image 
)

urlpatterns = [
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('report/', ReportIssueView.as_view(), name='report-issue'),
    path('my-issues/', MyIssuesView.as_view(), name='my-issues'),
    path('my-comments/', my_comments, name='my-comments'),
    path('recent-activity/', recent_activity, name='recent_activity'),
    path("predict-image/", predict_image, name="predict-image"),
    path('user/info/', user_info, name='user-info'),
    path('update-issue/<int:pk>/', UpdateIssueView.as_view(), name='update-issue'),
    path('issue/<int:issue_id>/upvote/', upvote_issue, name='upvote-issue'),
    path('issue/<int:issue_id>/remove-vote/', remove_vote_issue, name='remove-vote'),
    path('issue/<int:issue_id>/', get_issue_detail, name='issue-detail'),
    path('comment/<int:comment_id>/update/', update_comment, name='update_comment'),
    path('public-issues/', public_issues, name='public-issues'),
    path('issue/<int:issue_id>/comments/', comments_view, name='comments_view'),
    path('comment/<int:comment_id>/delete/', delete_comment, name='delete_comment'),
    path('issue/<int:pk>/delete/', DeleteIssueView.as_view(), name='delete-issue'),
    path('user-voted-issues/', user_voted_issues, name='user-voted-issues'),
    path('user/update/', update_user, name='update-user'),
]

