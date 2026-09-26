import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { sound } from '../../utils/audio';

interface StreamEvent {
  id: string;
  timestamp: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'scan';
  title: string;
  detail: string;
  badge: string;
  badgeColor: string;
}

export const LiveSimulationStream: React.FC = () => {
  const { products, warehouses, showToast, setCurrentTab } = useInventory();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [events, setEvents] = useState<StreamEvent[]>([
    {
      id: 'EVT-01',
      timestamp: 'Just now',
      type: 'receipt',
      title: 'PO Receipt Staged',
      detail: 'Received 120x Optical Sensor 4K into Central Hub (Aisle A1)',
      badge: 'Dock #02',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      id: 'EVT-02',
      timestamp: '1m ago',
      type: 'transfer',
      title: 'AGV Transit Dispatched',
      detail: '50x Isolated PSU 48V en route: WH-MAIN -> WH-WEST',
      badge: 'In Transit',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
    },
    {
      id: 'EVT-03',
      timestamp: '3m ago',
      type: 'delivery',
      title: 'Customer SO Dispatched',
      detail: 'Pick & Pack verified for Order #SO-88219 (Tesla Giga Nevada)',
      badge: 'FedEx Freight',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
  ]);

  // Automated background event generation when active
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)] || products[0];
      const randomWarehouse = warehouses[Math.floor(Math.random() * warehouses.length)] || warehouses[0];
      const eventTypes: Array<'receipt' | 'delivery' | 'transfer'> = ['receipt', 'delivery', 'transfer'];
      const pickedType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const qty = Math.floor(Math.random() * 25) + 5;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      let title = '';
      let detail = '';
      let badge = '';
      let badgeColor = '';

      if (pickedType === 'receipt') {
        title = `PO Inbound Verified (+${qty})`;
        detail = `${qty}x ${randomProduct.name} checked into ${randomWarehouse.name}`;
        badge = `Dock 0${Math.floor(Math.random() * 4) + 1}`;
        badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
        sound.playScan();
      } else if (pickedType === 'delivery') {
        title = `SO Fulfillment Dispatched (-${qty})`;
        detail = `Picked & packed ${qty}x ${randomProduct.name} for Outbound Dispatch`;
        badge = 'Express Dispatch';
        badgeColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400';
        sound.playClick();
      } else {
        title = `Internal AGV Transfer (${qty})`;
        detail = `Automated relocation of ${qty}x ${randomProduct.name} to Aisle B`;
        badge = 'AGV Active';
        badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400';
        sound.playClick();
      }

      const newEvent: StreamEvent = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        timestamp: timeStr,
        type: pickedType,
        title,
        detail,
        badge,
        badgeColor,
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 7)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isRunning, products, warehouses]);

  const handleToggleRunning = () => {
    sound.playClick();
    setIsRunning(!isRunning);
    if (!isRunning) {
      showToast('Live Logistics Stream Started', 'Real-time telemetry and AGV activity simulation running.', 'info');
    }
  };

  const handleSimulateQuickReceipt = () => {
    sound.playScan();
    const randomProduct = products[0];
    const newEvent: StreamEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type: 'receipt',
      title: 'Manual Scan Received (+20)',
      detail: `Operator scan confirmed 20x ${randomProduct.name}`,
      badge: 'Handheld Gun',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 7)]);
    showToast('Barcode Scan Streamed', `Captured telemetry for ${randomProduct.name}`, 'success');
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      {/* Top Stream Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isRunning ? 'bg-emerald-400' : 'bg-slate-400'
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isRunning ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </span>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Live Logistics Pulse Stream
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleRunning}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isRunning
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isRunning ? 'Pause Stream' : 'Start Live Sim'}</span>
            </button>
            <button
              onClick={handleSimulateQuickReceipt}
              title="Trigger simulated scanner pulse"
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Stream Event List */}
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {events.map(evt => (
            <div
              key={evt.id}
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-start gap-2.5 text-xs animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="shrink-0 mt-0.5">
                {evt.type === 'receipt' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </div>
                )}
                {evt.type === 'delivery' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <ArrowUpFromLine className="w-3.5 h-3.5" />
                  </div>
                )}
                {evt.type === 'transfer' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {evt.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {evt.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {evt.detail}
                </p>
              </div>

              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${evt.badgeColor}`}>
                {evt.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Channel: FIFO double-entry bus</span>
        <button
          onClick={() => setCurrentTab('ledger')}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-sans"
        >
          View Full Audit Ledger →
        </button>
      </div>
    </div>
  );
};
