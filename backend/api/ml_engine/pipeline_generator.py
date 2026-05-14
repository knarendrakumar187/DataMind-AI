class PipelineGenerator:

    METRICS_MAP = {
        "classification": ["accuracy_score", "f1_score", "precision_score", "recall_score", "confusion_matrix"],
        "regression": ["mean_absolute_error", "mean_squared_error", "r2_score"],
        "clustering": ["silhouette_score"],
        "time_series": ["mean_absolute_error", "mean_squared_error"],
    }

    LIBRARIES_MAP = {
        "classification": ["pandas", "numpy", "scikit-learn", "xgboost"],
        "regression": ["pandas", "numpy", "scikit-learn", "xgboost"],
        "clustering": ["pandas", "numpy", "scikit-learn"],
        "time_series": ["pandas", "numpy", "scikit-learn", "statsmodels"],
    }

    MODEL_IMPORTS = {
        "Random Forest Classifier": "from sklearn.ensemble import RandomForestClassifier",
        "XGBoost Classifier": "from xgboost import XGBClassifier",
        "Logistic Regression": "from sklearn.linear_model import LogisticRegression",
        "SVM Classifier": "from sklearn.svm import SVC",
        "Random Forest Regressor": "from sklearn.ensemble import RandomForestRegressor",
        "XGBoost Regressor": "from xgboost import XGBRegressor",
        "Linear Regression": "from sklearn.linear_model import LinearRegression",
        "Ridge Regression": "from sklearn.linear_model import Ridge",
        "KMeans": "from sklearn.cluster import KMeans",
        "DBSCAN": "from sklearn.cluster import DBSCAN",
        "Agglomerative Clustering": "from sklearn.cluster import AgglomerativeClustering",
        "ARIMA": "from statsmodels.tsa.arima.model import ARIMA",
        "Random Forest with Time Features": "from sklearn.ensemble import RandomForestRegressor",
    }

    MODEL_CLASS_MAP = {
        "Random Forest Classifier": "RandomForestClassifier(n_estimators=100, random_state=42)",
        "XGBoost Classifier": "XGBClassifier(random_state=42, eval_metric='logloss')",
        "Logistic Regression": "LogisticRegression(max_iter=1000, random_state=42)",
        "SVM Classifier": "SVC(random_state=42)",
        "Random Forest Regressor": "RandomForestRegressor(n_estimators=100, random_state=42)",
        "XGBoost Regressor": "XGBRegressor(random_state=42)",
        "Linear Regression": "LinearRegression()",
        "Ridge Regression": "Ridge(alpha=1.0)",
        "KMeans": "KMeans(n_clusters=3, random_state=42)",
        "DBSCAN": "DBSCAN(eps=0.5, min_samples=5)",
        "Agglomerative Clustering": "AgglomerativeClustering(n_clusters=3)",
        "ARIMA": None,
        "Random Forest with Time Features": "RandomForestRegressor(n_estimators=100, random_state=42)",
    }

    NEEDS_SCALING = {"Logistic Regression", "SVM Classifier", "KMeans", "DBSCAN",
                     "Agglomerative Clustering", "Ridge Regression"}

    def generate(self, analysis: dict, model_name: str, target_column: str) -> dict:
        task_type = analysis.get("task_type", "classification")
        model_import = self.MODEL_IMPORTS.get(model_name, f"# import {model_name}")
        model_class = self.MODEL_CLASS_MAP.get(model_name, f"{model_name}()")
        needs_scaling = model_name in self.NEEDS_SCALING

        metrics_to_use = self.METRICS_MAP.get(task_type, ["accuracy_score"])
        libraries_needed = self.LIBRARIES_MAP.get(task_type, ["scikit-learn"])

        is_supervised = task_type in ("classification", "regression")
        is_clustering = task_type == "clustering"

        # Generate evaluation code
        if task_type == "classification":
            eval_code = """from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, classification_report, confusion_matrix

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average='weighted')
precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)

print(f"Accuracy:  {accuracy:.4f}")
print(f"F1 Score:  {f1:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print("\\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))"""
        elif task_type == "regression":
            eval_code = """from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
r2 = r2_score(y_test, y_pred)

print(f"MAE:  {mae:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"R²:   {r2:.4f}")"""
        else:
            eval_code = """from sklearn.metrics import silhouette_score

labels = model.fit_predict(X_scaled)
score = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {score:.4f}")
print(f"Cluster sizes: {pd.Series(labels).value_counts().to_dict()}")"""

        scaling_code = ""
        if needs_scaling:
            scaling_code = """
# Feature Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
"""

        split_code = ""
        if is_supervised:
            split_code = f"""
# Split data
X = df.drop(columns=['{target_column}'])
y = df['{target_column}']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
"""
        elif is_clustering:
            split_code = f"""
# Prepare features (no target for clustering)
X = df.select_dtypes(include=[np.number])
X_scaled = StandardScaler().fit_transform(X)
"""

        cv_code = ""
        if is_supervised:
            cv_code = """
cv_scores = cross_val_score(model, X_train, y_train, cv=5)
print(f"Cross-validation scores: {cv_scores}")
print(f"Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
"""

        full_code = f"""# ============================================================
# DataMind AI — Generated ML Pipeline
# Model: {model_name}
# Task: {task_type.replace('_', ' ').title()}
# Target: {target_column if is_supervised else 'N/A (unsupervised)'}
# ============================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score
import warnings
import joblib
warnings.filterwarnings('ignore')

{model_import}

# ── SECTION 1: Load Data ──────────────────────────────────
df = pd.read_csv('your_dataset.csv')  # Change filename as needed
print(f"Dataset shape: {{df.shape}}")
print(df.head())

# ── SECTION 2: Preprocessing ─────────────────────────────
# Handle missing values
numeric_cols = df.select_dtypes(include=[np.number]).columns
for col in numeric_cols:
    df[col] = df[col].fillna(df[col].median())

categorical_cols = df.select_dtypes(include=['object']).columns
for col in categorical_cols:
    df[col] = df[col].fillna(df[col].mode()[0])

# Encode categorical columns
le = LabelEncoder()
for col in categorical_cols:
    df[col] = le.fit_transform(df[col].astype(str))

print("Preprocessing complete.")
{split_code}
{scaling_code}
# ── SECTION 3: Train Model ────────────────────────────────
model = {model_class}
{"model.fit(X_train, y_train)" if is_supervised else "labels = model.fit_predict(X_scaled)"}
print("Model trained successfully!")
{cv_code}
# ── SECTION 4: Evaluate ───────────────────────────────────
{eval_code}

# ── SECTION 5: Save Model ─────────────────────────────────
joblib.dump(model, 'trained_model.pkl')
print("\\nModel saved as trained_model.pkl")
"""

        steps = [
            {
                "step_number": 1,
                "title": "Import Libraries",
                "description": "Import all required Python libraries for data manipulation, preprocessing, and ML.",
                "code_snippet": f"import pandas as pd\nimport numpy as np\n{model_import}\nimport joblib",
            },
            {
                "step_number": 2,
                "title": "Load Dataset",
                "description": "Load the CSV file into a pandas DataFrame and inspect its shape.",
                "code_snippet": "df = pd.read_csv('your_dataset.csv')\nprint(f'Shape: {df.shape}')",
            },
            {
                "step_number": 3,
                "title": "Handle Missing Values",
                "description": "Fill numeric columns with median values and categorical columns with mode.",
                "code_snippet": "numeric_cols = df.select_dtypes(include=[np.number]).columns\nfor col in numeric_cols:\n    df[col] = df[col].fillna(df[col].median())",
            },
            {
                "step_number": 4,
                "title": "Encode Categorical Features",
                "description": "Convert text/categorical columns to numeric using Label Encoding.",
                "code_snippet": "from sklearn.preprocessing import LabelEncoder\nle = LabelEncoder()\nfor col in categorical_cols:\n    df[col] = le.fit_transform(df[col].astype(str))",
            },
            {
                "step_number": 5,
                "title": "Split Data" if is_supervised else "Prepare Features",
                "description": "Split data into 80% training and 20% test sets." if is_supervised else "Extract numeric features for clustering.",
                "code_snippet": split_code.strip(),
            },
            {
                "step_number": 6,
                "title": "Train Model",
                "description": f"Initialize and train the {model_name} on the training data.",
                "code_snippet": f"model = {model_class}\n" + ("model.fit(X_train, y_train)" if is_supervised else "labels = model.fit_predict(X_scaled)"),
            },
            {
                "step_number": 7,
                "title": "Evaluate Performance",
                "description": "Measure model performance using appropriate metrics for the task.",
                "code_snippet": eval_code[:200] + "...",
            },
            {
                "step_number": 8,
                "title": "Save Model",
                "description": "Persist the trained model to disk for future use.",
                "code_snippet": "import joblib\njoblib.dump(model, 'trained_model.pkl')\nprint('Model saved!')",
            },
        ]

        return {
            "code": full_code,
            "steps": steps,
            "metrics_to_use": metrics_to_use,
            "libraries_needed": libraries_needed,
        }
