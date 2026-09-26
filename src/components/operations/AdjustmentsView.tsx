import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Search,
  Printer,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  FileCheck,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const AdjustmentsView: React.FC = () => {
  const {
    movements,
    products,
    warehouses,
    activeWarehouseId,
    createAdjustment,
    approveAdjustment,
    openPrintSlip,
    currentUser,
    showToast,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState<'damaged' | 'scrap' | 'theft' | 'misplaced' | 'surplus' | 'expired' | 'cycle_count'>('damaged');
  const [auditRef, setAuditRef] = useState(`AUDIT-Q3-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('Forklift handling impact caused package rupture. Damaged units condemned.');

  const adjustments = movements.filter(m => {
    if (m.type !== 'adjustment') return false;
    if (activeWarehouseId !== 'ALL' && m.sourceWarehouseId !== activeWarehouseId) return false;
    if (
      search &&
      !m.referenceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !(m.partnerReference && m.partnerReference.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const selectedProduct = products.find(p => p.id === productId) || products[0];
  const selectedWarehouse = warehouses.find(w => w.id === warehouseId) || warehouses[0];
  const currentSystemQty = selectedProduct?.warehouseStocks.find(ws => ws.warehouseId === warehouseId)?.quantity || 0;
  const qtyDifference = physicalCount - currentSystemQty;
  const valuationImpact = qtyDifference * (selectedProduct?.costPrice || 0);

  const handleOpenModal = () => {
    const curQty = products[0]?.warehouseStocks.find(ws => ws.warehouseId === warehouses[0]?.id)?.quantity || 0;
    setPhysicalCount(Math.max(0, curQty - 1));
    setIsModalOpen(true);
  };

  const handleProductChange = (newProdId: string) => {
    setProductId(newProdId);
    const prod = products.find(p => p.id === newProdId);
    const curQty = prod?.warehouseStocks.find(ws => ws.warehouseId === warehouseId)?.quantity || 0;
    setPhysicalCount(curQty);
  };

  const handleWarehouseChange = (newWhId: string) => {
    setWarehouseId(newWhId);
    const curQty = selectedProduct?.warehouseStocks.find(ws => ws.warehouseId === newWhId)?.quantity || 0;
    setPhysicalCount(curQty);
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (qtyDifference === 0) {
      showToast('No Discrepancy', 'Physical count equals system stock. No ledger adjustment needed.', 'info');
      return;
    }

    createAdjustment({
      sourceWarehouseId: warehouseId,
      sourceWarehouseName: selectedWarehouse.name,
      partnerReference: auditRef,
      items: [
        {
          productId: selectedProduct.id,
          productSku: selectedProduct.sku,
          productName: selectedProduct.name,
          quantity: qtyDifference,
          unitCost: selectedProduct.costPrice,
          uom: selectedProduct.uom,
        },
      ],
      totalValue: valuationImpact,
      discrepancyReason: reason,
      notes,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Stock Adjustments & Cycle Counts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Physical stock take reconciliation, scrap write-offs, shrinkage auditing & variance approvals
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search adjustment ref, audit tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
        </div>

        <span className="text-slate-400 text-xs hidden sm:inline">
          {adjustments.length} adjustment records
        </span>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Adjustment Doc #</th>
                <th className="py-3 px-4">Warehouse Facility</th>
                <th className="py-3 px-4">Item & Reason Code</th>
                <th className="py-3 px-4 text-right">Physical Variance</th>
                <th className="py-3 px-4 text-right">Valuation Impact</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No physical count adjustments recorded yet.
                  </td>
                </tr>
              ) : (
                adjustments.map(m => {
                  const item = m.items[0];
                  const isPending = m.status === 'pending_approval';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {m.referenceNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Audit: {m.partnerReference}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {m.sourceWarehouseName}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{item?.productName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">{item?.productSku}</span>
                          <span>·</span>
                          <span className="font-semibold uppercase text-slate-600 dark:text-slate-300">
                            {m.discrepancyReason?.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span
                          className={item?.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
                        >
                          {item?.quantity > 0 ? `+${item?.quantity}` : item?.quantity} {item?.uom}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span
                          className={m.totalValue > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
                        >
                          {m.totalValue > 0 ? `+$${m.totalValue.toFixed(2)}` : `-$${Math.abs(m.totalValue).toFixed(2)}`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                            m.status === 'completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {m.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{m.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openPrintSlip(m)}
                            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            title="Print Count Reconciliation Sheet"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>Slip</span>
                          </button>

                          {isPending && (currentUser.role === 'admin' || currentUser.role === 'warehouse_manager') && (
                            <button
                              onClick={() => approveAdjustment(m.id)}
                              className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium transition-colors"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Log Physical Count / Stock Adjustment
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Audited Warehouse Facility *
                  </label>
                  <select
                    value={warehouseId}
                    onChange={e => handleWarehouseChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.code} – {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Cycle Count Audit Ref #
                  </label>
                  <input
                    type="text"
                    value={auditRef}
                    onChange={e => setAuditRef(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Target Product SKU *
                </label>
                <select
                  value={productId}
                  onChange={e => handleProductChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.sku} – {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Count Reconciliation Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">System Stock</span>
                    <span className="font-mono text-base font-bold text-slate-700 dark:text-slate-300">
                      {currentSystemQty} {selectedProduct.uom}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Counted Physical</span>
                    <input
                      type="number"
                      min="0"
                      value={physicalCount}
                      onChange={e => setPhysicalCount(parseInt(e.target.value) || 0)}
                      className="w-20 text-center py-1 font-mono font-bold text-base rounded border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 focus:outline-hidden"
                      autoFocus
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Variance Delta</span>
                    <span
                      className={`font-mono text-base font-bold ${
                        qtyDifference === 0
                          ? 'text-slate-400'
                          : qtyDifference > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {qtyDifference > 0 ? `+${qtyDifference}` : qtyDifference} {selectedProduct.uom}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Valuation Impact (Unit Cost: ${selectedProduct.costPrice.toFixed(2)}):</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      valuationImpact >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {valuationImpact >= 0 ? `+$${valuationImpact.toFixed(2)}` : `-$${Math.abs(valuationImpact).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Discrepancy Root Reason *
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="damaged">Damaged Goods in Storage / Forklift Incident</option>
                  <option value="scrap">Scrapped Defective Stock</option>
                  <option value="theft">Theft / Unexplained Shrinkage</option>
                  <option value="misplaced">Misplaced in Aisle / Bin</option>
                  <option value="surplus">Surplus Stock Discovered During Cycle Count</option>
                  <option value="expired">Shelf-Life Expiry</option>
                  <option value="cycle_count">Periodic Audit Reconciliation</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Audit Notes & Incident Documentation
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  {Math.abs(valuationImpact) > 2000 && currentUser.role === 'inventory_clerk'
                    ? 'Submit Variance for Manager Approval'
                    : 'Post Inventory Reconciliation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
