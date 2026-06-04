from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Frontend ke sath connect karne ke liye CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

# Mock Telemetry Data (Graphs ke liye)
@app.get("/api/v1/metrics")
def get_metrics():
    return [
        {"timestamp": "10:05", "cpu_utilization": 88, "error_rate_percent": 15, "latency_ms": 2450},
        {"timestamp": "10:04", "cpu_utilization": 85, "error_rate_percent": 12, "latency_ms": 2100},
        {"timestamp": "10:03", "cpu_utilization": 78, "error_rate_percent": 8, "latency_ms": 1850},
        {"timestamp": "10:02", "cpu_utilization": 55, "error_rate_percent": 2, "latency_ms": 400},
        {"timestamp": "10:01", "cpu_utilization": 42, "error_rate_percent": 0, "latency_ms": 85},
        {"timestamp": "10:00", "cpu_utilization": 40, "error_rate_percent": 0, "latency_ms": 75},
    ]

# Mock Incidents Timeline
@app.get("/api/v1/incidents")
def get_incidents():
    return [
        {"time": "10:04", "event": "📉 Checkout page conversion dropped to 0%"},
        {"time": "10:03", "event": "🚨 API Gateway metrics reported 502 Bad Gateway spikes"},
        {"time": "10:02", "event": "⚠️ Database connection pool reached 100% capacity"},
        {"time": "10:00", "event": "🚀 Deployment v1.2.4-patch triggered by Admin"},
    ]

# AI Assistant Chat Logic
@app.post("/api/v1/ask-ai")
def ask_ai(payload: ChatRequest):
    return {
        "analysis": "🚨 **Summary of Incident:**\nCheckout service is currently failing. API response time spiked to **2450ms** with an error rate of **15%**.\n\n🔍 **Root Cause Analysis (RCA):**\n1. **Trigger:** Deployment `v1.2.4-patch` went live at 10:00.\n2. **Issue:** New code has a connection leak, exhausting the DB pool.\n\n🛠️ **Remediation:** Revert to stable version `v1.2.3` immediately."
    }
