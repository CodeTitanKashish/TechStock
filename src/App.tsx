import React from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BarcodeModal } from './components/common/BarcodeModal';
import { PrintSlipModal } from './components/common/PrintSlipModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AuthPortal } from './components/auth/AuthPortal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { WarehousesView } from './components/warehouses/WarehousesView';
import { ReceiptsView } from './components/operations/ReceiptsView';
import { DeliveriesView } from './components/operations/DeliveriesView';
import { TransfersView } from './components/operations/TransfersView';
import { AdjustmentsView } from './components/operations/AdjustmentsView';
import { StockLedgerView } from './components/ledger/StockLedgerView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersAndSettingsView } from './components/settings/UsersAndSettingsView';
import { ApiDocsView } from './components/settings/ApiDocsView';
import { FrameworkDeckView } from './components/presentation/FrameworkDeckView';

import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentTab,
    toast,
    dismissToast,
    isAuthenticated,
    authModalOpen,
    closeAuthModal,
  } = useInventory();

  // If user signed out, display the full-page Enterprise Sign In & Sign Up Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <AuthPortal />
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
            <div className="p-3.5 rounded-xl shadow-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-start gap-3 max-w-sm text-xs">
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{toast.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={dismissToast}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'warehouses':
        return <WarehousesView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'transfers':
        return <TransfersView />;
      case 'adjustments':
        return <AdjustmentsView />;
      case 'ledger':
        return <StockLedgerView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'reports':
        return <ReportsView />;
      case 'users_settings':
        return <UsersAndSettingsView />;
      case 'api_docs':
        return <ApiDocsView />;
      case 'framework_deck':
        return <FrameworkDeckView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Collapsible ERP Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top ERP Header */}
        <Header />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <BarcodeModal />
      <PrintSlipModal />
      <GlobalSearchModal />
      {authModalOpen && <AuthPortal isModal={true} onClose={closeAuthModal} />}

      {/* Floating System Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-3.5 rounded-xl shadow-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-start gap-3 max-w-sm text-xs">
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{toast.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={dismissToast}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}
