# AnomalyForge: AI-Driven Security Intelligence Platform

AnomalyForge is a comprehensive, real-time security intelligence platform designed to empower an entire organization—from SOC analysts to executives—in the fight against cyber threats. It transforms the traditional, reactive security model into a proactive, intelligence-driven operation by providing multi-layered AI detection, deep contextual enrichment, and role-specific, actionable insights.

Video Link : https://drive.google.com/file/d/1BWrs1hgQ96ievQgb5AeCOIA_vWZEvp_s/view?usp=drive_link 

### Platform Showcase
<table>
  <tr>
    <td align="center"><strong>Main Dashboard</strong><br>Real-time maps showing global traffic and malicious attack origins.</td>
    <td align="center"><strong>Asset Inventory</strong><br>A dynamic, auto-discovered list of all network assets and their business context.</td>
  </tr>
  <tr>
    <td><img src="https://github.com/P47Parzival/Intellify-DAIICT/blob/main/dashboard.png?raw=true" alt="Main Dashboard View"></td>
    <td><img src="https://github.com/P47Parzival/Intellify-DAIICT/blob/main/charts.png?raw=true" alt="Asset Inventory Page"></td>
  </tr>
  <tr>
    <td align="center"><strong>Executive KPI Dashboard</strong><br>High-level strategic insights with trends for alerts, risk, and asset criticality.</td>
    <td align="center"><strong>Actionable Security Alerts</strong><br>Context-rich alerts with risk scores, playbooks, and deep-dive capabilities.</td>
  </tr>
  <tr>
    <td><img src="https://github.com/P47Parzival/Intellify-DAIICT/blob/main/dashboard.jpg?raw=true" alt="Executive KPI Dashboard"></td>
    <td><img src="https://github.com/P47Parzival/Intellify-DAIICT/blob/main/asset.jpg?raw=true" alt="Security Alerts Panel"></td>
  </tr>
   <tr>
    <td align="center"><strong>SOC Authentication</strong><br>Secure, role-based access control for SOC team members.</td>
    <td align="center"></td>
  </tr>
   <tr>
    <td><img src="https://github.com/P47Parzival/Intellify-DAIICT/blob/main/login.png?raw=true" alt="SOC Authentication Modal"></td>
    <td></td>
  </tr>
</table>

---
![AnomalyForge Dashboard](https://github.com/P47Parzival/Intellify-DAIICT/blob/main/Intellify-DAIICT.jpg?raw=true) 

---

## The Problem: Drowning in Data, Starving for Intelligence

Modern security teams are overwhelmed. They face a constant deluge of alerts from disparate systems, leading to "alert fatigue" where critical threats are easily missed. These alerts often lack the business context needed for effective prioritization. An attack on a test server is not the same as an attack on a production database, yet they often look identical in a log stream. This creates a multi-level challenge:

*   **SOC Analysts** need to quickly identify and prioritize genuine threats from a sea of noise.
*   **Incident Responders** need immediate, actionable steps to contain a threat.
*   **Executives** need high-level, strategic insights into the organization's security posture, not raw log data.
*   **Non-technical Users** are a potential source of intelligence but have no easy way to contribute.

## Our Solution: A Multi-Persona Intelligence Platform

AnomalyForge addresses these challenges with a unified platform that provides a tailored experience for different user roles.

*   **For the SOC Analyst:** A real-time operational dashboard visualizes global traffic, highlights malicious activity with geographic context, and provides deep-dive capabilities into every alert.
*   **For the Incident Responder:** Every malicious alert is enriched with asset criticality and a step-by-step remediation playbook, turning detection into immediate action.
*   **For the Executive:** A dedicated KPI dashboard translates raw security events into easy-to-understand charts and trends, answering the crucial question: "How secure are we over time?"
*   **For the Normal User:** A simple, intuitive portal allows any employee to become part of the security apparatus by reporting suspicious activity—with specific reasons—which is fed directly to the SOC team for investigation.

---

## Key Features

*   **Multi-Layered AI/ML Detection:** Utilizes a sophisticated ensemble of machine learning models to detect a wide variety of threats, minimizing false positives and providing clear reasons for each alert.
*   **Role-Based Access Control (RBAC):**
    *   **SOC Role:** Password-protected access (`ID: 123456`, `Pass: 1234`) to the full suite of monitoring and analysis tools.
    *   **User Role:** A simplified interface for reporting suspicious IPs.
*   **Real-Time SOC Dashboard:**
    *   **Global Traffic & Attack Maps:** Live visualization of all network traffic and confirmed malicious sources on interactive world maps.
    *   **Actionable Alert Panel:** Each alert is enriched with a risk score, asset context (owner, purpose, criticality), and a collapsible view showing the raw feature data used for the prediction.
    *   **Remediation Playbooks:** Concrete, step-by-step instructions on how to handle specific threats.
*   **Crowdsourced Threat Intelligence:**
    *   A dedicated portal for non-technical users to report suspicious IPs and categorize the reason (e.g., Phishing, DDoS Attack, Spam).
    *   A panel on the SOC dashboard to display, track, and manage these user-submitted reports in real-time.
*   **Dynamic Asset Inventory:**
    *   Features an **auto-discovery** mode that automatically populates the asset list from network traffic.
    *   Allows analysts to see the business context (owner, purpose, criticality) of any IP address.
*   **Executive KPI Dashboard:**
    *   Presents strategic insights with adjustable time ranges (24 Hours, 7 Days, 30 Days).
    *   Visualizes trends for Total Alerts, Average Risk Score, Alerts by Type, and Alerts by Asset Criticality.
*   **Persistent Data:** Utilizes a **SQLite** database on the backend to ensure that alert history, asset information, and user reports persist across server restarts.

---

## System Architecture & Flow

AnomalyForge is built on a modern, decoupled architecture with a Python backend and a React frontend.

### Backend (FastAPI)

1.  **Log Generation (`log_generator.py`):** A simulator generates realistic network log data, including a mix of benign traffic and various pre-defined attack patterns (Port Scans, XSS, etc.).
2.  **ML Inference (`ml_model.py`):** Each generated log is processed in real-time by the machine learning ensemble.
3.  **Data Persistence (`database.py`):** Malicious alerts, user-reported IPs (with categories), and asset information are stored in a persistent SQLite database.
4.  **Real-time Communication (WebSockets):**
    *   `/ws/raw`: Streams all generated logs to the frontend.
    *   `/ws/processed`: Streams only the logs flagged as malicious by the ML models.
5.  **REST APIs (Pydantic for validation):**
    *   `/api/kpis`: Aggregates historical alert data from the database to power the Executive Dashboard.
    *   `/api/assets`: Serves the dynamic asset inventory.
    *   `/api/report_ip`: Allows users to submit suspicious IPs with categories.
    *   `/api/reported_ips`: Provides the list of user-submitted IPs to the SOC dashboard and User Reporting Page.

### Frontend (React)

*   **Component-Based UI:** The interface is built with reusable React components (e.g., `WorldMap`, `MaliciousAlertsPanel`, `ExecutiveDashboard`).
*   **Real-Time Updates:** Components subscribe to the WebSocket streams to update the UI live without needing page reloads.
*   **Interactive Visualizations:** Uses `recharts` for KPI charts and `react-simple-maps` for geographic visualizations.
*   **Role-Based Routing:** Uses `localStorage` to maintain login state and directs users to the appropriate view (Login Page, SOC Dashboard, or User Reporting Page).

### Machine Learning Ensemble

Our models were trained on the **CIC-IDS2017 dataset**. We use an ensemble of diverse models, where each is specialized to detect a different kind of anomalous behavior.

*   **LightGBM (Main & Specialist):** A gradient-boosting model acts as the primary workhorse for identifying general malicious patterns, with a second specialist model fine-tuned to detect "Web Attack - XSS".
*   **Isolation Forest & One-Class SVM:** Unsupervised models excellent at detecting statistical outliers and novel anomalies that do not conform to any known traffic pattern.
*   **Autoencoder (TensorFlow/Keras):** A deep learning neural network trained to reconstruct benign traffic. When it fails to accurately reconstruct a sample (high reconstruction error), it indicates a structural anomaly.
*   **Risk Scoring:** Each model contributes to a cumulative risk score, allowing for automatic prioritization of alerts.

---

## Tech Stack

| Category              | Technology                                                              |
| --------------------- | ----------------------------------------------------------------------- |
| **Frontend**          | React, TypeScript, Vite, Tailwind CSS                                   |
| **Backend**           | Python, FastAPI, Pydantic, WebSockets                                   |
| **Machine Learning**  | TensorFlow, Keras, scikit-learn, LightGBM                               |
| **Dataset**           | CIC-IDS2017                                                             |
| **Database**          | SQLite                                                                  |
| **Visualization**     | Recharts, react-simple-maps                                             |

---

## How to Run

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