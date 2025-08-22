from rest_framework import serializers
from .models import CustomUser, Issue ,Comment
from datetime import date
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class UserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S.%fZ", read_only=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 'role', 'profile_picture', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True},
        }

    def validate_email(self, value: str):
        value = (value or '').strip().lower()
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value

    def validate_username(self, value: str):
        value = (value or '').strip()
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken. Please choose another.")
        return value

    def validate(self, attrs):
        # Confirm password match
        password = attrs.get('password')
        confirm = attrs.get('confirm_password')
        if password != confirm:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # Custom password policy: min 8, at least one special char, one lowercase
        pwd = password or ""
        errors = []
        if len(pwd) < 8:
            errors.append("Must be at least 8 characters long.")
        if not any(c.islower() for c in pwd):
            errors.append("Must contain at least one lowercase letter.")
        if not any(not c.isalnum() for c in pwd):
            errors.append("Must include at least one special character.")
        if errors:
            raise serializers.ValidationError({"password": errors})

        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        if 'email' in validated_data and validated_data['email']:
            validated_data['email'] = validated_data['email'].strip().lower()
        return CustomUser.objects.create_user(**validated_data)
    

class CommentSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    issue_title = serializers.CharField(source='issue.title', read_only=True)  

    class Meta:
        model = Comment
        fields = ['id', 'issue', 'issue_title', 'user_id', 'user_username', 'text', 'created_at']


class IssueSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    resolved_by_username = serializers.SerializerMethodField()
    image = serializers.ImageField(use_url=True, required=False)
    days_open = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    upvotes_count = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['reporter', 'resolved_by']  

    def get_days_open(self, obj):
        if obj.status and obj.status.lower() == 'resolved' and obj.updated_at:
            return (obj.updated_at.date() - obj.created_at.date()).days
        return (date.today() - obj.created_at.date()).days

    def get_upvotes_count(self, obj):
        return obj.upvotes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_user_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(pk=request.user.pk).exists()
        return False

    def get_resolved_by_username(self, obj):
        if obj.resolved_by:
            return obj.resolved_by.username
        return None

    def create(self, validated_data):
        if 'priority' not in validated_data or not validated_data['priority']:
            category = validated_data.get('category', '').lower()
            if category in ['electricity', 'water']:
                validated_data['priority'] = 'high'
            elif category in ['garbage', 'road']:
                validated_data['priority'] = 'medium'
            else:
                validated_data['priority'] = 'low'
        return super().create(validated_data)
