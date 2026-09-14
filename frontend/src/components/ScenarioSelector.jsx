import React, { useState } from 'react';
import { ShoppingBag, Truck, TrendingUp, AlertTriangle, Play, Sparkles } from 'lucide-react';

const PRESETS = [
  {
    id: 'scenario_1',
    title: '1. Recommendation Review',
    text: 'The purchasing system recommends buying 800 units of Organic Hass Avocados. Current inventory is 150, open PO is 150, and Bogotá Central warehouse available storage is 60 cu ft.',
    icon: ShoppingBag,
    color: 'border-blue-500/30 text-blue-400'
  },
  {
    id: 'scenario_2',
    title: '2. Supplier Partial Delivery',
    text: 'A purchase order was created for 500 units of Avocados, but the supplier informs us that only 250 units can currently be delivered. Check alternate express suppliers.',
    icon: Truck,
    color: 'border-amber-500/30 text-amber-400'
  },
  {
    id: 'scenario_3',
    title: '3. Forecast / Demand Shift',
    text: 'Actual sales for Organic Hass Avocados have spiked by +180% (from 35 to 98 units/day). Incoming inventory cover is down to 3 days. Evaluate emergency replenishment.',
    icon: TrendingUp,
    color: 'border-emerald-500/30 text-emerald-400'
  },
  {
    id: 'scenario_4',
    title: '4. Purchasing Constraints',
    text: 'We need 1,000 units of Whole Milk, but supplier maximum single-order capacity limit is 800 units and node budget is capped at $4,500.',
    icon: AlertTriangle,
    color: 'border-purple-500/30 text-purple-400'
  }
];

export default function ScenarioSelector({ selectedScenario, onSelectScenario, loading }) {
  const [customSituation, setCustomSituation] = useState('');

  const handleFillPreset = (preset) => {
    setCustomSituation(preset.text);
    onSelectScenario(preset.id);
  };

  const handleRunCustom = (e) => {
    e.preventDefault();
    if (!customSituation.trim()) return;
    onSelectScenario(customSituation);
  };

  return (
    <div className="glass-panel p-6 space-y-5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rappi-orange" />
            Dynamic Purchasing Situation Simulator
          </h2>
          <p className="text-xs text-slate-400">Describe any purchasing scenario or constraints — the AI Agent will investigate ERP data, make a decision, execute actions, and validate results.</p>
        </div>
      </div>

      {/* Dynamic Text Input Box */}
      <form onSubmit={handleRunCustom} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Enter Buyer Situation / Purchasing Constraints:
          </label>
          <textarea
            rows={3}
            value={customSituation}
            onChange={(e) => setCustomSituation(e.target.value)}
            placeholder="Type any purchasing situation here... e.g., 'System recommends buying 1,200 units, but warehouse storage is capped at 50 cu ft and budget is $5,000'"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rappi-orange transition font-sans leading-relaxed"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-[11px] text-slate-400">
            Type your own custom scenario above or select a preset template below.
          </div>

          <button
            type="submit"
            disabled={loading || !customSituation.trim()}
            className="px-6 py-2.5 bg-rappi-orange hover:bg-rappi-darkOrange text-white font-bold text-xs rounded-xl shadow-lg shadow-rappi-orange/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Investigating & Executing...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Analyze & Execute Situation
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Scenario Preset Templates */}
      <div className="pt-2 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Preset Scenario Templates (Assignment Brief)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleFillPreset(p)}
                className={`p-3 rounded-xl border bg-slate-950/70 text-left transition hover:border-rappi-orange/50 space-y-1.5 ${p.color}`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{p.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 font-sans leading-tight">
                  {p.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
