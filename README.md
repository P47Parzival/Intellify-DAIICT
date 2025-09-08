# Intellify - SOC-style Dashboard

This project is a SOC-style dashboard that displays real-time raw alerts and alerts flagged as malicious by a machine learning model.

## Tech Stack

- **Frontend**: React, Tailwind CSS, WebSockets/REST API
- **Backend**: FastAPI (Python)
- **ML Layer**: Simple anomaly detection model (scikit-learn)

## How to Run

1.  **Prerequisites**:
    *   Docker and Docker Compose installed.

2.  **Build and Run the Application**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the Application**:
    *   **Frontend**: Open your browser and navigate to `http://localhost:5173`
    *   **Backend API**:
        *   Raw alerts: `http://localhost:8000/alerts/raw`
        *   Processed (malicious) alerts: `http://localhost:8000/alerts/processed`
        *   API docs: `http://localhost:8000/docs`

## Project Structure

```
.
├── Backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── log_generator.py
│   ├── ml_model.py
│   └── requirements.txt
├── Frontend/
│   ├── Dockerfile
│   ├── src/
│   └── ... (React app files)
└── docker-compose.yml
```
