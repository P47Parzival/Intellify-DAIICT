# Intellify: AI-Driven Security Intelligence Platform

Intellify is a multi-faceted security intelligence platform designed to empower an entire organization, from SOC analysts to executives, in the fight against cyber threats. It moves beyond simple alerting by providing real-time detection, contextual enrichment, actionable intelligence, and strategic insights through a role-based, interactive web interface.

<!-- Add a GIF or screenshot of the dashboard in action here! -->
<!-- ![Intellify Dashboard](link-to-your-screenshot.png) -->

---

## The Problem: Alert Fatigue & Lack of Context

Modern security teams are overwhelmed. They face a constant barrage of alerts from disparate systems, leading to "alert fatigue" where critical threats can be easily missed. Furthermore, these alerts often lack the business context needed for effective prioritization. An attack on a test server is not the same as an attack on a production database, yet they often look identical in a log stream.

This creates a multi-level challenge:
*   **SOC Analysts** need to quickly identify and prioritize genuine threats from a sea of noise.
*   **Incident Responders** need immediate, actionable steps to contain a threat.
*   **Executives** need high-level, strategic insights into the organization's security posture, not raw log data.
*   **Non-technical Users** are a potential source of intelligence but have no easy way to contribute.

## Our Solution: A Multi-Persona Intelligence Platform

Intellify addresses these challenges with a unified platform that provides a tailored experience for different user roles.

*   **For the SOC Analyst:** A real-time operational dashboard visualizes global traffic, highlights malicious activity with geographic context, and provides deep-dive capabilities into every alert.
*   **For the Incident Responder:** Every malicious alert is enriched with asset criticality and a step-by-step remediation playbook, turning detection into immediate action.
*   **For the Executive:** A dedicated KPI dashboard translates raw security events into easy-to-understand charts and trends, answering the crucial question: "How secure are we over time?"
*   **For the Normal User:** A simple, intuitive portal allows any employee to become part of the security apparatus by reporting suspicious activity, which is fed directly to the SOC team for investigation.

---

## Key Features

*   **Multi-Layered AI/ML Detection:** Utilizes a sophisticated ensemble of machine learning models to detect a wide variety of threats, minimizing false positives and providing clear reasons for each alert.
*   **Role-Based Access Control (RBAC):**
    *   **SOC Role:** Password-protected access to the full suite of monitoring and analysis tools.
    *   **User Role:** A simplified interface for reporting suspicious IPs.
*   **Real-Time SOC Dashboard:**
    *   **Global Traffic & Attack Maps:** Live visualization of all network traffic and confirmed malicious sources on interactive world maps.
    *   **Live Log Streams:** Separate, real-time feeds for all network traffic and confirmed malicious alerts.
    *   **Actionable Alert Panel:** Each alert is enriched with a risk score, asset context (owner, purpose, criticality), and a collapsible view showing the raw feature data used for the prediction.
    *   **Remediation Playbooks:** Concrete, step-by-step instructions on how to handle specific threats.
*   **Dynamic Asset Inventory:**
    *   Features an auto-discovery mode that automatically populates the asset list from network traffic.
    *   Allows analysts to see the business context (owner, purpose, criticality) of any IP address.
*   **Executive KPI Dashboard:**
    *   Presents strategic insights with adjustable time ranges (24 Hours, 7 Days, 30 Days).
    *   Visualizes trends for Total Alerts, Average Risk Score, Alerts by Type, and Alerts by Asset Criticality.
*   **Crowdsourced Threat Intelligence:**
    *   A dedicated portal for non-technical users to report suspicious IPs.
    *   A panel on the SOC dashboard to display, track, and manage these user-submitted reports.
*   **Persistent Data:** Utilizes a SQLite database on the backend to ensure that alert history, asset information, and user reports persist across server restarts.

---

## System Architecture & Flow

Intellify is built on a modern, decoupled architecture with a Python backend and a React frontend.

### Backend (FastAPI)

1.  **Log Generation (`log_generator.py`):** A simulator generates realistic network log data, including a mix of benign traffic and various pre-defined attack patterns (Port Scans, XSS, etc.).
2.  **ML Inference (`ml_model.py`):** Each generated log is processed in real-time by the machine learning ensemble.
3.  **Data Persistence (`database.py`):** Malicious alerts, user-reported IPs, and asset information are stored in a persistent SQLite database.
4.  **Real-time Communication (WebSockets):**
    *   `/ws/raw`: Streams all generated logs to the frontend.
    *   `/ws/processed`: Streams only the logs flagged as malicious by the ML models.
5.  **REST APIs:**
    *   `/api/kpis`: Aggregates historical alert data from the database to power the Executive Dashboard.
    *   `/api/assets`: Serves the dynamic asset inventory.
    *   `/api/report_ip`: Allows users to submit suspicious IPs.
    *   `/api/reported_ips`: Provides the list of user-submitted IPs to the SOC dashboard.

### Frontend (React)

*   **Component-Based UI:** The interface is built with reusable React components (e.g., `WorldMap`, `MaliciousAlertsPanel`, `ExecutiveDashboard`).
*   **Real-Time Updates:** Components subscribe to the WebSocket streams to update the UI live without needing page reloads.
*   **Interactive Visualizations:** Uses `recharts` for KPI charts and `react-simple-maps` for geographic visualizations.
*   **Role-Based Routing:** Uses `localStorage` to maintain login state and directs users to the appropriate view (Login Page, SOC Dashboard, or User Reporting Page).

### Machine Learning Ensemble

Intellify uses an ensemble of diverse models, where each model is specialized to detect a different kind of anomalous behavior. This layered approach provides robust and explainable detections.

*   **LightGBM (Main Classifier):** A gradient-boosting model trained on a wide range of attacks. It acts as the primary workhorse for identifying general malicious patterns.
*   **LightGBM (Specialist):** A model fine-tuned specifically to detect "Web Attack - XSS". It provides high-confidence alerts for this specific threat vector.
*   **Isolation Forest:** An unsupervised model excellent at detecting statistical outliers. It's effective at finding anomalies like DDoS attempts or scanning activity with unusually high packet rates.
*   **One-Class SVM:** Another unsupervised model trained only on "benign" traffic. It excels at identifying novel anomalies that do not conform to any known traffic pattern, benign or malicious.
*   **Autoencoder (TensorFlow/Keras):** A deep learning neural network trained to reconstruct benign traffic. When it fails to accurately reconstruct a given traffic sample (resulting in a high "reconstruction error"), it indicates a structural anomaly, such as a malformed packet.
*   **Risk Scoring:** Each model contributes to a cumulative risk score. Specialist models and those detecting severe anomalies (like the Autoencoder) contribute more, allowing for automatic prioritization of alerts.

---

## Tech Stack

*   **Backend**: Python, FastAPI, WebSockets
*   **Frontend**: React, TypeScript, Tailwind CSS, Vite
*   **Machine Learning**: scikit-learn, LightGBM, TensorFlow/Keras
*   **Data Persistence**: SQLite
*   **Visualization**: Recharts, react-simple-maps

---

## How to Run

### Using Docker (Recommended)

1.  **Prerequisites**: Docker and Docker Compose must be installed.
2.  **Build and Run**: From the project root, run the following command:
    ```bash
    docker-compose up --build
    ```
3.  **Access the Application**:
    *   **Frontend**: Open your browser and navigate to `http://localhost:5173`

### Local Development

#### Backend
1.  Navigate to the `Backend/` directory.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
4.  The backend will be available at `http://localhost:8000`.

#### Frontend
1.  Navigate to the `Frontend/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  The frontend will be available at `http://localhost:5173`.
```# filepath: c:\Users\dhruv\OneDrive\Desktop\Intellify\README.md
# Intellify: AI-Driven Security Intelligence Platform

Intellify is a multi-faceted security intelligence platform designed to empower an entire organization, from SOC analysts to executives, in the fight against cyber threats. It moves beyond simple alerting by providing real-time detection, contextual enrichment, actionable intelligence, and strategic insights through a role-based, interactive web interface.

<!-- Add a GIF or screenshot of the dashboard in action here! -->
<!-- ![Intellify Dashboard](link-to-your-screenshot.png) -->

---

## The Problem: Alert Fatigue & Lack of Context

Modern security teams are overwhelmed. They face a constant barrage of alerts from disparate systems, leading to "alert fatigue" where critical threats can be easily missed. Furthermore, these alerts often lack the business context needed for effective prioritization. An attack on a test server is not the same as an attack on a production database, yet they often look identical in a log stream.

This creates a multi-level challenge:
*   **SOC Analysts** need to quickly identify and prioritize genuine threats from a sea of noise.
*   **Incident Responders** need immediate, actionable steps to contain a threat.
*   **Executives** need high-level, strategic insights into the organization's security posture, not raw log data.
*   **Non-technical Users** are a potential source of intelligence but have no easy way to contribute.

## Our Solution: A Multi-Persona Intelligence Platform

Intellify addresses these challenges with a unified platform that provides a tailored experience for different user roles.

*   **For the SOC Analyst:** A real-time operational dashboard visualizes global traffic, highlights malicious activity with geographic context, and provides deep-dive capabilities into every alert.
*   **For the Incident Responder:** Every malicious alert is enriched with asset criticality and a step-by-step remediation playbook, turning detection into immediate action.
*   **For the Executive:** A dedicated KPI dashboard translates raw security events into easy-to-understand charts and trends, answering the crucial question: "How secure are we over time?"
*   **For the Normal User:** A simple, intuitive portal allows any employee to become part of the security apparatus by reporting suspicious activity, which is fed directly to the SOC team for investigation.

---

## Key Features

*   **Multi-Layered AI/ML Detection:** Utilizes a sophisticated ensemble of machine learning models to detect a wide variety of threats, minimizing false positives and providing clear reasons for each alert.
*   **Role-Based Access Control (RBAC):**
    *   **SOC Role:** Password-protected access to the full suite of monitoring and analysis tools.
    *   **User Role:** A simplified interface for reporting suspicious IPs.
*   **Real-Time SOC Dashboard:**
    *   **Global Traffic & Attack Maps:** Live visualization of all network traffic and confirmed malicious sources on interactive world maps.
    *   **Live Log Streams:** Separate, real-time feeds for all network traffic and confirmed malicious alerts.
    *   **Actionable Alert Panel:** Each alert is enriched with a risk score, asset context (owner, purpose, criticality), and a collapsible view showing the raw feature data used for the prediction.
    *   **Remediation Playbooks:** Concrete, step-by-step instructions on how to handle specific threats.
*   **Dynamic Asset Inventory:**
    *   Features an auto-discovery mode that automatically populates the asset list from network traffic.
    *   Allows analysts to see the business context (owner, purpose, criticality) of any IP address.
*   **Executive KPI Dashboard:**
    *   Presents strategic insights with adjustable time ranges (24 Hours, 7 Days, 30 Days).
    *   Visualizes trends for Total Alerts, Average Risk Score, Alerts by Type, and Alerts by Asset Criticality.
*   **Crowdsourced Threat Intelligence:**
    *   A dedicated portal for non-technical users to report suspicious IPs.
    *   A panel on the SOC dashboard to display, track, and manage these user-submitted reports.
*   **Persistent Data:** Utilizes a SQLite database on the backend to ensure that alert history, asset information, and user reports persist across server restarts.

---

## System Architecture & Flow

Intellify is built on a modern, decoupled architecture with a Python backend and a React frontend.

### Backend (FastAPI)

1.  **Log Generation (`log_generator.py`):** A simulator generates realistic network log data, including a mix of benign traffic and various pre-defined attack patterns (Port Scans, XSS, etc.).
2.  **ML Inference (`ml_model.py`):** Each generated log is processed in real-time by the machine learning ensemble.
3.  **Data Persistence (`database.py`):** Malicious alerts, user-reported IPs, and asset information are stored in a persistent SQLite database.
4.  **Real-time Communication (WebSockets):**
    *   `/ws/raw`: Streams all generated logs to the frontend.
    *   `/ws/processed`: Streams only the logs flagged as malicious by the ML models.
5.  **REST APIs:**
    *   `/api/kpis`: Aggregates historical alert data from the database to power the Executive Dashboard.
    *   `/api/assets`: Serves the dynamic asset inventory.
    *   `/api/report_ip`: Allows users to submit suspicious IPs.
    *   `/api/reported_ips`: Provides the list of user-submitted IPs to the SOC dashboard.

### Frontend (React)

*   **Component-Based UI:** The interface is built with reusable React components (e.g., `WorldMap`, `MaliciousAlertsPanel`, `ExecutiveDashboard`).
*   **Real-Time Updates:** Components subscribe to the WebSocket streams to update the UI live without needing page reloads.
*   **Interactive Visualizations:** Uses `recharts` for KPI charts and `react-simple-maps` for geographic visualizations.
*   **Role-Based Routing:** Uses `localStorage` to maintain login state and directs users to the appropriate view (Login Page, SOC Dashboard, or User Reporting Page).

### Machine Learning Ensemble

Intellify uses an ensemble of diverse models, where each model is specialized to detect a different kind of anomalous behavior. This layered approach provides robust and explainable detections.

*   **LightGBM (Main Classifier):** A gradient-boosting model trained on a wide range of attacks. It acts as the primary workhorse for identifying general malicious patterns.
*   **LightGBM (Specialist):** A model fine-tuned specifically to detect "Web Attack - XSS". It provides high-confidence alerts for this specific threat vector.
*   **Isolation Forest:** An unsupervised model excellent at detecting statistical outliers. It's effective at finding anomalies like DDoS attempts or scanning activity with unusually high packet rates.
*   **One-Class SVM:** Another unsupervised model trained only on "benign" traffic. It excels at identifying novel anomalies that do not conform to any known traffic pattern, benign or malicious.
*   **Autoencoder (TensorFlow/Keras):** A deep learning neural network trained to reconstruct benign traffic. When it fails to accurately reconstruct a given traffic sample (resulting in a high "reconstruction error"), it indicates a structural anomaly, such as a malformed packet.
*   **Risk Scoring:** Each model contributes to a cumulative risk score. Specialist models and those detecting severe anomalies (like the Autoencoder) contribute more, allowing for automatic prioritization of alerts.

---

## Tech Stack

*   **Backend**: Python, FastAPI, WebSockets
*   **Frontend**: React, TypeScript, Tailwind CSS, Vite
*   **Machine Learning**: scikit-learn, LightGBM, TensorFlow/Keras
*   **Data Persistence**: SQLite
*   **Visualization**: Recharts, react-simple-maps

---

## How to Run

### Using Docker (Recommended)

1.  **Prerequisites**: Docker and Docker Compose must be installed.
2.  **Build and Run**: From the project root, run the following command:
    ```bash
    docker-compose up --build
    ```
3.  **Access the Application**:
    *   **Frontend**: Open your browser and navigate to `http://localhost:5173`

### Local Development

#### Backend
1.  Navigate to the `Backend/` directory.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
4.  The backend will be available at `http://localhost:8000`.

#### Frontend
1.  Navigate to the `Frontend/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  The frontend will be available at `http://localhost:5173`.