import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle,
  MessageCircle,
  UserX,
  UserCheck,
  CreditCard,
  Phone,
  Calendar,
  DollarSign,
  AlertTriangle,
  History,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Customer, CreditLedgerEntry } from '../../types';

export const CreditKhata: React.FC = () => {
  const {
    activeStore,
    customers,
    creditLedger,
    recordCreditPayment,
    recordCreditDebit,
    blockCustomer,
    unblockCustomer,
    addCustomer,
    updateCustomer,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'has_credit' | 'blocked'>('all');

  // Record Payment Modal
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(500);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank_transfer'>('upi');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Give Credit (Debit) Modal
  const [debitCustomer, setDebitCustomer] = useState<Customer | null>(null);
  const [debitAmount, setDebitAmount] = useState<number>(200);
  const [debitNotes, setDebitNotes] = useState('');

  // Block Customer Modal
  const [blockingCustomer, setBlockingCustomer] = useState<Customer | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');

  // Ledger History Drawer
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  // Add Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustLimit, setNewCustLimit] = useState(5000);

  const storeCustomers = customers.filter((c) => c.storeId === activeStore.id);
  const totalCreditOutstanding = storeCustomers.reduce((acc, c) => acc + c.currentCredit, 0);

  const filteredCustomers = storeCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    if (filterType === 'has_credit') return matchesSearch && c.currentCredit > 0;
    if (filterType === 'blocked') return matchesSearch && c.isBlocked;
    return matchesSearch;
  });

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCustomer || paymentAmount <= 0) return;
    recordCreditPayment(paymentCustomer.id, paymentAmount, paymentMode, paymentNotes);
    setPaymentCustomer(null);
    setPaymentAmount(500);
    setPaymentNotes('');
  };

  const handleRecordDebitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitCustomer || debitAmount <= 0) return;
    recordCreditDebit(debitCustomer.id, debitAmount, undefined, debitNotes);
    setDebitCustomer(null);
    setDebitAmount(200);
    setDebitNotes('');
  };

  const handleBlockCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockingCustomer || !blockReasonInput.trim()) return;
    blockCustomer(blockingCustomer.id, blockReasonInput.trim());
    setBlockingCustomer(null);
    setBlockReasonInput('');
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;
    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim(),
      address: newCustAddress.trim() || 'Local Customer',
      creditLimit: Number(newCustLimit),
      notes: 'Registered via Khata Ledger',
    });
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
  };

  const handleSendReminderWhatsApp = (cust: Customer) => {
    const text = `Namaste ${cust.name} ji 🙏,\n` +
      `This is a friendly reminder from *${activeStore.name}* regarding your pending grocery credit (Udhar) balance of *₹${cust.currentCredit}*.\n\n` +
      `You can pay via UPI to: *${activeStore.upiId || activeStore.phone}* or visit our counter.\n` +
      `Thank you for your support!\n-${activeStore.name}`;
    const url = `https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const customerLedgerEntries = historyCustomer
    ? creditLedger.filter((l) => l.customerId === historyCustomer.id)
    : [];

  return (
    <div id="credit-khata-page" className="space-y-6 pb-12">
      {/* Top Banner & Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Customer Credit & Udhar Khata
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
              Bahi-Khata Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer balances, set credit limits, record payments, and moderate fake-order accounts
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500">Total Udhar in Market:</div>
            <div className="text-2xl font-bold text-amber-900 tracking-tight">
              ₹{totalCreditOutstanding.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            id="btn-add-customer-khata"
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="khata-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name or phone number..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({storeCustomers.length})
          </button>
          <button
            onClick={() => setFilterType('has_credit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === 'has_credit'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending Udhar ({storeCustomers.filter((c) => c.currentCredit > 0).length})
          </button>
          <button
            onClick={() => setFilterType('blocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === 'blocked'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Blocked Fake ({storeCustomers.filter((c) => c.isBlocked).length})
          </button>
        </div>
      </div>

      {/* Customer Credit List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map((cust) => {
          const isOverLimit = cust.currentCredit > cust.creditLimit;
          const usagePercent = Math.min(100, Math.round((cust.currentCredit / cust.creditLimit) * 100));

          return (
            <div
              key={cust.id}
              className={`bg-white p-5 rounded-2xl border shadow-xs transition-all relative flex flex-col justify-between ${
                cust.isBlocked
                  ? 'border-red-300 bg-red-50/20'
                  : isOverLimit
                  ? 'border-amber-400 bg-amber-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{cust.name}</h3>
                      {cust.isBlocked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                          Blocked (Fake Orders)
                        </span>
                      ) : cust.currentCredit === 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Cleared ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          Active Udhar
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                      <span>{cust.phone}</span>
                      {cust.address && <span>• {cust.address}</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Balance Owed:</div>
                    <div className={`text-lg font-black font-mono ${cust.currentCredit > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                      ₹{cust.currentCredit}
                    </div>
                  </div>
                </div>

                {/* Block reason if customer is blocked */}
                {cust.isBlocked && cust.blockReason && (
                  <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Fake Order Flag:</strong> {cust.blockReason}
                      </div>
                    </div>
                  </div>
                )}

                {/* Credit limit meter */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Credit Utilization: {usagePercent}%</span>
                    <span>Limit: ₹{cust.creditLimit}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverLimit ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {cust.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-1">
                    "{cust.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setPaymentCustomer(cust);
                      setPaymentAmount(Math.min(cust.currentCredit, 1000) || 500);
                    }}
                    disabled={cust.currentCredit === 0}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold disabled:opacity-40"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Receive Payment</span>
                  </button>

                  <button
                    onClick={() => setDebitCustomer(cust)}
                    disabled={cust.isBlocked}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-40"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>Add Udhar</span>
                  </button>

                  <button
                    onClick={() => setHistoryCustomer(cust)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                    title="View Ledger History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {cust.currentCredit > 0 && (
                    <button
                      onClick={() => handleSendReminderWhatsApp(cust)}
                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                      title="Send WhatsApp Payment Reminder"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}

                  {cust.isBlocked ? (
                    <button
                      onClick={() => unblockCustomer(cust.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                      title="Unblock Customer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unblock</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setBlockingCustomer(cust);
                        setBlockReasonInput('Fake address provided, uncontactable on phone');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium"
                      title="Block for Fake Orders"
                    >
                      <UserX className="w-3.5 h-3.5 text-red-500" />
                      <span>Block</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Payment Modal */}
      {paymentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5" />
                <h3 className="font-bold text-sm">Record Khata Payment (Customer Credit)</h3>
              </div>
              <button onClick={() => setPaymentCustomer(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <p className="font-semibold text-emerald-900">{paymentCustomer.name}</p>
                <p className="text-emerald-700">Total Outstanding Udhar: <strong>₹{paymentCustomer.currentCredit}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={paymentCustomer.currentCredit + 5000}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold font-mono text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['upi', 'cash', 'bank_transfer'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 text-xs font-semibold rounded-xl border uppercase ${
                        paymentMode === mode
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Reference No.
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid via GPay Ref #992120"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentCustomer(null)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Give Goods on Credit Modal */}
      {debitCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Goods on Credit (Udhar)</h3>
              <button onClick={() => setDebitCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordDebitSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <p className="font-semibold text-slate-800">{debitCustomer.name}</p>
                <p className="text-slate-500">Current Credit: ₹{debitCustomer.currentCredit} / Limit: ₹{debitCustomer.creditLimit}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Credit Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={debitAmount}
                  onChange={(e) => setDebitAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Items / Reason
                </label>
                <input
                  type="text"
                  value={debitNotes}
                  onChange={(e) => setDebitNotes(e.target.value)}
                  placeholder="e.g. 2kg Rice, Masalas, Milk"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDebitCustomer(null)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Post to Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Fake Customer Modal */}
      {blockingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-red-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm">Block Customer (Fake Orders / Fraud)</h3>
              </div>
              <button onClick={() => setBlockingCustomer(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBlockCustomerSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Blocking will prevent <strong>{blockingCustomer.name}</strong> from ordering groceries online, placing COD orders, or taking goods on credit.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Blocking <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                  placeholder="e.g. Placed fake bulk order with invalid phone number; failed to pay COD twice."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockingCustomer(null)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Confirm Block & Cancel Orders
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Ledger History Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm">Udhar Ledger History: {historyCustomer.name}</h3>
                <p className="text-[11px] text-slate-400">Total Balance Owed: ₹{historyCustomer.currentCredit}</p>
              </div>
              <button onClick={() => setHistoryCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {customerLedgerEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No credit transactions recorded for this customer yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {customerLedgerEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        entry.type === 'credit'
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-amber-50/60 border-amber-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-lg ${entry.type === 'credit' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                          {entry.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {entry.type === 'credit' ? 'Payment Received' : 'Goods on Credit'}
                          </div>
                          <div className="text-[11px] text-slate-500">{entry.notes}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(entry.date).toLocaleString()} • Logged by: {entry.recordedBy}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-bold text-sm ${entry.type === 'credit' ? 'text-emerald-700' : 'text-amber-800'}`}>
                          {entry.type === 'credit' ? `-₹${entry.amount}` : `+₹${entry.amount}`}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Balance After: <span className="font-mono font-bold">₹{entry.balanceAfter}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Customer Account</h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCustomerSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Sunita Devi"
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
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="customer@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Home Address / Mohalla
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Flat 204, Gali 5"
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
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
