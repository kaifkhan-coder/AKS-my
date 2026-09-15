import React from 'react';
import { Printer, Share2, X, CheckCircle, QrCode, Store, Phone, Mail, MapPin } from 'lucide-react';
import { Bill, StoreProfile } from '../../types';

interface InvoiceModalProps {
  bill: Bill | null;
  store: StoreProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ bill, store, isOpen, onClose }) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const summary = `🧾 *Invoice from ${store.name}*\n` +
      `Bill No: *${bill.billNumber}*\n` +
      `Customer: ${bill.customerName}\n` +
      `Date: ${new Date(bill.createdAt).toLocaleDateString()}\n` +
      `------------------------\n` +
      bill.items.map((i) => `• ${i.name} (${i.quantity} ${i.unit}) - ₹${i.totalPrice}`).join('\n') +
      `\n------------------------\n` +
      `Total Payable: *₹${bill.totalAmount}*\n` +
      `Payment Mode: ${bill.paymentMethod.toUpperCase()}\n` +
      `Thank you for shopping at ${store.name}!`;

    const encoded = encodeURIComponent(summary);
    const phone = bill.customerPhone?.replace(/[^0-9]/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-8 overflow-hidden print:border-none print:shadow-none print:max-w-full">
        {/* Action bar (hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Automated Bill Generated</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-invoice"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thermal / Standard Receipt Content */}
        <div id="printable-receipt" className="p-6 sm:p-8 font-sans text-slate-800 text-xs">
          {/* Store Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
              {store.name}
            </h2>
            <p className="text-[11px] text-slate-600 italic mt-0.5">{store.tagline}</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
              {store.address}
            </p>
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 mt-1">
              <span>Phone: {store.phone}</span>
              {store.gstin && <span>GSTIN: {store.gstin}</span>}
            </div>
          </div>

          {/* Bill Meta */}
          <div className="py-3 border-b border-dashed border-slate-300 flex justify-between items-start text-[11px]">
            <div>
              <div><span className="text-slate-400">Bill No:</span> <strong className="font-mono text-slate-900">{bill.billNumber}</strong></div>
              <div><span className="text-slate-400">Customer:</span> <strong>{bill.customerName}</strong></div>
              {bill.customerPhone && (
                <div><span className="text-slate-400">Mobile:</span> {bill.customerPhone}</div>
              )}
            </div>
            <div className="text-right">
              <div>{new Date(bill.createdAt).toLocaleDateString('en-IN')}</div>
              <div>{new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div><span className="text-slate-400">Cashier:</span> {bill.billedBy.split(' ')[0]}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                  <th className="pb-1">Item</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Rate</th>
                  <th className="pb-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1.5 font-medium text-slate-800">
                      <div>{item.name}</div>
                      <span className="text-[9px] text-slate-400 uppercase">{item.unit}</span>
                    </td>
                    <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-1.5 text-right font-mono">₹{item.unitPrice}</td>
                    <td className="py-1.5 text-right font-mono font-bold">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-right text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-mono">₹{bill.subtotal}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Savings / Discount:</span>
                <span className="font-mono">-₹{bill.discountAmount}</span>
              </div>
            )}
            {bill.taxAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>GST / Tax:</span>
                <span className="font-mono">+₹{bill.taxAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>NET PAYABLE:</span>
              <span className="font-mono text-base">₹{bill.totalAmount}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="py-3 border-b border-dashed border-slate-300 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-400">Payment Mode: </span>
              <strong className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                {bill.paymentMethod === 'credit' ? 'Khata / Credit (Udhar)' : bill.paymentMethod}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Status: </span>
              <span className={`font-bold uppercase ${bill.paidStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {bill.paidStatus}
              </span>
            </div>
          </div>

          {/* UPI QR Code for instant scanning if store has UPI ID */}
          {store.upiId && bill.paymentMethod !== 'cash' && (
            <div className="py-3 text-center bg-slate-50 rounded-xl mt-3 p-3 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">
                Scan UPI QR to Pay ₹{bill.totalAmount}
              </p>
              <div className="w-24 h-24 mx-auto bg-white p-1.5 border border-slate-300 rounded-lg flex items-center justify-center">
                {/* SVG QR Placeholder */}
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <p className="text-[9px] font-mono text-slate-500 mt-1">UPI: {store.upiId}</p>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-4 text-center text-[10px] text-slate-400">
            <p>Thank you for your visit! Goods once sold cannot be returned.</p>
            <p className="font-mono mt-0.5">Powered by KiranaSync Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
};
