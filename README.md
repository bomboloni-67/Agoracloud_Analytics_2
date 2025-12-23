# AgoraCloud Analytics AI Engine

AgoraCloud is a high-performance analytics platform that bridges the gap between raw data and actionable insights. It features a dual-interface system: **Natural Language "Ask Data" discovery** and **High-fidelity QS Dashboards**, all secured via custom JWT authentication.

## Architecture

The application follows a modern serverless architecture designed for scalability:

1.  **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons.
2.  **Auth:** Custom JWT stored in `localStorage` for session persistence.
3.  **Backend:** AWS API Gateway + AWS Lambda (Python/Node.js).
4.  **Analytics Engine:** Amazon QuickSight (Q-Topics for discovery, Dashboards for reporting).





