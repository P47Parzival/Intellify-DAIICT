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