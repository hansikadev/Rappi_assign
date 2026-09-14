import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, AlertCircle, Play, Sparkles } from 'lucide-react';

export default function EvaluationSuiteView({ evaluations, onRunEvaluations, loading }) {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="glass-panel p-8 text-center space-y-4">
        <Award className="h-10 w-10 mx-auto text-rappi-orange opacity-60" />
        <div>
          <h3 className="text-base font-bold text-white">Automated Benchmark & Evaluation Suite</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
            Run standard evaluation benchmark across all 4 scenarios to grade Decision Correctness, Context Retrieval, Constraint Adherence, and Feedback Loops.
          </p>
        </div>
        <button
          onClick={onRunEvaluations}
          disabled={loading}
          className="px-5 py-2.5 bg-rappi-orange hover:bg-rappi-darkOrange text-white font-semibold text-xs rounded-xl shadow-lg shadow-rappi-orange/20 transition flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          Run Full Benchmark Suite
        </button>
      </div>
    );
  }

  // Calculate overall benchmark average score
  const avgScore = (evaluations.reduce((acc, curr) => acc + curr.overall_score, 0) / evaluations.length).toFixed(1);

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-rappi-orange" />
            <h3 className="text-lg font-bold text-white">Automated Benchmark Evaluation Matrix</h3>
          </div>
          <p className="text-xs text-slate-400">Quality evaluation based on Rappi assignment criteria</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Benchmark Score</div>
            <div className="text-xl font-mono font-extrabold text-emerald-400">{avgScore} / 100</div>
          </div>

          <button
            onClick={onRunEvaluations}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg border border-slate-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Re-Run Evaluation'}
          </button>
        </div>
      </div>

      {/* Scenario Evaluation Cards */}
      <div className="space-y-4">
        {evaluations.map((ev) => (
          <div key={ev.scenario_id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">{ev.scenario_title}</h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">{ev.summary}</p>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Score: {ev.overall_score}/100
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-900">
              {ev.metrics.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300 text-[11px] truncate">{m.name}</span>
                    <span className={`text-[10px] font-bold ${m.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    Score: <strong className="text-white">{m.score}%</strong>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate" title={m.notes}>{m.notes}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
