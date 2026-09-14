import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import DecisionView from './components/DecisionView';
import FeedbackLoopView from './components/FeedbackLoopView';
import InventoryDashboard from './components/InventoryDashboard';
import EvaluationSuiteView from './components/EvaluationSuiteView';
import { Database, Award, BrainCircuit } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  const [selectedScenario, setSelectedScenario] = useState('scenario_1');
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [decision, setDecision] = useState(null);
  const [erpState, setErpState] = useState(null);
  const [evaluations, setEvaluations] = useState(null);
  const [activeTab, setActiveTab] = useState('agent'); // 'agent' | 'erp' | 'evals'

  // Helper fetch method with fallback to direct backend URL
  const apiFetch = async (path, options = {}) => {
    try {
      const res = await fetch(path, options);
      if (res.ok) return res;
    } catch (e) {
      console.warn('Proxy fetch failed, trying direct backend URL:', e);
    }
    const directUrl = `${API_BASE}${path}`;
    return await fetch(directUrl, options);
  };

  // Fetch ERP state on load
  const fetchErpState = async () => {
    try {
      const res = await apiFetch('/api/erp/state');
      if (res.ok) {
        const data = await res.json();
        setErpState(data);
      }
    } catch (err) {
      console.error('Failed to fetch ERP state:', err);
    }
  };

  const handleResetData = async () => {
    setLoading(true);
    try {
      await apiFetch('/api/erp/reset', { method: 'POST' });
      await fetchErpState();
      // Re-run scenario 1 after resetting ERP state
      await runScenario('scenario_1');
    } catch (err) {
      console.error('Failed to reset ERP state:', err);
    } finally {
      setLoading(false);
    }
  };

  const runScenario = async (scenarioId) => {
    setSelectedScenario(scenarioId);
    setLoading(true);
    try {
      const res = await apiFetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenarioId,
          provider: 'gemini'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDecision(data);
        await fetchErpState();
      } else {
        console.error('API Error:', res.status, await res.text());
      }
    } catch (err) {
      console.error('Error running scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const runEvaluationSuite = async () => {
    setEvalLoading(true);
    try {
      const res = await apiFetch('/api/evaluations');
      if (res.ok) {
        const data = await res.json();
        setEvaluations(data);
      }
    } catch (err) {
      console.error('Error running evaluations:', err);
    } finally {
      setEvalLoading(false);
    }
  };

  useEffect(() => {
    fetchErpState();
    // Run initial scenario 1 on startup
    runScenario('scenario_1');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rappi-orange selection:text-white">
      {/* Top Header */}
      <Header onResetData={handleResetData} />

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-2 ${
                activeTab === 'agent'
                  ? 'bg-rappi-orange text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="h-4 w-4" />
              Agent Command Center & Scenarios
            </button>
            <button
              onClick={() => setActiveTab('erp')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-2 ${
                activeTab === 'erp'
                  ? 'bg-rappi-orange text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="h-4 w-4" />
              ERP State & Warehouse Storage
            </button>
            <button
              onClick={() => setActiveTab('evals')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-2 ${
                activeTab === 'evals'
                  ? 'bg-rappi-orange text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="h-4 w-4" />
              Automated Evaluation Suite
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              FastAPI Engine Online (127.0.0.1:8000)
            </span>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {activeTab === 'agent' && (
          <>
            {/* Scenario Trigger Cards */}
            <ScenarioSelector
              selectedScenario={selectedScenario}
              onSelectScenario={runScenario}
              loading={loading}
            />

            {/* Executive Decision Summary Card */}
            {decision && <DecisionView decision={decision} />}

            {/* Post-Action Feedback Validation Card */}
            {decision?.validation && <FeedbackLoopView validation={decision.validation} />}
          </>
        )}

        {activeTab === 'erp' && <InventoryDashboard erpState={erpState} />}

        {activeTab === 'evals' && (
          <EvaluationSuiteView
            evaluations={evaluations}
            onRunEvaluations={runEvaluationSuite}
            loading={evalLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-sans">
        Rappi AI Purchasing Agent — Full-Stack Assignment Solution • segregated backend (FastAPI) & frontend (Vite React)
      </footer>
    </div>
  );
}
