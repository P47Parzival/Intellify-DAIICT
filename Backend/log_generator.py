import random
import datetime
from faker import Faker

fake = Faker()

def generate_log():
    ip = fake.ipv4()
    # Make some IPs more frequent
    if random.random() < 0.1:
        ip = "192.168.1.105"
    
    # Introduce malicious IPs
    if random.random() < 0.05:
        ip = "10.0.0.5"

    method = random.choice(["GET", "POST", "PUT", "DELETE"])
    
    # Introduce malicious paths
    if random.random() < 0.05:
        path = "/etc/passwd"
    else:
        path = fake.uri_path()

    status = random.choice([200, 201, 301, 404, 500])
    
    # Introduce malicious status codes
    if random.random() < 0.05:
        status = 401

    user_agent = fake.user_agent()
    
    # Introduce malicious user agents
    if random.random() < 0.05:
        user_agent = "sqlmap/1.5.9"

    timestamp = datetime.datetime.now().isoformat()

    return {
        "timestamp": timestamp,
        "ip": ip,
        "method": method,
        "path": path,
        "status": status,
        "user_agent": user_agent,
    }
