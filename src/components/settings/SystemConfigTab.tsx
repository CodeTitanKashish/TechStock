import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Building2,
  DollarSign,
  ShieldAlert,
  Clock,
  Lock,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { SystemConfig } from '../../types/inventory';

export const SystemConfigTab: React.FC = () => {
  const { systemConfig, updateSystemConfig, showToast } = useInventory();

  // Local draft state
  const [formData, setFormData] = useState<SystemConfig>({ ...systemConfig });
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig(formData);
    setIsDirty(false);
  };

  const handleReset = () => {
    setFormData({ ...systemConfig });
    setIsDirty(false);
    showToast('Changes Reverted', 'Reverted unsaved form adjustments.', 'info');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-200 text-xs">
      {/* Save Bar Banner if unsaved */}
      {isDirty && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="font-semibold text-xs">You have unsaved system configuration changes!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
            >
              Revert
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Section 1: Company Profile & Accounting */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Enterprise Entity Profile & Valuation Method
              </h3>
              <p className="text-[11px] text-slate-400">
                Global legal entity metadata, base currency & balance sheet inventory accounting
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Company Legal Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Corporate Tax / VAT ID
            </label>
            <input
              type="text"
              value={formData.companyTaxId}
              onChange={e => handleChange('companyTaxId', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Primary Base Currency
            </label>
            <select
              value={formData.baseCurrency}
              onChange={e => handleChange('baseCurrency', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="INR (₹)">INR (₹) – Indian Rupee (₹)</option>
              <option value="USD ($)">USD ($) – United States Dollar</option>
              <option value="EUR (€)">EUR (€) – Euro Currency</option>
              <option value="GBP (£)">GBP (£) – British Pound Sterling</option>
              <option value="SGD (S$)">SGD (S$) – Singapore Dollar</option>
              <option value="JPY (¥)">JPY (¥) – Japanese Yen</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Default Cost Valuation Method
            </label>
            <select
              value={formData.defaultValuationMethod}
              onChange={e => handleChange('defaultValuationMethod', e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="FIFO">FIFO (First-In, First-Out) – Standard ERP GAAP</option>
              <option value="Weighted Average">Weighted Average Cost (Moving Average)</option>
              <option value="Standard Cost">Standard Costing Method</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Governance & Approval Thresholds */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Governance & Managerial Approval Thresholds
              </h3>
              <p className="text-[11px] text-slate-400">
                Automatic routing limits that mandate supervisor or administrator sign-off
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              PO Intake Approval Limit (₹)
            </label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3 top-2 font-bold text-xs">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.receiptApprovalThreshold}
                onChange={e => handleChange('receiptApprovalThreshold', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Receipts exceeding this sum require Warehouse Manager sign-off.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Inter-Hub Transfer Threshold (₹)
            </label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3 top-2 font-bold text-xs">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.transferApprovalThreshold}
                onChange={e => handleChange('transferApprovalThreshold', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Stock transfers between hubs above this amount require Admin approval.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Variance Write-Off Threshold (₹)
            </label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3 top-2 font-bold text-xs">₹</span>
              <input
                type="number"
                min="0"
                step="250"
                value={formData.adjustmentApprovalThreshold}
                onChange={e => handleChange('adjustmentApprovalThreshold', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Physical cycle count variances exceeding this value require authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Compliance, Audit Trail & Security Policies */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-cyan-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Security Policies & Audit Trail Integrity
              </h3>
              <p className="text-[11px] text-slate-400">
                Retention duration, authentication enforcement and lot traceability rules
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Audit Trail Retention Policy (Days)
              </label>
              <select
                value={formData.auditRetentionDays}
                onChange={e => handleChange('auditRetentionDays', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="90">90 Days (Standard Operations)</option>
                <option value="180">180 Days (Semi-Annual Audit)</option>
                <option value="365">365 Days (1 Full Fiscal Year – Recommended)</option>
                <option value="2555">7 Years (Strict Statutory SOX / IFRS Compliance)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Session Inactivity Timeout (Minutes)
              </label>
              <select
                value={formData.sessionTimeoutMinutes}
                onChange={e => handleChange('sessionTimeoutMinutes', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="15">15 Minutes (High Security)</option>
                <option value="30">30 Minutes (Standard)</option>
                <option value="60">60 Minutes (Normal Enterprise Default)</option>
                <option value="120">120 Minutes (Extended Operations)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={formData.enforceLotTracking}
                onChange={e => handleChange('enforceLotTracking', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Enforce Strict Batch / Lot Number Traceability
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Requires lot numbers on every inward goods receipt and dispatch note for full recall traceability.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={formData.mfaEnforced}
                onChange={e => handleChange('mfaEnforced', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Enforce Multi-Factor Authentication (MFA / FIDO2)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Requires secondary token or OTP verification for Administrator and Warehouse Manager role actions.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={formData.autoLockNegativeStock}
                onChange={e => handleChange('autoLockNegativeStock', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Prevent Negative Stock Outward Dispatches
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Automatically rejects customer delivery dispatches if the source facility balance is zero or reserved.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={formData.emailAlertsOnCriticalEvents}
                onChange={e => handleChange('emailAlertsOnCriticalEvents', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Automated Security & Audit Dispatch Notifications
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sends high-priority alerts to management whenever critical audit flags or approval requests occur.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Cancel Revisions
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save System Configurations</span>
        </button>
      </div>
    </form>
  );
};
