import React, { useState } from 'react';
import {
  Boxes,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Sparkles,
  Check,
  Warehouse as WarehouseIcon,
  X,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole } from '../../types/inventory';

interface AuthPortalProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ isModal = false, onClose }) => {
  const {
    users,
    currentUser,
    warehouses,
    login,
    signup,
    authPortalMode,
    setAuthPortalMode,
    showToast,
  } = useInventory();

  // Mode: 'signin' | 'signup' | 'otp_reset' | 'jwt_inspector'
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp_reset' | 'jwt_inspector'>(authPortalMode || 'signin');

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [signUpRole, setSignUpRole] = useState<UserRole>('warehouse_manager');
  const [signUpDepartment, setSignUpDepartment] = useState('Logistics Operations');
  const [signUpWarehouse, setSignUpWarehouse] = useState<string>('ALL');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // OTP Reset fields
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Quick Demo Logins
  const demoUsers = [
    { role: 'admin' as UserRole, name: 'Alex Mercer', email: 'alex.mercer@stocksense.corp', pwd: 'admin', badge: 'Admin' },
    { role: 'warehouse_manager' as UserRole, name: 'Elena Rostova', email: 'elena.rostova@stocksense.corp', pwd: 'manager', badge: 'Manager' },
    { role: 'inventory_clerk' as UserRole, name: 'Marcus Vance', email: 'marcus.vance@stocksense.corp', pwd: 'clerk', badge: 'Clerk' },
    { role: 'auditor' as UserRole, name: 'Sarah Chen, CPA', email: 'sarah.chen@stocksense.corp', pwd: 'auditor', badge: 'Auditor' },
  ];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    if (!signInEmail) {
      setSignInError('Please enter your corporate email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = login(signInEmail, signInPassword);
      if (!res.success) {
        setSignInError(res.error || 'Authentication failed');
      } else {
        if (onClose) onClose();
      }
    }, 350);
  };

  const handleQuickSignIn = (userEmail: string, userPwd: string) => {
    setSignInEmail(userEmail);
    setSignInPassword(userPwd);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = login(userEmail, userPwd);
      if (res.success && onClose) {
        onClose();
      }
    }, 250);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!signUpName.trim()) {
      setSignUpError('Please provide your full legal name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setSignUpError('Please provide a valid corporate email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError('Password must contain at least 6 characters.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match. Please re-type.');
      return;
    }
    if (!acceptTerms) {
      setSignUpError('You must agree to the corporate inventory governance policy.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = signup({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        role: signUpRole,
        department: signUpDepartment,
        assignedWarehouses: signUpWarehouse === 'ALL' ? ['*'] : [signUpWarehouse],
      });

      if (!res.success) {
        setSignUpError(res.error || 'Registration failed');
      } else {
        if (onClose) onClose();
      }
    }, 400);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) return;
    setOtpStep('verify');
    showToast('OTP Dispatched', `A 6-digit one-time code (849201) was dispatched to ${otpEmail}`, 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === '849201' || otpCode.length === 6) {
      setOtpStep('new_password');
      showToast('OTP Confirmed', 'One-time code verified. Create your new password.', 'success');
    } else {
      showToast('Invalid Code', 'Enter test verification code 849201.', 'error');
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Password Updated', 'Your credentials have been securely reset. Sign in with your new password.', 'success');
    setSignInEmail(otpEmail);
    setSignInPassword(newPassword);
    setMode('signin');
    setOtpStep('request');
  };

  const roleDescriptions: Record<UserRole, string> = {
    admin: 'Full ERP command, system configurations, master data creation & approval rights.',
    warehouse_manager: 'Multi-facility oversight, stock balance reviews, dispatch & receiving authorizations.',
    inventory_clerk: 'Inward PO intake, customer order picking, waybill dispatch & physical counts.',
    auditor: 'Read-only compliance audit trail, valuation variance analysis & stock ledger export.',
  };

  const content = (
    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
      {/* Brand Header */}
      <div className="p-6 bg-slate-900 text-white relative overflow-hidden flex items-center justify-between border-b border-slate-800">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Boxes className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">StockSense</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                ERP v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Web-Based Inventory Management System</p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-xs">
        <button
          onClick={() => { setMode('signin'); setSignInError(null); }}
          className={`flex-1 py-3 font-semibold text-center border-b-2 transition-colors ${
            mode === 'signin'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setMode('signup'); setSignUpError(null); }}
          className={`flex-1 py-3 font-semibold text-center border-b-2 transition-colors ${
            mode === 'signup'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Sign Up (New Account)
        </button>
        <button
          onClick={() => setMode('otp_reset')}
          className={`hidden sm:block px-4 py-3 font-medium text-center border-b-2 transition-colors ${
            mode === 'otp_reset'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          OTP Reset
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6 text-xs">
        {/* ======================= SIGN IN TAB ======================= */}
        {mode === 'signin' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sign in to your Enterprise Console
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Access multi-warehouse facilities, approvals, and real-time inventory ledger
              </p>
            </div>

            {signInError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="e.g. alex.mercer@stocksense.corp"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setOtpEmail(signInEmail); setMode('otp_reset'); }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password? (OTP)
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                    title={showSignInPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded focus:outline-hidden"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Keep me signed in on this workstation</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Sign-In Personas */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                Instant Demo Sign-In (1-Click Authentication):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map(d => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => handleQuickSignIn(d.email, d.pwd)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center justify-between group"
                  >
                    <div className="truncate pr-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{d.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shrink-0">
                      {d.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2 text-slate-500">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign up for StockSense
              </button>
            </div>
          </div>
        )}

        {/* ======================= SIGN UP TAB ======================= */}
        {mode === 'signup' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Register New Enterprise Account
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Join the StockSense global logistics supply chain platform
              </p>
            </div>

            {signUpError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={signUpName}
                      onChange={e => setSignUpName(e.target.value)}
                      placeholder="e.g. Jordan Reed"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Corporate Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      placeholder="j.reed@stocksense.corp"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      placeholder="Min. 6 chars..."
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                      title={showSignUpPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded focus:outline-hidden"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      value={signUpConfirmPassword}
                      onChange={e => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Re-type password..."
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      aria-label={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded focus:outline-hidden"
                    >
                      {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  System Role (RBAC Privileges) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['admin', 'warehouse_manager', 'inventory_clerk', 'auditor'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSignUpRole(r)}
                      className={`p-2 rounded-xl border text-center transition-colors ${
                        signUpRole === r
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="capitalize block">{r.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                  {roleDescriptions[signUpRole]}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Department
                  </label>
                  <select
                    value={signUpDepartment}
                    onChange={e => setSignUpDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Supply Chain Operations">Supply Chain Operations</option>
                    <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                    <option value="Receiving & Dispatch Dock">Receiving & Dispatch Dock</option>
                    <option value="Financial Audit & Compliance">Financial Audit & Compliance</option>
                    <option value="Procurement & Vendor Relations">Procurement & Vendor Relations</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Facility Scope
                  </label>
                  <select
                    value={signUpWarehouse}
                    onChange={e => setSignUpWarehouse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value="ALL">All Hubs (Consolidated Scope)</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.code} – {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-start gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none pt-1">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={e => setAcceptTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 shrink-0"
                  />
                  <span className="text-[11px] leading-tight">
                    I agree to the StockSense Corporate Security Policy, physical count auditing protocols, and RFC 7519 session compliance.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account & Sign In'}</span>
                <Check className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-1 text-slate-500">
              <span>Already registered? </span>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign in to your account
              </button>
            </div>
          </div>
        )}

        {/* ======================= OTP PASSWORD RESET TAB ======================= */}
        {mode === 'otp_reset' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Self-Service OTP Password Reset
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Reset your credentials via high-security 6-digit one-time code
              </p>
            </div>

            {otpStep === 'request' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300">
                  Enter your corporate email address to receive a secure time-based OTP.
                </p>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={e => setOtpEmail(e.target.value)}
                      placeholder="alex.mercer@stocksense.corp"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Send 6-Digit OTP Code
                </button>
              </form>
            )}

            {otpStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300">
                  <p className="font-semibold">Demo Sandbox Verification Code:</p>
                  <p className="text-[11px] mt-0.5">Enter code <strong className="font-mono text-sm">849201</strong> to confirm identity.</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="849201"
                    className="w-full px-3 py-2 text-center font-mono text-lg tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Verify Code
                </button>
              </form>
            )}

            {otpStep === 'new_password' && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300">
                  Identity verified. Enter your new password.
                </p>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    New Secure Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded focus:outline-hidden"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Save Password & Return to Sign In
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  // Full page view
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-slate-100 dark:bg-slate-950">
      {content}
    </div>
  );
};
