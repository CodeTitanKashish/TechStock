import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Printer,
  CheckCircle,
  Clock,
  Truck,
  ArrowRight,
  X,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { MovementLineItem } from '../../types/inventory';

export const TransfersView: React.FC = () => {
  const {
    movements,
    products,
    warehouses,
    activeWarehouseId,
    createTransfer,
    approveTransfer,
    completeTransfer,
    openPrintSlip,
    currentUser,
    showToast,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'in_transit' | 'completed' | 'pending_approval'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id || '');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(warehouses[1]?.id || '');
  const [partnerReference, setPartnerReference] = useState(`INT-TRF-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('Rebalancing stock to satisfy regional client demand.');
  const [lineItems, setLineItems] = useState<MovementLineItem[]>([
    {
      productId: products[0]?.id || '',
      productSku: products[0]?.sku || '',
      productName: products[0]?.name || '',
      quantity: 5,
      unitCost: products[0]?.costPrice || 100,
      uom: products[0]?.uom || 'pcs',
    },
  ]);

  const transfers = movements.filter(m => {
    if (m.type !== 'transfer') return false;
    if (activeWarehouseId !== 'ALL' && m.sourceWarehouseId !== activeWarehouseId && m.destinationWarehouseId !== activeWarehouseId) {
      return false;
    }
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (
      search &&
      !m.referenceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !(m.partnerReference && m.partnerReference.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleAddLineItem = () => {
    const p = products[0];
    setLineItems([
      ...lineItems,
      {
        productId: p.id,
        productSku: p.sku,
        productName: p.name,
        quantity: 2,
        unitCost: p.costPrice,
        uom: p.uom,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      productId: p.id,
      productSku: p.sku,
      productName: p.name,
      unitCost: p.costPrice,
      uom: p.uom,
    };
    setLineItems(updated);
  };

  const handleLineQtyChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index].quantity = qty;
    setLineItems(updated);
  };

  const totalValue = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceWarehouseId === destinationWarehouseId) {
      showToast('Validation Error', 'Source and destination facilities must be different.', 'error');
      return;
    }
    if (lineItems.length === 0) {
      showToast('Validation Error', 'Transfer must contain at least one item.', 'error');
      return;
    }

    const srcWh = warehouses.find(w => w.id === sourceWarehouseId);
    const destWh = warehouses.find(w => w.id === destinationWarehouseId);

    const result = createTransfer({
      sourceWarehouseId,
      sourceWarehouseName: srcWh?.name || 'Source Facility',
      destinationWarehouseId,
      destinationWarehouseName: destWh?.name || 'Destination Facility',
      partnerReference,
      items: lineItems,
      totalValue,
      notes,
    });

    if (result.success) {
      setIsCreateModalOpen(false);
    } else {
      showToast('Transfer Error', result.error || 'Cannot initiate transfer', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Internal Inter-Hub Transfers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Warehouse rebalancing, in-transit status tracking, dual facility verification & transit manifests
          </p>
        </div>

        <button
          onClick={() => {
            setPartnerReference(`INT-TRF-${Math.floor(100 + Math.random() * 900)}`);
            setIsCreateModalOpen(true);
          }}
          className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transfer ref, tracking #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Transfers
          </button>
          <button
            onClick={() => setStatusFilter('in_transit')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'in_transit'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            In Transit ({movements.filter(m => m.type === 'transfer' && m.status === 'in_transit').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'pending_approval'
                ? 'bg-amber-500 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Received / Completed
          </button>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Transfer Reference</th>
                <th className="py-3 px-4">Origin Hub</th>
                <th className="py-3 px-4">Destination Hub</th>
                <th className="py-3 px-4 text-center">Items & Units</th>
                <th className="py-3 px-4 text-right">Cargo Valuation</th>
                <th className="py-3 px-4 text-center">Transit Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No warehouse transfers found matching current filter parameters.
                  </td>
                </tr>
              ) : (
                transfers.map(m => {
                  const isInTransit = m.status === 'in_transit';
                  const isPending = m.status === 'pending_approval';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-purple-500 shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {m.referenceNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Manifest: {m.partnerReference}
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
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{m.destinationWarehouseName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {m.items.length} lines ({m.items.reduce((s, i) => s + i.quantity, 0)} units)
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ${m.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                            m.status === 'completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : m.status === 'in_transit'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {m.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : m.status === 'in_transit' ? (
                            <Truck className="w-3 h-3 text-blue-500 animate-pulse" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-500" />
                          )}
                          <span>{m.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openPrintSlip(m)}
                            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            title="Print Transfer Manifest"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>Waybill</span>
                          </button>

                          {isInTransit && (
                            <button
                              onClick={() => completeTransfer(m.id)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors"
                            >
                              Receive at Hub
                            </button>
                          )}

                          {isPending && currentUser.role === 'admin' && (
                            <button
                              onClick={() => approveTransfer(m.id)}
                              className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium transition-colors"
                            >
                              Authorize
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

      {/* New Internal Transfer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-purple-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Initiate Inter-Hub Stock Transfer
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransfer} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Origin Warehouse (Source Hub) *
                  </label>
                  <select
                    value={sourceWarehouseId}
                    onChange={e => setSourceWarehouseId(e.target.value)}
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
                    Target Warehouse (Destination Hub) *
                  </label>
                  <select
                    value={destinationWarehouseId}
                    onChange={e => setDestinationWarehouseId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.code} – {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Internal Transfer Manifest #
                </label>
                <input
                  type="text"
                  value={partnerReference}
                  onChange={e => setPartnerReference(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              {/* Items Line Container */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Transferred SKUs ({lineItems.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lineItems.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    const whStock = prod?.warehouseStocks.find(ws => ws.warehouseId === sourceWarehouseId)?.quantity || 0;
                    const isExceeding = item.quantity > whStock;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border grid grid-cols-12 gap-2 items-center ${
                          isExceeding
                            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="col-span-6">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Product SKU</label>
                          <select
                            value={item.productId}
                            onChange={e => handleProductChange(idx, e.target.value)}
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 truncate"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.sku} – {p.name}
                              </option>
                            ))}
                          </select>
                          <span className={`text-[10px] block mt-0.5 font-mono ${isExceeding ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                            Available in origin: {whStock} {prod?.uom}
                          </span>
                        </div>

                        <div className="col-span-3">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Transfer Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleLineQtyChange(idx, parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                          />
                        </div>

                        <div className="col-span-3 flex items-center justify-between pt-2">
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                            ${(item.quantity * item.unitCost).toFixed(0)}
                          </span>
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl text-slate-900 dark:text-slate-100 font-semibold">
                  <span>Transfer Cargo Value:</span>
                  <span className="font-mono text-base text-slate-900 dark:text-slate-100">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Transfer / Dispatch Logistics
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
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  {totalValue > 5000 && currentUser.role !== 'admin'
                    ? 'Submit for Admin Approval'
                    : 'Dispatch & Mark In Transit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
