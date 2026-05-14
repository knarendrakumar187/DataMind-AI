class ModelRecommender:
    MODELS = {
        "classification": [
            {
                "name": "Random Forest Classifier",
                "sklearn_class": "RandomForestClassifier",
                "import_line": "from sklearn.ensemble import RandomForestClassifier",
                "when_to_use": "Works well for most classification tasks with mixed feature types.",
                "pros": ["Handles missing values well", "No feature scaling needed", "Built-in feature importance"],
                "cons": ["Slower than linear models", "Less interpretable"],
                "complexity": "medium",
                "needs_scaling": False,
                "min_samples": 50,
                "base_score": 70,
            },
            {
                "name": "XGBoost Classifier",
                "sklearn_class": "XGBClassifier",
                "import_line": "from xgboost import XGBClassifier",
                "when_to_use": "Best for large datasets and tabular data competitions.",
                "pros": ["State-of-the-art performance", "Handles imbalanced classes", "Fast training"],
                "cons": ["Requires tuning", "More complex"],
                "complexity": "high",
                "needs_scaling": False,
                "min_samples": 100,
                "base_score": 68,
            },
            {
                "name": "Logistic Regression",
                "sklearn_class": "LogisticRegression",
                "import_line": "from sklearn.linear_model import LogisticRegression",
                "when_to_use": "Fast, interpretable baseline for binary or multi-class classification.",
                "pros": ["Highly interpretable", "Fast training", "Works well with small data"],
                "cons": ["Assumes linear boundary", "Struggles with complex relationships"],
                "complexity": "low",
                "needs_scaling": True,
                "min_samples": 20,
                "base_score": 62,
            },
            {
                "name": "SVM Classifier",
                "sklearn_class": "SVC",
                "import_line": "from sklearn.svm import SVC",
                "when_to_use": "Effective for high-dimensional spaces and small-medium datasets.",
                "pros": ["Effective in high dimensions", "Versatile kernels", "Good for small datasets"],
                "cons": ["Slow on large datasets", "Requires feature scaling"],
                "complexity": "medium",
                "needs_scaling": True,
                "min_samples": 30,
                "base_score": 60,
            },
        ],
        "regression": [
            {
                "name": "Random Forest Regressor",
                "sklearn_class": "RandomForestRegressor",
                "import_line": "from sklearn.ensemble import RandomForestRegressor",
                "when_to_use": "Robust regression for non-linear relationships in tabular data.",
                "pros": ["Handles non-linearity", "No scaling needed", "Feature importance"],
                "cons": ["Slower than linear models", "May overfit on small data"],
                "complexity": "medium",
                "needs_scaling": False,
                "min_samples": 50,
                "base_score": 70,
            },
            {
                "name": "XGBoost Regressor",
                "sklearn_class": "XGBRegressor",
                "import_line": "from xgboost import XGBRegressor",
                "when_to_use": "Top-performing regression on structured/tabular data.",
                "pros": ["Best accuracy on large data", "Handles outliers", "Regularization built-in"],
                "cons": ["Many hyperparameters", "Slower on very large data"],
                "complexity": "high",
                "needs_scaling": False,
                "min_samples": 100,
                "base_score": 68,
            },
            {
                "name": "Linear Regression",
                "sklearn_class": "LinearRegression",
                "import_line": "from sklearn.linear_model import LinearRegression",
                "when_to_use": "Best when the relationship between features and target is approximately linear.",
                "pros": ["Very fast", "Highly interpretable", "No hyperparameters"],
                "cons": ["Assumes linearity", "Sensitive to outliers"],
                "complexity": "low",
                "needs_scaling": False,
                "min_samples": 10,
                "base_score": 58,
            },
            {
                "name": "Ridge Regression",
                "sklearn_class": "Ridge",
                "import_line": "from sklearn.linear_model import Ridge",
                "when_to_use": "Linear regression with L2 regularization — better when features are correlated.",
                "pros": ["Handles multicollinearity", "Simple and fast", "Good baseline"],
                "cons": ["Assumes linearity", "All features included"],
                "complexity": "low",
                "needs_scaling": True,
                "min_samples": 10,
                "base_score": 60,
            },
        ],
        "clustering": [
            {
                "name": "KMeans",
                "sklearn_class": "KMeans",
                "import_line": "from sklearn.cluster import KMeans",
                "when_to_use": "Best for discovering k spherical clusters in continuous data.",
                "pros": ["Fast and scalable", "Easy to interpret", "Works well with numeric data"],
                "cons": ["Must specify k", "Sensitive to outliers"],
                "complexity": "low",
                "needs_scaling": True,
                "min_samples": 50,
                "base_score": 68,
            },
            {
                "name": "DBSCAN",
                "sklearn_class": "DBSCAN",
                "import_line": "from sklearn.cluster import DBSCAN",
                "when_to_use": "Finds arbitrary-shaped clusters and handles noise/outliers.",
                "pros": ["No need to specify k", "Handles outliers", "Finds arbitrary shapes"],
                "cons": ["Sensitive to eps parameter", "Struggles with varying density"],
                "complexity": "medium",
                "needs_scaling": True,
                "min_samples": 30,
                "base_score": 60,
            },
            {
                "name": "Agglomerative Clustering",
                "sklearn_class": "AgglomerativeClustering",
                "import_line": "from sklearn.cluster import AgglomerativeClustering",
                "when_to_use": "Hierarchical clustering that doesn't require specifying k upfront.",
                "pros": ["No need to specify k in advance", "Deterministic results", "Works with any shape"],
                "cons": ["Computationally expensive", "Memory intensive for large data"],
                "complexity": "medium",
                "needs_scaling": True,
                "min_samples": 20,
                "base_score": 55,
            },
        ],
        "time_series": [
            {
                "name": "ARIMA",
                "sklearn_class": "ARIMA",
                "import_line": "from statsmodels.tsa.arima.model import ARIMA",
                "when_to_use": "Classical statistical method for univariate time series forecasting.",
                "pros": ["Statistically grounded", "Interpretable parameters", "Works with small data"],
                "cons": ["Only univariate", "Requires stationarity checks"],
                "complexity": "high",
                "needs_scaling": False,
                "min_samples": 50,
                "base_score": 65,
            },
            {
                "name": "Random Forest with Time Features",
                "sklearn_class": "RandomForestRegressor",
                "import_line": "from sklearn.ensemble import RandomForestRegressor",
                "when_to_use": "Use ML on time series by extracting time-based features.",
                "pros": ["Handles multivariate", "No stationarity needed", "Feature importance"],
                "cons": ["Loses temporal ordering", "Requires feature engineering"],
                "complexity": "medium",
                "needs_scaling": False,
                "min_samples": 100,
                "base_score": 62,
            },
        ],
    }

    def recommend(self, analysis: dict) -> list:
        task_type = analysis.get("task_type", "clustering")
        models = self.MODELS.get(task_type, self.MODELS["clustering"])

        scored = []
        for model in models:
            score = self._calculate_score(model, analysis)
            model_copy = dict(model)
            model_copy["final_score"] = round(score, 1)
            scored.append(model_copy)

        scored.sort(key=lambda x: x["final_score"], reverse=True)
        for i, model in enumerate(scored[:3]):
            model["rank"] = i + 1
            model["recommendation_reason"] = self._generate_reason(model, analysis)

        return scored[:3]

    def _calculate_score(self, model: dict, analysis: dict) -> float:
        score = float(model["base_score"])
        rows = analysis.get("shape", {}).get("rows", 0)
        target_suggestions = analysis.get("target_suggestions", [])
        total_missing_pct = analysis.get("total_missing_pct", 0)

        model_name = model["name"]

        if rows > 10000 and "XGBoost" in model_name:
            score += 15
        if rows < 500 and ("Logistic Regression" in model_name or "Linear Regression" in model_name):
            score += 10
        if total_missing_pct > 10 and "Random Forest" in model_name:
            score += 10

        # Binary target check
        if len(target_suggestions) > 0:
            score += 0  # Placeholder for binary target detection

        if rows < 100 and "SVM" in model_name:
            score -= 20

        if rows < model.get("min_samples", 0):
            score -= 10

        return score

    def _generate_reason(self, model: dict, analysis: dict) -> str:
        rows = analysis.get("shape", {}).get("rows", 0)
        task = analysis.get("task_type", "unknown")
        quality = analysis.get("data_quality_score", 50)
        name = model["name"]
        rank = model.get("rank", 1)

        if rank == 1:
            return (f"{name} is the top recommendation for your {task} task with {rows} rows. "
                    f"It scored highest based on your dataset characteristics and data quality of {quality}/100.")
        elif rank == 2:
            return f"{name} is a strong alternative — especially if you want to compare performance."
        else:
            return f"{name} provides a useful baseline comparison for your {task} problem."

    def get_all_for_task(self, task_type: str) -> list:
        return self.MODELS.get(task_type, [])
