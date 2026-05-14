from django.db import models


class Dataset(models.Model):
    TASK_CHOICES = [
        ('classification', 'Classification'),
        ('regression', 'Regression'),
        ('clustering', 'Clustering'),
        ('time_series', 'Time Series'),
        ('unknown', 'Unknown'),
    ]
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('analyzed', 'Analyzed'),
        ('trained', 'Trained'),
        ('error', 'Error'),
    ]

    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    rows = models.IntegerField(null=True, blank=True)
    columns = models.IntegerField(null=True, blank=True)
    task_type = models.CharField(max_length=50, null=True, blank=True, choices=TASK_CHOICES)
    data_quality_score = models.FloatField(null=True, blank=True)
    analysis_result = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, default='uploaded', choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.task_type or 'unanalyzed'})"


class TrainingResult(models.Model):
    EXPERTISE_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('expert', 'Expert'),
    ]

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='training_results')
    model_name = models.CharField(max_length=100)
    metrics = models.JSONField()
    pipeline_code = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    expertise_level = models.CharField(max_length=20, default='beginner', choices=EXPERTISE_CHOICES)

    def __str__(self):
        return f"{self.model_name} on {self.dataset.name}"
