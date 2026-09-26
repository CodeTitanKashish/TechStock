import React, { useState } from 'react';
import {
  ArrowUpFromLine,
  Plus,
  Search,
  Printer,
  CheckCircle,
  Truck,
  Building,
  User,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { MovementLineItem } from '../../types/inventory';

export const DeliveriesView: React.FC = () => {
  const {
    movements,
    products,
    warehouses,
    activeWarehouseId,
    createDelivery,
    dispatchDelivery,
    openPrintSlip,
    showToast,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [partnerName, setPartnerName] = useState('Boeing Commercial Airplanes');
  const [partnerReference, setPartnerReference] = useState(`SO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id || '');
  const [notes, setNotes] = useState('Standard priority outbound delivery. Inspection certificate enclosed.');
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

  const deliveries = movements.filter(m => {
    if (m.type !== 'delivery') return false;
    if (activeWarehouseId !== 'ALL' && m.sourceWarehouseId !== activeWarehouseId) return false;
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

  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      showToast('Validation Error', 'Order must contain at least one item.', 'error');
      return;
    }

    const srcWh = warehouses.find(w => w.id === sourceWarehouseId);

    const result = createDelivery({
      partnerName,
      partnerReference,
      sourceWarehouseId,
      sourceWarehouseName: srcWh?.name || 'Central Facility',
      items: lineItems,
      totalValue,
      notes,
    });

    if (result.success) {
      setIsCreateModalOpen(false);
    } else {
      showToast('Stock Shortage', result.error || 'Cannot dispatch items', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Customer Deliveries (Outward Dispatches)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sales order fulfillment, stock availability checks, bill of lading & packing slip issuance
          </p>
        </div>

        <button
          onClick={() => {
            setPartnerReference(`SO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsCreateModalOpen(true);
          }}
          className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Delivery Order</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search delivery ref, customer, SO #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
        </div>

        <span className="text-slate-400 text-xs hidden sm:inline">
          Showing {deliveries.length} orders
        </span>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Delivery Order #</th>
                <th className="py-3 px-4">Origin Facility</th>
                <th className="py-3 px-4">Customer & SO Reference</th>
                <th className="py-3 px-4 text-center">Items Dispatched</th>
                <th className="py-3 px-4 text-right">Order Cost Basis</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customer delivery orders found matching search criteria.
                  </td>
                </tr>
              ) : (
                deliveries.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <ArrowUpFromLine className="w-4 h-4 text-blue-500 shrink-0" />
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
                        {m.sourceWarehouseName}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{m.partnerName}</p>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        SO: {m.partnerReference || 'Spot Order'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        {m.items.length} lines ({m.items.reduce((sum, i) => sum + i.quantity, 0)} units)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ₹{m.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize">
                        <CheckCircle className="w-3 h-3" />
                        <span>Dispatched</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openPrintSlip(m)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 mx-auto transition-colors"
                        title="Print Packing Slip & Bill of Lading"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Packing Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Delivery Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Create Customer Delivery Order (SO Dispatch)
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelivery} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Customer / Client Name *
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
                    Sales Order (SO) Number
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
                  Source Warehouse (Fulfillment Facility) *
                </label>
                <select
                  value={sourceWarehouseId}
                  onChange={e => setSourceWarehouseId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.code} – {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Line Container */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Dispatched Items ({lineItems.length}):
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
                            Available in facility: {whStock} {prod?.uom}
                          </span>
                        </div>

                        <div className="col-span-3">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Dispatch Qty</label>
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
                    );
                  })}
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl text-slate-900 dark:text-slate-100 font-semibold">
                  <span>Total Order Cost Valuation:</span>
                  <span className="font-mono text-base text-slate-900 dark:text-slate-100">
                    ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Dispatch Instructions & Carrier Notes
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
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Confirm & Dispatch Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
