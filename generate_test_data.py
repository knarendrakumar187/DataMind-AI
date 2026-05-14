"""
Generate a sample industrial sensor dataset for testing DataMind AI.
Run this script once to create a test CSV file.
"""
import pandas as pd
import numpy as np

np.random.seed(42)
n = 500

df = pd.DataFrame({
    'temperature': np.random.uniform(60, 100, n),
    'pressure': np.random.uniform(1, 10, n),
    'vibration': np.random.uniform(0, 5, n),
    'age_days': np.random.randint(1, 1000, n),
    'humidity': np.random.uniform(20, 90, n),
    'rotation_speed': np.random.uniform(500, 3000, n),
    'failure': np.random.choice([0, 1], n, p=[0.9, 0.1]),
})

df.to_csv('industrial_sensor_data.csv', index=False)
print(f"✅ Test dataset created: industrial_sensor_data.csv ({len(df)} rows)")
print("Upload this file to DataMind AI to test!")
