import React from 'react';
import {
  LayoutDashboard,
  Package,
  Warehouse as WarehouseIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  BookCheck,
  ShieldCheck,
  BarChart3,
  Users,
  Code2,
  ChevronLeft,
  ChevronRight,
  Boxes,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    movements,
    products,
    currentUser,
    logout,
    openAuthPortal,
  } = useInventory();

  // Calculate dynamic notification badges for sidebar
  const pendingApprovalsCount = movements.filter(m => m.status === 'pending_approval').length;
  const inTransitCount = movements.filter(m => m.type === 'transfer' && m.status === 'in_transit').length;
  const lowStockCount = products.filter(p => p.totalStock <= p.reorderPoint).length;

  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Master Data',
      items: [
        { id: 'products', label: 'Products Catalog', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined, badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' },
        { id: 'warehouses', label: 'Warehouses & Bins', icon: WarehouseIcon },
      ],
    },
    {
      title: 'Operations',
      items: [
        { id: 'receipts', label: 'Goods Receipts', icon: ArrowDownToLine },
        { id: 'deliveries', label: 'Customer Deliveries', icon: ArrowUpFromLine },
        { id: 'transfers', label: 'Internal Transfers', icon: ArrowLeftRight, badge: inTransitCount > 0 ? `${inTransitCount} transit` : undefined, badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' },
        { id: 'adjustments', label: 'Stock Adjustments', icon: SlidersHorizontal },
      ],
    },
    {
      title: 'Audit & Intelligence',
      items: [
        { id: 'ledger', label: 'Stock Ledger', icon: BookCheck },
        {
          id: 'approvals',
          label: 'Approval Queue',
          icon: ShieldCheck,
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white font-bold',
        },
        { id: 'reports', label: 'Reports & Valuation', icon: BarChart3 },
      ],
    },
    {
      title: 'System',
      items: [
        { id: 'users_settings', label: 'Settings & Audit Logs', icon: Users },
        { id: 'api_docs', label: 'REST API & Models', icon: Code2 },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Boxes className="w-4 h-4 text-emerald-400 dark:text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight leading-none block">
                  StockSense
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block tracking-normal mt-0.5">
                  ERP Inventory Suite
                </span>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Boxes className="w-4 h-4 text-emerald-400 dark:text-white" />
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:block transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="py-3 overflow-y-auto max-h-[calc(100vh-8.5rem)] px-2 space-y-4">
          {navSections.map(section => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative group ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                                isActive ? 'bg-white/20 text-white' : item.badgeColor
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && item.badge && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer User Info & Auth Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!sidebarCollapsed ? (
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[11px]">
              <div className="truncate">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</p>
                <span className="text-[10px] text-slate-400 capitalize block">{currentUser.role.replace('_', ' ')}</span>
              </div>
              <button
                onClick={logout}
                className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign Out of StockSense"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={() => openAuthPortal('signin')}
                className="py-1 px-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <LogIn className="w-3 h-3 text-indigo-500" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthPortal('signup')}
                className="py-1 px-2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                <UserPlus className="w-3 h-3" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => openAuthPortal('signin')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Sign In / Switch"
            >
              <LogIn className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
