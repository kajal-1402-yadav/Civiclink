from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'



class IsAdminOrReporterOfIssue(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or obj.reporter == request.user
