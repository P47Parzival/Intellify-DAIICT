import joblib
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import os

# --- NEW: Remediation Playbooks ---
# Maps a detection reason to a list of actionable steps for an incident responder.
REMEDIATION_PLAYBOOKS = {
    "General Malicious Pattern (LGBM)": [
        "1. Isolate the host machine immediately.",
        "2. Analyze running processes for suspicious activity.",
        "3. Review firewall logs for other connections from the source IP."
    ],
    "Potential XSS Attack (Specialist LGBM)": [
        "1. Block the attacker's IP at the Web Application Firewall (WAF).",
        "2. Review and sanitize input fields on the affected web application.",
        "3. Scan the application for other XSS vulnerabilities."
    ],
    "Anomalous Traffic (Isolation Forest)": [
        "1. Investigate the source IP against threat intelligence feeds.",
        "2. Analyze the flow to determine the nature of the anomaly (e.g., DDoS, scan).",
        "3. Temporarily rate-limit the source IP if traffic volume is high."
    ],
    "Anomalous Traffic (One-Class SVM)": [
        "1. Cross-reference the traffic pattern with historical data for this host.",
        "2. Determine if the anomalous behavior corresponds to a new deployment or legitimate activity.",
        "3. If suspicious, escalate for deeper packet capture and analysis."
    ],
    "Structural Anomaly (Autoencoder)": [
        "1. Verify the protocol and application generating the traffic.",
        "2. Check for malformed packets or protocol abuse.",
        "3. Ensure network hardware and drivers are up to date."
    ]
}

class AnomalyModel:
    def __init__(self, 
                 lgb_main_path="lgb_main_smote_weighted.pkl",
                 lgb_specialist_path="lgb_specialist_Web_Attack_-_XSS.pkl",
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
            self.autoencoder = load_model(os.path.join(base_dir, autoencoder_path), compile=False)
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

    def is_malicious(self, feature_df: pd.DataFrame) -> dict:
        """
            Predicts if a feature DataFrame is malicious using all models.
            Returns a dictionary with the prediction, risk score, and reason.
        """
        if any(model is None for model in [self.lgb_main, self.lgb_specialist, 
                                         self.iso_forest, self.one_class_svm, 
                                         self.autoencoder, self.scaler, self.label_encoder]):
            print("One or more models failed to load.")
            return {"is_malicious": False, "risk_score": 0, "reason": "Models not loaded"}

        try:
            # Validate feature count and names
            expected_features = 77
            if feature_df.shape[1] != expected_features:
                raise ValueError(f"Expected {expected_features} features, got {feature_df.shape[1]}")
            if not all(col in feature_df.columns for col in self.scaler.feature_names_in_):
                raise ValueError("Feature names do not match scaler's expectations")

            # Scale features
            X_scaled = self.scaler.transform(feature_df)

            reasons = []
            risk_score = 0

            # --- Model Predictions ---
            # Each model contributes to the risk score and adds a reason if it flags the traffic.

            # Predict with LightGBM main (multiclass)
            y_pred_prob = self.lgb_main.predict(X_scaled)
            y_pred_labels = np.argmax(y_pred_prob, axis=1)
            benign_label = self.label_encoder.transform(['Benign'])[0]
            if y_pred_labels[0] != benign_label:
                reasons.append("General Malicious Pattern (LGBM)")
                risk_score += 40

            # Predict with LightGBM specialist (Web Attack - XSS)
            y_pred_spec = self.lgb_specialist.predict(X_scaled)
            if y_pred_spec[0] > 0.5:
                reasons.append("Potential XSS Attack (Specialist LGBM)")
                risk_score += 70 # Higher weight for specialist model

            # Predict with Isolation Forest
            if self.iso_forest.predict(X_scaled)[0] == -1:
                reasons.append("Anomalous Traffic (Isolation Forest)")
                risk_score += 30

            # Predict with One-Class SVM
            if self.one_class_svm.predict(X_scaled)[0] == -1:
                reasons.append("Anomalous Traffic (One-Class SVM)")
                risk_score += 30

            # Predict with Autoencoder
            reconstructions = self.autoencoder.predict(X_scaled, verbose=0)
            mse = np.mean(np.power(X_scaled - reconstructions, 2), axis=1)
            if mse[0] > self.autoencoder_threshold:
                reasons.append("Structural Anomaly (Autoencoder)")
                risk_score += 50

            # --- Final Decision ---
            is_malicious_flag = len(reasons) > 0
            
            if not is_malicious_flag:
                return {"is_malicious": False, "risk_score": 0, "reason": "Benign", "playbook": []}

            # Combine reasons and look up playbooks
            final_reason = ", ".join(reasons)
            playbook = []
            for reason in reasons:
                if reason in REMEDIATION_PLAYBOOKS:
                    playbook.extend(REMEDIATION_PLAYBOOKS[reason])

            return {
                "is_malicious": True,
                "risk_score": min(risk_score, 100),
                "reason": final_reason,
                "playbook": list(dict.fromkeys(playbook)) # Get unique playbook steps
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            return {"is_malicious": False, "risk_score": 0, "reason": f"Prediction Error: {e}", "playbook": []}

# Create a single instance of the model
# TODO: Compute threshold dynamically or load from training
# We increase the threshold to a more realistic value to avoid false positives.
# A value of 0.1 is a better starting point than 0.0001.
model_instance = AnomalyModel(autoencoder_threshold=0.01)