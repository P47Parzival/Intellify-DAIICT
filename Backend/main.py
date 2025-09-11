import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd

from pydantic import BaseModel
from log_generator import generate_log
from ml_model import model_instance
from collections import Counter
import database
from datetime import datetime, timedelta

# --- NEW: In-memory store for historical alerts ---
HISTORICAL_ALERTS = []

# --- NEW: Mock Asset Inventory Database ---
ASSET_INVENTORY = {
    "8.90.36.189": {"owner": "Finance Dept", "purpose": "Payroll Server", "criticality": "High"},
    "209.93.15.12": {"owner": "Marketing Team", "purpose": "Campaign Analytics", "criticality": "Medium"},
    "104.28.15.99": {"owner": "Engineering", "purpose": "CI/CD Jenkins Runner", "criticality": "Medium"},
    "45.33.32.156": {"owner": "Public Relations", "purpose": "Public Blog (WordPress)", "criticality": "Low"},
    # Add more simulated assets that match IPs your generator might create
}

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReportPayload(BaseModel):
    ip: str

@app.post("/api/report_ip")
async def report_ip(payload: ReportPayload):
    # Basic IP validation could be added here
    database.report_suspicious_ip(payload.ip)
    return {"message": f"IP address {payload.ip} reported successfully. Thank you!"}

@app.get("/api/reported_ips")
async def get_reported_ips_endpoint():
    return database.get_reported_ips()

@app.get("/api/kpis")
async def get_kpis(range_days: int = 1): # Default to 1 day (24h)
    
    alerts = database.get_alerts_in_range(days=range_days)
    
    # 1. Alerts by Type (Reason)
    alerts_by_type = Counter(alert['reason'] for alert in alerts)
    
    # 2. Alerts by Asset Criticality
    alerts_by_criticality = Counter()
    for alert in alerts:
        asset = ASSET_INVENTORY.get(alert['ip'])
        if asset:
            alerts_by_criticality[asset['criticality']] += 1
        else:
            alerts_by_criticality['Unknown'] += 1
            
    # 3. Alerts over time (by day for multi-day, by hour for 24h)
    if range_days == 1:
        time_format = '%H:00'
        time_delta_unit = 'hours'
        num_units = 24
    else:
        time_format = '%Y-%m-%d'
        time_delta_unit = 'days'
        num_units = range_days

    alerts_over_time = { (datetime.now() - timedelta(**{time_delta_unit: i})).strftime(time_format): 0 for i in range(num_units) }
    for alert in alerts:
        hour_key = datetime.fromisoformat(alert['timestamp']).strftime(time_format)
        if hour_key in alerts_over_time:
            alerts_over_time[hour_key] += 1
            
    alerts_over_time_list = sorted(
        [{"time": key, "alerts": value} for key, value in alerts_over_time.items()],
        key=lambda x: x['time']
    )

    return {
        "total_alerts": len(alerts),
        "average_risk_score": sum(a['risk_score'] for a in alerts) / len(alerts) if alerts else 0,
        "alerts_by_type": [{"name": name, "value": value} for name, value in alerts_by_type.items()],
        "alerts_by_criticality": [{"name": name, "value": value} for name, value in alerts_by_criticality.items()],
        "alerts_over_time": alerts_over_time_list
    }

@app.get("/api/assets")
async def get_assets():
    return ASSET_INVENTORY

class ConnectionManager:
    """Manages active WebSocket connections."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to connection: {e}")

# Create managers for both raw and processed alert streams
raw_manager = ConnectionManager()
processed_manager = ConnectionManager()

async def log_processing_task():
    """Generate, classify, and broadcast logs via WebSockets."""
    while True:
        try:
            log_dict, feature_df = generate_log()

            # --- NEW: Asset Auto-Discovery Logic ---
            # Check if the IP from the new log exists in our inventory.
            # If not, add it with default "unassigned" values.
            ip_address = log_dict.get("ip")
            if ip_address and ip_address not in ASSET_INVENTORY:
                ASSET_INVENTORY[ip_address] = {
                    "owner": "Unassigned",
                    "purpose": "Auto-Discovered Host",
                    "criticality": "Low"
                }

            # Combine metadata and feature data into a single payload
            feature_data_dict = feature_df.iloc[0].to_dict()
            payload = log_dict
            payload['features'] = feature_data_dict

            # Broadcast the full payload to all connected raw clients
            await raw_manager.broadcast(json.dumps(payload))
            
            # Get the detailed prediction result from the model
            prediction_result = model_instance.is_malicious(feature_df)
            
            # Check the boolean flag from the result dictionary
            if prediction_result["is_malicious"]:
                # Add risk score, reason, and playbook to the payload
                payload['risk_score'] = prediction_result['risk_score']
                payload['reason'] = prediction_result['reason']
                payload['playbook'] = prediction_result['playbook']
                
                # --- UPDATED: Store alert in the database ---
                database.add_alert(payload)
                
                # Broadcast the enriched payload to processed clients
                await processed_manager.broadcast(json.dumps(payload))
            
            await asyncio.sleep(1)
        except Exception as e:
            print(f"Error in log processing task: {e}")

@app.on_event("startup")
async def startup_event():
    database.init_db()  # Initialize the database on server start
    asyncio.create_task(log_processing_task())

@app.websocket("/ws/raw")
async def websocket_raw_alerts(websocket: WebSocket):
    await raw_manager.connect(websocket)
    print("Raw client connected")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        raw_manager.disconnect(websocket)
        print("Raw client disconnected")

@app.websocket("/ws/processed")
async def websocket_processed_alerts(websocket: WebSocket):
    await processed_manager.connect(websocket)
    print("Processed client connected")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        processed_manager.disconnect(websocket)
        print("Processed client disconnected")