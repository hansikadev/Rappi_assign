import React from 'react';
import { Bot, RefreshCw } from 'lucide-react';

export default function Header({ onResetData }) {
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
        </div>
      </div>
    </header>
  );
}
