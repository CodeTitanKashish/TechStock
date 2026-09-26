import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Warehouse as WarehouseIcon,
  ChevronDown,
  Shield,
  Barcode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  User as UserIcon,
  Check,
  Plus,
  LogOut,
  LogIn,
  UserPlus,
  Volume2,
  VolumeX,
  Laptop,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole } from '../../types/inventory';
import { sound } from '../../utils/audio';

export const Header: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    warehouses,
    activeWarehouseId,
    setActiveWarehouseId,
    theme,
    toggleTheme,
    setTheme,
    currentUser,
    switchRole,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openBarcodeScanner,
    openGlobalSearch,
    openAuthPortal,
    logout,
    resetDemoData,
  } = useInventory();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getBreadcrumbs = () => {
    switch (currentTab) {
      case 'dashboard':
        return ['StockSense', 'Executive Overview'];
      case 'products':
        return ['StockSense', 'Master Data', 'Products Catalog'];
      case 'warehouses':
        return ['StockSense', 'Master Data', 'Warehouses & Bins'];
      case 'receipts':
        return ['StockSense', 'Operations', 'Goods Receipts'];
      case 'deliveries':
        return ['StockSense', 'Operations', 'Customer Deliveries'];
      case 'transfers':
        return ['StockSense', 'Operations', 'Internal Transfers'];
      case 'adjustments':
        return ['StockSense', 'Operations', 'Stock Adjustments'];
      case 'ledger':
        return ['StockSense', 'Accounting', 'Stock Ledger'];
      case 'approvals':
        return ['StockSense', 'Governance', 'Approval Queue'];
      case 'reports':
        return ['StockSense', 'Intelligence', 'Reports & Valuation'];
      case 'users_settings':
        return ['StockSense', 'System', 'Users & RBAC'];
      case 'api_docs':
        return ['StockSense', 'System', 'REST API & Schemas'];
      default:
        return ['StockSense', 'Console'];
    }
  };

  const breadcrumbs = getBreadcrumbs();
  const activeWarehouse = warehouses.find(w => w.id === activeWarehouseId);

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    admin: { label: 'Administrator', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
    warehouse_manager: { label: 'Warehouse Manager', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    inventory_clerk: { label: 'Inventory Clerk', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    auditor: { label: 'Internal Auditor', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Zone 1: Breadcrumb Trail & Warehouse Scope */}
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-900 dark:text-slate-100' : ''}>
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && <span className="text-slate-300 dark:text-slate-600">/</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Warehouse Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setWarehouseDropdownOpen(!warehouseDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            title="Filter data by warehouse facility"
          >
            <WarehouseIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px] md:max-w-[180px]">
              {activeWarehouseId === 'ALL' ? 'All Warehouses' : activeWarehouse?.code || 'Facility'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {warehouseDropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                Facility Filter
              </div>
              <button
                onClick={() => {
                  setActiveWarehouseId('ALL');
                  setWarehouseDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                  activeWarehouseId === 'ALL' ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>All Warehouses (Global Consolidated)</span>
                {activeWarehouseId === 'ALL' && <Check className="w-3.5 h-3.5" />}
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              {warehouses.map(wh => (
                <button
                  key={wh.id}
                  onClick={() => {
                    setActiveWarehouseId(wh.id);
                    setWarehouseDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                    activeWarehouseId === wh.id ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono font-medium mr-1.5">{wh.code}</span>
                    <span className="text-slate-500 dark:text-slate-400">{wh.city}</span>
                  </div>
                  {activeWarehouseId === wh.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Search Affordance & Barcode Scanner */}
      <div className="flex items-center gap-2">
        <button
          onClick={openGlobalSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors w-48 lg:w-64"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Search SKU, Batch, PO...</span>
          <kbd className="ml-auto font-mono text-[10px] bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1 text-slate-500 dark:text-slate-300">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={openBarcodeScanner}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Barcode Scanner / Label Generator"
        >
          <Barcode className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="hidden xl:inline">Barcode Tool</span>
        </button>

        {/* Quick Action + Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Operation</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {quickCreateOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  setCurrentTab('receipts');
                  setQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Receive Goods (PO / Inward)</span>
              </button>
              <button
                onClick={() => {
                  setCurrentTab('deliveries');
                  setQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Dispatch Delivery (SO / Outward)</span>
              </button>
              <button
                onClick={() => {
                  setCurrentTab('transfers');
                  setQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Internal Warehouse Transfer</span>
              </button>
              <button
                onClick={() => {
                  setCurrentTab('adjustments');
                  setQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Stock Audit & Adjustment</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Notifications, Sound FX, Theme Switcher, Role Badge & User Profile */}
      <div className="flex items-center gap-2">
        {/* Tactile Sound FX Toggle */}
        <button
          type="button"
          onClick={() => {
            const next = sound.toggle();
            setSoundEnabled(next);
          }}
          aria-label={soundEnabled ? 'Disable tactile sound FX' : 'Enable tactile sound FX'}
          title={soundEnabled ? 'Tactile Sound FX Active (Click to mute)' : 'Sound Muted (Click to enable)'}
          className={`p-2 rounded-xl border transition-all ${
            soundEnabled
              ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Enhanced Theme Switcher & Preset Selector */}
        <div className="relative">
          <button
            id="theme-toggle"
            type="button"
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            aria-label="Theme mode selector"
            title={theme === 'dark' ? 'Dark Mode Active (Click for theme options)' : 'Light Mode Active (Click for theme options)'}
            className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all shadow-2xs group focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
              theme === 'dark'
                ? 'border-indigo-800/80 bg-slate-800/90 text-slate-100 hover:bg-slate-700/80'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-200 group-hover:-rotate-12" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 group-hover:rotate-45" />
              )}
            </div>
            <span className="hidden lg:inline text-xs font-semibold select-none">
              {theme === 'dark' ? 'Midnight Dark' : 'Daylight'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Theme Dropdown Popover */}
          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100 p-1.5 space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Display Theme
              </div>

              {/* Dark Preset */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTheme('dark');
                  setThemeDropdownOpen(false);
                }}
                className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                  theme === 'dark'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-slate-900 text-indigo-400 border border-slate-700">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-medium">Midnight Obsidian</span>
                    <span className="text-[10px] text-slate-400 block">High-contrast dark canvas</span>
                  </div>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </button>

              {/* Light Preset */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTheme('light');
                  setThemeDropdownOpen(false);
                }}
                className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                  theme === 'light'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-medium">Daylight Studio</span>
                    <span className="text-[10px] text-slate-400 block">Crisp industrial light mode</span>
                  </div>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </button>

              {/* System Preset */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  setTheme(prefersDark ? 'dark' : 'light');
                  setThemeDropdownOpen(false);
                }}
                className="w-full p-2 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Laptop className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-medium">System Synchronized</span>
                    <span className="text-[10px] text-slate-400 block">Match OS preference</span>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) setCurrentTab(n.linkTab);
                        setNotificationsOpen(false);
                      }}
                      className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-2.5 ${
                        !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                        {n.type === 'approval_required' && <Shield className="w-4 h-4 text-amber-500" />}
                        {n.type === 'info' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                        {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">{n.title}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Sign In / Sign Up triggers */}
        <button
          onClick={() => openAuthPortal('signin')}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          title="Sign in to your corporate account"
        >
          <LogIn className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Sign In</span>
        </button>

        <button
          onClick={() => openAuthPortal('signup')}
          className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-medium text-indigo-700 dark:text-indigo-300 transition-colors"
          title="Register new account"
        >
          <UserPlus className="w-3.5 h-3.5 shrink-0" />
          <span>Sign Up</span>
        </button>

        {/* User Role Switcher Pill & Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 dark:bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs overflow-hidden">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs leading-none">
              <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{currentUser.name}</p>
              <span className="text-[10px] text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{currentUser.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  {currentUser.department}
                </div>
              </div>

              {/* RBAC Role Switcher */}
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                  Simulate RBAC User Role
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {(['admin', 'warehouse_manager', 'inventory_clerk', 'auditor'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setProfileOpen(false);
                      }}
                      className={`px-2 py-1.5 rounded text-left text-[11px] transition-colors flex items-center justify-between ${
                        currentUser.role === role
                          ? 'bg-slate-900 text-white dark:bg-indigo-600 font-medium'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="capitalize">{role.replace('_', ' ')}</span>
                      {currentUser.role === role && <Check className="w-3 h-3 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="py-1">
                <button
                  onClick={() => {
                    openAuthPortal('signin');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Sign In as Another User</span>
                </button>
                <button
                  onClick={() => {
                    openAuthPortal('signup');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sign Up New Enterprise Account</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => {
                    setCurrentTab('users_settings');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Access Control Matrix & Users</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('api_docs');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>REST API & Database Schemas</span>
                </button>
                <button
                  onClick={() => {
                    resetDemoData();
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Demo Database</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
