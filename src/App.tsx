import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { NewStoreModal } from './components/store/NewStoreModal';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { InventoryManager } from './components/inventory/InventoryManager';
import { BillingPos } from './components/billing/BillingPos';
import { CreditKhata } from './components/credit/CreditKhata';
import { CustomerOrdersManager } from './components/orders/CustomerOrdersManager';
import { StaffManager } from './components/staff/StaffManager';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { KiranaSyncCloudView } from './components/cloud/KiranaSyncCloudView';
import { Store, User, Users, Shield, Cloud } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, loginAsDemoUser } = useStore();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState(false);

  const isCustomer = currentUser.role === 'customer';

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col">
      {/* Primary Sticky Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNewStoreModal={() => setIsNewStoreModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isCustomer ? (
          /* Regular Customer Portal */
          <CustomerPortal />
        ) : (
          /* Shop Owner & Staff Views */
          <>
            {currentTab === 'dashboard' && (
              <AnalyticsDashboard onNavigate={(tab) => setCurrentTab(tab)} />
            )}

            {currentTab === 'pos' && <BillingPos />}

            {currentTab === 'inventory' && <InventoryManager />}

            {currentTab === 'khata' && <CreditKhata />}

            {currentTab === 'orders' && <CustomerOrdersManager />}

            {currentTab === 'staff' && <StaffManager />}

            {currentTab === 'cloudsync' && <KiranaSyncCloudView />}
          </>
        )}
      </main>

      {/* Quick Role & Mode Switcher Floating Pill for seamless demo exploration */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-full shadow-2xl border border-slate-700/60 flex items-center gap-1 sm:gap-2 text-[11px]">
        <span className="text-slate-400 font-semibold hidden md:inline px-2">
          Demo Persona:
        </span>

        <button
          onClick={() => {
            loginAsDemoUser('owner');
            setCurrentTab('dashboard');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
            currentUser.role === 'owner'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-emerald-400" />
          <span>Shop Owner</span>
        </button>

        <button
          onClick={() => {
            loginAsDemoUser('staff');
            setCurrentTab('pos');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
            currentUser.role === 'staff'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5 text-teal-400" />
          <span>Staff Cashier</span>
        </button>

        <button
          onClick={() => {
            loginAsDemoUser('customer');
            setCurrentTab('customer-store');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
            currentUser.role === 'customer'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>Customer</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-1 hidden sm:block" />

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 font-medium"
          title="Login with Gmail & OTP"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Gmail OTP</span>
        </button>
      </div>

      {/* Gmail & Mobile OTP Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Add New Store Profile Modal */}
      <NewStoreModal
        isOpen={isNewStoreModalOpen}
        onClose={() => setIsNewStoreModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
