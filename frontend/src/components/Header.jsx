import React, { useState } from 'react';
import { Bot, Key, Activity, RefreshCw, Layers } from 'lucide-react';

export default function Header({ apiKey, setApiKey, onResetData }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || '');

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setShowKeyModal(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rappi-orange to-amber-500 flex items-center justify-center shadow-lg shadow-rappi-orange/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Rappi Purchasing AI Agent</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-rappi-orange/20 text-rappi-orange border border-rappi-orange/30 rounded-full">
                v1.0 Autonomous
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Procurement, Decision-Making & Feedback Validation Engine</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onResetData}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition"
            title="Reset ERP Database state"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset ERP State
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              apiKey
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            {apiKey ? 'API Key Set (Live LLM)' : 'LLM Key Config (Rule Engine Active)'}
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-rappi-orange" />
                Configure LLM API Key
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300">
              By default, the agent runs using our deterministic Rule & Heuristic Reasoning Engine out-of-the-box. You may optionally enter an OpenAI or Gemini API key to enable live model reasoning.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">OpenAI / Gemini Key</label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-rappi-orange"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 text-xs font-semibold bg-rappi-orange hover:bg-rappi-darkOrange text-white rounded-lg transition shadow-lg shadow-rappi-orange/20"
              >
                Save & Apply Key
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
