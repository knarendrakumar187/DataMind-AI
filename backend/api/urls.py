from django.urls import path
from .views import (
    UploadDatasetView, AnalyzeDatasetView, RecommendModelsView,
    GeneratePipelineView, TrainModelView, ExplainView, ChatView, DatasetListView
)

urlpatterns = [
    path('upload/', UploadDatasetView.as_view(), name='upload'),
    path('analyze/<int:pk>/', AnalyzeDatasetView.as_view(), name='analyze'),
    path('recommend/<int:pk>/', RecommendModelsView.as_view(), name='recommend'),
    path('pipeline/<int:pk>/', GeneratePipelineView.as_view(), name='pipeline'),
    path('train/<int:pk>/', TrainModelView.as_view(), name='train'),
    path('explain/', ExplainView.as_view(), name='explain'),
    path('chat/', ChatView.as_view(), name='chat'),
    path('datasets/', DatasetListView.as_view(), name='datasets'),
]
