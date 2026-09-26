import React, { useState } from 'react';
import { X, Barcode, Printer, Search, MapPin, Package, ArrowRight } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const BarcodeModal: React.FC = () => {
  const {
    barcodeModalOpen,
    closeBarcodeScanner,
    products,
    setCurrentTab,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  if (!barcodeModalOpen) return null;

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const filteredProducts = products.filter(
    p =>
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
  );

  // Generate deterministic bar widths for pseudo Code-128 SVG
  const generateBarcodeBars = (code: string) => {
    const bars: { width: number; isBlack: boolean }[] = [];
    const seed = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Guard bars
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });

    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const w1 = ((charCode * 3 + seed + i) % 3) + 1;
      const w2 = ((charCode * 7 + i) % 2) + 1;
      const w3 = ((charCode * 5 + i * 2) % 3) + 1;
      bars.push({ width: w1, isBlack: false });
      bars.push({ width: w2, isBlack: true });
      bars.push({ width: w3, isBlack: false });
      bars.push({ width: ((charCode + i) % 3) + 1, isBlack: true });
    }

    // Stop bars
    bars.push({ width: 3, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });

    return bars;
  };

  const barcodeBars = selectedProduct ? generateBarcodeBars(selectedProduct.barcode) : [];

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Barcode Inspector & Label Studio
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scan, generate and verify standard Code-128 logistics labels
              </p>
            </div>
          </div>
          <button
            onClick={closeBarcodeScanner}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Search SKU or scan input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search SKU, item name or enter 12-digit barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Quick Select Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 shrink-0">Sample items:</span>
            {filteredProducts.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors shrink-0 ${
                  selectedProductId === p.id
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.sku}
              </button>
            ))}
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Printable Barcode Label Card */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white text-slate-900 flex flex-col items-center justify-center text-center shadow-xs">
                <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-100 pb-1 mb-2">
                  <span>StockSense ERP Standard</span>
                  <span>{selectedProduct.category}</span>
                </div>

                <p className="font-bold text-sm text-slate-900 truncate max-w-xs">{selectedProduct.name}</p>
                <p className="font-mono text-xs font-semibold text-indigo-700 mt-0.5">SKU: {selectedProduct.sku}</p>

                {/* SVG Barcode Visual */}
                <div className="my-3 py-2 px-3 bg-white border border-slate-200 rounded flex flex-col items-center">
                  <svg height="48" className="w-48 overflow-visible">
                    {(() => {
                      let currentX = 0;
                      return barcodeBars.map((bar, idx) => {
                        const x = currentX;
                        currentX += bar.width * 2;
                        if (!bar.isBlack) return null;
                        return (
                          <rect
                            key={idx}
                            x={x}
                            y="0"
                            width={bar.width * 2}
                            height="48"
                            fill="#0f172a"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <span className="font-mono text-xs tracking-widest text-slate-700 mt-1">
                    {selectedProduct.barcode}
                  </span>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-slate-100 pt-2 text-left">
                  <div>
                    <span className="text-slate-400 block text-[10px]">UOM:</span>
                    <span className="font-medium uppercase">{selectedProduct.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Lot:</span>
                    <span className="font-mono">{selectedProduct.activeLotNumber || 'N/A'}</span>
                  </div>
                </div>

                <button
                  onClick={handlePrintLabel}
                  className="mt-3 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Warehouse Sticker</span>
                </button>
              </div>

              {/* Warehouse Stock & Location Coordinates */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Total System Stock:</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono">
                      {selectedProduct.totalStock} {selectedProduct.uom}
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Valuation @ Cost:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      ${(selectedProduct.totalStock * selectedProduct.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Live Bin Locations:
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedProduct.warehouseStocks.map(ws => (
                      <div
                        key={ws.warehouseId}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <div>
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {ws.warehouseCode}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                              Bin: {ws.locationBin}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                            {ws.quantity} {selectedProduct.uom}
                          </span>
                          {ws.reserved > 0 && (
                            <span className="text-[10px] text-amber-500 block">
                              ({ws.reserved} reserved)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeBarcodeScanner();
                    setCurrentTab('products');
                  }}
                  className="w-full py-2 px-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Open Full Product Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
