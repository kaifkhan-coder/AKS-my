import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  QrCode,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BillItem, Bill, Customer } from '../../types';
import { InvoiceModal } from './InvoiceModal';

export const BillingPos: React.FC = () => {
  const {
    activeStore,
    inventory,
    categories,
    customers,
    createBill,
    addCustomer,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<BillItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'credit' | 'split'>('cash');
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitCredit, setSplitCredit] = useState<number>(0);

  // Quick Add Customer Modal
  const [isAddCustModalOpen, setIsAddCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLimit, setNewCustLimit] = useState(5000);

  // Generated Invoice Modal
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const storeInventory = inventory.filter((item) => item.storeId === activeStore.id);
  const storeCustomers = customers.filter((c) => c.storeId === activeStore.id);

  const selectedCustomer = storeCustomers.find((c) => c.id === selectedCustomerId);

  // Filter products for catalog
  const filteredProducts = storeInventory.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode && item.barcode.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Barcode quick add
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const matched = storeInventory.find(
      (item) => item.barcode === searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matched) {
      addToCart(matched);
      setSearchQuery('');
    }
  };

  const addToCart = (product: typeof storeInventory[0]) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.itemId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.itemId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            itemId: product.id,
            name: product.name,
            category: product.category,
            quantity: 1,
            unit: product.unit,
            unitPrice: product.sellingPrice,
            totalPrice: product.sellingPrice,
          },
        ];
      }
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.itemId !== itemId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitPrice,
          };
        })
        .filter(Boolean) as BillItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = taxPercent > 0 ? Math.round((subtotal * taxPercent) / 100) : 0;
  const totalPayable = Math.max(0, subtotal - discountAmount + taxAmount);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Validation for Credit payment
    if (paymentMethod === 'credit' && !selectedCustomer) {
      alert('Please select a registered customer to bill on Khata / Credit.');
      return;
    }

    if (selectedCustomer?.isBlocked) {
      alert(`⚠️ Customer "${selectedCustomer.name}" is BLOCKED for fake orders: "${selectedCustomer.blockReason}". Cannot bill on credit!`);
      return;
    }

    const bill = createBill({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Cash Customer',
      customerPhone: selectedCustomer?.phone,
      items: cartItems,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount: totalPayable,
      paymentMethod,
      paymentDetails:
        paymentMethod === 'split'
          ? { cashAmount: splitCash, creditAmount: splitCredit }
          : paymentMethod === 'credit'
          ? { creditAmount: totalPayable }
          : paymentMethod === 'cash'
          ? { cashAmount: totalPayable }
          : { upiAmount: totalPayable },
      paidStatus: paymentMethod === 'credit' ? 'unpaid' : 'paid',
    });

    setGeneratedBill(bill);
    setIsInvoiceModalOpen(true);
    // Reset cart
    setCartItems([]);
    setDiscountAmount(0);
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;
    const newId = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: '',
      address: 'Local Customer',
      creditLimit: Number(newCustLimit),
      notes: 'Added from POS counter',
    });
    setSelectedCustomerId(newId);
    setNewCustName('');
    setNewCustPhone('');
    setIsAddCustModalOpen(false);
  };

  return (
    <div id="billing-pos-page" className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              POS Counter & Automated Billing
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Active Register
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant barcode scanning, auto-stock depletion, credit ledger posting, and thermal slip generator
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Store UPI ID:</div>
          <div className="text-xs font-mono font-bold text-slate-800">{activeStore.upiId || 'Not Configured'}</div>
        </div>
      </div>

      {/* Main Grid: Left Catalog & Search / Right Bill Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Search, Category Filters, Item Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barcode & Search Input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="pos-search-barcode"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan barcode or type product name (e.g. Atta, Oil, Milk)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                <Barcode className="w-4 h-4" />
                <span>Scan</span>
              </button>
            </form>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none mt-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Items ({storeInventory.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const inCart = cartItems.find((ci) => ci.itemId === product.id);
              const isOut = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOut && addToCart(product)}
                  className={`p-3.5 rounded-xl border bg-white text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isOut
                      ? 'opacity-40 cursor-not-allowed border-slate-200'
                      : inCart
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {product.unit}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        product.stock <= product.lowStockThreshold
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.stock} left
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      ₹{product.sellingPrice}
                    </span>
                    {inCart ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center hover:bg-emerald-600 hover:text-white">
                        +
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Bill Register Cart & Checkout (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20 space-y-4">
            {/* Register Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Current Bill</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {cartItems.length} items
              </span>
            </div>

            {/* Customer Selection & Credit Warning */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">Customer (Udhar Account):</label>
                <button
                  type="button"
                  onClick={() => setIsAddCustModalOpen(true)}
                  className="text-emerald-700 hover:underline font-bold text-[11px]"
                >
                  + Add New
                </button>
              </div>

              <select
                id="pos-customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Walk-in Cash Customer (No Khata)</option>
                {storeCustomers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} {cust.isBlocked ? '⚠️ [BLOCKED FAKE]' : `(Udhar: ₹${cust.currentCredit})`}
                  </option>
                ))}
              </select>

              {/* Blocked or Credit limit notification */}
              {selectedCustomer && (
                <div className="p-2.5 rounded-xl border text-xs">
                  {selectedCustomer.isBlocked ? (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50/80 p-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>CUSTOMER BLOCKED:</strong>
                        <p className="text-[11px] mt-0.5">{selectedCustomer.blockReason}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Current Udhar: <strong>₹{selectedCustomer.currentCredit}</strong></span>
                      <span className="text-slate-400">Limit: ₹{selectedCustomer.creditLimit}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Cart is empty. Click products from catalog or scan barcode.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.itemId} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ₹{item.unitPrice} × {item.quantity} {item.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.itemId, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-slate-900 w-14 text-right">
                        ₹{item.totalPrice}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        className="text-slate-300 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount & Tax controls */}
            {cartItems.length > 0 && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Discount (₹)
                  </label>
                  <input
                    id="pos-discount-input"
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    GST / Tax Rate
                  </label>
                  <select
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                  </select>
                </div>
              </div>
            )}

            {/* Total Summary */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Savings / Discount:</span>
                  <span className="font-mono">-₹{discountAmount}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({taxPercent}%):</span>
                  <span className="font-mono">+₹{taxAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>NET TOTAL:</span>
                <span className="font-mono text-emerald-800">₹{totalPayable}</span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Payment Mode:</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  id="paymode-cash"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  id="paymode-upi"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  id="paymode-credit"
                  onClick={() => setPaymentMethod('credit')}
                  disabled={selectedCustomer?.isBlocked}
                  className={`py-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'credit'
                      ? 'border-amber-600 bg-amber-50 text-amber-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Khata (Udhar)</span>
                </button>
              </div>
            </div>

            {/* Action Checkout Button */}
            <button
              id="btn-generate-bill"
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || (paymentMethod === 'credit' && selectedCustomer?.isBlocked)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Generate Automated Bill (₹{totalPayable})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {isAddCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-4 font-bold text-sm">
              Register New Customer (Khata)
            </div>
            <form onSubmit={handleCreateCustomerSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Credit Limit (₹)
                </label>
                <input
                  type="number"
                  min="500"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Output Receipt Modal */}
      <InvoiceModal
        bill={generatedBill}
        store={activeStore}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
};
