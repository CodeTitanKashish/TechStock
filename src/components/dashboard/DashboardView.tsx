import React, { useState } from 'react';
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  DollarSign,
  Package,
  Warehouse,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useInventory } from '../../context/InventoryContext';
import { sound } from '../../utils/audio';
import { WarehouseFloorPlan } from './WarehouseFloorPlan';
import { ScenarioForecastSandbox } from './ScenarioForecastSandbox';
import { LiveSimulationStream } from './LiveSimulationStream';

export const DashboardView: React.FC = () => {
  const {
    products,
    warehouses,
    movements,
    ledger,
    activeWarehouseId,
    setCurrentTab,
    openPrintSlip,
    theme,
  } = useInventory();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'floorplan' | 'sandbox' | 'livestream'>('overview');

  // Filter based on active warehouse if selected
  const filteredProducts = activeWarehouseId === 'ALL'
    ? products
    : products.map(p => {
        const ws = p.warehouseStocks.find(w => w.warehouseId === activeWarehouseId);
        return {
          ...p,
          totalStock: ws?.quantity || 0,
        };
      });

  const totalSKUs = products.length;
  const totalValuation = filteredProducts.reduce((sum, p) => sum + (p.totalStock * p.costPrice), 0);
  const lowStockItems = filteredProducts.filter(p => p.totalStock <= p.reorderPoint);
  const criticalStockItems = filteredProducts.filter(p => p.totalStock <= p.safetyStock);
  const pendingApprovals = movements.filter(m => m.status === 'pending_approval');
  const inTransitCount = movements.filter(m => m.type === 'transfer' && m.status === 'in_transit').length;

  // Chart data: Simulated 7-day movement throughput (Inbound vs Outbound)
  const movementTrendData = [
    { day: 'Mon', receipts: 28, deliveries: 19 },
    { day: 'Tue', receipts: 35, deliveries: 42 },
    { day: 'Wed', receipts: 14, deliveries: 31 },
    { day: 'Thu', receipts: 48, deliveries: 26 },
    { day: 'Fri', receipts: 52, deliveries: 45 },
    { day: 'Sat', receipts: 18, deliveries: 12 },
    { day: 'Sun', receipts: 8, deliveries: 5 },
  ];

  // Category Valuation Breakdown for Donut Chart
  const categoryMap: Record<string, number> = {};
  filteredProducts.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + (p.totalStock * p.costPrice);
  });

  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

  // Recent 6 ledger entries
  const recentLedger = ledger.slice(0, 6);

  const handleSubTabChange = (tab: 'overview' | 'floorplan' | 'sandbox' | 'livestream') => {
    sound.playClick();
    setActiveSubTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Facility Status & Interactive Sub-Navigation */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-6 shadow-md border border-slate-800">
        <div className="absolute inset-0 opacity-15 mix-blend-luminosity pointer-events-none">
          <img
            src="/src/assets/images/warehouse_logistics_hub_1790402440298.jpg"
            alt="Logistics Facility"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Logistics Engine Active</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Global Supply Chain & Inventory Command
            </h1>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Monitoring 4 fulfillment centers, high-velocity stock allocations, multi-tier approvals, and perpetual double-entry movements.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => { sound.playClick(); setCurrentTab('receipts'); }}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Receive PO</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setCurrentTab('deliveries'); }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowUpFromLine className="w-3.5 h-3.5" />
              <span>Dispatch SO</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setCurrentTab('transfers'); }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Interactive Mode Switcher Strip */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => handleSubTabChange('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Executive Metrics & Velocity</span>
          </button>
          <button
            onClick={() => handleSubTabChange('floorplan')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'floorplan'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>2D Warehouse Spatial Floor Plan</span>
          </button>
          <button
            onClick={() => handleSubTabChange('sandbox')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'sandbox'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>What-If Scenario Sandbox</span>
          </button>
          <button
            onClick={() => handleSubTabChange('livestream')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'livestream'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Pulse Stream Simulator</span>
          </button>
        </div>
      </div>

      {/* Visual Low Stock Threshold Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/50 dark:border-amber-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs shrink-0 animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Threshold Alert: {lowStockItems.length} Product{lowStockItems.length > 1 ? 's' : ''} Below Minimum Stock Level
                </h3>
                {criticalStockItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                    {criticalStockItems.length} Critical (Below Safety Floor)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Physical on-hand inventory has breached configured minimum thresholds. Replenish immediately to avoid order fulfillment blockages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setCurrentTab('products');
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Configure Thresholds
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setCurrentTab('receipts');
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Draft POs</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Stat Cards Grid (Always visible for fast scanning) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Valuation */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Asset Valuation</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
            ${totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Weighted Cost Basis</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Nominal</span>
          </div>
        </div>

        {/* Active SKUs */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Catalog SKUs</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {totalSKUs} <span className="text-xs font-normal text-slate-400">active items</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Across 4 Global Depots</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => { sound.playClick(); setCurrentTab('products'); }}
          className={`p-4 rounded-xl bg-white dark:bg-slate-900 border shadow-xs cursor-pointer transition-all ${
            lowStockItems.length > 0
              ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20 bg-amber-50/10'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Threshold Breaches</span>
              {lowStockItems.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {lowStockItems.length} <span className="text-xs font-normal text-slate-400">below min level</span>
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            <span>{criticalStockItems.length > 0 ? `${criticalStockItems.length} critical safety floors` : 'Inspect & Reorder'}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => { sound.playClick(); setCurrentTab('approvals'); }}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Governance Queue</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-2">
            {pendingApprovals.length} <span className="text-xs font-normal text-slate-400">awaiting sign-off</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{inTransitCount} transfers in transit</span>
          </div>
        </div>
      </div>

      {/* Sub-View Render Condition */}
      {activeSubTab === 'floorplan' && <WarehouseFloorPlan />}
      {activeSubTab === 'sandbox' && <ScenarioForecastSandbox />}
      {activeSubTab === 'livestream' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveSimulationStream />
          <WarehouseFloorPlan />
        </div>
      )}

      {activeSubTab === 'overview' && (
        <>
          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Inbound vs Outbound Velocity */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Movement Velocity & Throughput
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Weekly units received vs dispatched across facilities
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-600 dark:text-slate-400">Receipts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">Deliveries</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={movementTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="receiptsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="deliveriesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} stroke="transparent" />
                    <YAxis tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} stroke="transparent" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Area type="monotone" dataKey="receipts" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#receiptsGrad)" />
                    <Area type="monotone" dataKey="deliveries" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#deliveriesGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Valuation by Category Donut Chart */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Valuation by Category
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Capital tied across product lines
                </p>
              </div>

              <div className="h-48 w-full my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => `$${Number(val || 0).toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mini Legend */}
              <div className="space-y-1 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                {categoryChartData.slice(0, 3).map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-200 shrink-0">
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Facilities & Warehouses Overview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Warehouse Capacities & Live Utilization
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Storage footprint utilization across nodes
                </p>
              </div>
              <button
                onClick={() => { sound.playClick(); setCurrentTab('warehouses'); }}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Manage Hubs</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {warehouses.map(wh => {
                const pct = Math.round((wh.utilizedCapacitySqFt / wh.totalCapacitySqFt) * 100);
                return (
                  <div
                    key={wh.id}
                    onClick={() => { sound.playClick(); setCurrentTab('warehouses'); }}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{wh.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        Active
                      </span>
                    </div>
                    <p className="font-medium text-xs text-slate-800 dark:text-slate-200 mt-1 truncate">{wh.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{wh.city}</p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Capacity Occupied</span>
                        <span className="font-mono font-medium">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {(wh.utilizedCapacitySqFt / 1000).toFixed(0)}k / {(wh.totalCapacitySqFt / 1000).toFixed(0)}k sq ft
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Column Bottom Grid: Critical Low Stock Replenishment & Live Stream Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Low Stock Warnings */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Priority Replenishment Queue
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { sound.playClick(); setCurrentTab('products'); }}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                  >
                    Adjust Thresholds
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setCurrentTab('reports'); }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Full Forecast
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {lowStockItems.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">All products satisfy safety stock buffers.</div>
                ) : (
                  lowStockItems.map(p => {
                    const isCritical = p.totalStock <= p.safetyStock;
                    const deficit = p.reorderPoint - p.totalStock;
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isCritical
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                            : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                            {isCritical && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            SKU: {p.sku} · Min Threshold: {p.reorderPoint} {p.uom} · Safety: {p.safetyStock}
                          </p>
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono block mt-0.5">
                            Deficit: {deficit > 0 ? `-${deficit} ${p.uom}` : 'At Threshold'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold ${
                            isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                          }`}>
                            {p.totalStock} {p.uom} on hand
                          </span>
                          <button
                            onClick={() => { sound.playClick(); setCurrentTab('receipts'); }}
                            className="mt-1 block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            + Auto-Draft PO
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Real-Time Immutable Ledger Stream */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-indigo-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Perpetual Stock Ledger Stream
                  </h2>
                </div>
                <button
                  onClick={() => { sound.playClick(); setCurrentTab('ledger'); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Inspect Ledger
                </button>
              </div>

              <div className="space-y-2">
                {recentLedger.map(entry => (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          entry.quantityChange > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <div>
                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {entry.movementRef}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {entry.productName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono font-bold ${
                          entry.quantityChange > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Bal: {entry.runningBalance} @ {entry.warehouseCode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
