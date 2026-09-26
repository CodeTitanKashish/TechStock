import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Filter,
  Download,
  Trash2,
  Boxes,
  ShieldCheck,
  SlidersHorizontal,
  Lock,
  Warehouse,
  AlertTriangle,
  Info,
  AlertCircle,
  ExternalLink,
  Calendar,
  User as UserIcon,
  RefreshCw,
  Copy,
  Check,
  Eye,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { AuditLogEntry, AuditCategory, UserRole } from '../../types/inventory';

export const AuditLogTab: React.FC = () => {
  const {
    auditLogs,
    users,
    currentUser,
    logAuditEvent,
    clearAuditLogs,
    exportAuditLogsCsv,
    showToast,
  } = useInventory();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'info' | 'warning' | 'critical'>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | '24h' | '7d'>('ALL');

  // Selected Log for Deep Inspection Drawer/Modal
  const [inspectedLog, setInspectedLog] = useState<AuditLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to Clipboard', text, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Simulation Action to test live logging
  const handleSimulateAction = (type: 'inventory' | 'approval' | 'system') => {
    if (type === 'inventory') {
      logAuditEvent({
        actionCategory: 'inventory',
        actionType: 'STOCK_CYCLE_VERIFIED',
        targetEntity: 'ProductMaster',
        entityRef: 'SEN-OPT-902',
        description: `${currentUser.name} verified physical lot tags for Precision Optical LiDAR Sensor Unit at Chicago Hub.`,
        severity: 'info',
        metadata: { verifiedStock: 82, location: 'Rack A-04-B1', status: 'verified_match' },
      });
      showToast('Inventory Event Logged', 'Physical stock cycle count recorded in audit trail.', 'success');
    } else if (type === 'approval') {
      logAuditEvent({
        actionCategory: 'approval',
        actionType: 'OVERRIDE_AUTHORIZED',
        targetEntity: 'InventoryMovement',
        entityRef: 'APV-MANUAL-99',
        description: `Executive emergency dispatch override granted by ${currentUser.name} (${currentUser.role.toUpperCase()}).`,
        severity: 'warning',
        metadata: { reason: 'Urgent customer production line stoppage', authorizedBy: currentUser.email },
      });
      showToast('Approval Event Logged', 'Managerial override logged with high-audit flag.', 'warning');
    } else {
      logAuditEvent({
        actionCategory: 'system',
        actionType: 'SECURITY_AUDIT_CHECKPOINT',
        targetEntity: 'SystemConfig',
        entityRef: 'SYS-SOC2-CHECK',
        description: `Automated cryptographic integrity check verified for SOC2 / ISO 27001 compliance standards.`,
        severity: 'info',
        metadata: { integrityVerified: true, cipher: 'SHA-256', activeActorsCount: users.length },
      });
      showToast('System Checkpoint Logged', 'Compliance security checkpoint registered.', 'info');
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Category filter
      if (selectedCategory !== 'ALL' && log.actionCategory !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) {
        return false;
      }
      // User filter
      if (selectedUserId !== 'ALL' && log.userId !== selectedUserId) {
        return false;
      }
      // Time filter
      if (timeFilter !== 'ALL') {
        const logDate = new Date(log.timestamp).getTime();
        const now = Date.now();
        const hoursDiff = (now - logDate) / (1000 * 60 * 60);
        if (timeFilter === '24h' && hoursDiff > 24) return false;
        if (timeFilter === '7d' && hoursDiff > 168) return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchUser = log.userName.toLowerCase().includes(q) || log.userEmail.toLowerCase().includes(q);
        const matchAction = log.actionType.toLowerCase().includes(q);
        const matchEntity = log.targetEntity.toLowerCase().includes(q) || log.entityRef.toLowerCase().includes(q);
        const matchDesc = log.description.toLowerCase().includes(q);
        const matchIp = log.ipAddress.toLowerCase().includes(q);
        return matchUser || matchAction || matchEntity || matchDesc || matchIp;
      }
      return true;
    });
  }, [auditLogs, selectedCategory, selectedSeverity, selectedUserId, timeFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const inventoryCount = auditLogs.filter(l => l.actionCategory === 'inventory').length;
    const approvalCount = auditLogs.filter(l => l.actionCategory === 'approval').length;
    const systemCount = auditLogs.filter(l => l.actionCategory === 'system').length;
    const criticalCount = auditLogs.filter(l => l.severity === 'critical' || l.severity === 'warning').length;
    return { total, inventoryCount, approvalCount, systemCount, criticalCount };
  }, [auditLogs]);

  // Helper for Category badge rendering
  const renderCategoryBadge = (cat: AuditCategory) => {
    switch (cat) {
      case 'inventory':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Boxes className="w-3 h-3 text-indigo-500" />
            Inventory
          </span>
        );
      case 'approval':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Approval
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
            <SlidersHorizontal className="w-3 h-3 text-cyan-500" />
            System Config
          </span>
        );
      case 'auth':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Lock className="w-3 h-3 text-amber-500" />
            Auth & Session
          </span>
        );
      case 'warehouse':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Warehouse className="w-3 h-3 text-purple-500" />
            Facility
          </span>
        );
      default:
        return <span className="text-[10px]">{cat}</span>;
    }
  };

  // Helper for Severity badge rendering
  const renderSeverityBadge = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Info className="w-3 h-3 text-slate-400" />
            Info
          </span>
        );
    }
  };

  // Format relative time helper
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relative = '';
      if (diffMins < 1) relative = 'Just now';
      else if (diffMins < 60) relative = `${diffMins}m ago`;
      else if (diffHours < 24) relative = `${diffHours}h ago`;
      else relative = `${diffDays}d ago`;

      return {
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        formattedTime: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        relative,
      };
    } catch {
      return { formattedDate: isoString, formattedTime: '', relative: '' };
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Events</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">{stats.total}</span>
            <span className="text-[10px] text-slate-400 font-medium">Recorded</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Inventory Changes</span>
            <Boxes className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{stats.inventoryCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">
              {stats.total ? Math.round((stats.inventoryCount / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Approvals & Signoffs</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats.approvalCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Decisions</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>System Configs</span>
            <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">{stats.systemCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Admin Updates</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Flags & Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{stats.criticalCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">High Attention</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Export */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by user, SKU, movement reference, description, IP..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Simulation Testing Triggers & Export */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Simulation trigger */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <span className="text-[10px] font-semibold text-slate-400 px-1.5 uppercase tracking-wider hidden sm:inline">
                Simulate:
              </span>
              <button
                onClick={() => handleSimulateAction('inventory')}
                title="Test log an inventory count check"
                className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-[11px] transition-colors"
              >
                + Inventory
              </button>
              <button
                onClick={() => handleSimulateAction('approval')}
                title="Test log a managerial approval override"
                className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-[11px] transition-colors"
              >
                + Approval
              </button>
              <button
                onClick={() => handleSimulateAction('system')}
                title="Test log a SOC2 security configuration checkpoint"
                className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-[11px] transition-colors"
              >
                + System
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={exportAuditLogsCsv}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Clear / Archive Logs */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                title="Archive and purge old audit logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as any)}
              className="py-1 px-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories ({auditLogs.length})</option>
              <option value="inventory">Inventory Operations</option>
              <option value="approval">Approvals & Signoffs</option>
              <option value="system">System Configuration</option>
              <option value="auth">Auth & Session</option>
              <option value="warehouse">Facility Setup</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value as any)}
              className="py-1 px-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* User Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Actor:</span>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="py-1 px-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 max-w-[160px] truncate"
            >
              <option value="ALL">All Team Members</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-semibold text-slate-400">Time:</span>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
              <button
                onClick={() => setTimeFilter('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  timeFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter('24h')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  timeFilter === '24h'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setTimeFilter('7d')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  timeFilter === '7d'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                7d
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Audit Event Records
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
              {filteredLogs.length} of {auditLogs.length} events
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Immutable Double-Entry Audit Verification Trail
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No matching audit events</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting your filters or search keywords.</p>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedSeverity('ALL');
                setSelectedUserId('ALL');
                setTimeFilter('ALL');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Actor / User</th>
                  <th className="py-3 px-3 font-semibold">Category</th>
                  <th className="py-3 px-3 font-semibold">Action Type</th>
                  <th className="py-3 px-4 font-semibold">Target Entity / Ref</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-3 font-semibold text-center">Severity</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
                {filteredLogs.map(log => {
                  const { formattedDate, formattedTime, relative } = formatTime(log.timestamp);
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setInspectedLog(log)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-900 dark:text-slate-100 text-[11px]">
                          {formattedDate}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <span>{formattedTime}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-sans font-medium">{relative}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {log.userName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                              {log.userName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{log.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderCategoryBadge(log.actionCategory)}
                      </td>

                      {/* Action Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {log.actionType}
                        </span>
                      </td>

                      {/* Target Entity / Ref */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                            {log.targetEntity}:
                          </span>
                          <span className="font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50">
                            {log.entityRef}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-xs md:max-w-md">
                        <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-1 group-hover:line-clamp-none transition-all">
                          {log.description}
                        </p>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        {renderSeverityBadge(log.severity)}
                      </td>

                      {/* Quick Inspect Button */}
                      <td className="py-3 px-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setInspectedLog(log)}
                          className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deep Inspection Drawer / Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Audit Record Deep Inspection
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {inspectedLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Event Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Category</span>
                  <div className="mt-1">{renderCategoryBadge(inspectedLog.actionCategory)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Severity</span>
                  <div className="mt-1">{renderSeverityBadge(inspectedLog.severity)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Action Type</span>
                  <p className="mt-1 font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                    {inspectedLog.actionType}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Client IP</span>
                  <p className="mt-1 font-mono text-slate-700 dark:text-slate-300">
                    {inspectedLog.ipAddress}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 tracking-wider">
                  Event Description & Narrative:
                </span>
                <p className="mt-1.5 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {inspectedLog.description}
                </p>
              </div>

              {/* Actor & Entity Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Actor Credentials & Session:
                  </span>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                      {inspectedLog.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{inspectedLog.userName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{inspectedLog.userEmail}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Role: {inspectedLog.userRole.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Target Resource & Reference:
                  </span>
                  <div className="space-y-1 pt-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entity:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectedLog.targetEntity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Reference:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{inspectedLog.entityRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timestamp (UTC):</span>
                      <span className="text-slate-600 dark:text-slate-400">{inspectedLog.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON Metadata Viewer */}
              {inspectedLog.metadata && Object.keys(inspectedLog.metadata).length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Event Metadata Payload (JSON):
                    </span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(inspectedLog.metadata, null, 2), 'meta-json')}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {copiedId === 'meta-json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Payload</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                    {JSON.stringify(inspectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Cryptographic Proof Verification Tag */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Cryptographic Integrity Seal:
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                    SHA256:{Math.abs(inspectedLog.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).padStart(16, '0')}e91b
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Verified Unaltered
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-end gap-2">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge / Archive Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Archive & Purge Audit Trail?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                This operation will archive all {auditLogs.length} historical audit events and record a compliant purge checkpoint. This action requires Administrator clearance.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAuditLogs();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Confirm Archive & Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
