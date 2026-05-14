import numpy as np
import pandas as pd


class ModelTrainer:
    def __init__(self, dataset_path: str, analysis: dict):
        self.dataset_path = dataset_path
        self.analysis = analysis
        try:
            if dataset_path.lower().endswith('.xlsx') or dataset_path.lower().endswith('.xls'):
                self.df = pd.read_excel(dataset_path)
            else:
                self.df = pd.read_csv(dataset_path)
        except Exception as e:
            self.df = pd.DataFrame()
            self._load_error = str(e)

    def train(self, model_name: str, target_column: str) -> dict:
        try:
            task_type = self.analysis.get("task_type", "classification")

            if task_type == "clustering":
                return self._train_clustering(model_name)

            # Supervised training
            X_train, X_test, y_train, y_test, feature_names = self._preprocess(target_column)
            model = self._get_model(model_name)

            if model is None:
                return {"success": False, "error": f"Model '{model_name}' not found."}

            model.fit(X_train, y_train)

            # Cross-validation
            from sklearn.model_selection import cross_val_score
            try:
                cv_scores = cross_val_score(model, X_train, y_train, cv=min(5, len(X_train) // 5 or 2))
                cv_mean = float(cv_scores.mean())
                cv_std = float(cv_scores.std())
            except Exception:
                cv_mean = 0.0
                cv_std = 0.0

            metrics = {}
            if task_type == "classification":
                from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
                y_pred = model.predict(X_test)
                metrics = {
                    "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
                    "f1_score": round(float(f1_score(y_test, y_pred, average='weighted', zero_division=0)), 4),
                    "precision": round(float(precision_score(y_test, y_pred, average='weighted', zero_division=0)), 4),
                    "recall": round(float(recall_score(y_test, y_pred, average='weighted', zero_division=0)), 4),
                    "cv_mean": round(cv_mean, 4),
                    "cv_std": round(cv_std, 4),
                }
            elif task_type == "regression":
                from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
                y_pred = model.predict(X_test)
                mse = float(mean_squared_error(y_test, y_pred))
                metrics = {
                    "r2_score": round(float(r2_score(y_test, y_pred)), 4),
                    "mae": round(float(mean_absolute_error(y_test, y_pred)), 4),
                    "rmse": round(float(mse ** 0.5), 4),
                    "cv_mean": round(cv_mean, 4),
                }
            elif task_type == "time_series":
                from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
                y_pred = model.predict(X_test)
                mse = float(mean_squared_error(y_test, y_pred))
                metrics = {
                    "r2_score": round(float(r2_score(y_test, y_pred)), 4),
                    "mae": round(float(mean_absolute_error(y_test, y_pred)), 4),
                    "rmse": round(float(mse ** 0.5), 4),
                    "cv_mean": round(cv_mean, 4),
                }

            top_features = self._get_feature_importance(model, feature_names)

            return {
                "success": True,
                "model_name": model_name,
                "metrics": metrics,
                "training_samples": len(X_train),
                "test_samples": len(X_test),
                "feature_count": len(feature_names),
                "top_features": top_features,
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def _train_clustering(self, model_name: str) -> dict:
        try:
            from sklearn.preprocessing import StandardScaler
            from sklearn.metrics import silhouette_score

            X = self.df.select_dtypes(include=[np.number]).fillna(0)
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            model = self._get_model(model_name)
            if model is None:
                return {"success": False, "error": f"Model '{model_name}' not found."}

            labels = model.fit_predict(X_scaled)
            n_clusters = len(set(labels)) - (1 if -1 in labels else 0)

            try:
                sil_score = float(silhouette_score(X_scaled, labels)) if n_clusters > 1 else 0.0
            except Exception:
                sil_score = 0.0

            metrics = {
                "silhouette_score": round(sil_score, 4),
                "n_clusters": n_clusters,
            }
            if hasattr(model, 'inertia_'):
                metrics["inertia"] = round(float(model.inertia_), 2)

            return {
                "success": True,
                "model_name": model_name,
                "metrics": metrics,
                "training_samples": len(X_scaled),
                "test_samples": 0,
                "feature_count": X.shape[1],
                "top_features": [],
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def _preprocess(self, target_column: str):
        df = self.df.copy()

        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset.")

        # Fill missing values
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].median())

        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        for col in categorical_cols:
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'unknown')

        # Encode categoricals
        from sklearn.preprocessing import LabelEncoder
        le = LabelEncoder()
        for col in categorical_cols:
            df[col] = le.fit_transform(df[col].astype(str))

        X = df.drop(columns=[target_column])
        y = df[target_column]
        feature_names = list(X.columns)

        # KEY FIX: If target is float but all values are whole numbers (e.g. 0.0, 1.0)
        # cast to int so classifiers don't receive a "continuous" target
        task_type = self.analysis.get("task_type", "classification")
        if task_type == "classification":
            if pd.api.types.is_float_dtype(y.dtype):
                y_clean = y.dropna()
                if len(y_clean) > 0 and (y_clean == y_clean.round()).all():
                    y = y.astype(int)

        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        return X_train, X_test, y_train, y_test, feature_names

    def _get_model(self, model_name: str):
        try:
            if model_name == "Random Forest Classifier":
                from sklearn.ensemble import RandomForestClassifier
                return RandomForestClassifier(n_estimators=100, random_state=42)
            elif model_name == "XGBoost Classifier":
                from xgboost import XGBClassifier
                return XGBClassifier(random_state=42, eval_metric='logloss', verbosity=0)
            elif model_name == "Logistic Regression":
                from sklearn.linear_model import LogisticRegression
                return LogisticRegression(max_iter=1000, random_state=42)
            elif model_name == "SVM Classifier":
                from sklearn.svm import SVC
                return SVC(random_state=42)
            elif model_name == "Random Forest Regressor":
                from sklearn.ensemble import RandomForestRegressor
                return RandomForestRegressor(n_estimators=100, random_state=42)
            elif model_name == "XGBoost Regressor":
                from xgboost import XGBRegressor
                return XGBRegressor(random_state=42, verbosity=0)
            elif model_name == "Linear Regression":
                from sklearn.linear_model import LinearRegression
                return LinearRegression()
            elif model_name == "Ridge Regression":
                from sklearn.linear_model import Ridge
                return Ridge(alpha=1.0)
            elif model_name == "KMeans":
                from sklearn.cluster import KMeans
                return KMeans(n_clusters=3, random_state=42, n_init=10)
            elif model_name == "DBSCAN":
                from sklearn.cluster import DBSCAN
                return DBSCAN(eps=0.5, min_samples=5)
            elif model_name == "Agglomerative Clustering":
                from sklearn.cluster import AgglomerativeClustering
                return AgglomerativeClustering(n_clusters=3)
            elif model_name in ("Random Forest with Time Features", "ARIMA"):
                # ARIMA requires statsmodels API; fall back to RF regressor for training
                from sklearn.ensemble import RandomForestRegressor
                return RandomForestRegressor(n_estimators=100, random_state=42)
            else:
                # Unknown model — return LinearRegression as safe default
                from sklearn.linear_model import LinearRegression
                return LinearRegression()
        except Exception:
            return None

    def _get_feature_importance(self, model, feature_names: list) -> list:
        try:
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
            elif hasattr(model, 'coef_'):
                coef = model.coef_
                if coef.ndim > 1:
                    importances = np.abs(coef).mean(axis=0)
                else:
                    importances = np.abs(coef)
            else:
                return []

            feature_importance_pairs = list(zip(feature_names, importances))
            feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)
            return [
                {"name": name, "importance": round(float(imp), 4)}
                for name, imp in feature_importance_pairs[:5]
            ]
        except Exception:
            return []
