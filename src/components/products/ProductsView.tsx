import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Barcode,
  MapPin,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Eye,
  X,
  Sliders,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types/inventory';
import { sound } from '../../utils/audio';
import { ThresholdManagerModal } from './ThresholdManagerModal';

export const ProductsView: React.FC = () => {
  const {
    products,
    warehouses,
    activeWarehouseId,
    addProduct,
    updateProduct,
    deleteProduct,
    openBarcodeScanner,
    showToast,
    setCurrentTab,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'NOMINAL'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [thresholdModalSku, setThresholdModalSku] = useState<string | undefined>(undefined);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inspectingLocationsProduct, setInspectingLocationsProduct] = useState<Product | null>(null);

  // Quick Inline Threshold Edit popover state
  const [quickThresholdProductId, setQuickThresholdProductId] = useState<string | null>(null);
  const [quickThresholdValue, setQuickThresholdValue] = useState<number>(0);
  const [quickSafetyValue, setQuickSafetyValue] = useState<number>(0);

  // New product form state
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    category: 'Industrial Electronics',
    uom: 'pcs',
    costPrice: 50,
    sellingPrice: 95,
    reorderPoint: 20,
    safetyStock: 10,
    maxStock: 200,
    lotTracking: false,
    activeLotNumber: '',
    initialWarehouseId: warehouses[0]?.id || '',
    initialQty: 10,
    initialBin: 'Rack A-01-A1',
  });

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    // Check warehouse-specific or global stock
    const effectiveStock =
      activeWarehouseId === 'ALL'
        ? p.totalStock
        : p.warehouseStocks.find(w => w.warehouseId === activeWarehouseId)?.quantity || 0;

    let matchesStock = true;
    if (stockFilter === 'LOW') {
      matchesStock = effectiveStock <= p.reorderPoint;
    } else if (stockFilter === 'NOMINAL') {
      matchesStock = effectiveStock > p.reorderPoint;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleExportCSV = () => {
    const headers = ['SKU', 'Barcode', 'Product Name', 'Category', 'UOM', 'Cost Price', 'Selling Price', 'Total Stock', 'Reorder Point', 'Valuation'];
    const rows = filteredProducts.map(p => [
      `"${p.sku}"`,
      `"${p.barcode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.uom}"`,
      p.costPrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      p.totalStock,
      p.reorderPoint,
      (p.totalStock * p.costPrice).toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Catalog Exported', 'CSV download initiated successfully.', 'success');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku || !formData.name) {
      showToast('Validation Error', 'SKU and Product Name are required.', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        description: formData.description,
        category: formData.category,
        uom: formData.uom,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        reorderPoint: Number(formData.reorderPoint),
        safetyStock: Number(formData.safetyStock),
        maxStock: Number(formData.maxStock),
        lotTracking: formData.lotTracking,
        activeLotNumber: formData.activeLotNumber,
      });
      setEditingProduct(null);
    } else {
      // Create new warehouse stock array
      const warehouseStocks = warehouses.map(wh => ({
        warehouseId: wh.id,
        warehouseCode: wh.code,
        quantity: wh.id === formData.initialWarehouseId ? Number(formData.initialQty) : 0,
        reserved: 0,
        locationBin: wh.id === formData.initialWarehouseId ? formData.initialBin : 'General',
      }));

      addProduct({
        sku: formData.sku.toUpperCase(),
        barcode: formData.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        uom: formData.uom,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        reorderPoint: Number(formData.reorderPoint),
        safetyStock: Number(formData.safetyStock),
        maxStock: Number(formData.maxStock),
        lotTracking: formData.lotTracking,
        activeLotNumber: formData.activeLotNumber,
        warehouseStocks,
      });

      setIsAddModalOpen(false);
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      description: p.description,
      category: p.category,
      uom: p.uom,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      reorderPoint: p.reorderPoint,
      safetyStock: p.safetyStock,
      maxStock: p.maxStock,
      lotTracking: p.lotTracking,
      activeLotNumber: p.activeLotNumber || '',
      initialWarehouseId: warehouses[0]?.id || '',
      initialQty: 0,
      initialBin: 'Rack A-01',
    });
  };

  const totalBreached = products.filter(p => p.totalStock <= p.reorderPoint).length;
  const criticalBreached = products.filter(p => p.totalStock <= p.safetyStock).length;

  const handleOpenThresholdModal = (sku?: string) => {
    sound.playClick();
    setThresholdModalSku(sku);
    setIsThresholdModalOpen(true);
  };

  const handleSaveInlineThreshold = (productId: string) => {
    sound.playSuccess();
    updateProduct(productId, {
      reorderPoint: quickThresholdValue,
      safetyStock: quickSafetyValue,
    });
    setQuickThresholdProductId(null);
    showToast('Threshold Saved', 'Minimum low stock threshold updated successfully.', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Products Master Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Centralized SKU records, unit economics, reorder thresholds & multi-facility balances
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Low Stock Threshold Manager Hub Trigger Button */}
          <button
            onClick={() => handleOpenThresholdModal()}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs border ${
              totalBreached > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 animate-pulse'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="Configure minimum stock levels and safety stock buffers"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Low Stock Thresholds</span>
            {totalBreached > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-amber-700 text-[10px] font-bold">
                {totalBreached}
              </span>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openBarcodeScanner}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Barcode Scanner</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
                barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                name: '',
                description: '',
                category: 'Industrial Electronics',
                uom: 'pcs',
                costPrice: 50,
                sellingPrice: 85,
                reorderPoint: 25,
                safetyStock: 10,
                maxStock: 250,
                lotTracking: false,
                activeLotNumber: '',
                initialWarehouseId: warehouses[0]?.id || '',
                initialQty: 20,
                initialBin: 'Rack A-01-A1',
              });
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Real-Time Low Stock Threshold Alert Banner (If items are below minimum levels) */}
      {totalBreached > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent dark:from-amber-950/40 dark:via-amber-900/20 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  Threshold Alert: {totalBreached} Item{totalBreached > 1 ? 's' : ''} Below Minimum Stock Level
                </h2>
                {criticalBreached > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                    {criticalBreached} Critical Safety Breaches
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Current inventory on hand has dropped below configured minimum thresholds. Automatic alerts are active on the executive dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setStockFilter('LOW');
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Filter Low Stock SKUs
            </button>
            <button
              onClick={() => handleOpenThresholdModal()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manage Thresholds</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by SKU, name, barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full md:w-auto justify-end">
          <button
            onClick={() => setStockFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-colors ${
              stockFilter === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Stock ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('LOW')}
            className={`px-3 py-1 rounded-md transition-colors ${
              stockFilter === 'LOW'
                ? 'bg-amber-500 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Low Stock ({totalBreached})
          </button>
          <button
            onClick={() => setStockFilter('NOMINAL')}
            className={`px-3 py-1 rounded-md transition-colors ${
              stockFilter === 'NOMINAL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Nominal Stock
          </button>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Available Stock</th>
                <th className="py-3 px-4 text-left">Min Stock Threshold & Gauge</th>
                <th className="py-3 px-4 text-right">Valuation</th>
                <th className="py-3 px-4 text-center">Locations</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No matching products found. Try changing filters or adding a new SKU.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.totalStock <= p.reorderPoint;
                  const isCritical = p.totalStock <= p.safetyStock;
                  const maxVal = p.maxStock || (p.reorderPoint * 3) || 100;
                  const percentRatio = Math.min(100, Math.round((p.totalStock / maxVal) * 100));

                  const isInlineEditing = quickThresholdProductId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isCritical
                          ? 'bg-rose-50/20 dark:bg-rose-950/10'
                          : isLow
                          ? 'bg-amber-50/30 dark:bg-amber-950/10'
                          : ''
                      }`}
                    >
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isCritical
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                              : isLow
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">{p.sku}</span>
                              <span>·</span>
                              <span className="font-mono">{p.barcode}</span>
                              {p.lotTracking && (
                                <>
                                  <span>·</span>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Lot: {p.activeLotNumber}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {p.category}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                        ${p.costPrice.toFixed(2)}
                      </td>

                      {/* Sell */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-slate-100">
                        ${p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Available Stock */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-bold inline-flex items-center gap-1 ${
                              isCritical
                                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900'
                                : isLow
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {isLow && <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />}
                            <span>{p.totalStock} {p.uom}</span>
                          </span>
                          {p.totalReserved > 0 && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              ({p.totalReserved} reserved)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Low Stock Threshold & Visual Gauge Column */}
                      <td className="py-3 px-4 min-w-[200px]">
                        {isInlineEditing ? (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-md space-y-2 animate-in zoom-in-95 duration-100">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                              <span>Set Low Stock Min</span>
                              <button
                                onClick={() => setQuickThresholdProductId(null)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                <label className="text-[9px] text-slate-500 block">Min Threshold</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={quickThresholdValue}
                                  onChange={e => setQuickThresholdValue(parseInt(e.target.value) || 0)}
                                  className="w-full text-xs font-mono font-bold px-2 py-1 rounded border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 block">Safety Stock</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={quickSafetyValue}
                                  onChange={e => setQuickSafetyValue(parseInt(e.target.value) || 0)}
                                  className="w-full text-xs font-mono font-bold px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleSaveInlineThreshold(p.id)}
                              className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium transition-colors"
                            >
                              Save Threshold
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                  Min: {p.reorderPoint} {p.uom}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  (Safe: {p.safetyStock})
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  sound.playClick();
                                  setQuickThresholdProductId(p.id);
                                  setQuickThresholdValue(p.reorderPoint);
                                  setQuickSafetyValue(p.safetyStock);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Quick edit low stock threshold"
                              >
                                <Sliders className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Mini Stock vs Threshold Gauge Bar */}
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isCritical
                                    ? 'bg-rose-500'
                                    : isLow
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.max(5, percentRatio)}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-mono">
                              {isCritical ? (
                                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                                  ● Critical Safety Floor Breached
                                </span>
                              ) : isLow ? (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                                  ● Below Min Threshold (-{p.reorderPoint - p.totalStock})
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  ✓ Stock Level Healthy
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Total Valuation */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        ${(p.totalStock * p.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Locations Map Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setInspectingLocationsProduct(p)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono flex items-center gap-1 mx-auto transition-colors"
                          title="Inspect warehouse bins"
                        >
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          <span>{p.warehouseStocks.length} Hubs</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenThresholdModal(p.sku)}
                            className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            title="Configure SKU Low Stock Threshold"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete SKU"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Warehouse Locations Breakdown Drawer / Modal */}
      {inspectingLocationsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Facility Stock Breakdown: {inspectingLocationsProduct.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  SKU: {inspectingLocationsProduct.sku} · Barcode: {inspectingLocationsProduct.barcode}
                </p>
              </div>
              <button
                onClick={() => setInspectingLocationsProduct(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="space-y-2">
                {inspectingLocationsProduct.warehouseStocks.map(ws => {
                  const wh = warehouses.find(w => w.id === ws.warehouseId);
                  return (
                    <div
                      key={ws.warehouseId}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-bold font-mono">{ws.warehouseCode}</span>
                          <span>·</span>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">{wh?.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1 block">
                          Storage Coordinate: <span className="font-semibold text-slate-700 dark:text-slate-300">{ws.locationBin}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                          {ws.quantity} {inspectingLocationsProduct.uom}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ${(ws.quantity * inspectingLocationsProduct.costPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Global Available Stock:</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                  {inspectingLocationsProduct.totalStock} {inspectingLocationsProduct.uom}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {editingProduct ? `Edit SKU: ${editingProduct.sku}` : 'Add New Inventory SKU'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Barcode (EAN-128 / UPC)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ultra-Torque Brushless Servo Motor 450W"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Sensors & Robotics">Sensors & Robotics</option>
                    <option value="Motion & Actuators">Motion & Actuators</option>
                    <option value="Industrial Electronics">Industrial Electronics</option>
                    <option value="Power & Energy">Power & Energy</option>
                    <option value="Pneumatics & Fluidics">Pneumatics & Fluidics</option>
                    <option value="Logistics & Packaging">Logistics & Packaging</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Hardware & Bearings">Hardware & Bearings</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Unit of Measure (UOM)
                  </label>
                  <select
                    value={formData.uom}
                    onChange={e => setFormData({ ...formData, uom: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="box">Boxes (box)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="meter">Meters (meter)</option>
                    <option value="pallet">Pallets (pallet)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Safety Stock
                  </label>
                  <input
                    type="number"
                    value={formData.safetyStock}
                    onChange={e => setFormData({ ...formData, safetyStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Reorder Trigger
                  </label>
                  <input
                    type="number"
                    value={formData.reorderPoint}
                    onChange={e => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.maxStock}
                    onChange={e => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Initial allocation when adding new product */}
              {!editingProduct && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Initial Stock Setup:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Warehouse</label>
                      <select
                        value={formData.initialWarehouseId}
                        onChange={e => setFormData({ ...formData, initialWarehouseId: e.target.value })}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.code}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Initial Units</label>
                      <input
                        type="number"
                        value={formData.initialQty}
                        onChange={e => setFormData({ ...formData, initialQty: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Bin Coordinate</label>
                      <input
                        type="text"
                        value={formData.initialBin}
                        onChange={e => setFormData({ ...formData, initialBin: e.target.value })}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Manager Hub Modal */}
      <ThresholdManagerModal
        isOpen={isThresholdModalOpen}
        onClose={() => {
          setIsThresholdModalOpen(false);
          setThresholdModalSku(undefined);
        }}
        initialSelectedSku={thresholdModalSku}
      />
    </div>
  );
};
