import React, { useState } from 'react';
import {
  BookCheck,
  Search,
  Filter,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Calendar,
  Building,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { MovementType } from '../../types/inventory';

export const StockLedgerView: React.FC = () => {
  const { ledger, warehouses, activeWarehouseId, showToast } = useInventory();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredLedger = ledger.filter(entry => {
    if (activeWarehouseId !== 'ALL' && entry.warehouseId !== activeWarehouseId) {
      return false;
    }
    if (typeFilter !== 'ALL' && entry.movementType !== typeFilter) {
      return false;
    }
    if (
      search &&
      !entry.movementRef.toLowerCase().includes(search.toLowerCase()) &&
      !entry.productSku.toLowerCase().includes(search.toLowerCase()) &&
      !entry.productName.toLowerCase().includes(search.toLowerCase()) &&
      !entry.performedBy.toLowerCase().includes(search.toLowerCase()) &&
      !entry.remarks.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalInboundUnits = filteredLedger
    .filter(e => e.quantityChange > 0)
    .reduce((sum, e) => sum + e.quantityChange, 0);

  const totalOutboundUnits = filteredLedger
    .filter(e => e.quantityChange < 0)
    .reduce((sum, e) => sum + Math.abs(e.quantityChange), 0);

  const netValuationImpact = filteredLedger.reduce(
    (sum, e) => sum + e.totalValuationChange,
    0
  );

  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Movement Ref',
      'Type',
      'SKU',
      'Product Name',
      'Warehouse',
      'Bin Location',
      'Qty Change',
      'Running Balance',
      'Unit Cost',
      'Valuation Impact',
      'Performed By',
      'Remarks',
    ];

    const rows = filteredLedger.map(e => [
      `"${e.timestamp}"`,
      `"${e.movementRef}"`,
      `"${e.movementType}"`,
      `"${e.productSku}"`,
      `"${e.productName.replace(/"/g, '""')}"`,
      `"${e.warehouseCode}"`,
      `"${e.locationBin}"`,
      e.quantityChange,
      e.runningBalance,
      e.unitCost.toFixed(2),
      e.totalValuationChange.toFixed(2),
      `"${e.performedBy}"`,
      `"${e.remarks.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `stocksense_ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ledger Exported', 'Stock ledger CSV downloaded for accounting audit.', 'success');
  };

  const getTypeIcon = (type: MovementType) => {
    switch (type) {
      case 'receipt':
        return <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'delivery':
        return <ArrowUpFromLine className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'transfer':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'adjustment':
        return <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Perpetual Stock Ledger (Double-Entry Audit)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable transaction records, running inventory balances, unit cost accounting & compliance audit trail
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Ledger Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            Cumulative Inbound Flow
          </span>
          <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            +{totalInboundUnits.toLocaleString()} units
          </p>
          <span className="text-[10px] text-slate-400">Goods receipts & positive audits</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            Cumulative Outbound Flow
          </span>
          <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            -{totalOutboundUnits.toLocaleString()} units
          </p>
          <span className="text-[10px] text-slate-400">Customer dispatches & scrap</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            Net Valuation Movement
          </span>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            ${netValuationImpact.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400">Net asset change for scope</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ref, SKU, product, user, or remarks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {['ALL', 'receipt', 'delivery', 'transfer', 'adjustment'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-md transition-colors capitalize ${
                typeFilter === type
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {type === 'ALL' ? 'All Operations' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Movement Ref</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Product SKU & Name</th>
                <th className="py-3 px-3">Location / Bin</th>
                <th className="py-3 px-3 text-right">Qty Delta</th>
                <th className="py-3 px-3 text-right">Running Bal</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-3 text-right">Total Impact</th>
                <th className="py-3 px-3">Author</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-sans">
                    No ledger entries found matching parameters.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 text-[11px]">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {entry.movementRef}
                    </td>

                    <td className="py-2.5 px-3 capitalize font-sans">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        {getTypeIcon(entry.movementType)}
                        <span>{entry.movementType}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-sans max-w-[200px] truncate">
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 mr-1.5">
                        {entry.productSku}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{entry.productName}</span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1">
                        {entry.warehouseCode}
                      </span>
                      <span>({entry.locationBin})</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                      <span
                        className={
                          entry.quantityChange > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {entry.runningBalance}
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      ${entry.unitCost.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                      <span
                        className={
                          entry.totalValuationChange >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {entry.totalValuationChange >= 0
                          ? `+$${entry.totalValuationChange.toFixed(2)}`
                          : `-$${Math.abs(entry.totalValuationChange).toFixed(2)}`}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {entry.performedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
