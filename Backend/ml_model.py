import random

def is_malicious(log):
    """
    A simple dummy ML classifier.
    In a real-world scenario, this would be a trained model.
    """
    # Features that might indicate malicious activity
    malicious_ips = ["10.0.0.5"]
    malicious_paths = ["/etc/passwd", "/admin", "/login.php"]
    malicious_user_agents = ["sqlmap", "nmap", "nikto"]
    
    if log["ip"] in malicious_ips:
        return True
    
    for path in malicious_paths:
        if path in log["path"]:
            return True

    for agent in malicious_user_agents:
        if agent in log["user_agent"].lower():
            return True
            
    if log["status"] == 401:
        return True

    # Add some randomness to simulate a model's probabilistic nature
    if random.random() < 0.02:
        return True
        
    return False
