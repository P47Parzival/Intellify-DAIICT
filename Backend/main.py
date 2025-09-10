import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd

from log_generator import generate_log
from ml_model import model_instance

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

            # Combine metadata and feature data into a single payload
            feature_data_dict = feature_df.iloc[0].to_dict()
            payload = log_dict
            payload['features'] = feature_data_dict

            # Convert payload to JSON string for broadcasting
            payload_json = json.dumps(payload)

            # Broadcast the full payload to all connected raw clients
            await raw_manager.broadcast(payload_json)
            
            is_malicious_flag = model_instance.is_malicious(feature_df)
            
            if is_malicious_flag:
                # If malicious, broadcast the same full payload
                await processed_manager.broadcast(payload_json)
            
            await asyncio.sleep(1)
        except Exception as e:
            print(f"Error in log processing task: {e}")

@app.on_event("startup")
async def startup_event():
    """Start the background task when the app starts."""
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