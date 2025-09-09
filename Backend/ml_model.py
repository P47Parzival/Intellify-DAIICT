import joblib
import numpy as np
import os

class AnomalyModel:
    def __init__(self, model_path="isolation_forest.pkl", scaler_path="scaler.pkl"):
        """
        Loads the pre-trained model and scaler from disk.
        """
        # Get the absolute path to the directory where this script is located
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Construct full paths for the model and scaler
        full_model_path = os.path.join(base_dir, model_path)
        full_scaler_path = os.path.join(base_dir, scaler_path)

        try:
            self.model = joblib.load(full_model_path)
            self.scaler = joblib.load(full_scaler_path)
            print("Successfully loaded model and scaler.")
        except FileNotFoundError as e:
            print(f"Error loading model files: {e}")
            print("Please ensure 'isolation_forest.pkl' and 'scaler.pkl' are in the Backend directory.")
            self.model = None
            self.scaler = None

    def _preprocess(self, log: dict) -> np.ndarray:
        """
        Transforms a log dictionary into a numerical feature vector.
        
        IMPORTANT: This must match the preprocessing from your training notebook.
        This is a sample implementation assuming 'status' and 'size' were used as features.
        """
        # Extract features. Use .get() to provide a default value if a key is missing.
        status = log.get("status", 200)
        size = log.get("size", 0)
        
        # Create a 2D array for the scaler
        features = np.array([[status, size]])
        
        # Scale the features using the loaded scaler
        scaled_features = self.scaler.transform(features)
        
        return scaled_features

    def is_malicious(self, log: dict) -> bool:
        """
        Predicts if a log is malicious (an anomaly).
        """
        if not self.model or not self.scaler:
            # Fallback to false if models aren't loaded
            return False

        # 1. Preprocess the log data
        processed_log = self._preprocess(log)
        
        # 2. Make a prediction
        # IsolationForest returns -1 for anomalies (malicious) and 1 for inliers (benign)
        prediction = self.model.predict(processed_log)
        
        # 3. Return True if it's an anomaly
        return prediction[0] == -1

# Create a single instance of the model to be used by the FastAPI app
model_instance = AnomalyModel()