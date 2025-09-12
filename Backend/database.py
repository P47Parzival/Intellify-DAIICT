import sqlite3
from datetime import datetime, timedelta
import json

DB_NAME = "security_dashboard.db"

def init_db():
    """Initializes the database and creates the alerts table if it doesn't exist."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                ip TEXT NOT NULL,
                reason TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                playbook TEXT NOT NULL,
                features TEXT NOT NULL
            )
        ''')
        # --- UPDATED: User Reported IPs Table ---
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reported_ips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT NOT NULL UNIQUE,
                report_count INTEGER DEFAULT 1,
                last_reported_at TEXT NOT NULL,
                status TEXT DEFAULT 'New',
                categories TEXT 
            )
        ''')
        conn.commit()

def add_alert(alert_data: dict):
    """Adds a new alert to the database."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO alerts (timestamp, ip, reason, risk_score, playbook, features)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            alert_data['timestamp'],
            alert_data['ip'],
            alert_data['reason'],
            alert_data['risk_score'],
            json.dumps(alert_data['playbook']),
            json.dumps(alert_data['features'])
        ))
        conn.commit()

# --- NEW: Function to handle user-reported IPs ---
def report_suspicious_ip(ip: str, categories: list[str]):
    """Adds a new suspicious IP or increments the report count of an existing one."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        categories_json = json.dumps(categories)
        
        # Try to insert a new IP. If it's a duplicate, update the count and timestamp.
        cursor.execute('''
            INSERT INTO reported_ips (ip, last_reported_at, categories) VALUES (?, ?, ?)
            ON CONFLICT(ip) DO UPDATE SET
                report_count = report_count + 1,
                last_reported_at = excluded.last_reported_at
        ''', (ip, datetime.now().isoformat(), categories_json))
        conn.commit()

# --- NEW: Function to get all reported IPs for the SOC team ---
def get_reported_ips(limit: int = 10) -> list:
    """Fetches user-reported IPs, limited to the most recent entries."""
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reported_ips ORDER BY last_reported_at DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            row_dict = dict(row)
            # Safely parse categories JSON
            try:
                row_dict['categories'] = json.loads(row_dict['categories']) if row_dict['categories'] else []
            except (json.JSONDecodeError, TypeError):
                row_dict['categories'] = []
            results.append(row_dict)
        return results
    
def get_alerts_in_range(days: int) -> list:
    """Fetches alerts from the database within a given number of past days."""
    start_date = datetime.now() - timedelta(days=days)
    start_date_iso = start_date.isoformat()
    
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts WHERE timestamp >= ?", (start_date_iso,))
        rows = cursor.fetchall()
        # Convert rows to dictionaries
        return [dict(row) for row in rows]