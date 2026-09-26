import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Download,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  Boxes,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useInventory } from '../../context/InventoryContext';

export const ReportsView: React.FC = () => {
  const {
    products,
    warehouses,
    activeWarehouseId,
    setCurrentTab,
    createReceipt,
    showToast,
    theme,
  } = useInventory();

  const [activeReportTab, setActiveReportTab] = useState<'replenishment' | 'valuation' | 'turnover'>('replenishment');

  // Filter based on active warehouse
  const effectiveProducts = activeWarehouseId === 'ALL'
    ? products
    : products.map(p => {
        const ws = p.warehouseStocks.find(w => w.warehouseId === activeWarehouseId);
        return {
          ...p,
          totalStock: ws?.quantity || 0,
        };
      });

  const totalValuation = effectiveProducts.reduce((sum, p) => sum + (p.totalStock * p.costPrice), 0);
  const totalSellingValuation = effectiveProducts.reduce((sum, p) => sum + (p.totalStock * p.sellingPrice), 0);
  const unrealizedGrossMargin = totalSellingValuation - totalValuation;
  const marginPct = totalSellingValuation > 0 ? ((unrealizedGrossMargin / totalSellingValuation) * 100).toFixed(1) : '0';

  // Replenishment items
  const reorderList = effectiveProducts
    .filter(p => p.totalStock <= p.reorderPoint)
    .map(p => {
      const deficit = p.reorderPoint - p.totalStock;
      const suggestedQty = Math.max(deficit + p.safetyStock, p.safetyStock * 2);
      const estCost = suggestedQty * p.costPrice;
      return {
        product: p,
        deficit,
        suggestedQty,
        estCost,
      };
    });

  const totalReplenishmentCost = reorderList.reduce((sum, r) => sum + r.estCost, 0);

  // Valuation by facility
  const warehouseValuations = warehouses.map(wh => {
    let val = 0;
    products.forEach(p => {
      const ws = p.warehouseStocks.find(w => w.warehouseId === wh.id);
      if (ws) val += ws.quantity * p.costPrice;
    });
    return {
      code: wh.code,
      name: wh.name,
      valuation: Math.round(val),
    };
  });

  const handleGeneratePO = (r: typeof reorderList[0]) => {
    createReceipt({
      partnerName: 'Preferred OEM Supplier',
      partnerReference: `AUTO-PO-${Date.now().toString().slice(-4)}`,
      destinationWarehouseId: warehouses[0]?.id,
      destinationWarehouseName: warehouses[0]?.name,
      items: [
        {
          productId: r.product.id,
          productSku: r.product.sku,
          productName: r.product.name,
          quantity: r.suggestedQty,
          unitCost: r.product.costPrice,
          uom: r.product.uom,
          lotNumber: `LOT-2026-${Math.floor(100 + Math.random() * 900)}`,
        },
      ],
      totalValue: r.estCost,
      notes: `Automated replenishment PO generated from StockSense reorder forecast. Deficit was ${r.deficit} ${r.product.uom}.`,
    });
    showToast('PO Generated', `Draft PO for ${r.suggestedQty} ${r.product.uom} of ${r.product.name} created.`, 'success');
    setCurrentTab('receipts');
  };

  const handleExportReportCSV = () => {
    const headers = ['SKU', 'Item Name', 'Category', 'Current Stock', 'Reorder Trigger', 'Safety Stock', 'Deficit', 'Suggested Reorder Qty', 'Unit Cost', 'Estimated Capital Required'];
    const rows = reorderList.map(r => [
      `"${r.product.sku}"`,
      `"${r.product.name.replace(/"/g, '""')}"`,
      `"${r.product.category}"`,
      r.product.totalStock,
      r.product.reorderPoint,
      r.product.safetyStock,
      r.deficit,
      r.suggestedQty,
      r.product.costPrice.toFixed(2),
      r.estCost.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_replenishment_forecast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report Exported', 'Replenishment forecast CSV downloaded.', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Reports & Valuation Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perpetual inventory accounting, stock velocity analytics, automated PO suggestions & gross margin estimates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReportCSV}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Forecast</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Total Inventory Valuation (Cost)
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            ${totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">
            Asset value based on weighted acquisition cost
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Projected Retail Value
          </span>
          <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            ${totalSellingValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
            Unrealized Gross Margin: +${unrealizedGrossMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({marginPct}%)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Replenishment Capital Required
          </span>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            ${totalReplenishmentCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">
            To restore {reorderList.length} low-stock SKUs to safety threshold
          </span>
        </div>
      </div>

      {/* Report View Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveReportTab('replenishment')}
          className={`py-2 px-4 border-b-2 font-medium transition-colors ${
            activeReportTab === 'replenishment'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Automated Replenishment Forecast ({reorderList.length})
        </button>
        <button
          onClick={() => setActiveReportTab('valuation')}
          className={`py-2 px-4 border-b-2 font-medium transition-colors ${
            activeReportTab === 'valuation'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Warehouse Asset Distribution
        </button>
      </div>

      {/* Content 1: Replenishment Table */}
      {activeReportTab === 'replenishment' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Product SKU & Name</th>
                  <th className="py-3 px-4 text-right">Current Stock</th>
                  <th className="py-3 px-4 text-right">Reorder Threshold</th>
                  <th className="py-3 px-4 text-right">Safety Stock</th>
                  <th className="py-3 px-4 text-right">Stock Deficit</th>
                  <th className="py-3 px-4 text-right">Suggested Order Qty</th>
                  <th className="py-3 px-4 text-right">Est. Cost</th>
                  <th className="py-3 px-4 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reorderList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      All products currently satisfy safety buffer requirements. No replenishment needed.
                    </td>
                  </tr>
                ) : (
                  reorderList.map(r => (
                    <tr key={r.product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{r.product.name}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-mono">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">{r.product.sku}</span>
                          <span>·</span>
                          <span>{r.product.category}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        {r.product.totalStock} {r.product.uom}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {r.product.reorderPoint} {r.product.uom}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {r.product.safetyStock} {r.product.uom}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        -{r.deficit} {r.product.uom}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        +{r.suggestedQty} {r.product.uom}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ${r.estCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleGeneratePO(r)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Boxes className="w-3 h-3" />
                          <span>Generate PO</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content 2: Valuation Chart */}
      {activeReportTab === 'valuation' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Capital Allocation by Warehouse Node
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Total inventory balance stored across geographic hubs
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseValuations} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} stroke="transparent" />
                <YAxis tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} stroke="transparent" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Valuation']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="valuation" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
