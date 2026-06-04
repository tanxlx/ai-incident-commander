"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Terminal, Activity, AlertTriangle, Send, RefreshCw } from 'lucide-react';

interface MetricData {
  timestamp: string;
  cpu_utilization: number;
  error_rate_percent: number;
  latency_ms: number;
}

interface IncidentEvent {
  time: string;
  event: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [incidents, setIncidents] = useState<IncidentEvent[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hello! I am your AI Incident Commander. Ask me anything about system health or specific failures.' }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const metricsRes = await fetch('http://127.0.0.1:8000/api/v1/metrics');
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.reverse());

      const incidentsRes = await fetch('http://127.0.0.1:8000/api/v1/incidents');
      const incidentsData = await incidentsRes.json();
      setIncidents(incidentsData);
    } catch (error) {
      console.error("Backend connection error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', text: data.analysis }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: '❌ Error: Cannot connect to AI Brain Backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <Terminal className="text-red-500 w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">
            AI Incident Commander <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 ml-2">MVP v1.0</span>
          </h1>
        </div>
        <button onClick={fetchData} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
          <RefreshCw className="w-4 h-4" /> <span>Sync Telemetry</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="text-emerald-400 w-5 h-5" />
              <h2 className="text-lg font-semibold">System Telemetry (Real-time)</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timestamp" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  <Line type="monotone" dataKey="latency_ms" stroke="#f43f5e" strokeWidth={2} name="Latency (ms)" />
                  <Line type="monotone" dataKey="cpu_utilization" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 mt-2">* Notice the critical latency spike in the last 3 minutes.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="text-amber-500 w-5 h-5" />
              <h2 className="text-lg font-semibold">Infrastructure Event Log Timeline</h2>
            </div>
            <div className="space-y-4">
              {incidents.map((evt, idx) => (
                <div key={idx} className="flex items-start space-x-3 border-l-2 border-slate-800 pl-4 ml-2 relative">
                  <div className="absolute w-2.5 h-2.5 bg-slate-700 rounded-full -left-[6px] top-1.5 border border-slate-950"></div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{evt.time}</span>
                  <p className="text-sm text-slate-300 font-mono">{evt.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-120px)] shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-xl">
            <h2 className="font-semibold text-md flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>AI Core Reasoning Engine</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg max-w-[90%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}>
                <strong>{msg.role === 'user' ? '👉 You: ' : '🤖 Commander: '}</strong>
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-xs text-slate-500 animate-pulse">AI is parsing logs and correlating metrics...</div>}
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-xl flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="e.g., Why did checkout fail?"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-slate-700 text-slate-200"
            />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition flex items-center space-x-1">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
