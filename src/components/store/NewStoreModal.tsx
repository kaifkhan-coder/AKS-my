import React, { useState } from 'react';
import { Store, X, Plus, MapPin, Phone, Mail, FileText, QrCode } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface NewStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewStoreModal: React.FC<NewStoreModalProps> = ({ isOpen, onClose }) => {
  const { addNewStoreProfile } = useStore();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('Daily Fresh Provisions & Wholesale');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [upiId, setUpiId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addNewStoreProfile({
      name: name.trim(),
      tagline: tagline.trim(),
      phone: phone.trim() || '+91 98765 00000',
      email: email.trim() || 'store@gmail.com',
      address: address.trim() || 'Main Market Road',
      gstin: gstin.trim() || undefined,
      upiId: upiId.trim() || undefined,
      currency: 'INR',
      currencySymbol: '₹',
      ownerId: 'user-demo-owner',
      isDefault: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Add Another Kirana Store Profile</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Create an additional store profile (e.g. Branch 2, Wholesale Godown, Superette). You can instantly switch between profiles from the top navigation.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Balaji Wholesale & Kirana Godown"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Tagline / Slogan
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Pure Spices, Grains & Cold Drinks"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98000 11111"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Email (Gmail)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="branch2@gmail.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shop Address & City
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No. 4, Ganj Bazar, Sector 12"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="07AAAAA0000A1Z5"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store UPI ID for QR Billing
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="branch2@okaxis"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Create Store Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
