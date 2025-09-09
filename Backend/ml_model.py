import joblib
import numpy as np
import pandas as pd
import os

class AnomalyModel:
    def __init__(self, model_path="isolation_forest.pkl", scaler_path="scaler.pkl"):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        full_model_path = os.path.join(base_dir, model_path)
        full_scaler_path = os.path.join(base_dir, scaler_path)

        try:
            self.model = joblib.load(full_model_path)
            self.scaler = joblib.load(full_scaler_path)
            # This is the crucial list of feature names from your training data
            # YOU MUST REPLACE THIS WITH THE ACTUAL COLUMN NAMES FROM YOUR NOTEBOOK
            self.feature_names = self.scaler.get_feature_names_out()
            print("Successfully loaded model and scaler.")
            print(f"Model expects {len(self.feature_names)} features.")
        except Exception as e:
            print(f"Error loading model files: {e}")
            self.model = None
            self.scaler = None
            self.feature_names = []

    def _preprocess(self, log: dict) -> np.ndarray:
        """
        Transforms a log dictionary into a numerical feature vector using pandas
        to ensure column order and naming matches the training data.
        """
        # Create a single-row DataFrame with the expected column names, initialized to 0
        df = pd.DataFrame(0, index=[0], columns=self.feature_names)

        # --- FEATURE ENGINEERING ---
        # You must now populate the DataFrame columns based on the raw log.
        # This section MUST match the feature engineering in your training notebook.
        
        # Example 1: Direct mapping for numerical features
        if 'status' in df.columns:
            df['status'] = log.get('status', 200)
        if 'size' in df.columns:
            df['size'] = log.get('size', 0)

        # Example 2: One-Hot Encoding for categorical features (e.g., method)
        method = log.get('method', 'GET').upper()
        method_col = f'method_{method}'
        if method_col in df.columns:
            df[method_col] = 1
            
        # Example 3: Feature extraction from 'request' string
        request_str = log.get('request', '')
        if 'request_length' in df.columns:
            df['request_length'] = len(request_str)
        if 'num_special_chars' in df.columns:
            df['num_special_chars'] = sum(1 for char in request_str if not char.isalnum())
        if 'contains_sql_keyword' in df.columns:
            df['contains_sql_keyword'] = 1 if 'select' in request_str.lower() or 'union' in request_str.lower() else 0

        # ... and so on for all 77 features ...
        # You need to add logic for every feature your model was trained on.
        # Check your notebook for things like: user_agent parsing, protocol features, etc.

        # The DataFrame `df` now has the correct shape and column order.
        return df

    def is_malicious(self, log: dict) -> bool:
        """
        Predicts if a log is malicious (an anomaly).
        """
        # FIX: Explicitly check the size of the numpy array.
        if self.model is None or self.scaler is None or self.feature_names.size == 0:
            return False

        try:
            # 1. Preprocess the log data into a DataFrame
            processed_df = self._preprocess(log)
            
            # 2. Scale the features
            scaled_features = self.scaler.transform(processed_df)
            
            # 3. Make a prediction
            prediction = self.model.predict(scaled_features)
            
            # 4. Return True if it's an anomaly (-1)
            return prediction[0] == -1
        except Exception as e:
            print(f"Error during prediction: {e}")
            return False

# Create a single instance of the model
model_instance = AnomalyModel()