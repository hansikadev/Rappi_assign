import React from 'react';
import { Database, Package, Warehouse, Truck, DollarSign } from 'lucide-react';

export default function InventoryDashboard({ erpState }) {
  if (!erpState) return null;

  const { products, suppliers, fulfillment_nodes, purchase_orders } = erpState;

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-rappi-orange" />
          <h3 className="text-base font-bold text-white">Mock ERP & Warehouse Live Data State</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Stateful Quick-Commerce Operational Telemetry
        </span>
      </div>

      {/* Nodes & Warehouse Storage Capacity Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fulfillment_nodes.map((node) => {
          const usedPct = ((node.used_storage_cu_ft / node.max_storage_cu_ft) * 100).toFixed(1);

          return (
            <div key={node.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">{node.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{node.id}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-emerald-400">${node.available_budget.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Available Budget</div>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Storage Used ({node.used_storage_cu_ft.toFixed(1)} / {node.max_storage_cu_ft} cu ft)</span>
                  <span className={usedPct > 85 ? 'text-amber-400 font-bold' : 'text-slate-300'}>{usedPct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usedPct > 85 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, usedPct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-right">
                  Available Vol: <strong className="text-white font-mono">{node.available_storage_cu_ft.toFixed(1)} cu ft</strong>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Catalog & Inventory Table */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Package className="h-4 w-4 text-cyan-400" />
          Product Catalog & Inventory Balances
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300 font-sans">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Unit Cost</th>
                <th className="py-2.5 px-3">Unit Vol</th>
                <th className="py-2.5 px-3">On Hand</th>
                <th className="py-2.5 px-3">Reorder Pt</th>
                <th className="py-2.5 px-3">Safety Stock</th>
                <th className="py-2.5 px-3">Daily Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {prod.name}
                    <div className="text-[10px] text-slate-500 font-mono">{prod.id}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">${prod.unit_cost.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-mono">{prod.unit_volume_cu_ft} cu ft</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{prod.current_stock} units</td>
                  <td className="py-2.5 px-3 font-mono">{prod.reorder_point}</td>
                  <td className="py-2.5 px-3 font-mono">{prod.safety_stock}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-300">{prod.avg_daily_demand} / day</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Purchase Orders */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Truck className="h-4 w-4 text-purple-400" />
          Active Purchase Orders ({purchase_orders.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {purchase_orders.map((po) => (
            <div key={po.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1.5 font-mono">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400">{po.id}</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {po.status}
                </span>
              </div>
              <div className="text-slate-300 flex justify-between">
                <span>Qty: <strong>{po.quantity} units</strong></span>
                <span>Total: <strong className="text-emerald-400">${po.total_cost.toLocaleString()}</strong></span>
              </div>
              {po.notes && <p className="text-[10px] font-sans text-slate-400 truncate">{po.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
