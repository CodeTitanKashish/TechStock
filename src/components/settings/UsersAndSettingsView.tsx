import React, { useState } from 'react';
import {
  Users,
  Shield,
  Check,
  X,
  Plus,
  Mail,
  Building,
  KeyRound,
  CheckCircle2,
  Lock,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole, User } from '../../types/inventory';
import { AuditLogTab } from './AuditLogTab';
import { SystemConfigTab } from './SystemConfigTab';

type SettingsTab = 'users' | 'rbac_matrix' | 'audit_logs' | 'system_config';

export const UsersAndSettingsView: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    warehouses,
    auditLogs,
    openAuthPortal,
    showToast,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<SettingsTab>('users');

  const rbacMatrix = [
    {
      permission: 'View Products Catalog & Stock Levels',
      admin: true,
      manager: true,
      clerk: true,
      auditor: true,
    },
    {
      permission: 'Create / Edit / Delete Products & SKUs',
      admin: true,
      manager: true,
      clerk: false,
      auditor: false,
    },
    {
      permission: 'Create Inward Goods Receipt (PO Intake)',
      admin: true,
      manager: true,
      clerk: true,
      auditor: false,
    },
    {
      permission: 'Authorize High-Value Receipts (> $10k)',
      admin: true,
      manager: true,
      clerk: false,
      auditor: false,
    },
    {
      permission: 'Dispatch Customer Deliveries (SO Outward)',
      admin: true,
      manager: true,
      clerk: true,
      auditor: false,
    },
    {
      permission: 'Initiate Internal Inter-Hub Transfers',
      admin: true,
      manager: true,
      clerk: false,
      auditor: false,
    },
    {
      permission: 'Authorize Inter-Hub Transfers (> $5k)',
      admin: true,
      manager: false,
      clerk: false,
      auditor: false,
    },
    {
      permission: 'Log Physical Stock Counts & Discrepancies',
      admin: true,
      manager: true,
      clerk: true,
      auditor: false,
    },
    {
      permission: 'Authorize High-Variance Adjustments (> $2k)',
      admin: true,
      manager: true,
      clerk: false,
      auditor: false,
    },
    {
      permission: 'Inspect Immutable Stock Ledger',
      admin: true,
      manager: true,
      clerk: true,
      auditor: true,
    },
    {
      permission: 'Export Financial Ledger & Valuation Reports',
      admin: true,
      manager: true,
      clerk: false,
      auditor: true,
    },
    {
      permission: 'Configure Warehouses & Storage Bins',
      admin: true,
      manager: true,
      clerk: false,
      auditor: false,
    },
    {
      permission: 'User Administration & Role Assignment',
      admin: true,
      manager: false,
      clerk: false,
      auditor: false,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Enterprise Governance, Audit & Team Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable audit logs, granular RBAC access control, team member provisioning & system configurations
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <button
              onClick={() => openAuthPortal('signup')}
              className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New User</span>
            </button>
          )}

          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Team Members ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('rbac_matrix')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'rbac_matrix'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              RBAC Matrix
            </button>
            <button
              onClick={() => setActiveTab('audit_logs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'audit_logs'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Audit Logs</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                {auditLogs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('system_config')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'system_config'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>System Config</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map(u => {
            const isCurrent = currentUser.id === u.id;
            return (
              <div
                key={u.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{u.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      u.role === 'admin'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200'
                        : u.role === 'warehouse_manager'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200'
                        : u.role === 'inventory_clerk'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                    }`}
                  >
                    {u.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{u.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Warehouses:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                      {u.assignedWarehouses.includes('*') ? 'All Facilities (Global Scope)' : u.assignedWarehouses.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Security Verification:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Email & MFA Verified</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  {isCurrent ? (
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active Session</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setCurrentUser(u)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors"
                    >
                      Impersonate User
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'rbac_matrix' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Role-Based Access Control (RBAC) Entitlements
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Deterministic authorization bounds enforced by StockSense middleware
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">System Operation / Resource</th>
                  <th className="py-3 px-4 text-center">Administrator</th>
                  <th className="py-3 px-4 text-center">Warehouse Manager</th>
                  <th className="py-3 px-4 text-center">Inventory Clerk</th>
                  <th className="py-3 px-4 text-center">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rbacMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {row.permission}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {row.admin ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {row.manager ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {row.clerk ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {row.auditor ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit_logs' && <AuditLogTab />}

      {activeTab === 'system_config' && <SystemConfigTab />}
    </div>
  );
};
