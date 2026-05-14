import pandas as pd
import numpy as np
try:
    from scipy import stats
except ImportError:
    stats = None


class DatasetAnalyzer:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.df = None
        try:
            if filepath.lower().endswith('.xlsx') or filepath.lower().endswith('.xls'):
                self.df = pd.read_excel(filepath)
            else:
                self.df = pd.read_csv(filepath)
        except Exception as e:
            self.df = pd.DataFrame()
            self.error = str(e)

    def get_full_analysis(self) -> dict:
        if self.df is None or self.df.empty:
            return {
                "shape": {"rows": 0, "columns": 0},
                "columns": [],
                "numeric_stats": {},
                "task_type": "unknown",
                "task_confidence": 0.0,
                "target_suggestions": [],
                "data_quality_score": 0.0,
                "issues": ["Failed to load dataset"],
                "duplicate_rows": 0,
                "total_missing_pct": 0.0,
                "sample_rows": [],
            }

        task_type, task_confidence = self._detect_task_type()
        data_quality_score = self._score_data_quality()

        columns_info = []
        for col in self.df.columns:
            dtype = self._detect_column_type(col)
            missing_count = int(self.df[col].isnull().sum())
            missing_pct = round(missing_count / len(self.df) * 100, 2)
            unique_count = int(self.df[col].nunique())
            try:
                sample_values = [str(v) for v in self.df[col].dropna().unique()[:5]]
            except Exception:
                sample_values = []

            columns_info.append({
                "name": col,
                "dtype": dtype,
                "missing_count": missing_count,
                "missing_pct": missing_pct,
                "unique_count": unique_count,
                "sample_values": sample_values,
            })

        numeric_stats = {}
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            try:
                series = self.df[col].dropna()
                skewness = float(series.skew()) if len(series) > 0 else 0.0
                numeric_stats[col] = {
                    "mean": round(float(series.mean()), 4),
                    "std": round(float(series.std()), 4),
                    "min": round(float(series.min()), 4),
                    "max": round(float(series.max()), 4),
                    "median": round(float(series.median()), 4),
                    "skewness": round(skewness, 4),
                }
            except Exception:
                pass

        # Target suggestions
        target_suggestions = self._suggest_targets()

        # Issues
        issues = []
        total_missing_pct = round(self.df.isnull().sum().sum() / (self.df.shape[0] * self.df.shape[1]) * 100, 2)
        duplicate_rows = int(self.df.duplicated().sum())

        if total_missing_pct > 20:
            issues.append(f"High missing data: {total_missing_pct:.1f}% of all values are missing")
        if duplicate_rows > 0:
            issues.append(f"Found {duplicate_rows} duplicate rows ({duplicate_rows/len(self.df)*100:.1f}%)")
        if len(self.df) < 50:
            issues.append(f"Very small dataset: only {len(self.df)} rows — model may not generalize well")
        for col in self.df.columns:
            col_missing = self.df[col].isnull().sum() / len(self.df) * 100
            if col_missing > 50:
                issues.append(f"Column '{col}' has {col_missing:.0f}% missing values")

        try:
            sample_rows = self.df.head(3).fillna('').astype(str).to_dict(orient='records')
        except Exception:
            sample_rows = []

        return {
            "shape": {"rows": len(self.df), "columns": len(self.df.columns)},
            "columns": columns_info,
            "numeric_stats": numeric_stats,
            "task_type": task_type,
            "task_confidence": task_confidence,
            "target_suggestions": target_suggestions,
            "data_quality_score": data_quality_score,
            "issues": issues,
            "duplicate_rows": duplicate_rows,
            "total_missing_pct": total_missing_pct,
            "sample_rows": sample_rows,
        }

    def _detect_column_type(self, col: str) -> str:
        dtype = self.df[col].dtype
        if pd.api.types.is_numeric_dtype(dtype):
            return "numeric"
        if pd.api.types.is_datetime64_any_dtype(dtype):
            return "datetime"
        # Check if it looks like datetime string
        col_lower = col.lower()
        if any(kw in col_lower for kw in ['date', 'time', 'timestamp', 'year', 'month']):
            return "datetime"
        if pd.api.types.is_object_dtype(dtype):
            # If very long strings, it's text
            try:
                avg_len = self.df[col].dropna().astype(str).str.len().mean()
                if avg_len > 50:
                    return "text"
            except Exception:
                pass
            return "categorical"
        return "categorical"

    def _detect_task_type(self) -> tuple:
        if self.df is None or self.df.empty:
            return ("unknown", 0.0)

        # Check for time series
        for col in self.df.columns:
            col_lower = col.lower()
            if any(kw in col_lower for kw in ['date', 'time', 'timestamp', 'year', 'month']):
                return ("time_series", 0.85)

        # Find target column
        target_col = None
        priority_names = ['label', 'target', 'class', 'y', 'output', 'result', 'failure', 'category']
        for name in priority_names:
            if name in [c.lower() for c in self.df.columns]:
                target_col = self.df.columns[[c.lower() for c in self.df.columns].index(name)]
                break

        if target_col is None:
            # Use last column as guess
            target_col = self.df.columns[-1]

        target_series = self.df[target_col].dropna()
        n_unique = target_series.nunique()

        # Check if it's a discrete/categorical target (classification)
        # Handles both int dtype AND float columns that only contain whole numbers (e.g. 0.0, 1.0)
        is_whole_number_float = (
            pd.api.types.is_float_dtype(target_series.dtype) and
            n_unique <= 20 and
            (target_series == target_series.round()).all()
        )

        if n_unique <= 10 and (
            pd.api.types.is_integer_dtype(target_series.dtype) or
            pd.api.types.is_object_dtype(target_series.dtype) or
            is_whole_number_float
        ):
            confidence = 0.95 if n_unique <= 2 else (0.9 if n_unique <= 5 else 0.75)
            return ("classification", confidence)

        if pd.api.types.is_float_dtype(target_series.dtype) or (
            pd.api.types.is_integer_dtype(target_series.dtype) and n_unique > 10
        ):
            return ("regression", 0.80)

        # No clear target
        return ("clustering", 0.65)

    def _suggest_targets(self) -> list:
        suggestions = []
        priority_names = ['label', 'target', 'class', 'y', 'output', 'result', 'failure',
                          'category', 'price', 'salary', 'score', 'grade', 'status']
        col_lower_map = {c.lower(): c for c in self.df.columns}
        for name in priority_names:
            if name in col_lower_map:
                suggestions.append(col_lower_map[name])
        # Also add last column if not already in suggestions
        last_col = self.df.columns[-1]
        if last_col not in suggestions:
            suggestions.append(last_col)
        return suggestions[:5]

    def _score_data_quality(self) -> float:
        if self.df is None or self.df.empty:
            return 0.0

        score = 100.0
        total_cells = self.df.shape[0] * self.df.shape[1]
        if total_cells > 0:
            missing_pct = self.df.isnull().sum().sum() / total_cells * 100
            score -= min(40, missing_pct * 2)

        dup_pct = self.df.duplicated().sum() / len(self.df) * 100
        if dup_pct > 10:
            score -= 10

        for col in self.df.columns:
            col_missing_pct = self.df[col].isnull().sum() / len(self.df) * 100
            if col_missing_pct > 50:
                score -= 5

        if len(self.df) < 50:
            score -= 5

        return round(max(0.0, min(100.0, score)), 2)

    def get_correlation_matrix(self) -> dict:
        try:
            numeric_df = self.df.select_dtypes(include=[np.number])
            if numeric_df.empty:
                return {}
            corr = numeric_df.corr()
            return {col: {row: round(float(val), 4) for row, val in corr[col].items()}
                    for col in corr.columns}
        except Exception:
            return {}
