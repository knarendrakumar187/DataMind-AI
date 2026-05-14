from rest_framework import serializers
from .models import Dataset, TrainingResult


class DatasetSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, required=False)
    uploaded_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Dataset
        fields = ['id', 'name', 'file', 'uploaded_at', 'rows', 'columns',
                  'task_type', 'data_quality_score', 'status']


class TrainingResultSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = TrainingResult
        fields = ['id', 'dataset', 'model_name', 'metrics', 'pipeline_code',
                  'created_at', 'expertise_level']


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    expertise_level = serializers.ChoiceField(
        choices=['beginner', 'intermediate', 'expert'],
        default='beginner'
    )

    def validate_file(self, value):
        # Check file extension
        filename = value.name.lower()
        if not (filename.endswith('.csv') or filename.endswith('.xlsx')):
            raise serializers.ValidationError(
                "Only .csv and .xlsx files are supported."
            )
        # Check file size (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size ({value.size / (1024*1024):.1f}MB) exceeds the 10MB limit."
            )
        return value
