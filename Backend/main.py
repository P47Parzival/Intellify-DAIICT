from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from log_generator import generate_log
from ml_model import is_malicious

app = FastAPI()

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust this to your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

raw_logs = []
malicious_logs = []

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(log_generator_task())

async def log_generator_task():
    while True:
        log = generate_log()
        raw_logs.append(log)
        if is_malicious(log):
            malicious_logs.append(log)
        await asyncio.sleep(1)

@app.get("/alerts/raw")
async def get_raw_alerts():
    return raw_logs

@app.get("/alerts/processed")
async def get_processed_alerts():
    return malicious_logs

@app.websocket("/ws/raw")
async def websocket_raw_alerts(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(json.dumps(raw_logs))
            await asyncio.sleep(2)
    except Exception as e:
        print(f"WebSocket raw error: {e}")
    finally:
        await websocket.close()

@app.websocket("/ws/processed")
async def websocket_processed_alerts(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(json.dumps(malicious_logs))
            await asyncio.sleep(2)
    except Exception as e:
        print(f"WebSocket processed error: {e}")
    finally:
        await websocket.close()
