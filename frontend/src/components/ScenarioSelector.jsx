import React from 'react';
import { ShoppingBag, Truck, TrendingUp, AlertTriangle, Play } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'scenario_1',
    title: '1. Recommendation Review',
    subtitle: 'Evaluate initial 800-unit PO recommendation',
    icon: ShoppingBag,
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    btnBg: 'bg-blue-600 hover:bg-blue-500',
    description: 'System suggests buying 800 units of Organic Avocados. Agent inspects current inventory, 30d forecast, open POs, budget, & 60 cu ft node storage capacity limit.',
    expectedOutcome: 'Agent MODIFIES recommendation to 500 units to fit warehouse volume.'
  },
  {
    id: 'scenario_2',
    title: '2. Supplier Partial Delivery',
    subtitle: 'Handle 500 -> 250 unit supplier shortfall',
    icon: Truck,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    btnBg: 'bg-amber-600 hover:bg-amber-500',
    description: 'Supplier notifies system it can only fulfill 250 of 500 requested units. Agent evaluates lead times, safety stock, and issues supplemental PO to alternate supplier.',
    expectedOutcome: 'Agent SPLITS order & places 250-unit PO with 1-day express supplier.'
  },
  {
    id: 'scenario_3',
    title: '3. Forecast / Demand Shift',
    subtitle: 'Respond to +180% surge in daily sales',
    icon: TrendingUp,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500',
    description: 'Actual POS sales spike from 35 to 98 units/day. Current stock cover drops to critical 3.0 days. Agent calculates emergency buffer & triggers replenishment PO.',
    expectedOutcome: 'Agent ISSUES emergency PO for 450 units to prevent stockout.'
  },
  {
    id: 'scenario_4',
    title: '4. Purchasing Constraints',
    subtitle: 'Navigate supplier capacity & storage caps',
    icon: AlertTriangle,
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    btnBg: 'bg-purple-600 hover:bg-purple-500',
    description: 'Demand calls for 1,000 units of Whole Milk, but supplier max single-order capacity is capped at 800 units. Agent formulates a multi-phase delivery split.',
    expectedOutcome: 'Agent SPLITS order into Phase 1 (700 units) and Phase 2 (300 units).'
  }
];

export default function ScenarioSelector({ selectedScenario, onSelectScenario, loading }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rappi-orange animate-ping" />
            Select Scenario to Test Agent
          </h2>
          <p className="text-xs text-slate-400">Run end-to-end purchasing scenarios from the Rappi assignment brief</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isSelected = selectedScenario === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`glass-panel p-5 flex flex-col justify-between transition-all duration-300 ${
                isSelected
                  ? 'border-rappi-orange shadow-lg shadow-rappi-orange/10 bg-slate-900/90'
                  : 'hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${scenario.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                    Brief Scenario
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{scenario.title}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{scenario.subtitle}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Target Outcome:</span> {scenario.expectedOutcome}
                </div>

                <button
                  onClick={() => onSelectScenario(scenario.id)}
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-2 transition shadow-md ${scenario.btnBg} disabled:opacity-50`}
                >
                  {loading && isSelected ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Evaluating Scenario...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Run Scenario {scenario.id.split('_')[1]}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
