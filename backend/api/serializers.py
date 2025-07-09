from rest_framework import serializers
from .models import CustomUser, Issue ,Comment
from datetime import date

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)

class IssueSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    resolved_by_username = serializers.CharField(source='resolved_by.username', read_only=True)
    image = serializers.ImageField(use_url=True, required=False)
    days_open = serializers.SerializerMethodField()  # ✅ Add this

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['reporter', 'resolved_by', 'upvotes', 'downvotes']

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
    
    def get_days_open(self, obj):
        if obj.status == 'resolved' and obj.updated_at:
            return (obj.updated_at.date() - obj.created_at.date()).days
        return (date.today() - obj.created_at.date()).days

        
        
class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'issue', 'user', 'user_username', 'text', 'created_at']
        read_only_fields = ['user', 'created_at']
