import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'datamind_backend.settings')
import django; django.setup()

bugs_found = []

print("=== 1. TESTING ALL CLASSIFIERS ===")
from api.ml_engine.dataset_analyzer import DatasetAnalyzer
from api.ml_engine.model_trainer import ModelTrainer
from api.ml_engine.pipeline_generator import PipelineGenerator

a = DatasetAnalyzer('../industrial_sensor_data.csv')
r = a.get_full_analysis()
trainer = ModelTrainer('../industrial_sensor_data.csv', r)

classifiers = ['Random Forest Classifier','XGBoost Classifier','Logistic Regression','SVM Classifier']
for m in classifiers:
    res = trainer.train(m, 'failure')
    status = "OK" if res['success'] else "FAIL: " + res.get('error','?')
    print(f"  {m}: {status}")

print()
print("=== 2. TESTING ALL REGRESSORS ===")
import pandas as pd, numpy as np
import tempfile, os as _os
reg_data = pd.DataFrame({
    'x1': np.random.randn(300),
    'x2': np.random.randn(300),
    'x3': np.random.randn(300),
    'price': np.random.uniform(100, 500, 300)
})
tmp = tempfile.NamedTemporaryFile(suffix='.csv', delete=False, mode='w')
reg_data.to_csv(tmp.name, index=False)
tmp.close()

a2 = DatasetAnalyzer(tmp.name)
r2 = a2.get_full_analysis()
print("  Detected task:", r2['task_type'])
trainer2 = ModelTrainer(tmp.name, r2)
regressors = ['Random Forest Regressor','XGBoost Regressor','Linear Regression','Ridge Regression']
for m in regressors:
    res = trainer2.train(m, 'price')
    status = "OK" if res['success'] else "FAIL: " + res.get('error','?')
    print(f"  {m}: {status}")

print()
print("=== 3. TESTING CLUSTERING ===")
clust_analysis = dict(r)
clust_analysis['task_type'] = 'clustering'
trainer3 = ModelTrainer('../industrial_sensor_data.csv', clust_analysis)
for m in ['KMeans','DBSCAN','Agglomerative Clustering']:
    res = trainer3.train(m, '')
    status = "OK" if res['success'] else "FAIL: " + res.get('error','?')
    print(f"  {m}: {status}")

print()
print("=== 4. CHECKING PIPELINE CODE FOR CLUSTERING BUG ===")
pg = PipelineGenerator()
pip = pg.generate(clust_analysis, 'KMeans', '')
if 'X_train' in pip['code']:
    bugs_found.append("pipeline_generator: clustering code wrongly references X_train")
    print("  BUG: clustering pipeline uses X_train/y_train")
else:
    print("  OK: no X_train in clustering code")

print()
print("=== 5. TESTING ARIMA MODEL RESOLUTION ===")
arima_model = trainer._get_model('ARIMA')
if arima_model is None:
    bugs_found.append("model_trainer: ARIMA returns None -> will fail silently")
    print("  BUG: ARIMA _get_model returns None")
else:
    print("  OK: ARIMA resolved")

print()
print("=== 6. CHECKING CROSS-VALIDATION MIN-SAMPLES BUG ===")
# CV with cv=min(5, len(X_train)//5 or 2) — if dataset < 25 rows, //5 = 0 -> or 2 -> cv=2 OK
# But what if len(X_train) = 0?
small_data = pd.DataFrame({'x': [1,2,3,4,5], 'y': [0,1,0,1,0]})
tmp2 = tempfile.NamedTemporaryFile(suffix='.csv', delete=False, mode='w')
small_data.to_csv(tmp2.name, index=False)
tmp2.close()
a3 = DatasetAnalyzer(tmp2.name)
r3 = a3.get_full_analysis()
trainer4 = ModelTrainer(tmp2.name, r3)
res4 = trainer4.train('Logistic Regression', 'y')
if not res4['success']:
    bugs_found.append("model_trainer: very small dataset crashes: " + res4.get('error','?'))
    print("  BUG:", res4.get('error'))
else:
    print("  OK: small dataset handled")

print()
print("=== 7. CHECKING LLM FALLBACK ON EMPTY ANALYSIS ===")
from api.ml_engine.llm_client import LLMClient
llm = LLMClient()
try:
    result = llm.explain_dataset({}, 'beginner')
    print("  OK: empty analysis handled, got:", result[:60])
except Exception as e:
    bugs_found.append("llm_client: explain_dataset({}) crashes: " + str(e))
    print("  BUG:", e)

print()
print("=== 8. CHECKING PANDAS 3.x FILLNA COMPAT ===")
df_test = pd.DataFrame({'a': [1.0, None, 3.0], 'b': [None, 2.0, 3.0], 'label': [0.0, 1.0, 0.0]})
try:
    numeric_cols = df_test.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        df_test[col] = df_test[col].fillna(df_test[col].median())
    print("  OK: pandas fillna per-column works")
except Exception as e:
    bugs_found.append("pandas fillna: " + str(e))
    print("  BUG:", e)

print()
print("=" * 50)
if bugs_found:
    print(f"BUGS FOUND ({len(bugs_found)}):")
    for b in bugs_found:
        print(" -", b)
else:
    print("No bugs found in tested paths.")

# Cleanup
_os.unlink(tmp.name)
_os.unlink(tmp2.name)
