import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Activity, CheckCircle2, AlertCircle, RefreshCw, Database, 
  Server, Cpu, ShieldCheck, Terminal, HardDrive
} from 'lucide-react';

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/health');
      setHealth(response.data);
    } catch (err) {
      console.error('Healthcheck error:', err);
      // In case backend returned an operational 503 degraded error or network down
      if (err.errors) {
        setHealth(err.errors);
      } else {
        setError(err.message || 'Unable to contact backend server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            System & Database Health Diagnostics
          </h1>
          <p className="text-sm text-slate-500">
            Real-time verification of Express backend runtime and PostgreSQL connection status.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Run Health Diagnostic
        </button>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend API Status */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Backend Express API</h3>
                <p className="text-xs text-slate-500">Node.js HTTP Server</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                health?.service
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {health?.service ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ONLINE
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> OFFLINE
                </>
              )}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-xs font-mono space-y-1.5 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-semibold text-slate-800">{health?.service || 'SkillBridge REST API'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Environment:</span>
              <span className="text-slate-800">{health?.environment || 'development'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Uptime:</span>
              <span className="text-slate-800">{health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-800">{health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">PostgreSQL Database</h3>
                <p className="text-xs text-slate-500">Relational Database Engine</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                health?.database?.connected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {health?.database?.connected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> CONNECTED
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> PENDING CONFIG
                </>
              )}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-xs font-mono space-y-1.5 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Driver:</span>
              <span className="font-semibold text-slate-800">node-postgres (pg Pool)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Database Name:</span>
              <span className="text-slate-800">{health?.database?.database || 'skillbridge_db'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className={health?.database?.connected ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                {health?.database?.connected ? 'Ready for queries' : 'Awaiting DB instance'}
              </span>
            </div>
            {health?.database?.error && (
              <div className="pt-2 text-[11px] text-rose-600 font-sans border-t border-slate-200">
                Notice: {health.database.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Quick Setup Guide for Viva / Demo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-600" />
          Database Quick Setup Commands
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The project provides automated scripts to create and seed all tables:
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2">
          <p className="text-slate-400"># 1. Copy sample environment file and configure PostgreSQL credentials</p>
          <p className="text-indigo-400">cp backend/.env.example backend/.env</p>
          <p className="text-slate-400 pt-2"># 2. Run schema initialization (creates 13 normalized tables and constraints)</p>
          <p className="text-emerald-400">npm run db:init --prefix backend</p>
          <p className="text-slate-400 pt-2"># 3. Seed demo dataset (1 admin, 2 instructors, 5 students, 3 courses)</p>
          <p className="text-emerald-400">npm run db:seed --prefix backend</p>
        </div>
      </div>
    </div>
  );
}
