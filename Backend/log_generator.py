import random
from datetime import datetime
import numpy as np
import pandas as pd
import geoip2.database

# List of 77 feature names that match the scaler's expectations
FEATURE_NAMES = [
    'Protocol', 'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
    'Fwd Packets Length Total', 'Bwd Packets Length Total', 'Fwd Packet Length Max',
    'Fwd Packet Length Min', 'Fwd Packet Length Mean', 'Fwd Packet Length Std',
    'Bwd Packet Length Max', 'Bwd Packet Length Min', 'Bwd Packet Length Mean',
    'Bwd Packet Length Std', 'Flow Bytes/s', 'Flow Packets/s', 'Flow IAT Mean',
    'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min', 'Fwd IAT Total', 'Fwd IAT Mean',
    'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min', 'Bwd IAT Total', 'Bwd IAT Mean',
    'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min', 'Fwd PSH Flags', 'Bwd PSH Flags',
    'Fwd URG Flags', 'Bwd URG Flags', 'Fwd Header Length', 'Bwd Header Length',
    'Fwd Packets/s', 'Bwd Packets/s', 'Packet Length Min', 'Packet Length Max',
    'Packet Length Mean', 'Packet Length Std', 'Packet Length Variance',
    'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count',
    'ACK Flag Count', 'URG Flag Count', 'CWE Flag Count', 'ECE Flag Count',
    'Down/Up Ratio', 'Avg Packet Size', 'Avg Fwd Segment Size',
    'Avg Bwd Segment Size', 'Fwd Avg Bytes/Bulk',
    'Fwd Avg Packets/Bulk', 'Fwd Avg Bulk Rate', 'Bwd Avg Bytes/Bulk',
    'Bwd Avg Packets/Bulk', 'Bwd Avg Bulk Rate', 'Subflow Fwd Packets',
    'Subflow Fwd Bytes', 'Subflow Bwd Packets', 'Subflow Bwd Bytes',
    'Init Fwd Win Bytes', 'Init Bwd Win Bytes', 'Fwd Act Data Packets',
    'Fwd Seg Size Min', 'Active Mean', 'Active Std', 'Active Max',
    'Active Min', 'Idle Mean', 'Idle Std', 'Idle Max', 'Idle Min'
]

# Templates for feature values
BENIGN_TEMPLATE = {
    'Protocol': 6, # TCP
    'Flow Duration': lambda: random.randint(50000, 200000),
    'Total Fwd Packets': 2,
    'Total Backward Packets': 2,
    'Fwd Packets Length Total': lambda: random.randint(50, 200),
    'Bwd Packets Length Total': lambda: random.randint(100, 3000),
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
    'Packet Length Min': 0,
    'Packet Length Max': lambda: random.randint(50, 1500),
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
    'Avg Packet Size': lambda: random.uniform(50, 600),
    'Avg Fwd Segment Size': lambda: random.uniform(25, 100),
    'Avg Bwd Segment Size': lambda: random.uniform(50, 750),
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
    'Init Fwd Win Bytes': 8192,
    'Init Bwd Win Bytes': 8192,
    'Fwd Act Data Packets': 1,
    'Fwd Seg Size Min': 20,
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
    'Protocol': lambda: random.choice([6, 17]),  # TCP or UDP
    'Flow Duration': lambda: random.randint(1000000, 5000000),
    'Total Fwd Packets': lambda: random.randint(10, 50),
    'Total Backward Packets': lambda: random.randint(2, 10),
    'Fwd Packets Length Total': lambda: random.randint(0, 50),
    'Bwd Packets Length Total': 0,
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
    'Packet Length Min': 0,
    'Packet Length Max': lambda: random.randint(0, 50),
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
    'Avg Packet Size': lambda: random.uniform(0, 50),
    'Avg Fwd Segment Size': lambda: random.uniform(0, 25),
    'Avg Bwd Segment Size': 0.0,
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
    'Init Fwd Win Bytes': 256,
    'Init Bwd Win Bytes': -1,
    'Fwd Act Data Packets': lambda: random.randint(5, 20),
    'Fwd Seg Size Min': 20,
    'Active Mean': 0.0,
    'Active Std': 0.0,
    'Active Max': 0,
    'Active Min': 0,
    'Idle Mean': 0.0,
    'Idle Std': 0.0,
    'Idle Max': 0,
    'Idle Min': 0
}

MALICIOUS_TEMPLATES = {
    "SQL_INJECTION": {
        "log_info": {"path": "/products.php?id=1' OR '1'='1", "user_agent": "sqlmap/1.6"},
        "features": {
            'Fwd Packets Length Total': lambda: random.randint(100, 400),
            'Fwd Packet Length Mean': lambda: random.uniform(50, 150),
            'PSH Flag Count': 1, # PSH flag is common
            'Flow Duration': lambda: random.randint(5000, 20000),
        }
    },
    "XSS_ATTACK": {
        "log_info": {"path": "/search?q=<script>alert('XSS')</script>", "user_agent": "Mozilla/5.0"},
        "features": {
            'Fwd Packets Length Total': lambda: random.randint(500, 1500),
            'Fwd Packet Length Max': lambda: random.randint(400, 1000),
            'Fwd Packet Length Mean': lambda: random.uniform(200, 500),
            'Fwd PSH Flags': 1, # PSH flag is common to push the script payload
            'Flow Duration': lambda: random.randint(10000, 50000),
        }
    },
    "STATISTICAL_ANOMALY": {
        "log_info": {"path": "/api/v2/metrics", "user_agent": "Internal-Scanner/1.0"},
        "features": {
            'Flow Duration': lambda: random.randint(1, 100),
            'Total Fwd Packets': lambda: random.randint(1000, 5000),
            'Flow Packets/s': lambda: random.uniform(100000, 900000),
            'Fwd Packets/s': lambda: random.uniform(100000, 900000),
            'Init Fwd Win Bytes': 0,
        }
    },
    "STRUCTURAL_ANOMALY": {
        "log_info": {"path": "/auth/token", "user_agent": "Go-http-client/1.1"},
        "features": {
            'Total Fwd Packets': 10,
            'Fwd Packets Length Total': 0,
            'Fwd Packet Length Max': 0,
            'Fwd Packet Length Mean': 0,
            'Fwd Packet Length Std': 0,
            'Flow Bytes/s': 0,
            'ACK Flag Count': 0,
            'SYN Flag Count': 1,
        }
    }
}


# --- Initialize GeoIP Reader ---
# This should be outside the function so it's only loaded once.
try:
    geoip_reader = geoip2.database.Reader('GeoLite2-City.mmdb')
except FileNotFoundError:
    print("GeoLite2-City.mmdb not found. Map functionality will be limited.")
    geoip_reader = None

def generate_log():
    """
    Generates a tuple containing:
    1. A human-readable log dictionary for the frontend.
    2. A pandas DataFrame with 77 features for the ML model.
    """
    is_malicious = random.random() < 0.3  # 30% chance of being malicious

    # --- 1. Generate the human-readable log ---
    log_dict = {
        "timestamp": datetime.now().isoformat(),
        "ip": f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}",
        "method": random.choice(["GET", "POST", "DELETE", "PUT"]),
        "path": f"/{random.randint(1, 100)}",
        "status": random.choice([200, 201, 304, 404, 500]),
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # Add GeoIP data if the reader is available
    if geoip_reader:
        try:
            response = geoip_reader.city(log_dict['ip'])
            log_dict['location'] = {
                'latitude': response.location.latitude,
                'longitude': response.location.longitude,
                'city': response.city.name,
                'country': response.country.name
            }
        except geoip2.errors.AddressNotFoundError:
            # IP not found in the database (e.g., private IP), skip adding location
            log_dict['location'] = None

    if is_malicious:
        # --- UPDATED: Randomly select an attack type ---
        attack_type = random.choice(list(MALICIOUS_TEMPLATES.keys()))
        attack_template = MALICIOUS_TEMPLATES[attack_type]
        
        # --- CRITICAL CHANGE: Start from a BENIGN baseline, then apply attack features ---
        base_template = BENIGN_TEMPLATE.copy()
        base_template.update(attack_template["features"])
        
        # Update the human-readable log info
        log_dict.update(attack_template["log_info"])
        log_dict["attack_type_simulated"] = attack_type # Add for clarity
    else:
        log_dict.update({
            "method": random.choice(["GET", "POST", "PUT", "DELETE"]),
            "path": f"/{random.choice(['api/v1/users', 'assets/img.png', 'search/blog', ''])}",
            "status": random.choice([200, 201, 304]),
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
        # Add jitter to non-zero numerical values
        if isinstance(value, (int, float)) and value > 0 and name not in ['Total Fwd Packets', 'Fwd Packets Length Total']:
            jitter = value * 0.1
            value = random.uniform(value - jitter, value + jitter)
        feature_dict[name] = value

    # Create DataFrame with correct column names
    feature_df = pd.DataFrame([feature_dict], columns=FEATURE_NAMES)

    return log_dict, feature_df