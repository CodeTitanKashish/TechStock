import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Sliders,
  CheckCircle2,
  X,
  Package,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Save,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types/inventory';
import { sound } from '../../utils/audio';

interface ThresholdManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedSku?: string;
}

export const ThresholdManagerModal: React.FC<ThresholdManagerModalProps> = ({
  isOpen,
  onClose,
  initialSelectedSku,
}) => {
  const { products, updateProduct, showToast, setCurrentTab } = useInventory();

  // Local state for tracking edited thresholds before batch commit
  const [editedThresholds, setEditedThresholds] = useState<
    Record<string, { reorderPoint: number; safetyStock: number; maxStock: number }>
  >({});

  const [search, setSearch] = useState(initialSelectedSku || '');
  const [filterMode, setFilterMode] = useState<'ALL' | 'BREACHED' | 'CRITICAL' | 'HEALTHY'>('ALL');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.find(p => p.sku === initialSelectedSku)?.id || products[0]?.id || ''
  );

  // Initialize editedThresholds when modal opens or products change
  React.useEffect(() => {
    if (isOpen) {
      const initial: Record<string, { reorderPoint: number; safetyStock: number; maxStock: number }> = {};
      products.forEach(p => {
        initial[p.id] = {
          reorderPoint: p.reorderPoint,
          safetyStock: p.safetyStock,
          maxStock: p.maxStock,
        };
      });
      setEditedThresholds(initial);
      if (initialSelectedSku) {
        const found = products.find(p => p.sku === initialSelectedSku);
        if (found) setSelectedProductId(found.id);
      }
    }
  }, [isOpen, products, initialSelectedSku]);

  const handleThresholdChange = (
    productId: string,
    field: 'reorderPoint' | 'safetyStock' | 'maxStock',
    value: number
  ) => {
    setEditedThresholds(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: Math.max(0, value),
      },
    }));
  };

  const handleSaveSingle = (product: Product) => {
    sound.playSuccess();
    const edits = editedThresholds[product.id];
    if (edits) {
      updateProduct(product.id, {
        reorderPoint: edits.reorderPoint,
        safetyStock: edits.safetyStock,
        maxStock: edits.maxStock,
      });
      showToast(
        'Threshold Updated',
        `Low stock minimum threshold for ${product.name} (${product.sku}) updated to ${edits.reorderPoint} ${product.uom}.`,
        'success'
      );
    }
  };

  const handleSaveAll = () => {
    sound.playSuccess();
    let count = 0;
    products.forEach(p => {
      const edits = editedThresholds[p.id];
      if (
        edits &&
        (edits.reorderPoint !== p.reorderPoint ||
          edits.safetyStock !== p.safetyStock ||
          edits.maxStock !== p.maxStock)
      ) {
        updateProduct(p.id, {
          reorderPoint: edits.reorderPoint,
          safetyStock: edits.safetyStock,
          maxStock: edits.maxStock,
        });
        count++;
      }
    });

    showToast(
      'Thresholds Saved',
      `Successfully updated minimum stock thresholds across ${count || products.length} catalog items.`,
      'success'
    );
    onClose();
  };

  const handleApplySeasonalBuffer = (percentage: number) => {
    sound.playClick();
    setEditedThresholds(prev => {
      const next = { ...prev };
      products.forEach(p => {
        const current = next[p.id] || { reorderPoint: p.reorderPoint, safetyStock: p.safetyStock, maxStock: p.maxStock };
        next[p.id] = {
          ...current,
          reorderPoint: Math.round(current.reorderPoint * (1 + percentage / 100)),
          safetyStock: Math.round(current.safetyStock * (1 + percentage / 100)),
        };
      });
      return next;
    });
    showToast(
      'Buffer Preset Applied',
      `Increased low stock thresholds and safety stock by +${percentage}% across all items. Click "Save All Rules" to commit.`,
      'info'
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const config = editedThresholds[p.id] || { reorderPoint: p.reorderPoint, safetyStock: p.safetyStock };
      const isCritical = p.totalStock <= config.safetyStock;
      const isBreached = p.totalStock <= config.reorderPoint;

      if (filterMode === 'CRITICAL') return matchesSearch && isCritical;
      if (filterMode === 'BREACHED') return matchesSearch && isBreached;
      if (filterMode === 'HEALTHY') return matchesSearch && !isBreached;
      return matchesSearch;
    });
  }, [products, search, filterMode, editedThresholds]);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const activeEdits = selectedProduct ? (editedThresholds[selectedProduct.id] || {
    reorderPoint: selectedProduct.reorderPoint,
    safetyStock: selectedProduct.safetyStock,
    maxStock: selectedProduct.maxStock,
  }) : { reorderPoint: 20, safetyStock: 10, maxStock: 200 };

  const totalBreached = products.filter(p => {
    const config = editedThresholds[p.id] || { reorderPoint: p.reorderPoint };
    return p.totalStock <= config.reorderPoint;
  }).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Low Stock Threshold & Safety Buffer Manager
                </h2>
                {totalBreached > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 animate-pulse">
                    {totalBreached} SKUs Below Threshold
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure minimum inventory levels, emergency reorder triggers, and safety stock buffers per SKU.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Batch Preset Toolbar */}
        <div className="px-4 sm:px-6 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-[11px]">Quick Optimization Presets:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleApplySeasonalBuffer(20)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              +20% Peak Demand Buffer
            </button>
            <button
              onClick={() => handleApplySeasonalBuffer(35)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              +35% Supply Shock Buffer
            </button>
            <button
              onClick={() => {
                sound.playClick();
                const initial: Record<string, { reorderPoint: number; safetyStock: number; maxStock: number }> = {};
                products.forEach(p => {
                  initial[p.id] = { reorderPoint: p.reorderPoint, safetyStock: p.safetyStock, maxStock: p.maxStock };
                });
                setEditedThresholds(initial);
                showToast('Reset Complete', 'Reverted unsaved threshold changes to saved catalog defaults.', 'info');
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Modal Body: 2-Column Split View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: SKU Selector & Breach List */}
          <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/40">
            {/* Search and Filters */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search SKU, item name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                <button
                  onClick={() => setFilterMode('ALL')}
                  className={`px-2 py-1 rounded-md transition-all font-medium shrink-0 ${
                    filterMode === 'ALL'
                      ? 'bg-slate-900 text-white dark:bg-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setFilterMode('BREACHED')}
                  className={`px-2 py-1 rounded-md transition-all font-medium shrink-0 flex items-center gap-1 ${
                    filterMode === 'BREACHED'
                      ? 'bg-amber-500 text-white'
                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Below Min ({totalBreached})
                </button>
                <button
                  onClick={() => setFilterMode('HEALTHY')}
                  className={`px-2 py-1 rounded-md transition-all font-medium shrink-0 ${
                    filterMode === 'HEALTHY'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Healthy
                </button>
              </div>
            </div>

            {/* Product Item List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No products match the selected threshold filter.
                </div>
              ) : (
                filteredProducts.map(p => {
                  const edits = editedThresholds[p.id] || { reorderPoint: p.reorderPoint, safetyStock: p.safetyStock };
                  const isBelowMin = p.totalStock <= edits.reorderPoint;
                  const isCritical = p.totalStock <= edits.safetyStock;
                  const isSelected = selectedProductId === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedProductId(p.id);
                      }}
                      className={`p-3 cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {p.sku}
                          </span>
                          {isCritical ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              CRITICAL
                            </span>
                          ) : isBelowMin ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                              OPTIMAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                          <span>Stock: <strong className={isBelowMin ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}>{p.totalStock}</strong></span>
                          <span>·</span>
                          <span>Min: <strong>{edits.reorderPoint}</strong></span>
                          <span>·</span>
                          <span>Safety: <strong>{edits.safetyStock}</strong></span>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected SKU Threshold Editor & Live Visualizer */}
          <div className="md:col-span-7 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-6">
            {selectedProduct ? (
              <div className="space-y-5">
                {/* SKU Header Info */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        {selectedProduct.sku}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Barcode: {selectedProduct.barcode}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-1">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Category: {selectedProduct.category} · Unit: {selectedProduct.uom}
                    </p>
                  </div>

                  {selectedProduct.totalStock <= activeEdits.reorderPoint && (
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Threshold Breached</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Deficit: {activeEdits.reorderPoint - selectedProduct.totalStock} {selectedProduct.uom}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Level Visual Gauge Bar */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Live Inventory Gauge vs Thresholds</span>
                    <span className="font-mono text-slate-500">
                      Capacity: {activeEdits.maxStock} {selectedProduct.uom}
                    </span>
                  </div>

                  {/* Multi-segment Threshold Bar */}
                  <div className="relative w-full h-5 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    {/* Fill Level */}
                    <div
                      className={`h-full transition-all duration-300 ${
                        selectedProduct.totalStock <= activeEdits.safetyStock
                          ? 'bg-rose-500'
                          : selectedProduct.totalStock <= activeEdits.reorderPoint
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, (selectedProduct.totalStock / (activeEdits.maxStock || 200)) * 100))}%`,
                      }}
                    />

                    {/* Safety Stock Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-700 z-10"
                      style={{
                        left: `${Math.min(100, (activeEdits.safetyStock / (activeEdits.maxStock || 200)) * 100)}%`,
                      }}
                      title={`Safety Stock: ${activeEdits.safetyStock}`}
                    />

                    {/* Reorder Point (Minimum Threshold) Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-700 z-10"
                      style={{
                        left: `${Math.min(100, (activeEdits.reorderPoint / (activeEdits.maxStock || 200)) * 100)}%`,
                      }}
                      title={`Min Threshold: ${activeEdits.reorderPoint}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-rose-500" /> Safety: {activeEdits.safetyStock}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <span className="w-2 h-2 rounded bg-amber-500" /> Min Threshold: {activeEdits.reorderPoint}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100">
                      Current Stock: {selectedProduct.totalStock} {selectedProduct.uom}
                    </span>
                  </div>
                </div>

                {/* Interactive Threshold Editors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Reorder Point (Low Stock Trigger) */}
                  <div className="p-3.5 rounded-xl border-2 border-amber-400/80 dark:border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/10 space-y-1.5">
                    <label className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      Low Stock Threshold (Min) *
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Alerts triggered when stock falls at or below this level.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="number"
                        min="0"
                        value={activeEdits.reorderPoint}
                        onChange={e =>
                          handleThresholdChange(
                            selectedProduct.id,
                            'reorderPoint',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full text-sm font-mono font-bold px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-xs font-mono text-slate-400">{selectedProduct.uom}</span>
                    </div>
                  </div>

                  {/* Safety Buffer */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Safety Stock Buffer
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Emergency reserve floor against vendor delays.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="number"
                        min="0"
                        value={activeEdits.safetyStock}
                        onChange={e =>
                          handleThresholdChange(
                            selectedProduct.id,
                            'safetyStock',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full text-sm font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-xs font-mono text-slate-400">{selectedProduct.uom}</span>
                    </div>
                  </div>

                  {/* Max Stock Target */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Max Facility Capacity
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Physical bin ceiling to prevent overflow.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="number"
                        min="0"
                        value={activeEdits.maxStock}
                        onChange={e =>
                          handleThresholdChange(
                            selectedProduct.id,
                            'maxStock',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full text-sm font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-xs font-mono text-slate-400">{selectedProduct.uom}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons for single SKU */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleSaveSingle(selectedProduct)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Apply to {selectedProduct.sku}</span>
                  </button>

                  {selectedProduct.totalStock <= activeEdits.reorderPoint && (
                    <button
                      onClick={() => {
                        onClose();
                        setCurrentTab('receipts');
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <span>Draft Replenishment PO →</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Select a SKU on the left to configure minimum thresholds.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Updated threshold triggers immediately sync across the Executive Dashboard & Warehouse Floor Plans.</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save All Rules & Sync Alerts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
