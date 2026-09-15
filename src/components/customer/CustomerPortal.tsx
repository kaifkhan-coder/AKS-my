import React, { useState } from 'react';
import {
  ShoppingBag,
  CreditCard,
  QrCode,
  MapPin,
  Clock,
  Phone,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Package,
  Receipt,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BillItem } from '../../types';

export const CustomerPortal: React.FC = () => {
  const { activeStore, currentUser, inventory, categories, customers, orders, placeCustomerOrder } = useStore();

  const [activeTab, setActiveTab] = useState<'shop' | 'khata' | 'my_orders'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart
  const [cart, setCart] = useState<{ item: typeof inventory[0]; qty: number }[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Sunshine Apts, Near Kirana Store');
  const [paymentChoice, setPaymentChoice] = useState<'cod' | 'upi_on_delivery' | 'credit_khata'>('upi_on_delivery');
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState<string | null>(null);

  // Find linked customer profile for current user
  const currentCustomer = customers.find(
    (c) =>
      c.storeId === activeStore.id &&
      (c.phone === currentUser?.phone || c.email === currentUser?.email || c.name.toLowerCase() === currentUser?.name.toLowerCase())
  ) || {
    id: 'cust-demo',
    storeId: activeStore.id,
    name: currentUser?.name || 'Valued Customer',
    phone: currentUser?.phone || '+91 98765 43210',
    email: currentUser?.email || 'customer@gmail.com',
    currentCredit: 1450,
    creditLimit: 5000,
    isBlocked: false,
    address: 'Near Main Road',
  };

  const storeInventory = inventory.filter((item) => item.storeId === activeStore.id);
  const myOrders = orders.filter(
    (o) =>
      o.storeId === activeStore.id &&
      (o.customerId === currentCustomer.id || o.customerPhone === currentCustomer.phone)
  );

  const filteredItems = storeInventory.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: typeof storeInventory[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === product.id);
      if (existing) {
        return prev.map((c) => (c.item.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item: product, qty: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id !== productId) return c;
          const newQty = c.qty + delta;
          if (newQty <= 0) return null;
          return { ...c, qty: newQty };
        })
        .filter(Boolean) as { item: typeof inventory[0]; qty: number }[]
    );
  };

  const cartSubtotal = cart.reduce((sum, c) => sum + c.item.sellingPrice * c.qty, 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentChoice === 'credit_khata' && currentCustomer.isBlocked) {
      alert('Your account is blocked from ordering on Khata credit.');
      return;
    }

    const orderItems: BillItem[] = cart.map((c) => ({
      itemId: c.item.id,
      name: c.item.name,
      category: c.item.category,
      quantity: c.qty,
      unit: c.item.unit,
      unitPrice: c.item.sellingPrice,
      totalPrice: c.item.sellingPrice * c.qty,
    }));

    const order = placeCustomerOrder({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      deliveryAddress,
      items: orderItems,
      totalAmount: cartSubtotal,
      paymentPreference: paymentChoice,
    });

    setCart([]);
    setOrderPlacedSuccess(`Order #${order.orderNumber} successfully placed with ${activeStore.name}!`);
    setTimeout(() => {
      setOrderPlacedSuccess(null);
      setActiveTab('my_orders');
    }, 2500);
  };

  return (
    <div id="customer-portal-view" className="space-y-6 pb-12">
      {/* Store Top Greeting Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Customer Portal
              </span>
              <span className="text-xs text-slate-300">Welcome, {currentCustomer.name}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1">{activeStore.name}</h1>
            <p className="text-xs text-emerald-100/80 mt-0.5">{activeStore.tagline} • {activeStore.address}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-right">
              <div className="text-[11px] text-slate-300">My Outstanding Udhar:</div>
              <div className="text-lg font-black font-mono text-emerald-300">
                ₹{currentCustomer.currentCredit}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Portal Nav Pills */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shop'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Order Groceries
          </button>
          <button
            onClick={() => setActiveTab('khata')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'khata'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            My Khata Ledger & Udhar
          </button>
          <button
            onClick={() => setActiveTab('my_orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my_orders'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            My Past Orders ({myOrders.length})
          </button>
        </div>
      </div>

      {/* Blocked warning banner if customer is marked fake by owner */}
      {currentCustomer.isBlocked && (
        <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900">
            <strong className="text-sm">Account Flagged / Blocked:</strong>
            <p className="mt-0.5">{currentCustomer.blockReason || 'Order flagged as fake by store management.'}</p>
            <p className="mt-1 text-red-700">Please visit the shop counter in person or call {activeStore.phone} to clear this status.</p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {orderPlacedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{orderPlacedSuccess}</span>
        </div>
      )}

      {/* VIEW: Shop Groceries */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Products List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search and Category Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search daily essentials (Atta, Sugar, Oil, Daal)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Items
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      selectedCategory === c.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredItems.map((product) => {
                const inCart = cart.find((c) => c.item.id === product.id);
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span className="uppercase font-semibold">{product.unit}</span>
                        <span className={isOutOfStock ? 'text-red-500 font-bold' : 'text-emerald-700 font-medium'}>
                          {isOutOfStock ? 'Out of stock' : 'In stock'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{product.name}</h3>
                      {product.customFieldValues && Object.keys(product.customFieldValues).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(product.customFieldValues).slice(0, 2).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                              {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-base font-black font-mono text-slate-900">
                          ₹{product.sellingPrice}
                        </div>
                        {product.mrp && product.mrp > product.sellingPrice && (
                          <div className="text-[10px] text-slate-400 line-through">MRP ₹{product.mrp}</div>
                        )}
                      </div>

                      {inCart ? (
                        <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50">
                          <button
                            onClick={() => updateCartQty(product.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-200 rounded-l-xl font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-slate-900">
                            {inCart.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(product.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-200 rounded-r-xl font-bold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock || currentCustomer.isBlocked}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs"
                        >
                          + Add to Basket
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Basket (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">Your Grocery Basket</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">{cart.length} items</span>
              </div>

              {/* Cart List */}
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                {cart.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    Your basket is empty. Select items to order.
                  </div>
                ) : (
                  cart.map((c) => (
                    <div key={c.item.id} className="py-2 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800">{c.item.name}</div>
                        <div className="text-[10px] text-slate-400">₹{c.item.sellingPrice} × {c.qty}</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{c.item.sellingPrice * c.qty}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <form onSubmit={handlePlaceOrder} className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Delivery Address:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter flat / house number and street..."
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Mode:
                    </label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="cust_paymode"
                          checked={paymentChoice === 'upi_on_delivery'}
                          onChange={() => setPaymentChoice('upi_on_delivery')}
                          className="text-emerald-600"
                        />
                        <span>UPI / QR Scan upon Delivery</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="cust_paymode"
                          checked={paymentChoice === 'cod'}
                          onChange={() => setPaymentChoice('cod')}
                          className="text-emerald-600"
                        />
                        <span>Cash on Delivery (COD)</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 ${currentCustomer.isBlocked ? 'opacity-40 pointer-events-none' : ''}`}>
                        <input
                          type="radio"
                          name="cust_paymode"
                          disabled={currentCustomer.isBlocked}
                          checked={paymentChoice === 'credit_khata'}
                          onChange={() => setPaymentChoice('credit_khata')}
                          className="text-emerald-600"
                        />
                        <span>Pay later via Khata / Udhar</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-sm font-bold">
                    <span>Order Total:</span>
                    <span className="font-mono text-emerald-800 font-black">₹{cartSubtotal}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={currentCustomer.isBlocked}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-xs"
                  >
                    Place Grocery Order (₹{cartSubtotal})
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Customer Khata Ledger */}
      {activeTab === 'khata' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Kirana Credit Ledger (Khata)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified accounting of items purchased on credit and payments settled with {activeStore.name}
              </p>
            </div>

            <div className="text-right bg-amber-50 p-3 rounded-2xl border border-amber-200">
              <div className="text-xs text-amber-900">Pending Amount to Pay:</div>
              <div className="text-xl font-black font-mono text-amber-900">
                ₹{currentCustomer.currentCredit}
              </div>
            </div>
          </div>

          {/* Quick Pay UPI QR */}
          {activeStore.upiId && currentCustomer.currentCredit > 0 && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 shrink-0 flex items-center justify-center shadow-xs">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Scan QR to Clear Udhar via Google Pay / PhonePe / Paytm</h4>
                <p>Store UPI ID: <strong className="font-mono text-emerald-800">{activeStore.upiId}</strong></p>
                <p className="text-slate-500">
                  After paying online, inform the shop owner or staff. The amount will be instantly reconciled in your digital ledger.
                </p>
              </div>
            </div>
          )}

          {/* Credit Limit Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">Total Credit Limit Allowed:</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">₹{currentCustomer.creditLimit}</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-amber-800">Current Outstanding Balance:</div>
              <div className="text-lg font-bold font-mono text-amber-900 mt-1">₹{currentCustomer.currentCredit}</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-emerald-800">Remaining Available Credit:</div>
              <div className="text-lg font-bold font-mono text-emerald-900 mt-1">
                ₹{Math.max(0, currentCustomer.creditLimit - currentCustomer.currentCredit)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: My Past Orders */}
      {activeTab === 'my_orders' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">My Grocery Orders</h2>
          {myOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No orders placed yet. Switch to "Order Groceries" tab to buy essentials!
            </div>
          ) : (
            myOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">#{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'cancelled_fake'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-slate-400">{new Date(order.placedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="text-slate-600 mt-1">
                    {order.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Delivery to: {order.deliveryAddress}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-base font-mono text-slate-900">₹{order.totalAmount}</div>
                  <div className="text-[11px] text-slate-500 uppercase">{order.paymentPreference.replace(/_/g, ' ')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
