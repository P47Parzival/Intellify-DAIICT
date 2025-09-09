import random
import datetime
import numpy as np
import pandas as pd

# List of 77 feature names (as provided, correct for CICIDS2017)
FEATURE_NAMES = [
    'Destination Port', 'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
    'Total Length of Fwd Packets', 'Total Length of Bwd Packets', 'Fwd Packet Length Max',
    'Fwd Packet Length Min', 'Fwd Packet Length Mean', 'Fwd Packet Length Std',
    'Bwd Packet Length Max', 'Bwd Packet Length Min', 'Bwd Packet Length Mean',
    'Bwd Packet Length Std', 'Flow Bytes/s', 'Flow Packets/s', 'Flow IAT Mean',
    'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min', 'Fwd IAT Total', 'Fwd IAT Mean',
    'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min', 'Bwd IAT Total', 'Bwd IAT Mean',
    'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min', 'Fwd PSH Flags', 'Bwd PSH Flags',
    'Fwd URG Flags', 'Bwd URG Flags', 'Fwd Header Length', 'Bwd Header Length',
    'Fwd Packets/s', 'Bwd Packets/s', 'Min Packet Length', 'Max Packet Length',
    'Packet Length Mean', 'Packet Length Std', 'Packet Length Variance',
    'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count',
    'ACK Flag Count', 'URG Flag Count', 'CWE Flag Count', 'ECE Flag Count',
    'Down/Up Ratio', 'Average Packet Size', 'Avg Fwd Segment Size',
    'Avg Bwd Segment Size', 'Fwd Header Length.1', 'Fwd Avg Bytes/Bulk',
    'Fwd Avg Packets/Bulk', 'Fwd Avg Bulk Rate', 'Bwd Avg Bytes/Bulk',
    'Bwd Avg Packets/Bulk', 'Bwd Avg Bulk Rate', 'Subflow Fwd Packets',
    'Subflow Fwd Bytes', 'Subflow Bwd Packets', 'Subflow Bwd Bytes',
    'Init_Win_bytes_forward', 'Init_Win_bytes_backward', 'act_data_pkt_fwd',
    'min_seg_size_forward', 'Active Mean', 'Active Std', 'Active Max',
    'Active Min', 'Idle Mean', 'Idle Std', 'Idle Max', 'Idle Min'
]

# Templates for feature values
BENIGN_TEMPLATE = {
    'Destination Port': 80,
    'Flow Duration': lambda: random.randint(50000, 200000),
    'Total Fwd Packets': 2,
    'Total Backward Packets': 2,
    'Total Length of Fwd Packets': lambda: random.randint(50, 200),
    'Total Length of Bwd Packets': lambda: random.randint(100, 3000),
    'Fwd Packet Length Max': lambda: random.randint(50, 200),
    'Fwd Packet Length Min': 0,
    'Fwd Packet Length Mean': lambda: random.uniform(25, 100),
    'Fwd Packet Length Std': lambda: random.uniform(0, 50),
    'Bwd Packet Length Max': lambda: random.randint(50, 1500),
    'Bwd Packet Length Min': 0,
    'Bwd Packet Length Mean': lambda: random.uniform(50, 750),
    'Bwd Packet Length Std': lambda: random.uniform(0, 300),
    'Flow Bytes/s': lambda: random.uniform(1000, 5000),
    'Flow Packets/s': lambda: random.uniform(10, 40),
    'Flow IAT Mean': lambda: random.uniform(10000, 50000),
    'Flow IAT Std': lambda: random.uniform(0, 20000),
    'Flow IAT Max': lambda: random.randint(30000, 100000),
    'Flow IAT Min': lambda: random.randint(1000, 10000),
    'Fwd IAT Total': lambda: random.randint(20000, 100000),
    'Fwd IAT Mean': lambda: random.uniform(10000, 50000),
    'Fwd IAT Std': lambda: random.uniform(0, 20000),
    'Fwd IAT Max': lambda: random.randint(10000, 50000),
    'Fwd IAT Min': lambda: random.randint(1000, 10000),
    'Bwd IAT Total': lambda: random.randint(20000, 100000),
    'Bwd IAT Mean': lambda: random.uniform(10000, 50000),
    'Bwd IAT Std': lambda: random.uniform(0, 20000),
    'Bwd IAT Max': lambda: random.randint(10000, 50000),
    'Bwd IAT Min': lambda: random.randint(1000, 10000),
    'Fwd PSH Flags': 1,
    'Bwd PSH Flags': 0,
    'Fwd URG Flags': 0,
    'Bwd URG Flags': 0,
    'Fwd Header Length': 40,
    'Bwd Header Length': 40,
    'Fwd Packets/s': lambda: random.uniform(5, 20),
    'Bwd Packets/s': lambda: random.uniform(5, 20),
    'Min Packet Length': 0,
    'Max Packet Length': lambda: random.randint(50, 1500),
    'Packet Length Mean': lambda: random.uniform(50, 500),
    'Packet Length Std': lambda: random.uniform(0, 200),
    'Packet Length Variance': lambda: random.uniform(0, 40000),
    'FIN Flag Count': 0,
    'SYN Flag Count': 0,
    'RST Flag Count': 0,
    'PSH Flag Count': 1,
    'ACK Flag Count': 1,
    'URG Flag Count': 0,
    'CWE Flag Count': 0,
    'ECE Flag Count': 0,
    'Down/Up Ratio': 1.0,
    'Average Packet Size': lambda: random.uniform(50, 600),
    'Avg Fwd Segment Size': lambda: random.uniform(25, 100),
    'Avg Bwd Segment Size': lambda: random.uniform(50, 750),
    'Fwd Header Length.1': 40,
    'Fwd Avg Bytes/Bulk': 0,
    'Fwd Avg Packets/Bulk': 0,
    'Fwd Avg Bulk Rate': 0,
    'Bwd Avg Bytes/Bulk': 0,
    'Bwd Avg Packets/Bulk': 0,
    'Bwd Avg Bulk Rate': 0,
    'Subflow Fwd Packets': 2,
    'Subflow Fwd Bytes': lambda: random.randint(50, 200),
    'Subflow Bwd Packets': 2,
    'Subflow Bwd Bytes': lambda: random.randint(100, 3000),
    'Init_Win_bytes_forward': 8192,
    'Init_Win_bytes_backward': 8192,
    'act_data_pkt_fwd': 1,
    'min_seg_size_forward': 20,
    'Active Mean': 0.0,
    'Active Std': 0.0,
    'Active Max': 0,
    'Active Min': 0,
    'Idle Mean': 0.0,
    'Idle Std': 0.0,
    'Idle Max': 0,
    'Idle Min': 0
}

MALICIOUS_TEMPLATE = {
    'Destination Port': 443,
    'Flow Duration': lambda: random.randint(1000000, 5000000),
    'Total Fwd Packets': lambda: random.randint(10, 50),
    'Total Backward Packets': lambda: random.randint(2, 10),
    'Total Length of Fwd Packets': lambda: random.randint(0, 50),
    'Total Length of Bwd Packets': 0,
    'Fwd Packet Length Max': lambda: random.randint(0, 50),
    'Fwd Packet Length Min': 0,
    'Fwd Packet Length Mean': lambda: random.uniform(0, 25),
    'Fwd Packet Length Std': 0.0,
    'Bwd Packet Length Max': 0,
    'Bwd Packet Length Min': 0,
    'Bwd Packet Length Mean': 0.0,
    'Bwd Packet Length Std': 0.0,
    'Flow Bytes/s': lambda: random.uniform(1, 100),
    'Flow Packets/s': lambda: random.uniform(1000, 10000),
    'Flow IAT Mean': lambda: random.uniform(1000, 10000),
    'Flow IAT Std': lambda: random.uniform(0, 5000),
    'Flow IAT Max': lambda: random.randint(10000, 50000),
    'Flow IAT Min': lambda: random.randint(100, 1000),
    'Fwd IAT Total': lambda: random.randint(500000, 2000000),
    'Fwd IAT Mean': lambda: random.uniform(10000, 100000),
    'Fwd IAT Std': lambda: random.uniform(0, 50000),
    'Fwd IAT Max': lambda: random.randint(50000, 200000),
    'Fwd IAT Min': lambda: random.randint(100, 1000),
    'Bwd IAT Total': lambda: random.randint(10000, 100000),
    'Bwd IAT Mean': lambda: random.uniform(5000, 50000),
    'Bwd IAT Std': lambda: random.uniform(0, 20000),
    'Bwd IAT Max': lambda: random.randint(5000, 50000),
    'Bwd IAT Min': lambda: random.randint(100, 1000),
    'Fwd PSH Flags': 0,
    'Bwd PSH Flags': 0,
    'Fwd URG Flags': 0,
    'Bwd URG Flags': 0,
    'Fwd Header Length': lambda: random.randint(40, 200),
    'Bwd Header Length': lambda: random.randint(20, 40),
    'Fwd Packets/s': lambda: random.uniform(500, 2000),
    'Bwd Packets/s': lambda: random.uniform(10, 50),
    'Min Packet Length': 0,
    'Max Packet Length': lambda: random.randint(0, 50),
    'Packet Length Mean': lambda: random.uniform(0, 25),
    'Packet Length Std': 0.0,
    'Packet Length Variance': 0.0,
    'FIN Flag Count': 0,
    'SYN Flag Count': 1,
    'RST Flag Count': 1,
    'PSH Flag Count': 0,
    'ACK Flag Count': 0,
    'URG Flag Count': 0,
    'CWE Flag Count': 0,
    'ECE Flag Count': 0,
    'Down/Up Ratio': lambda: random.uniform(0, 0.5),
    'Average Packet Size': lambda: random.uniform(0, 50),
    'Avg Fwd Segment Size': lambda: random.uniform(0, 25),
    'Avg Bwd Segment Size': 0.0,
    'Fwd Header Length.1': lambda: random.randint(40, 200),
    'Fwd Avg Bytes/Bulk': 0,
    'Fwd Avg Packets/Bulk': 0,
    'Fwd Avg Bulk Rate': 0,
    'Bwd Avg Bytes/Bulk': 0,
    'Bwd Avg Packets/Bulk': 0,
    'Bwd Avg Bulk Rate': 0,
    'Subflow Fwd Packets': lambda: random.randint(10, 50),
    'Subflow Fwd Bytes': lambda: random.randint(0, 50),
    'Subflow Bwd Packets': lambda: random.randint(2, 10),
    'Subflow Bwd Bytes': 0,
    'Init_Win_bytes_forward': 256,
    'Init_Win_bytes_backward': -1,
    'act_data_pkt_fwd': lambda: random.randint(5, 20),
    'min_seg_size_forward': 20,
    'Active Mean': 0.0,
    'Active Std': 0.0,
    'Active Max': 0,
    'Active Min': 0,
    'Idle Mean': 0.0,
    'Idle Std': 0.0,
    'Idle Max': 0,
    'Idle Min': 0
}

def generate_log():
    """
    Generates a tuple containing:
    1. A human-readable log dictionary for the frontend.
    2. A pandas DataFrame with 77 features for the ML model.
    """
    is_malicious = random.random() < 0.1  # 10% chance of being malicious

    # --- 1. Generate the human-readable log ---
    log_dict = {
        "timestamp": datetime.datetime.now().isoformat(),
        "ip": f"{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}",
    }

    if is_malicious:
        log_dict.update({
            "method": random.choice(["GET", "POST"]),
            "path": "/login.php?user=' or 1=1--",
            "status": 401,
            "user_agent": "sqlmap/1.5.11"
        })
        base_template = MALICIOUS_TEMPLATE
    else:
        log_dict.update({
            "method": random.choice(["GET", "POST", "PUT", "DELETE"]),
            "path": f"/{random.choice(['api/v1/users', 'assets/img.png', 'search/blog', ''])}{random.randint(1,100)}",
            "status": random.choice([200, 201, 304, 404]),
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        })
        base_template = BENIGN_TEMPLATE

    # --- 2. Generate the corresponding feature DataFrame ---
    feature_dict = {}
    for name in FEATURE_NAMES:
        value = base_template.get(name, 0)
        # If the value is a callable (lambda), evaluate it
        if callable(value):
            value = value()
        # Add jitter to non-zero values
        if isinstance(value, (int, float)) and value > 0:
            jitter = value * 0.1
            value = random.uniform(value - jitter, value + jitter)
        feature_dict[name] = value

    # Ensure 'Destination Port' aligns with status
    feature_dict['Destination Port'] = 80 if log_dict["status"] != 401 else 443

    # Create DataFrame with correct column names
    feature_df = pd.DataFrame([feature_dict], columns=FEATURE_NAMES)

    return log_dict, feature_df