from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Issue
from datetime import date

# ✅ CustomUser Admin using UserAdmin
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_staff', 'is_superuser')  # Removed 'name'
    list_filter = ('role', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')

    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role',)}),  # Removed 'name'
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role',)}),  # Removed 'name'
    )

# ✅ Issue Admin
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
        'days_open',
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
