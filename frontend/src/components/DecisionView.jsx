import React from 'react';
import { CheckCircle, AlertTriangle, FileText, ArrowRight, ShieldCheck, DollarSign, Package } from 'lucide-react';

export default function DecisionView({ decision }) {
  if (!decision) return null;

  const { decision_type, recommended_qty, final_qty, rationale, actions_taken, created_po_ids } = decision;

  let badgeColor = "bg-blue-500/20 text-blue-400 border-blue-500/40";
  if (decision_type === "MODIFIED") badgeColor = "bg-amber-500/20 text-amber-400 border-amber-500/40";
  if (decision_type === "SPLIT_ORDER") badgeColor = "bg-purple-500/20 text-purple-400 border-purple-500/40";
  if (decision_type === "ACCEPTED") badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
  if (decision_type === "REJECTED") badgeColor = "bg-rose-500/20 text-rose-400 border-rose-500/40";

  return (
    <div className="glass-panel p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rappi-orange/10 border border-rappi-orange/30 text-rappi-orange">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Agent Executive Decision Summary</h3>
            <p className="text-xs text-slate-400">Autonomous purchasing conclusion & purchase order mutations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Qty Adjustment</div>
            <div className="text-sm font-mono font-bold text-white flex items-center gap-1">
              <span>{recommended_qty} units</span>
              <ArrowRight className="h-3 w-3 text-rappi-orange" />
              <span className="text-rappi-orange">{final_qty} units</span>
            </div>
          </div>

          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border ${badgeColor}`}>
            {decision_type}
          </span>
        </div>
      </div>

      {/* Rationale box */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <FileText className="h-4 w-4 text-rappi-orange" />
          Decision Rationale & Trade-off Analysis
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {rationale}
        </p>
      </div>

      {/* Created POs & ERP Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Actions Executed */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-400" />
            Mutated ERP Actions ({actions_taken.length})
          </div>

          <div className="space-y-2">
            {actions_taken.map((act, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between font-mono font-semibold text-white">
                  <span className="text-emerald-400">{act.action}</span>
                  {act.po_id && <span className="text-slate-400">{act.po_id}</span>}
                </div>
                {act.reason && <p className="text-slate-400 text-[11px]">{act.reason}</p>}
                {act.total_cost && (
                  <p className="text-slate-300 text-[11px] font-mono">
                    Total Order Value: <span className="text-emerald-400 font-bold">${act.total_cost.toLocaleString()}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Orders Created */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            Generated Purchase Orders
          </div>

          {created_po_ids.length > 0 ? (
            <div className="space-y-2">
              {created_po_ids.map((poId) => (
                <div key={poId} className="p-3 bg-slate-900/60 rounded-lg border border-amber-500/20 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-amber-300">{poId}</span>
                    <p className="text-[10px] text-slate-400">Status: CREATED & ALLOCATED</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded">
                    Active in ERP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic p-4 text-center">No new POs generated.</div>
          )}
        </div>
      </div>
    </div>
  );
}
