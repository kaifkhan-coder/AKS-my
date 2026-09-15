import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  PackageCheck,
  Truck,
  ShieldAlert,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  AlertTriangle,
  X,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomerOrder } from '../../types';

export const CustomerOrdersManager: React.FC = () => {
  const { activeStore, orders, updateOrderStatus, flagOrderAsFakeAndBlock } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fakeOrderModalItem, setFakeOrderModalItem] = useState<CustomerOrder | null>(null);
  const [fakeReason, setFakeReason] = useState('Delivery boy reached address but house number fake; customer rejected calls.');

  const storeOrders = orders.filter((o) => o.storeId === activeStore.id);

  const filteredOrders = storeOrders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const handleConfirmFakeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeOrderModalItem || !fakeReason.trim()) return;
    flagOrderAsFakeAndBlock(fakeOrderModalItem.id, fakeReason.trim());
    setFakeOrderModalItem(null);
  };

  return (
    <div id="orders-manager-page" className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Customer Grocery Orders & Moderation
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Live Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track incoming grocery orders, dispatch deliveries, and block fraudulent customers placing fake orders
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'pending', 'packed', 'delivered', 'cancelled_fake'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'cancelled_fake' ? 'Fake Blocked' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No orders found under "{statusFilter}" category.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isFake = order.status === 'cancelled_fake';
            const isPending = order.status === 'pending';
            const isPacked = order.status === 'packed';
            const isDelivered = order.status === 'delivered';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  isFake ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isFake
                        ? 'bg-red-100 text-red-700'
                        : isPending
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : isPacked
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isFake ? 'Fake Order (Customer Blocked)' : order.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.placedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Payment: <strong className="uppercase text-slate-700">{order.paymentPreference.replace(/_/g, ' ')}</strong>
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 ml-2">
                      Total: ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Customer Details & Items */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-3 text-xs">
                  <div className="md:col-span-5 space-y-1">
                    <p className="font-bold text-slate-800">{order.customerName}</p>
                    <p className="text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </p>
                    {order.deliveryAddress && (
                      <p className="text-slate-600 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </p>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="md:col-span-7 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">
                      Ordered Kirana Goods ({order.items.length} items):
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700">
                          <span>• {item.name} ({item.quantity} {item.unit})</span>
                          <span className="font-mono font-semibold">₹{item.quantity * item.unitPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cancellation & Fake details if any */}
                {isFake && order.cancelReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 my-2 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Store Moderation Action:</strong> {order.cancelReason}
                    </div>
                  </div>
                )}

                {/* Owner Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Customer</span>
                    </a>
                    <a
                      href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Status update buttons */}
                  {!isFake && (
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'packed')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Mark Packed</span>
                        </button>
                      )}

                      {isPacked && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      {/* Fake Order & Block Action */}
                      <button
                        onClick={() => {
                          setFakeOrderModalItem(order);
                          setFakeReason('Customer unreachable, fake address provided. Blocked by owner.');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>Flag as Fake & Block Customer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Flag Fake Order & Block Customer Dialog */}
      {fakeOrderModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-red-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm">Flag Fake Order & Block Customer</h3>
              </div>
              <button onClick={() => setFakeOrderModalItem(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmFakeBlock} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                You are marking order <strong>#{fakeOrderModalItem.orderNumber}</strong> as fake.
                This will immediately cancel the order and <strong>block customer {fakeOrderModalItem.customerName}</strong> from placing further orders or taking store credit.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Fake Flag <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={fakeReason}
                  onChange={(e) => setFakeReason(e.target.value)}
                  placeholder="Explain why this order is fake (e.g., Wrong phone number, unreachable delivery location)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFakeOrderModalItem(null)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Block Customer & Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
