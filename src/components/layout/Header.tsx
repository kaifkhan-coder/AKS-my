import React, { useState } from 'react';
import {
  Store,
  ChevronDown,
  Cloud,
  Bell,
  User,
  Plus,
  LogOut,
  Sparkles,
  Shield,
  Layers,
  ShoppingBag,
  Receipt,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onOpenNewStoreModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuthModal,
  onOpenNewStoreModal,
}) => {
  const {
    activeStore,
    stores,
    setActiveStoreId,
    currentUser,
    logout,
    lowStockItems,
    orders,
    lastSyncTime,
    isSyncing,
    createKiranaSyncBackup,
    loginAsDemoUser,
  } = useStore();

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const isOwnerOrStaff = currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'staff';
  const pendingOrdersCount = orders.filter((o) => o.storeId === activeStore.id && o.status === 'pending').length;
  const lowStockCount = lowStockItems.length;

  const handleQuickSync = async () => {
    await createKiranaSyncBackup();
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 2500);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner with Store Switcher, KiranaSync Google Cloud Status, and User Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab(isOwnerOrStaff ? 'dashboard' : 'customer-store')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">KiranaSync</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 hidden sm:block">
                  Smart Inventory, Khata & Billing
                </p>
              </div>
            </div>

            {/* Store Profile Switcher (Only visible to owner/staff or multi-store browsing) */}
            {isOwnerOrStaff && (
              <div className="relative ml-2">
                <button
                  id="store-profile-dropdown-btn"
                  onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[130px] sm:max-w-[200px] truncate">{activeStore.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isStoreMenuOpen && (
                  <div
                    id="store-switcher-menu"
                    className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                  >
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Store Profile
                    </div>
                    {stores.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveStoreId(s.id);
                          setIsStoreMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                          s.id === activeStore.id ? 'bg-emerald-50/70 font-semibold text-emerald-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-800">{s.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[190px]">{s.address}</div>
                        </div>
                        {s.id === activeStore.id && (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          setIsStoreMenuOpen(false);
                          onOpenNewStoreModal();
                        }}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-md font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Store Profile</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center/Right utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Cloud KiranaSync Indicator */}
            <div className="relative">
              <button
                id="header-cloud-sync-btn"
                onClick={handleQuickSync}
                disabled={isSyncing}
                title="Sync and Backup to Google Cloud 'KiranaSync' Folder"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium transition-colors"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="hidden md:inline font-mono text-[11px]">
                  {showSyncSuccess ? 'Synced to KiranaSync ✓' : 'Cloud KiranaSync'}
                </span>
              </button>
            </div>

            {/* Notification Bell (Low Stock & New Orders for owners) */}
            {isOwnerOrStaff && (
              <button
                id="header-alerts-btn"
                onClick={() => setCurrentTab(lowStockCount > 0 ? 'inventory' : 'orders')}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title={`${lowStockCount} Low stock alerts, ${pendingOrdersCount} pending orders`}
              >
                <Bell className="w-4 h-4" />
                {(lowStockCount > 0 || pendingOrdersCount > 0) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            )}

            {/* Role & User Profile Switcher */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentUser.role === 'owner'
                    ? 'bg-emerald-600 text-white'
                    : currentUser.role === 'admin'
                    ? 'bg-blue-600 text-white'
                    : currentUser.role === 'staff'
                    ? 'bg-teal-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 leading-tight">
                    {currentUser.role === 'owner' ? 'Shop Owner' : currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email || 'No Gmail configured'}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      currentUser.role === 'owner'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentUser.role === 'customer'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      Role: {currentUser.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                      Quick Test Role Switch
                    </div>
                    <button
                      onClick={() => {
                        loginAsDemoUser('owner');
                        setCurrentTab('dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Switch to Shop Owner</span>
                    </button>
                    <button
                      onClick={() => {
                        loginAsDemoUser('staff');
                        setCurrentTab('pos');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Switch to Staff (Cashier)</span>
                    </button>
                    <button
                      onClick={() => {
                        loginAsDemoUser('customer');
                        setCurrentTab('customer-store');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>Switch to Customer Portal</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Secure Gmail OTP Login...</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <div className="bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5">
            {isOwnerOrStaff ? (
              <>
                <button
                  id="tab-dashboard"
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'dashboard'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Sales Dashboard</span>
                </button>

                <button
                  id="tab-pos"
                  onClick={() => setCurrentTab('pos')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'pos'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>POS & Billing</span>
                </button>

                <button
                  id="tab-inventory"
                  onClick={() => setCurrentTab('inventory')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'inventory'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Inventory & Categories</span>
                  {lowStockCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                      {lowStockCount}
                    </span>
                  )}
                </button>

                <button
                  id="tab-khata"
                  onClick={() => setCurrentTab('khata')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'khata'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Customer Credit (Udhar)</span>
                </button>

                <button
                  id="tab-orders"
                  onClick={() => setCurrentTab('orders')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'orders'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Customer Orders & Moderation</span>
                  {pendingOrdersCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-bold">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>

                {currentUser.role === 'owner' && (
                  <button
                    id="tab-staff"
                    onClick={() => setCurrentTab('staff')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      currentTab === 'staff'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Staff & Roles</span>
                  </button>
                )}

                <button
                  id="tab-cloudsync"
                  onClick={() => setCurrentTab('cloudsync')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'cloudsync'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>'KiranaSync' Google Cloud</span>
                </button>
              </>
            ) : (
              /* Regular Customer Navigation */
              <>
                <button
                  id="tab-customer-store"
                  onClick={() => setCurrentTab('customer-store')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'customer-store'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order Groceries</span>
                </button>

                <button
                  id="tab-customer-bills"
                  onClick={() => setCurrentTab('customer-bills')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'customer-bills'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>My Bills & Receipts</span>
                </button>

                <button
                  id="tab-customer-khata"
                  onClick={() => setCurrentTab('customer-khata')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'customer-khata'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>My Udhar / Credit Balance</span>
                </button>

                <button
                  id="tab-customer-orders"
                  onClick={() => setCurrentTab('customer-orders')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'customer-orders'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Track My Orders</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
