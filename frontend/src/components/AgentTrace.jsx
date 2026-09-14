import React, { useState } from 'react';
import { BrainCircuit, Database, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, Terminal } from 'lucide-react';

export default function AgentTrace({ thinkingSteps }) {
  const [expandedSteps, setExpandedSteps] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true });

  const toggleStep = (stepNum) => {
    setExpandedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  if (!thinkingSteps || thinkingSteps.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-slate-500">
        <BrainCircuit className="h-10 w-10 mx-auto mb-2 opacity-40 animate-pulse" />
        <p className="text-sm">Select and run a purchasing scenario above to view the agent's live reasoning trace.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-rappi-orange" />
          <h3 className="text-base font-bold text-white">Agent Execution & Tool Call Trace</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {thinkingSteps.length} Execution Steps Recorded
        </span>
      </div>

      <div className="space-y-3">
        {thinkingSteps.map((step) => {
          const isExpanded = expandedSteps[step.step_number];

          // Badge colors
          let actionBadge = "bg-slate-800 text-slate-300 border-slate-700";
          if (step.action_type === "TOOL_CALL") actionBadge = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
          if (step.action_type === "ANALYSIS") actionBadge = "bg-amber-500/10 text-amber-400 border-amber-500/30";
          if (step.action_type === "DECISION") actionBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
          if (step.action_type === "VALIDATION") actionBadge = "bg-purple-500/10 text-purple-400 border-purple-500/30";

          return (
            <div
              key={step.step_number}
              className="border border-slate-800/80 rounded-xl bg-slate-950/60 overflow-hidden transition"
            >
              {/* Header bar */}
              <div
                onClick={() => toggleStep(step.step_number)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-900/50"
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center border border-slate-700">
                    {step.step_number}
                  </span>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${actionBadge}`}>
                    {step.action_type}
                  </span>

                  <p className="text-xs font-medium text-slate-200 line-clamp-1">
                    {step.thought}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  {step.tool_call && (
                    <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/50">
                      {step.tool_call.tool_name}()
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </div>

              {/* Step details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-900">
                  <p className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/50 leading-relaxed font-sans">
                    <span className="font-semibold text-rappi-orange">Agent Thought:</span> {step.thought}
                  </p>

                  {/* Tool Call Payload */}
                  {step.tool_call && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <Terminal className="h-3.5 w-3.5" />
                          Tool Execution: <code className="text-white font-bold">{step.tool_call.tool_name}</code>
                        </span>
                        <span className="text-[10px] text-slate-500">{step.tool_call.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                        {/* Arguments */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Arguments Passed</div>
                          <pre className="text-slate-300 text-[11px] overflow-x-auto">
                            {JSON.stringify(step.tool_call.arguments, null, 2)}
                          </pre>
                        </div>

                        {/* Result */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                          <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Returned State</div>
                          <pre className="text-emerald-300 text-[11px] overflow-x-auto">
                            {JSON.stringify(step.tool_call.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
