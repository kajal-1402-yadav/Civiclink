from django.contrib import admin
from django.utils.html import format_html
from .models import CustomUser, Issue

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'is_staff', 'is_superuser']
    list_filter = ['role', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email']
    
from datetime import date
from django.utils.html import format_html
from django.contrib import admin
from .models import Issue, CustomUser

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'status',
        'category',
        'priority',
        'reporter',
        'resolved_by',
        'address',
        'created_at',
        'days_open',  # ✅ Add this
    ]
    list_filter = ['status', 'category', 'priority']
    search_fields = ['title', 'description', 'address']
    readonly_fields = ['created_at', 'updated_at', 'reporter']
    list_editable = ['status', 'priority']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "resolved_by":
            kwargs["queryset"] = CustomUser.objects.filter(role='admin')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        if obj.status == 'resolved' and not obj.resolved_by:
            obj.resolved_by = request.user
        super().save_model(request, obj, form, change)

    def days_open(self, obj):
        if obj.status == 'resolved' and obj.updated_at:
            return (obj.updated_at.date() - obj.created_at.date()).days
        return (date.today() - obj.created_at.date()).days
    days_open.short_description = 'Open (Days)'


