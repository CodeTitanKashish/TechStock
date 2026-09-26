import React, { useState } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  MapPin,
  Mail,
  Phone,
  Layers,
  Package,
  ExternalLink,
  Edit2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Warehouse } from '../../types/inventory';

export const WarehousesView: React.FC = () => {
  const {
    warehouses,
    products,
    addWarehouse,
    updateWarehouse,
    showToast,
  } = useInventory();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    country: 'United States',
    managerName: '',
    contactEmail: '',
    contactPhone: '',
    totalCapacitySqFt: 100000,
    utilizedCapacitySqFt: 45000,
    zones: 'Zone A (High-Bay), Zone B (Receiving), Zone C (Bulk Storage)',
  });

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];

  // Get products stored in this specific warehouse
  const warehouseProducts = products.map(p => {
    const ws = p.warehouseStocks.find(w => w.warehouseId === selectedWarehouse?.id);
    return {
      product: p,
      quantity: ws?.quantity || 0,
      reserved: ws?.reserved || 0,
      locationBin: ws?.locationBin || 'Unassigned',
      valuation: (ws?.quantity || 0) * p.costPrice,
    };
  }).filter(item => item.quantity > 0);

  const totalWarehouseValuation = warehouseProducts.reduce((sum, item) => sum + item.valuation, 0);

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      showToast('Validation Error', 'Code and Facility Name are required.', 'error');
      return;
    }

    const zonesArray = formData.zones.split(',').map(z => z.trim()).filter(Boolean);

    if (editingWarehouse) {
      updateWarehouse(editingWarehouse.id, {
        code: formData.code.toUpperCase(),
        name: formData.name,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        managerName: formData.managerName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        totalCapacitySqFt: Number(formData.totalCapacitySqFt),
        utilizedCapacitySqFt: Number(formData.utilizedCapacitySqFt),
        zones: zonesArray,
      });
      setEditingWarehouse(null);
    } else {
      addWarehouse({
        code: formData.code.toUpperCase(),
        name: formData.name,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        managerName: formData.managerName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        totalCapacitySqFt: Number(formData.totalCapacitySqFt),
        utilizedCapacitySqFt: Number(formData.utilizedCapacitySqFt),
        zones: zonesArray,
        status: 'active',
      });
      setIsAddModalOpen(false);
    }
  };

  const openEditModal = (w: Warehouse) => {
    setEditingWarehouse(w);
    setFormData({
      code: w.code,
      name: w.name,
      address: w.address,
      city: w.city,
      country: w.country,
      managerName: w.managerName,
      contactEmail: w.contactEmail,
      contactPhone: w.contactPhone,
      totalCapacitySqFt: w.totalCapacitySqFt,
      utilizedCapacitySqFt: w.utilizedCapacitySqFt,
      zones: w.zones.join(', '),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Multi-Warehouse Network & Bins
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Global distribution centers, high-bay storage zones, aisle-rack coordinates & real-time occupancy
          </p>
        </div>

        <button
          onClick={() => {
            setEditingWarehouse(null);
            setFormData({
              code: `WH-HUB-${Math.floor(10 + Math.random() * 90)}`,
              name: '',
              address: '',
              city: '',
              country: 'United States',
              managerName: '',
              contactEmail: '',
              contactPhone: '',
              totalCapacitySqFt: 150000,
              utilizedCapacitySqFt: 25000,
              zones: 'Zone 1 (Receiving), Zone 2 (Aisle High-Bay), Zone 3 (Dispatch)',
            });
            setIsAddModalOpen(true);
          }}
          className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Warehouse Facility</span>
        </button>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map(wh => {
          const isSelected = selectedWarehouse?.id === wh.id;
          const pct = Math.round((wh.utilizedCapacitySqFt / wh.totalCapacitySqFt) * 100);

          return (
            <div
              key={wh.id}
              onClick={() => setSelectedWarehouseId(wh.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {wh.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openEditModal(wh);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2 leading-tight">
                  {wh.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{wh.city}, {wh.country}</span>
                </p>

                {/* Manager info */}
                <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    Lead: {wh.managerName}
                  </p>
                  <p className="truncate text-slate-400 text-[10px]">{wh.contactEmail}</p>
                </div>
              </div>

              {/* Capacity meter */}
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Occupancy</span>
                  <span className="font-mono font-medium">{pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct > 80 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Facility Deep Dive & Storage Bins */}
      {selectedWarehouse && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedWarehouse.code}
                </span>
                <span className="text-slate-300">·</span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedWarehouse.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Address: {selectedWarehouse.address}, {selectedWarehouse.city}, {selectedWarehouse.country}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase">Stocked Items:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {warehouseProducts.length} SKUs
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase">Facility Valuation:</span>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  ${totalWarehouseValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Zones Breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Configured Storage Zones & Aisle Racks:
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {selectedWarehouse.zones.map(z => (
                <div
                  key={z}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{z}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Inventory in this warehouse table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Physical Inventory on Location:
            </h3>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4">SKU / Product</th>
                    <th className="py-2.5 px-4">Aisle / Bin Coordinate</th>
                    <th className="py-2.5 px-4 text-right">Available Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Cost</th>
                    <th className="py-2.5 px-4 text-right">Subtotal Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {warehouseProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No products currently assigned to this facility.
                      </td>
                    </tr>
                  ) : (
                    warehouseProducts.map(({ product, quantity, reserved, locationBin, valuation }) => (
                      <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</p>
                          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{product.sku}</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300 font-medium">
                          {locationBin}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {quantity} {product.uom}
                          {reserved > 0 && <span className="text-[10px] text-amber-500 block">({reserved} reserved)</span>}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                          ${product.costPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          ${valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Warehouse Modal */}
      {(isAddModalOpen || editingWarehouse) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {editingWarehouse ? `Edit Facility: ${editingWarehouse.code}` : 'Register New Warehouse Facility'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingWarehouse(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Facility Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. WH-DAL"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dallas Distribution Center"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 1400 Industrial Blvd"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Dallas, TX"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Facility Director / Manager
                  </label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="Manager Name"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="manager@stocksense.corp"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Total Area (Sq Ft)
                  </label>
                  <input
                    type="number"
                    value={formData.totalCapacitySqFt}
                    onChange={e => setFormData({ ...formData, totalCapacitySqFt: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Current Occupancy (Sq Ft)
                  </label>
                  <input
                    type="number"
                    value={formData.utilizedCapacitySqFt}
                    onChange={e => setFormData({ ...formData, utilizedCapacitySqFt: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Storage Zones (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.zones}
                  onChange={e => setFormData({ ...formData, zones: e.target.value })}
                  placeholder="Zone A, Zone B, Zone C"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingWarehouse(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingWarehouse ? 'Save Changes' : 'Register Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
