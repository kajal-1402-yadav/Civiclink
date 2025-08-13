from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import os


# ✅ Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(username, email, password, **extra_fields)

# ✅ Custom User Model
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('reporter', 'Reporter'),
        ('admin', 'Admin'),
    )
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='reporter')
    objects = CustomUserManager()

    def __str__(self):
        return self.username


class Issue(models.Model):
    STATUS_CHOICES = (
        ('Open', 'Open'),
        ('Acknowledged', 'Acknowledged'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    )

    CATEGORY_CHOICES = (
        ('road', 'Road'),
        ('garbage', 'Garbage'),
        ('water', 'Water'),
        ('electricity', 'Electricity'),
        ('other', 'Other'),
    )
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='issue_images/', blank=True, null=True)
    address = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    reporter = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='reported_issues')
    resolved_by = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_issues')

    # Replace integer upvotes with ManyToMany field
    upvotes = models.ManyToManyField('CustomUser', related_name='upvoted_issues', blank=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

    def delete(self, *args, **kwargs):
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)
        super().delete(*args, **kwargs)

    # Optional: helper method to get vote count
    @property
    def upvotes_count(self):
        return self.upvotes.count()


class Comment(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.issue.title}"


