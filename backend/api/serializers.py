from rest_framework import serializers
from .models import CustomUser, Issue ,Comment
from datetime import date

class UserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S.%fZ", read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'role', 'profile_picture', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True},
        }

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)
    

        
        
from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'issue', 'user_id', 'user_username', 'text', 'created_at']


class IssueSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    resolved_by_username = serializers.SerializerMethodField()


    image = serializers.ImageField(use_url=True, required=False)
    days_open = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    upvotes_count = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['reporter', 'resolved_by']  # upvotes handled separately

    def get_days_open(self, obj):
        if obj.status == 'resolved' and obj.updated_at:
            return (obj.updated_at.date() - obj.created_at.date()).days
        return (date.today() - obj.created_at.date()).days

    def get_upvotes_count(self, obj):
        return obj.upvotes.count()

    def get_user_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(pk=request.user.pk).exists()
            return False
    def get_upvotes_count(self, obj):
        return obj.upvotes.count()

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