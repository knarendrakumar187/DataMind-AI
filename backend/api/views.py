import os
import pandas as pd
from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.conf import settings

from .models import Dataset, TrainingResult
from .serializers import DatasetSerializer, TrainingResultSerializer, UploadSerializer
from .ml_engine.dataset_analyzer import DatasetAnalyzer
from .ml_engine.model_recommender import ModelRecommender
from .ml_engine.pipeline_generator import PipelineGenerator
from .ml_engine.model_trainer import ModelTrainer
from .ml_engine.llm_client import LLMClient


class UploadDatasetView(APIView):
    def post(self, request):
        try:
            serializer = UploadSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {"error": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            file = serializer.validated_data['file']
            expertise_level = serializer.validated_data.get('expertise_level', 'beginner')

            # Save file
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'datasets')
            os.makedirs(upload_dir, exist_ok=True)

            dataset = Dataset(
                name=file.name,
                file=file,
                status='uploaded'
            )
            dataset.save()

            # Quick row/column count
            try:
                filepath = dataset.file.path
                if filepath.lower().endswith('.xlsx'):
                    df = pd.read_excel(filepath)
                else:
                    df = pd.read_csv(filepath)
                dataset.rows = len(df)
                dataset.columns = len(df.columns)
                dataset.save()
            except Exception:
                pass

            return Response({
                "id": dataset.id,
                "name": dataset.name,
                "rows": dataset.rows,
                "columns": dataset.columns,
                "status": dataset.status,
                "message": "Dataset uploaded successfully! Ready for analysis.",
                "expertise_level": expertise_level,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnalyzeDatasetView(APIView):
    def get(self, request, pk):
        try:
            try:
                dataset = Dataset.objects.get(pk=pk)
            except Dataset.DoesNotExist:
                return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

            filepath = dataset.file.path
            analyzer = DatasetAnalyzer(filepath)
            analysis = analyzer.get_full_analysis()

            dataset.rows = analysis["shape"]["rows"]
            dataset.columns = analysis["shape"]["columns"]
            dataset.task_type = analysis["task_type"]
            dataset.data_quality_score = analysis["data_quality_score"]
            dataset.analysis_result = analysis
            dataset.status = 'analyzed'
            dataset.save()

            return Response({
                "dataset_id": dataset.id,
                "analysis": analysis,
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RecommendModelsView(APIView):
    def get(self, request, pk):
        try:
            try:
                dataset = Dataset.objects.get(pk=pk)
            except Dataset.DoesNotExist:
                return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

            analysis = dataset.analysis_result
            if not analysis:
                analyzer = DatasetAnalyzer(dataset.file.path)
                analysis = analyzer.get_full_analysis()
                dataset.analysis_result = analysis
                dataset.task_type = analysis["task_type"]
                dataset.save()

            recommender = ModelRecommender()
            recommendations = recommender.recommend(analysis)

            expertise = request.query_params.get('expertise_level', 'intermediate')
            llm_explanation = ""
            if recommendations:
                try:
                    llm = LLMClient()
                    llm_explanation = llm.explain_model_recommendation(
                        recommendations[0], analysis, expertise
                    )
                except Exception:
                    llm_explanation = "Explanation unavailable"

            return Response({
                "recommendations": recommendations,
                "llm_explanation": llm_explanation,
                "task_type": analysis.get("task_type", "unknown"),
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GeneratePipelineView(APIView):
    def post(self, request, pk):
        try:
            try:
                dataset = Dataset.objects.get(pk=pk)
            except Dataset.DoesNotExist:
                return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

            model_name = request.data.get("model_name", "")
            target_column = request.data.get("target_column", "")

            if not model_name:
                return Response({"error": "model_name is required"}, status=status.HTTP_400_BAD_REQUEST)

            analysis = dataset.analysis_result or {}
            generator = PipelineGenerator()
            pipeline = generator.generate(analysis, model_name, target_column)

            return Response(pipeline)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TrainModelView(APIView):
    def post(self, request, pk):
        try:
            try:
                dataset = Dataset.objects.get(pk=pk)
            except Dataset.DoesNotExist:
                return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

            model_name = request.data.get("model_name", "")
            target_column = request.data.get("target_column", "")
            expertise_level = request.data.get("expertise_level", "beginner")

            if not model_name:
                return Response({"error": "model_name is required"}, status=status.HTTP_400_BAD_REQUEST)

            analysis = dataset.analysis_result or {}
            trainer = ModelTrainer(dataset.file.path, analysis)
            result = trainer.train(model_name, target_column)

            if not result.get("success"):
                return Response(
                    {"error": result.get("error", "Training failed")},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generate pipeline code
            generator = PipelineGenerator()
            pipeline = generator.generate(analysis, model_name, target_column)
            pipeline_code = pipeline.get("code", "")

            # Save training result
            training_result = TrainingResult(
                dataset=dataset,
                model_name=model_name,
                metrics=result.get("metrics", {}),
                pipeline_code=pipeline_code,
                expertise_level=expertise_level,
            )
            training_result.save()
            dataset.status = 'trained'
            dataset.save()

            # LLM explanation
            llm_explanation = ""
            try:
                llm = LLMClient()
                llm_explanation = llm.explain_results(
                    result.get("metrics", {}),
                    analysis.get("task_type", "unknown"),
                    model_name,
                    expertise_level,
                )
            except Exception:
                llm_explanation = "Explanation unavailable"

            return Response({
                "metrics": result.get("metrics", {}),
                "llm_explanation": llm_explanation,
                "top_features": result.get("top_features", []),
                "pipeline_code": pipeline_code,
                "training_samples": result.get("training_samples", 0),
                "test_samples": result.get("test_samples", 0),
                "feature_count": result.get("feature_count", 0),
                "model_name": model_name,
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExplainView(APIView):
    def post(self, request):
        try:
            dataset_id = request.data.get("dataset_id")
            expertise_level = request.data.get("expertise_level", "beginner")

            try:
                dataset = Dataset.objects.get(pk=dataset_id)
            except Dataset.DoesNotExist:
                return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

            analysis = dataset.analysis_result or {}
            llm = LLMClient()

            explanation = llm.explain_dataset(analysis, expertise_level)
            abb_insights = llm.generate_abb_insights(analysis, {})

            return Response({
                "explanation": explanation,
                "abb_insights": abb_insights,
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatView(APIView):
    def post(self, request):
        try:
            message = request.data.get("message", "")
            dataset_id = request.data.get("dataset_id")
            expertise_level = request.data.get("expertise_level", "beginner")
            model_name = request.data.get("model_name", "")

            if not message:
                return Response({"error": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

            context = {"model_name": model_name}
            if dataset_id:
                try:
                    dataset = Dataset.objects.get(pk=dataset_id)
                    analysis = dataset.analysis_result or {}
                    context.update({
                        "task_type": analysis.get("task_type", "unknown"),
                        "rows": analysis.get("shape", {}).get("rows", 0),
                    })
                except Dataset.DoesNotExist:
                    pass

            llm = LLMClient()
            response_text = llm.answer_question(message, context, expertise_level)

            return Response({
                "response": response_text,
                "timestamp": datetime.now().isoformat(),
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DatasetListView(APIView):
    def get(self, request):
        try:
            datasets = Dataset.objects.all().order_by('-uploaded_at')
            serializer = DatasetSerializer(datasets, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
