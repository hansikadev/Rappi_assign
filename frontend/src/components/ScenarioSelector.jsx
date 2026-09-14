import React, { useState } from 'react';
import { ShoppingBag, Truck, TrendingUp, AlertTriangle, Play, Sparkles } from 'lucide-react';

const SAMPLE_CHIPS = [
  "System recommends buying 800 units of Organic Hass Avocados. Check stock (150), open POs (150), and Bogotá Central warehouse space (60 cu ft).",
  "PO was created for 500 units of avocados, but supplier notifies only 250 units can be supplied. Sourcing from alternate express supplier.",
  "Sales spiked +180% for Organic Avocados (35 to 98 units/day). Stock cover is down to 3 days. Evaluate emergency replenishment.",
  "We need 1,000 units of Whole Milk, but supplier max single-order limit is 800 units and node budget is $4,500."
];

const PRESETS = [
  {
    id: 'scenario_1',
    title: '1. Recommendation Review',
    text: 'Evaluate initial 800-unit PO recommendation against Bogotá Central storage limits.',
    icon: ShoppingBag,
    color: 'border-blue-500/30 text-blue-400'
  },
  {
    id: 'scenario_2',
    title: '2. Supplier Partial Delivery',
    text: 'Handle 500 -> 250 unit supplier shortfall by sourcing from express vendor.',
    icon: Truck,
    color: 'border-amber-500/30 text-amber-400'
  },
  {
    id: 'scenario_3',
    title: '3. Forecast / Demand Shift',
    text: 'Respond to +180% surge in daily sales by placing emergency PO.',
    icon: TrendingUp,
    color: 'border-emerald-500/30 text-emerald-400'
  },
  {
    id: 'scenario_4',
    title: '4. Purchasing Constraints',
    text: 'Navigate supplier capacity limits & storage caps with phased split order.',
    icon: AlertTriangle,
    color: 'border-purple-500/30 text-purple-400'
  }
];

export default function ScenarioSelector({ selectedScenario, onSelectScenario, loading }) {
  const [customSituation, setCustomSituation] = useState('');

  const handleRunCustom = (e) => {
    e.preventDefault();
    const queryToRun = customSituation.trim() || 'scenario_1';
    onSelectScenario(queryToRun);
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
            placeholder="Type any custom purchasing situation here... (e.g. 'Supplier can only deliver 200 of 600 units' or 'Recommends 1,200 units but storage is full')"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rappi-orange transition font-sans leading-relaxed"
          />
        </div>

        {/* Quick Sample Click Chips */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400">Click to fill sample query:</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CHIPS.map((chipText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCustomSituation(chipText)}
                className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 transition text-left cursor-pointer truncate max-w-xs"
                title={chipText}
              >
                Sample {i + 1}: {chipText.substring(0, 38)}...
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="text-[11px] text-slate-400">
            Type your custom situation above or select a preset template below.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-rappi-orange hover:bg-rappi-darkOrange text-white font-bold text-xs rounded-xl shadow-lg shadow-rappi-orange/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing & Executing...
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
                onClick={() => onSelectScenario(p.id)}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 text-left transition hover:border-rappi-orange/50 space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Icon className="h-4 w-4 shrink-0 text-rappi-orange" />
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
