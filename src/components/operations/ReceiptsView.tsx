import React, { useState } from 'react';
import {
  ArrowDownToLine,
  Plus,
  Search,
  Printer,
  CheckCircle,
  Clock,
  Building,
  User,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { MovementLineItem } from '../../types/inventory';

export const ReceiptsView: React.FC = () => {
  const {
    movements,
    products,
    warehouses,
    activeWarehouseId,
    createReceipt,
    approveReceipt,
    openPrintSlip,
    currentUser,
    showToast,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'completed' | 'pending_approval'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Receipt Form State
  const [partnerName, setPartnerName] = useState('Kyoto Precision Sensors Co.');
  const [partnerReference, setPartnerReference] = useState(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(warehouses[0]?.id || '');
  const [notes, setNotes] = useState('Air freight delivery verified and accepted into quarantine inspection.');
  const [lineItems, setLineItems] = useState<MovementLineItem[]>([
    {
      productId: products[0]?.id || '',
      productSku: products[0]?.sku || '',
      productName: products[0]?.name || '',
      quantity: 15,
      unitCost: products[0]?.costPrice || 100,
      uom: products[0]?.uom || 'pcs',
      lotNumber: `LOT-2026-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: '2029-12-31',
    },
  ]);

  const receipts = movements.filter(m => {
    if (m.type !== 'receipt') return false;
    if (activeWarehouseId !== 'ALL' && m.destinationWarehouseId !== activeWarehouseId) return false;
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (
      search &&
      !m.referenceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !(m.partnerName && m.partnerName.toLowerCase().includes(search.toLowerCase())) &&
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
        quantity: 10,
        unitCost: p.costPrice,
        uom: p.uom,
        lotNumber: `LOT-2026-${Math.floor(100 + Math.random() * 900)}`,
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

  const handleLineLotChange = (index: number, lot: string) => {
    const updated = [...lineItems];
    updated[index].lotNumber = lot;
    setLineItems(updated);
  };

  const totalValue = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      showToast('Validation Error', 'Receipt must contain at least one item.', 'error');
      return;
    }

    const destWh = warehouses.find(w => w.id === destinationWarehouseId);

    createReceipt({
      partnerName,
      partnerReference,
      destinationWarehouseId,
      destinationWarehouseName: destWh?.name || 'Central Facility',
      items: lineItems,
      totalValue,
      notes,
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Goods Receipts (Inward Stock)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Purchase order intake, carrier manifests, batch/lot tracking & automated inventory ledger posting
          </p>
        </div>

        <button
          onClick={() => {
            setPartnerReference(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsCreateModalOpen(true);
          }}
          className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goods Receipt</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ref #, supplier, PO..."
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
            All Receipts
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Received & Posted
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'pending_approval'
                ? 'bg-amber-500 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Pending QC Approval
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Receipt Reference</th>
                <th className="py-3 px-4">Destination Facility</th>
                <th className="py-3 px-4">Vendor / PO Reference</th>
                <th className="py-3 px-4 text-center">Items Received</th>
                <th className="py-3 px-4 text-right">Consignment Valuation</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No goods receipts found matching current parameters.
                  </td>
                </tr>
              ) : (
                receipts.map(m => {
                  const isPending = m.status === 'pending_approval';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ArrowDownToLine className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {m.referenceNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {new Date(m.date).toLocaleDateString()} {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {m.destinationWarehouseName}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{m.partnerName}</p>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          PO: {m.partnerReference || 'Direct Delivery'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {m.items.length} lines ({m.items.reduce((sum, i) => sum + i.quantity, 0)} units)
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{m.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                            title="Print Goods Received Note (GRN)"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>GRN Slip</span>
                          </button>

                          {isPending && (currentUser.role === 'admin' || currentUser.role === 'warehouse_manager') && (
                            <button
                              onClick={() => approveReceipt(m.id)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors"
                            >
                              Authorize QC
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

      {/* New Goods Receipt Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Record Inbound Goods Receipt (GRN)
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReceipt} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Supplier / Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Purchase Order (PO) / Airway Bill
                  </label>
                  <input
                    type="text"
                    value={partnerReference}
                    onChange={e => setPartnerReference(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Destination Warehouse *
                </label>
                <select
                  value={destinationWarehouseId}
                  onChange={e => setDestinationWarehouseId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.code} – {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Container */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Received Inventory Items ({lineItems.length}):
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
                  {lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-5">
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
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Received Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleLineQtyChange(idx, parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Batch / Lot #</label>
                        <input
                          type="text"
                          value={item.lotNumber || ''}
                          onChange={e => handleLineLotChange(idx, e.target.value)}
                          placeholder="LOT-2026-X"
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-between pt-3">
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                          ₹{(item.quantity * item.unitCost).toLocaleString('en-IN')}
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
                  ))}
                </div>

                <div className="flex justify-between items-center p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl text-slate-900 dark:text-slate-100 font-semibold">
                  <span>Total Consignment Valuation:</span>
                  <span className="font-mono text-base text-emerald-600 dark:text-emerald-400">
                    ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Receiving Inspection Notes
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
                  {totalValue > 10000 && currentUser.role === 'inventory_clerk'
                    ? 'Submit for Manager QC Approval'
                    : 'Process & Post Goods to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
