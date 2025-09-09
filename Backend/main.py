import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from log_generator import generate_log
from ml_model import model_instance

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Added localhost:3000 for local dev
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
            await connection.send_text(message)

# Create managers for both raw and processed alert streams
raw_manager = ConnectionManager()
processed_manager = ConnectionManager()

async def log_processing_task():
    """Generate, classify, and broadcast logs via WebSockets."""
    while True:
        # FIX: Removed 'await' as generate_log is a synchronous function
        log = generate_log()
        
        # Broadcast the raw log to all connected raw clients
        await raw_manager.broadcast(json.dumps(log))
        
        # Use the ML model to classify the log
        is_malicious_flag = model_instance.is_malicious(log)
        
        if is_malicious_flag:
            log_with_flag = log.copy()
            log_with_flag["is_malicious"] = True
            # Broadcast the malicious log to all connected processed clients
            await processed_manager.broadcast(json.dumps(log_with_flag))
            
        await asyncio.sleep(1) # Control the rate of log generation

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
            # Keep the connection alive by waiting for messages (or timeouts)
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
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        processed_manager.disconnect(websocket)
        print("Processed client disconnected")