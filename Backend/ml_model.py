import joblib
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import os

class AnomalyModel:
    def __init__(self, 
                 lgb_main_path="lgb_main_smote_weighted.pkl",
                 lgb_specialist_path="lgb_specialist_Web_Attack_XSS.pkl",
                 iso_forest_path="isolation_forest.pkl",
                 one_class_svm_path="one_class_svm.pkl",
                 autoencoder_path="autoencoder_anomaly_model.h5",
                 scaler_path="scaler.pkl",
                 label_encoder_path="label_encoder.pkl",
                 autoencoder_threshold=0.0001):  # Placeholder, adjust after computing
        base_dir = os.path.dirname(os.path.abspath(__file__))
        try:
            self.lgb_main = joblib.load(os.path.join(base_dir, lgb_main_path))
            self.lgb_specialist = joblib.load(os.path.join(base_dir, lgb_specialist_path))
            self.iso_forest = joblib.load(os.path.join(base_dir, iso_forest_path))
            self.one_class_svm = joblib.load(os.path.join(base_dir, one_class_svm_path))
            self.autoencoder = load_model(os.path.join(base_dir, autoencoder_path))
            self.scaler = joblib.load(os.path.join(base_dir, scaler_path))
            self.label_encoder = joblib.load(os.path.join(base_dir, label_encoder_path))
            self.autoencoder_threshold = autoencoder_threshold
            print("Successfully loaded all models and preprocessors.")
        except Exception as e:
            print(f"Error loading model files: {e}")
            self.lgb_main = None
            self.lgb_specialist = None
            self.iso_forest = None
            self.one_class_svm = None
            self.autoencoder = None
            self.scaler = None
            self.label_encoder = None

    def is_malicious(self, feature_df: pd.DataFrame) -> bool:
        """
        Predicts if a feature DataFrame is malicious using all models.
        Expects a DataFrame with 77 features matching FEATURE_NAMES.
        """
        if any(model is None for model in [self.lgb_main, self.lgb_specialist, 
                                         self.iso_forest, self.one_class_svm, 
                                         self.autoencoder, self.scaler, self.label_encoder]):
            print("One or more models failed to load.")
            return False

        try:
            # Validate feature count and names
            expected_features = 77
            if feature_df.shape[1] != expected_features:
                raise ValueError(f"Expected {expected_features} features, got {feature_df.shape[1]}")
            if not all(col in feature_df.columns for col in self.scaler.feature_names_in_):
                raise ValueError("Feature names do not match scaler's expectations")

            # Scale features
            X_scaled = self.scaler.transform(feature_df)

            # Predict with LightGBM main (multiclass)
            y_pred_prob = self.lgb_main.predict(X_scaled)
            y_pred_labels = np.argmax(y_pred_prob, axis=1)
            benign_label = self.label_encoder.transform(['Benign'])[0]
            lgb_main_malicious = y_pred_labels != benign_label

            # Predict with LightGBM specialist (Web Attack - XSS)
            y_pred_spec = self.lgb_specialist.predict(X_scaled)
            lgb_spec_malicious = (y_pred_spec > 0.5).astype(int)

            # Predict with Isolation Forest
            iso_pred = self.iso_forest.predict(X_scaled)
            iso_malicious = iso_pred == -1

            # Predict with One-Class SVM
            svm_pred = self.one_class_svm.predict(X_scaled)
            svm_malicious = svm_pred == -1

            # Predict with Autoencoder
            reconstructions = self.autoencoder.predict(X_scaled, verbose=0)
            mse = np.mean(np.power(X_scaled - reconstructions, 2), axis=1)
            autoencoder_malicious = mse > self.autoencoder_threshold

            # Combine predictions: Flag as malicious if any model detects
            is_malicious = (
                lgb_main_malicious[0] or 
                lgb_spec_malicious[0] or 
                iso_malicious[0] or 
                svm_malicious[0] or 
                autoencoder_malicious[0]
            )

            return is_malicious
        except Exception as e:
            print(f"Error during prediction: {e}")
            return False

# Create a single instance of the model
# TODO: Compute threshold dynamically or load from training
model_instance = AnomalyModel(autoencoder_threshold=0.0001)