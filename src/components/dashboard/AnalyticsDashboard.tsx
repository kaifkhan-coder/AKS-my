import React from 'react';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  Package,
  Plus,
  Cloud,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AnalyticsDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onNavigate }) => {
  const { activeStore, bills, inventory, customers, lowStockItems, adjustStock, createKiranaSyncBackup, isSyncing } = useStore();

  const storeBills = bills.filter((b) => b.storeId === activeStore.id);
  const storeInventory = inventory.filter((i) => i.storeId === activeStore.id);
  const storeCustomers = customers.filter((c) => c.storeId === activeStore.id);

  // Financial calculations
  const totalSalesRevenue = storeBills.reduce((acc, b) => acc + b.totalAmount, 0);

  // Estimated profit = sellingPrice - purchasePrice for items sold
  const totalEstimatedProfit = storeBills.reduce((profitAcc, bill) => {
    const billProfit = bill.items.reduce((itemAcc, item) => {
      const invItem = storeInventory.find((i) => i.id === item.itemId);
      const purchasePrice = invItem ? invItem.purchasePrice : item.unitPrice * 0.75;
      const itemMargin = (item.unitPrice - purchasePrice) * item.quantity;
      return itemAcc + itemMargin;
    }, 0);
    return profitAcc + (billProfit - bill.discountAmount);
  }, 0);

  // Total credit outstanding (Udhar to collect)
  const totalOutstandingCredit = storeCustomers.reduce((acc, c) => acc + c.currentCredit, 0);

  // Payment method breakdown
  const paymentBreakdown = {
    cash: storeBills.filter((b) => b.paymentMethod === 'cash').reduce((sum, b) => sum + b.totalAmount, 0),
    upi: storeBills.filter((b) => b.paymentMethod === 'upi').reduce((sum, b) => sum + b.totalAmount, 0),
    credit: storeBills.filter((b) => b.paymentMethod === 'credit').reduce((sum, b) => sum + b.totalAmount, 0),
  };

  // Top selling items
  const itemSalesMap = new Map<string, { name: string; quantity: number; revenue: number; category: string }>();
  storeBills.forEach((b) => {
    b.items.forEach((i) => {
      const existing = itemSalesMap.get(i.itemId) || { name: i.name, quantity: 0, revenue: 0, category: i.category };
      existing.quantity += i.quantity;
      existing.revenue += i.totalPrice;
      itemSalesMap.set(i.itemId, existing);
    });
  });

  const topSellingItems = Array.from(itemSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div id="analytics-dashboard" className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {activeStore.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Store ID: {activeStore.id} • {activeStore.address}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="quick-new-bill-btn"
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>New POS Bill</span>
          </button>
          <button
            id="quick-add-item-btn"
            onClick={() => onNavigate('inventory')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Add Stock</span>
          </button>
          <button
            id="quick-sync-cloud-btn"
            onClick={createKiranaSyncBackup}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Cloud className="w-4 h-4 text-teal-600" />
            <span>{isSyncing ? 'Backing Up...' : 'KiranaSync Backup'}</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStockItems.length > 0 && (
        <div id="low-stock-alert-box" className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Low Stock Notification ({lowStockItems.length} Products Need Reordering)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Items below their safety threshold. Prevent stockouts by replenishing from your supplier.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs text-slate-800 shadow-2xs"
                    >
                      <span className="font-medium text-slate-900">{item.name}:</span>
                      <span className="font-bold text-red-600">
                        {item.stock} {item.unit} left
                      </span>
                      <button
                        onClick={() => adjustStock(item.id, 10)}
                        title="Add +10 stock immediately"
                        className="px-1.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                      >
                        +10 Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-amber-900 hover:text-amber-950 font-bold underline shrink-0 whitespace-nowrap"
            >
              Manage All Stock →
            </button>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{totalSalesRevenue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{storeBills.length} Bills Generated</span>
            </div>
          </div>
        </div>

        {/* Estimated Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Profit</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{Math.max(0, Math.round(totalEstimatedProfit)).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              ~{totalSalesRevenue > 0 ? ((totalEstimatedProfit / totalSalesRevenue) * 100).toFixed(1) : 0}% Gross Margin
            </div>
          </div>
        </div>

        {/* Total Udhar / Credit Outstanding */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Udhar (Credit)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-900 tracking-tight">
              ₹{totalOutstandingCredit.toLocaleString('en-IN')}
            </div>
            <button
              onClick={() => onNavigate('khata')}
              className="text-xs text-amber-700 hover:text-amber-800 mt-1 font-medium underline flex items-center gap-1"
            >
              <span>{storeCustomers.filter((c) => c.currentCredit > 0).length} Customers owe • View Khata →</span>
            </button>
          </div>
        </div>

        {/* Active Inventory Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Items</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {storeInventory.length} SKUs
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {lowStockItems.length > 0 ? (
                <span className="text-red-600 font-medium">{lowStockItems.length} Low Stock Alert</span>
              ) : (
                <span className="text-emerald-600 font-medium">All Stocks Healthy ✓</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Payment Methods & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Payment Modes Breakdown</h2>
            <span className="text-xs text-slate-500 font-mono">100% Real-Time</span>
          </div>

          <div className="space-y-4">
            {/* Cash */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Cash in Counter
                </span>
                <span>₹{paymentBreakdown.cash.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalSalesRevenue > 0 ? (paymentBreakdown.cash / totalSalesRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* UPI */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  UPI / QR Code
                </span>
                <span>₹{paymentBreakdown.upi.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalSalesRevenue > 0 ? (paymentBreakdown.upi / totalSalesRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Credit (Khata) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Credit (Udhar Ledger)
                </span>
                <span>₹{paymentBreakdown.credit.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalSalesRevenue > 0 ? (paymentBreakdown.credit / totalSalesRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>UPI ID: <span className="font-mono font-semibold text-slate-700">{activeStore.upiId || 'Not set'}</span></span>
            <button
              onClick={() => onNavigate('pos')}
              className="text-emerald-700 font-bold hover:underline"
            >
              Open POS Register →
            </button>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Top Moving Kirana Products</h2>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              Full Inventory →
            </button>
          </div>

          {topSellingItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No bills generated yet. Create your first bill in POS!
            </div>
          ) : (
            <div className="space-y-3">
              {topSellingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.quantity} units sold
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">₹{item.revenue}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Fast Moving</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bills Stream */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Automated Invoices & Bills</h2>
            <p className="text-xs text-slate-500">Instant printable receipts generated from counter</p>
          </div>
          <button
            onClick={() => onNavigate('pos')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Create New Bill +
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Bill No.</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Cashier</th>
                <th className="py-2.5 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {storeBills.slice(0, 5).map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{bill.billNumber}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{bill.customerName}</td>
                  <td className="py-3 px-3 text-slate-500">{bill.items.length} items</td>
                  <td className="py-3 px-3 font-bold text-slate-900">₹{bill.totalAmount}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        bill.paymentMethod === 'cash'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bill.paymentMethod === 'upi'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{bill.billedBy}</td>
                  <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
