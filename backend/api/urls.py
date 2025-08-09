from django.urls import path
from .views import (
    CreateUserView,
    ReportIssueView,
    MyIssuesView,
    # AllIssuesView,
    # ResolveIssueView,
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
    CreateAdminView,
    update_comment,
    user_info,
    update_user,
    
)

urlpatterns = [
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('report/', ReportIssueView.as_view(), name='report-issue'),
    path('my-issues/', MyIssuesView.as_view(), name='my-issues'),
    # path('all-issues/', AllIssuesView.as_view(), name='all-issues'),
    # path('issues-map/', AllIssuesView.as_view(), name='issues-map'),
    # path('resolve/<int:pk>/', ResolveIssueView.as_view(), name='resolve-issue'),
    path('user/info/', user_info, name='user-info'),
    path('update-issue/<int:pk>/', UpdateIssueView.as_view(), name='update-issue'),
    path('issue/<int:issue_id>/upvote/', upvote_issue, name='upvote-issue'),
path('issue/<int:issue_id>/remove-vote/', remove_vote_issue, name='remove-vote'),
path('issue/<int:issue_id>/', get_issue_detail, name='issue-detail'),
 path('comment/<int:comment_id>/update/', update_comment, name='update_comment'),
    path('public-issues/', public_issues, name='public-issues'),
    path('issue/<int:issue_id>/comments/', comments_view, name='comments_view'),
    path('comment/<int:comment_id>/delete/', delete_comment, name='delete_comment'),
    # path("issue/<int:pk>/update-status/", update_issue_status),
    path('admin/register/', CreateAdminView.as_view(), name='admin-register'),
    path('issue/<int:pk>/update/', UpdateIssueView.as_view(), name='update-issue'),
    path('issue/<int:pk>/delete/', DeleteIssueView.as_view(), name='delete-issue'),
path('user-voted-issues/', user_voted_issues, name='user-voted-issues'),

    path('user/update/', update_user, name='update-user'),

]

