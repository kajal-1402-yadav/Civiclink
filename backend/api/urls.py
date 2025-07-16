from django.urls import path
from .views import (
    CreateUserView,
    ReportIssueView,
    MyIssuesView,
    AllIssuesView,
    ResolveIssueView,
    user_info,
    UpdateIssueView,
    upvote_issue,
    downvote_issue,
    public_issues,
    delete_comment,
    comments_view,
    CreateAdminView,
    update_issue_status,
    user_info,
    update_user,
    
)

urlpatterns = [
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('report/', ReportIssueView.as_view(), name='report-issue'),
    path('my-issues/', MyIssuesView.as_view(), name='my-issues'),
    path('all-issues/', AllIssuesView.as_view(), name='all-issues'),
    path('issues-map/', AllIssuesView.as_view(), name='issues-map'),
    path('resolve/<int:pk>/', ResolveIssueView.as_view(), name='resolve-issue'),
    path('user/info/', user_info, name='user-info'),
    path('update-issue/<int:pk>/', UpdateIssueView.as_view(), name='update-issue'),
    path('issue/<int:issue_id>/upvote/', upvote_issue, name='upvote_issue'),    
    path('issue/<int:issue_id>/downvote/',downvote_issue, name='downvote_issue'),
    path('public-issues/', public_issues, name='public-issues'),
    path('issue/<int:issue_id>/comments/', comments_view, name='comments_view'),
    path('comment/<int:comment_id>/delete/', delete_comment, name='delete_comment'),
    path("issue/<int:pk>/update-status/", update_issue_status),
    path('admin/register/', CreateAdminView.as_view(), name='admin-register'),
    path('issue/<int:pk>/update/', UpdateIssueView.as_view(), name='update-issue'),
    path('user/update/', update_user, name='update-user'),

 

]

