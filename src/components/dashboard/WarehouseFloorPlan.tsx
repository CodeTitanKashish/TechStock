import React, { useState } from 'react';
import {
  Layers,
  Thermometer,
  Boxes,
  Zap,
  CheckCircle2,
  AlertTriangle,
  MoveRight,
  Eye,
  Info,
  Maximize2
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { sound } from '../../utils/audio';

interface RackBin {
  id: string;
  code: string;
  sku: string;
  productName: string;
  qty: number;
  maxCapacity: number;
  temperature: string;
  status: 'optimal' | 'dense' | 'low' | 'quarantine';
}

export const WarehouseFloorPlan: React.FC = () => {
  const { products, warehouses, activeWarehouseId, setCurrentTab } = useInventory();
  const [selectedZone, setSelectedZone] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [selectedBin, setSelectedBin] = useState<RackBin | null>(null);
  const [viewMode, setViewMode] = useState<'capacity' | 'temperature' | 'velocity'>('capacity');

  const activeWarehouse = warehouses.find(w => w.id === activeWarehouseId) || warehouses[0];

  // Dynamic rack bins data mapped to products
  const zoneRacks: Record<'A' | 'B' | 'C' | 'D', { name: string; type: string; bins: RackBin[] }> = {
    A: {
      name: 'Zone A: High-Velocity Pallet Racking',
      type: 'Ambient Heavy Logistics',
      bins: [
        { id: 'A-01-01', code: 'A1-01', sku: 'SEN-OPT-01', productName: 'Optical Sensor 4K', qty: 185, maxCapacity: 200, temperature: '21.4°C', status: 'dense' },
        { id: 'A-01-02', code: 'A1-02', sku: 'ROB-ARM-04', productName: 'Servo Actuator 24V', qty: 64, maxCapacity: 100, temperature: '21.2°C', status: 'optimal' },
        { id: 'A-02-01', code: 'A2-01', sku: 'LID-3D-900', productName: 'Industrial LiDAR Unit', qty: 18, maxCapacity: 150, temperature: '21.5°C', status: 'low' },
        { id: 'A-02-02', code: 'A2-02', sku: 'PLC-MOD-16', productName: 'Logic Controller 16-Ch', qty: 95, maxCapacity: 120, temperature: '21.1°C', status: 'optimal' },
        { id: 'A-03-01', code: 'A3-01', sku: 'MOT-STP-02', productName: 'NEMA 23 Stepper Motor', qty: 110, maxCapacity: 120, temperature: '21.0°C', status: 'dense' },
        { id: 'A-03-02', code: 'A3-02', sku: 'ENC-ROT-50', productName: 'Optical Rotary Encoder', qty: 45, maxCapacity: 100, temperature: '21.3°C', status: 'optimal' },
      ],
    },
    B: {
      name: 'Zone B: Climate-Controlled Clean Room',
      type: 'Cold & Moisture Regulated (18.0°C)',
      bins: [
        { id: 'B-01-01', code: 'B1-01', sku: 'MCU-ARM-32', productName: 'ARM Cortex M4 Board', qty: 320, maxCapacity: 400, temperature: '18.1°C', status: 'optimal' },
        { id: 'B-01-02', code: 'B1-02', sku: 'SEN-AIR-09', productName: 'Precision Gas Sensor', qty: 290, maxCapacity: 300, temperature: '18.0°C', status: 'dense' },
        { id: 'B-02-01', code: 'B2-01', sku: 'PWR-SMPS-48', productName: 'Isolated PSU 48V/10A', qty: 40, maxCapacity: 80, temperature: '18.2°C', status: 'optimal' },
        { id: 'B-02-02', code: 'B2-02', sku: 'FIB-CAB-10', productName: 'Armored Fiber Cable 10m', qty: 12, maxCapacity: 100, temperature: '18.0°C', status: 'low' },
      ],
    },
    C: {
      name: 'Zone C: Cross-Dock & Inbound Staging',
      type: 'High Turn Rate Staging',
      bins: [
        { id: 'C-01-01', code: 'STG-01', sku: 'PKG-PAL-HD', productName: 'Heavy Duty Euro Pallets', qty: 85, maxCapacity: 100, temperature: '22.0°C', status: 'optimal' },
        { id: 'C-01-02', code: 'STG-02', sku: 'STR-WRK-01', productName: 'Stretch Film Poly 500m', qty: 92, maxCapacity: 100, temperature: '22.1°C', status: 'dense' },
        { id: 'C-02-01', code: 'DCK-01', sku: 'LBL-BAR-4X', productName: 'Thermal Barcode Rolls', qty: 300, maxCapacity: 300, temperature: '21.9°C', status: 'dense' },
      ],
    },
    D: {
      name: 'Zone D: Inspection & Quarantine Bay',
      type: 'Quality Assurance & Returns',
      bins: [
        { id: 'D-01-01', code: 'QA-01', sku: 'SEN-OPT-01', productName: 'Optical Sensor 4K (Pending Calib)', qty: 8, maxCapacity: 50, temperature: '20.5°C', status: 'quarantine' },
        { id: 'D-01-02', code: 'QA-02', sku: 'ROB-ARM-04', productName: 'Servo Actuator (RMA Testing)', qty: 4, maxCapacity: 50, temperature: '20.6°C', status: 'quarantine' },
      ],
    },
  };

  const currentZone = zoneRacks[selectedZone];

  const handleSelectBin = (bin: RackBin) => {
    sound.playClick();
    setSelectedBin(bin);
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Header with Zone Switcher & Visual Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Interactive 2D Facility Spatial Map
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Facility: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeWarehouse.name}</span> ({activeWarehouse.code}) · Live telemetry active
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => { sound.playClick(); setViewMode('capacity'); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'capacity'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Capacity Heatmap
            </button>
            <button
              onClick={() => { sound.playClick(); setViewMode('temperature'); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'temperature'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Telemetry (Temp)
            </button>
          </div>
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
        {(['A', 'B', 'C', 'D'] as const).map(zoneKey => (
          <button
            key={zoneKey}
            onClick={() => { sound.playClick(); setSelectedZone(zoneKey); setSelectedBin(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 shrink-0 ${
              selectedZone === zoneKey
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current opacity-80" />
            <span>Zone {zoneKey}</span>
            <span className="text-[10px] opacity-75 font-mono">
              ({zoneRacks[zoneKey].bins.length} bays)
            </span>
          </button>
        ))}
      </div>

      {/* Main Floor Plan Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
        {/* Visual Rack Map */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 relative overflow-hidden">
          {/* Subtle Grid Canvas Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-3">
              <div>
                <span className="font-semibold text-white">{currentZone.name}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{currentZone.type}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AGV Robotic Grid Online</span>
              </div>
            </div>

            {/* Interactive Racks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentZone.bins.map(bin => {
                const fillPercent = Math.round((bin.qty / bin.maxCapacity) * 100);
                const isSelected = selectedBin?.id === bin.id;

                let colorStyle = 'border-indigo-500/40 bg-indigo-950/30 text-indigo-200';
                if (bin.status === 'dense') {
                  colorStyle = 'border-amber-500/50 bg-amber-950/30 text-amber-200';
                } else if (bin.status === 'low') {
                  colorStyle = 'border-rose-500/50 bg-rose-950/30 text-rose-200';
                } else if (bin.status === 'quarantine') {
                  colorStyle = 'border-purple-500/50 bg-purple-950/30 text-purple-200';
                }

                return (
                  <div
                    key={bin.id}
                    onClick={() => handleSelectBin(bin)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'ring-2 ring-indigo-400 border-indigo-400 bg-indigo-900/40 shadow-lg scale-[1.02]'
                        : `${colorStyle} hover:bg-slate-800/80`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white tracking-wider">
                        {bin.code}
                      </span>
                      {viewMode === 'temperature' ? (
                        <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          {bin.temperature}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-300">
                          {fillPercent}%
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-200 font-medium truncate mt-1">
                      {bin.productName}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      {bin.sku}
                    </span>

                    {/* Occupancy Indicator Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          bin.status === 'dense'
                            ? 'bg-amber-400'
                            : bin.status === 'low'
                            ? 'bg-rose-400'
                            : bin.status === 'quarantine'
                            ? 'bg-purple-400'
                            : 'bg-indigo-400'
                        }`}
                        style={{ width: `${Math.min(fillPercent, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>{bin.qty} units</span>
                      <span>Cap: {bin.maxCapacity}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Floor Guide & Status Ticker */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500" /> Optimal (40-80%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> High Load (&gt;80%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500" /> Understocked (&lt;20%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" /> Quarantine Bay</span>
              </div>
              <span>Click any bin to view stock profile</span>
            </div>
          </div>
        </div>

        {/* Selected Bin Real-Time Inspection Inspector Panel */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          {selectedBin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    BAY {selectedBin.code}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedBin.productName}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {selectedBin.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Stock on Bay</span>
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
                    {selectedBin.qty}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Max Bay Capacity</span>
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
                    {selectedBin.maxCapacity}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Temperature</span>
                  <span className="font-mono font-bold text-base text-cyan-600 dark:text-cyan-400">
                    {selectedBin.temperature}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">SKU Code</span>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                    {selectedBin.sku}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-indigo-700 dark:text-indigo-300">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Automated Bin Routing</span>
                </div>
                <p>
                  Optimized for FIFO dispatch. Direct conveyor connection to Loading Dock #02.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setCurrentTab('transfers')}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                  <span>Initiate Bay Relocation</span>
                </button>
                <button
                  onClick={() => setCurrentTab('products')}
                  className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open SKU Master Record</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Boxes className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
              <p className="font-medium text-xs text-slate-700 dark:text-slate-300">No Bay Selected</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                Click any rack bay on the 2D floor plan to inspect stock quantities and bay health.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
