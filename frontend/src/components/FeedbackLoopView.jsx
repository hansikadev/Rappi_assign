import React from 'react';
import { Activity, CheckCircle2, XCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function FeedbackLoopView({ validation }) {
  if (!validation) return null;

  const { is_valid, summary, checks, corrective_action_taken } = validation;

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-rappi-orange" />
          <h3 className="text-base font-bold text-white">Feedback Loop & Post-Action Verification Engine</h3>
        </div>

        <span className={`px-2.5 py-1 text-xs font-bold rounded-md border flex items-center gap-1.5 ${
          is_valid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {is_valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {is_valid ? 'ALL VALIDATION CHECKS PASSED' : 'CORRECTIVE FEEDBACK TRIGGERED'}
        </span>
      </div>

      <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
        <span className="font-semibold text-slate-200">Validation System Summary:</span> {summary}
      </p>

      {/* Corrective Action Alert if feedback loop auto-adjusted decision */}
      {corrective_action_taken && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
            Feedback Loop Corrective Action Executed
          </div>
          <p className="text-slate-300 font-sans">{corrective_action_taken}</p>
        </div>
      )}

      {/* Validation Checks Table/List */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Post-Condition Verification Matrix ({checks.length} Checks)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checks.map((chk, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border space-y-2 transition ${
                chk.passed
                  ? 'bg-slate-950/60 border-slate-800'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {chk.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-white">{chk.check_name}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  chk.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {chk.passed ? 'PASS' : 'WARN / ADJUST'}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans">{chk.details}</p>

              {chk.impact_metrics && Object.keys(chk.impact_metrics).length > 0 && (
                <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-3 text-[11px] font-mono text-slate-400">
                  {Object.entries(chk.impact_metrics).map(([k, v]) => (
                    <span key={k} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {k}: <strong className="text-slate-200">{v}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
