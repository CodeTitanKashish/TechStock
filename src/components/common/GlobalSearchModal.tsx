import React, { useState, useEffect } from 'react';
import { Search, X, Package, Warehouse, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, BookCheck, ShieldCheck } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    searchModalOpen,
    closeGlobalSearch,
    products,
    warehouses,
    movements,
    setCurrentTab,
    openPrintSlip,
  } = useInventory();

  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchModalOpen) {
          closeGlobalSearch();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, closeGlobalSearch]);

  if (!searchModalOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingProducts = q ? products.filter(p => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.barcode.includes(q)) : [];
  const matchingWarehouses = q ? warehouses.filter(w => w.code.toLowerCase().includes(q) || w.name.toLowerCase().includes(q) || w.city.toLowerCase().includes(q)) : [];
  const matchingMovements = q ? movements.filter(m => m.referenceNumber.toLowerCase().includes(q) || (m.partnerName && m.partnerName.toLowerCase().includes(q)) || (m.partnerReference && m.partnerReference.toLowerCase().includes(q))) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Type SKU, barcode, warehouse, document ref (e.g. REC-2026, SEN-OPT)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full py-1 text-sm bg-transparent border-0 focus:outline-hidden text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={closeGlobalSearch}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
          {!query && (
            <div className="p-4 text-center text-slate-400">
              <p className="font-medium text-slate-600 dark:text-slate-300">Quick ERP Navigation</p>
              <p className="text-[11px] mt-1">Start typing to search products, inventory movements, or warehouses.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => { setCurrentTab('products'); closeGlobalSearch(); }}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px]"
                >
                  Products Catalog
                </button>
                <button
                  onClick={() => { setCurrentTab('receipts'); closeGlobalSearch(); }}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px]"
                >
                  Goods Receipts
                </button>
                <button
                  onClick={() => { setCurrentTab('ledger'); closeGlobalSearch(); }}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px]"
                >
                  Stock Ledger
                </button>
              </div>
            </div>
          )}

          {/* Products */}
          {matchingProducts.length > 0 && (
            <div className="py-2">
              <span className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Products ({matchingProducts.length})
              </span>
              {matchingProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setCurrentTab('products');
                    closeGlobalSearch();
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        SKU: {p.sku} · Barcode: {p.barcode}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {p.totalStock} {p.uom}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Movements */}
          {matchingMovements.length > 0 && (
            <div className="py-2">
              <span className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Movements & Orders ({matchingMovements.length})
              </span>
              {matchingMovements.map(m => (
                <div
                  key={m.id}
                  onClick={() => {
                    openPrintSlip(m);
                    closeGlobalSearch();
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    {m.type === 'receipt' ? <ArrowDownToLine className="w-4 h-4 text-emerald-500 shrink-0" /> : <ArrowUpFromLine className="w-4 h-4 text-blue-500 shrink-0" />}
                    <div>
                      <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">{m.referenceNumber}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {m.partnerName || m.sourceWarehouseName} · ${(m.totalValue).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Warehouses */}
          {matchingWarehouses.length > 0 && (
            <div className="py-2">
              <span className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Warehouses ({matchingWarehouses.length})
              </span>
              {matchingWarehouses.map(w => (
                <div
                  key={w.id}
                  onClick={() => {
                    setCurrentTab('warehouses');
                    closeGlobalSearch();
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Warehouse className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{w.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{w.city}, {w.country}</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{w.code}</span>
                </div>
              ))}
            </div>
          )}

          {q && matchingProducts.length === 0 && matchingMovements.length === 0 && matchingWarehouses.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              No matching records found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
