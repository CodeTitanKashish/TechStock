import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownToLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Building,
  User,
  AlertTriangle,
  Printer,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { InventoryMovement } from '../../types/inventory';

export const ApprovalsView: React.FC = () => {
  const {
    movements,
    approveRequest,
    rejectRequest,
    openPrintSlip,
    currentUser,
    showToast,
  } = useInventory();

  const [activeFilter, setActiveFilter] = useState<'pending' | 'history'>('pending');
  const [rejectModalMovement, setRejectModalMovement] = useState<InventoryMovement | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const pendingItems = movements.filter(m => m.status === 'pending_approval');
  const historyItems = movements.filter(m => m.status === 'completed' || m.status === 'cancelled');

  const displayedItems = activeFilter === 'pending' ? pendingItems : historyItems;

  const handleConfirmReject = () => {
    if (!rejectModalMovement) return;
    rejectRequest(rejectModalMovement.id, rejectRemarks);
    setRejectModalMovement(null);
    setRejectRemarks('');
  };

  const isUserAuthorized = currentUser.role === 'admin' || currentUser.role === 'warehouse_manager';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Governance & Approval Command Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-tier validation for high-value inward consignments, inter-depot transfers & physical audit variances
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Authorization ({pendingItems.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeFilter === 'history'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Approved & History</span>
          </button>
        </div>
      </div>

      {/* RBAC Permission Banner */}
      {!isUserAuthorized && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Your current role (<strong>{currentUser.role.replace('_', ' ').toUpperCase()}</strong>) has view-only rights in the Approval Queue. Switch to <strong>Administrator</strong> or <strong>Warehouse Manager</strong> in the top-right profile menu to authorize workflows.
            </span>
          </div>
        </div>
      )}

      {/* Approvals Cards Grid */}
      <div className="space-y-3">
        {displayedItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              {activeFilter === 'pending' ? 'All Operations Cleared' : 'No Authorization History'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeFilter === 'pending'
                ? 'There are currently no inbound shipments, inter-depot transfers or inventory variances awaiting sign-off.'
                : 'Processed authorization tickets will show up here.'}
            </p>
          </div>
        ) : (
          displayedItems.map(m => {
            const isPending = m.status === 'pending_approval';

            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                        {m.referenceNumber}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {m.type}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          m.status === 'pending_approval'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                            : m.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Facility: <strong>{m.sourceWarehouseName || m.destinationWarehouseName}</strong></span>
                      <span>·</span>
                      <span>Requested By: <strong>{m.createdBy.userName}</strong> ({m.createdBy.userRole.replace('_', ' ')})</span>
                      <span>·</span>
                      <span>Logged: <strong>{new Date(m.date).toLocaleDateString()} {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    </div>

                    {/* Items preview snippet */}
                    <div className="pt-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 mr-1.5">Line Items:</span>
                      {m.items.map((i, idx) => (
                        <span key={i.productId} className="inline-block mr-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {i.productSku} ({i.quantity > 0 ? `+${i.quantity}` : i.quantity} {i.uom})
                        </span>
                      ))}
                    </div>

                    {m.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-100 dark:border-slate-800">
                        "{m.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right Actions & Financial Impact */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Financial Impact</span>
                      <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                        ${Math.abs(m.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPrintSlip(m)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect Slip</span>
                      </button>

                      {isPending && isUserAuthorized && (
                        <>
                          <button
                            onClick={() => setRejectModalMovement(m)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => approveRequest(m.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs"
                          >
                            Authorize & Post
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-5 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Reject Authorization Request
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Provide an audit remark for rejecting ticket <strong>{rejectModalMovement.referenceNumber}</strong>. The requester will be notified.
            </p>
            <div>
              <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Rejection Reason / Required Rectification
              </label>
              <textarea
                rows={3}
                value={rejectRemarks}
                onChange={e => setRejectRemarks(e.target.value)}
                placeholder="e.g. Discrepancy exceeds standard tolerance; please re-count with secondary supervisor."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalMovement(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
