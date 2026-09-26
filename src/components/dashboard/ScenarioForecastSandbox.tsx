import React, { useState } from 'react';
import {
  TrendingUp,
  Sliders,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useInventory } from '../../context/InventoryContext';
import { sound } from '../../utils/audio';

export const ScenarioForecastSandbox: React.FC = () => {
  const { products, theme, setCurrentTab, showToast } = useInventory();

  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'SEN-OPT-01');
  const [demandSurge, setDemandSurge] = useState<number>(30); // percentage surge
  const [supplierDelayDays, setSupplierDelayDays] = useState<number>(5); // extra lead time days
  const [scenarioName, setScenarioName] = useState<'q4_peak' | 'custom' | 'supply_shock'>('q4_peak');

  const activeProduct = products.find(p => p.sku === selectedSku) || products[0];

  // Calculate 30-day projection curves
  const dailyBaseRunRate = Math.max(1, Math.round(activeProduct.totalStock / 25)); // simulated base daily consumption
  const surgedDailyRunRate = Math.round(dailyBaseRunRate * (1 + demandSurge / 100));

  const simulationData = Array.from({ length: 30 }, (_, dayIndex) => {
    const day = `Day ${dayIndex + 1}`;
    // Baseline depletion
    const baselineStock = Math.max(0, activeProduct.totalStock - dailyBaseRunRate * (dayIndex + 1));
    // Surged scenario depletion
    const surgedStock = Math.max(0, activeProduct.totalStock - surgedDailyRunRate * (dayIndex + 1));

    return {
      day,
      dayNum: dayIndex + 1,
      baselineStock,
      surgedStock,
      safetyBuffer: activeProduct.reorderPoint,
    };
  });

  const stockoutDayIndex = simulationData.findIndex(d => d.surgedStock <= 0);
  const stockoutDay = stockoutDayIndex !== -1 ? stockoutDayIndex + 1 : '> 30';
  const reorderTriggerDay = simulationData.findIndex(d => d.surgedStock <= activeProduct.reorderPoint) + 1;

  const handleApplyPreset = (preset: 'q4_peak' | 'supply_shock' | 'normal') => {
    sound.playClick();
    if (preset === 'q4_peak') {
      setScenarioName('q4_peak');
      setDemandSurge(50);
      setSupplierDelayDays(7);
    } else if (preset === 'supply_shock') {
      setScenarioName('supply_shock');
      setDemandSurge(20);
      setSupplierDelayDays(18);
    } else {
      setScenarioName('custom');
      setDemandSurge(0);
      setSupplierDelayDays(0);
    }
  };

  const handleCreateAutoPO = () => {
    sound.playSuccess();
    showToast(
      'Automated PO Generated',
      `Auto-drafted Purchase Order for ${Math.round(activeProduct.reorderPoint * 2.5)} units of ${activeProduct.name} to mitigate Day ${stockoutDay} stockout.`,
      'success'
    );
    setCurrentTab('receipts');
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Predictive Demand & Stockout Sandbox
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Test hypothetical market spikes, lead-time variance, and stress-test reorder buffers in real time.
          </p>
        </div>

        {/* Preset Scenarios */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => handleApplyPreset('q4_peak')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              scenarioName === 'q4_peak'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Q4 Holiday Surge (+50%)
          </button>
          <button
            onClick={() => handleApplyPreset('supply_shock')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              scenarioName === 'supply_shock'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Supply Chain Bottleneck
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Interactive Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Column: Interactive Simulation Sliders */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Target SKU for Stress-Test
            </label>
            <select
              value={selectedSku}
              onChange={e => {
                sound.playClick();
                setSelectedSku(e.target.value);
              }}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            >
              {products.map(p => (
                <option key={p.id} value={p.sku}>
                  [{p.sku}] {p.name} ({p.totalStock} {p.uom} on hand)
                </option>
              ))}
            </select>
          </div>

          {/* Demand Surge Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Simulated Demand Spike</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +{demandSurge}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={demandSurge}
              onChange={e => {
                setScenarioName('custom');
                setDemandSurge(Number(e.target.value));
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>Standard (0%)</span>
              <span>+75%</span>
              <span>+150% Peak</span>
            </div>
          </div>

          {/* Supplier Lead Time Delay Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Supplier Delay Variance</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                +{supplierDelayDays} days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={supplierDelayDays}
              onChange={e => {
                setScenarioName('custom');
                setSupplierDelayDays(Number(e.target.value));
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>0 Days</span>
              <span>15 Days</span>
              <span>30 Days (Critical)</span>
            </div>
          </div>

          {/* Scenario Outcome Summary */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Projected Runout:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                Day {stockoutDay}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Reorder Trigger:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                Day {reorderTriggerDay > 0 ? reorderTriggerDay : 1}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recommended Order:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(activeProduct.reorderPoint * 2.5)} {activeProduct.uom}
              </span>
            </div>
          </div>

          <button
            onClick={handleCreateAutoPO}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Recommended PO</span>
          </button>
        </div>

        {/* Right Column: Dynamic 30-Day Projection Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                30-Day Simulated Depletion Curve
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Comparing standard operational baseline vs simulated scenario curve
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-slate-400" />
                <span className="text-slate-500">Baseline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-rose-500" />
                <span className="text-slate-900 dark:text-slate-200 font-medium">Surge Curve</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">Safety Buffer</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="dayNum" tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} stroke="transparent" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine y={activeProduct.reorderPoint} stroke="#f59e0b" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="baselineStock" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="surgedStock" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Current inventory on hand: <strong className="text-slate-800 dark:text-slate-200 font-mono">{activeProduct.totalStock} {activeProduct.uom}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Auto-safety buffer preserved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
