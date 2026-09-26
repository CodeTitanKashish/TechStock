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
  BadgeCheck,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole } from '../../types/inventory';
import { sound } from '../../utils/audio';

interface AuthPortalProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ isModal = false, onClose }) => {
  const {
    users,
    warehouses,
    login,
    signup,
    resetPassword,
    authPortalMode,
    showToast,
  } = useInventory();

  // Distinct Portal Modes: 'signin' | 'signup' | 'reset_password'
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset_password'>(
    authPortalMode === 'signup' ? 'signup' : 'signin'
  );

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [signUpRole, setSignUpRole] = useState<UserRole>('warehouse_manager');
  const [signUpDepartment, setSignUpDepartment] = useState('Logistics & Warehousing');
  const [signUpWarehouse, setSignUpWarehouse] = useState<string>('ALL');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Non-OTP Password Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pwd)) score += 25;
    return score;
  };

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
        setSignInError(res.error || 'Authentication failed. Please check your credentials.');
      } else {
        sound.playSuccess();
        if (onClose) onClose();
      }
    }, 300);
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
      setSignUpError('Passwords do not match. Please verify.');
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
        sound.playSuccess();
        if (onClose) onClose();
      }
    }, 350);
  };

  const handleDirectPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError('Please enter a valid corporate email address.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetError('New password must contain at least 6 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = resetPassword(resetEmail, resetNewPassword);
      if (!res.success) {
        setResetError(res.error || 'Password reset could not be completed.');
      } else {
        sound.playSuccess();
        setResetSuccess(true);
      }
    }, 350);
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
            <p className="text-xs text-slate-400">Enterprise Inventory & Multi-Warehouse System</p>
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

      {/* Distinct Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-xs">
        <button
          onClick={() => {
            sound.playClick();
            setMode('signin');
            setSignInError(null);
          }}
          className={`flex-1 py-3 font-semibold text-center border-b-2 transition-all ${
            mode === 'signin'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-2xs font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setMode('signup');
            setSignUpError(null);
          }}
          className={`flex-1 py-3 font-semibold text-center border-b-2 transition-all ${
            mode === 'signup'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-2xs font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Register New Account
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setMode('reset_password');
            setResetError(null);
            setResetSuccess(false);
          }}
          className={`px-4 py-3 font-medium text-center border-b-2 transition-all ${
            mode === 'reset_password'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-2xs font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Reset Password
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6 text-xs">
        {/* ======================= 1. SIGN IN PROCESS ======================= */}
        {mode === 'signin' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sign in to your Enterprise Console
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Access multi-facility storage, physical counts, approvals, and perpetual ledger
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
                    onClick={() => {
                      sound.playClick();
                      setResetEmail(signInEmail);
                      setMode('reset_password');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                  >
                    Forgot password?
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
                  <span>Remember this workstation</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800 text-slate-500">
              <span>New to StockSense? </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('signup');
                }}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Create an Enterprise Account
              </button>
            </div>
          </div>
        )}

        {/* ======================= 2. SIGN UP (NEW ACCOUNT) PROCESS ======================= */}
        {mode === 'signup' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Register New Enterprise Account
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Complete onboarding to provision your role-based access credentials
              </p>
            </div>

            {signUpError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
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
                      placeholder="e.g. Jordan Hayes"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                      placeholder="jordan.hayes@stocksense.corp"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
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
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {signUpPassword && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Password Security Strength:</span>
                    <span>{getPasswordStrength(signUpPassword)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        getPasswordStrength(signUpPassword) < 50
                          ? 'bg-rose-500'
                          : getPasswordStrength(signUpPassword) < 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${getPasswordStrength(signUpPassword)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Role Selection (RBAC Cards) */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  System Role (RBAC Privileges) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['admin', 'warehouse_manager', 'inventory_clerk', 'auditor'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSignUpRole(r);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        signUpRole === r
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="capitalize block text-xs">{r.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                  {roleDescriptions[signUpRole]}
                </p>
              </div>

              {/* Department & Primary Warehouse Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Department Scope
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
                    Assigned Facility Scope
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
                    I agree to the StockSense Corporate Security Policy, physical count auditing protocols, and double-entry governance compliance.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                <span>{loading ? 'Registering Account...' : 'Complete Registration & Sign In'}</span>
                <Check className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-1 text-slate-500">
              <span>Already registered? </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('signin');
                }}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign in to your account
              </button>
            </div>
          </div>
        )}

        {/* ======================= 3. PASSWORD RESET (NO OTP - DIRECT RECOVERY) ======================= */}
        {mode === 'reset_password' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Self-Service Password Reset
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Direct credential recovery without OTP verification codes
              </p>
            </div>

            {resetSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Password Updated Successfully!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Your password has been securely reset for <strong>{resetEmail}</strong>. You can now sign in immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSignInEmail(resetEmail);
                    setSignInPassword(resetNewPassword);
                    setMode('signin');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Proceed to Sign In →
                </button>
              </div>
            ) : (
              <form onSubmit={handleDirectPasswordReset} className="space-y-4">
                {resetError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Enter your registered corporate email and set your new password directly.</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Corporate Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="e.g. alex.mercer@stocksense.corp"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    New Secure Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetNewPassword}
                      onChange={e => setResetNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={e => setResetConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  <span>{loading ? 'Updating Credentials...' : 'Save New Password & Update'}</span>
                  <Check className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMode('signin');
                    }}
                    className="font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
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
