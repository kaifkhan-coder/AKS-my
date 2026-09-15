import React, { useState, useEffect } from 'react';
import { Mail, Phone, ShieldCheck, KeyRound, ArrowRight, RefreshCw, CheckCircle2, Store, UserCheck, Users } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRole = 'owner' }) => {
  const { setCurrentUser, activeStoreId, staff, customers, loginAsDemoUser } = useStore();

  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState('khankaifcom551@gmail.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otpDigits, setOtpDigits] = useState(['4', '8', '2', '9', '1', '0']);
  const [countdown, setCountdown] = useState(45);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('482910');

  useEffect(() => {
    if (selectedRole === 'owner') {
      setEmail('khankaifcom551@gmail.com');
      setPhone('+91 98765 43210');
    } else if (selectedRole === 'staff') {
      setEmail('sunil.cashier@gmail.com');
      setPhone('+91 98222 33114');
    } else {
      setEmail('priya.verma.tech@gmail.com');
      setPhone('+91 98989 77889');
    }
  }, [selectedRole]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address.');
      return;
    }
    if (phone.length < 8) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    setErrorMessage('');
    setIsSending(true);

    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpDigits(code.split(''));
      setIsSending(false);
      setStep('otp');
      setCountdown(45);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered !== generatedOtp && entered !== '482910') {
      setErrorMessage('Invalid OTP code. Please enter the code sent to your Gmail/Phone.');
      return;
    }

    // Set user session based on chosen role
    if (selectedRole === 'owner') {
      setCurrentUser({
        id: 'owner-kaif',
        name: 'Kaif Khan (Shop Owner)',
        email,
        phone,
        role: 'owner',
        storeId: activeStoreId,
        permissions: {
          canManageInventory: true,
          canCreateBills: true,
          canManageCredit: true,
          canManageStaff: true,
          canViewFinancials: true,
          canBlockCustomers: true,
        },
      });
    } else if (selectedRole === 'staff') {
      const matchedStaff = staff.find((s) => s.email.toLowerCase() === email.toLowerCase()) || staff[1];
      setCurrentUser({
        id: matchedStaff.id,
        name: matchedStaff.name,
        email,
        phone,
        role: matchedStaff.role,
        storeId: activeStoreId,
        permissions: matchedStaff.permissions,
      });
    } else {
      // Customer
      const matchedCust = customers.find((c) => c.email.toLowerCase() === email.toLowerCase()) || customers[1];
      setCurrentUser({
        id: matchedCust.id,
        name: matchedCust.name,
        email,
        phone,
        role: 'customer',
        storeId: activeStoreId,
      });
    }

    onClose();
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto focus next input
    if (char && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 backdrop-blur-xs border border-white/20">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">KiranaSync Authentication</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Secure 2-Factor Sign-in via Gmail & Mobile OTP
          </p>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-lg font-bold p-1 rounded-md"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Quick Demo Role Selector */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Select Portal / Role:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="select-role-owner"
                onClick={() => { setSelectedRole('owner'); setStep('input'); }}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  selectedRole === 'owner'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 mb-1 text-emerald-600" />
                <span>Shop Owner</span>
                <span className="text-[10px] text-slate-400">Full Access</span>
              </button>

              <button
                type="button"
                id="select-role-staff"
                onClick={() => { setSelectedRole('staff'); setStep('input'); }}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  selectedRole === 'staff'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 mb-1 text-blue-600" />
                <span>Store Staff</span>
                <span className="text-[10px] text-slate-400">POS & Bills</span>
              </button>

              <button
                type="button"
                id="select-role-customer"
                onClick={() => { setSelectedRole('customer'); setStep('input'); }}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  selectedRole === 'customer'
                    ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 mb-1 text-amber-600" />
                <span>Customer</span>
                <span className="text-[10px] text-slate-400">Order & Khata</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {errorMessage}
            </div>
          )}

          {step === 'input' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gmail Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-gmail-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  OTP will be sent to this Gmail for secure 2-step verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="login-mobile-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  SMS OTP backup will also be dispatched to this phone.
                </p>
              </div>

              <button
                id="btn-send-otp"
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Generate & Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Fast 1-click test bypass */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  id="btn-quick-login"
                  onClick={() => {
                    loginAsDemoUser(selectedRole);
                    onClose();
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline"
                >
                  ⚡ Instant Demo Sign-in as {selectedRole.toUpperCase()} (Skip OTP)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">OTP Dispatched!</p>
                    <p className="text-[11px] text-emerald-700">
                      Code sent to <span className="font-mono font-medium">{email}</span> & <span className="font-mono">{phone}</span>
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-800 font-mono font-bold">
                        Demo OTP: {generatedOtp}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpDigits(generatedOtp.split(''))}
                        className="text-[11px] text-emerald-800 hover:underline font-semibold"
                      >
                        Autofill Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  Enter 6-digit Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      className="w-11 h-12 text-center font-mono font-bold text-lg bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all shadow-xs"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  {countdown > 0 ? (
                    `Resend OTP in ${countdown}s`
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(code);
                        setOtpDigits(code.split(''));
                        setCountdown(45);
                      }}
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      Resend Code to Gmail
                    </button>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-slate-600 hover:text-slate-900 underline"
                >
                  Change Email
                </button>
              </div>

              <button
                id="btn-verify-otp"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                <KeyRound className="w-4 h-4" />
                <span>Verify OTP & Enter App</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
