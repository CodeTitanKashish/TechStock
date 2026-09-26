import React, { useState } from 'react';
import { X, Shield, KeyRound, Mail, CheckCircle2, Lock, UserCheck, RefreshCw } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole } from '../../types/inventory';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    closeAuthModal,
    users,
    currentUser,
    setCurrentUser,
    switchRole,
    showToast,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'login' | 'otp_reset' | 'jwt_inspector'>('jwt_inspector');
  const [emailInput, setEmailInput] = useState(currentUser.email);
  const [otpStep, setOtpStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [simulatedToken, setSimulatedToken] = useState<string>(() => {
    // Generate a simulated JWT
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({
        sub: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        warehouses: currentUser.assignedWarehouses,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
        iss: 'stocksense-auth-service',
      })
    )}.sX82_mockSig91kL3qZ_StockSenseProd`;
  });

  if (!authModalOpen) return null;

  const handleQuickSwitchUser = (user: typeof users[0]) => {
    setCurrentUser(user);
    setEmailInput(user.email);
    // Regenerate simulated token
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        warehouses: user.assignedWarehouses,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
        iss: 'stocksense-auth-service',
      })
    )}.sX82_mockSig91kL3qZ_StockSenseProd`;
    setSimulatedToken(token);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setOtpStep('verify');
    showToast('OTP Sent', `A 6-digit one-time code (849201) was dispatched to ${emailInput}`, 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === '849201' || otpCode.length === 6) {
      setOtpStep('new_password');
      showToast('OTP Verified', 'Verification code confirmed. Set a new password.', 'success');
    } else {
      showToast('Invalid Code', 'Please enter 849201 to test the OTP reset.', 'error');
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Password Updated', 'Your enterprise credentials have been reset. Log in with your new password.', 'success');
    setOtpStep('request');
    setActiveTab('jwt_inspector');
  };

  const decodeJwtPayload = () => {
    try {
      const parts = simulatedToken.split('.');
      if (parts.length < 2) return null;
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  };

  const decoded = decodeJwtPayload();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Authentication & Role Engine
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                JWT Session Tokens, OTP Password Reset & RBAC verification
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('jwt_inspector')}
            className={`flex-1 py-2.5 font-medium text-center border-b-2 transition-colors ${
              activeTab === 'jwt_inspector'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Active JWT Claims & Role
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 font-medium text-center border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Quick Switch User
          </button>
          <button
            onClick={() => setActiveTab('otp_reset')}
            className={`flex-1 py-2.5 font-medium text-center border-b-2 transition-colors ${
              activeTab === 'otp_reset'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            OTP Password Reset
          </button>
        </div>

        <div className="p-5 text-xs">
          {activeTab === 'jwt_inspector' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                    Authenticated Principal:
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{currentUser.name}</p>
                  <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 justify-end">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Email Verified</span>
                  </div>
                </div>
              </div>

              {/* Decoded JWT Claims */}
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Decoded Token Payload (RFC 7519):
                </span>
                <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(decoded, null, 2)}
                </pre>
              </div>

              {/* Raw Token string */}
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Raw Bearer Token:
                </span>
                <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] break-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {simulatedToken}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'login' && (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                Choose an enterprise persona to verify granular role permissions across receipts, transfers, and approvals:
              </p>
              <div className="space-y-2">
                {users.map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleQuickSwitchUser(u)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      currentUser.id === u.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{u.email} · {u.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[11px] capitalize font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {u.role.replace('_', ' ')}
                      </span>
                      {currentUser.id === u.id && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium block mt-1">
                          Current Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'otp_reset' && (
            <div className="space-y-4">
              {otpStep === 'request' && (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-300">
                    Enter your corporate email address to receive a secure time-based one-time password (OTP).
                  </p>
                  <div>
                    <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">Corporate Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Send 6-Digit OTP Code
                  </button>
                </form>
              )}

              {otpStep === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300">
                    <p className="font-semibold">Demo Sandbox OTP:</p>
                    <p className="text-[11px] mt-0.5">Use test code <span className="font-mono font-bold">849201</span> to proceed.</p>
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">One-Time Code (OTP)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="849201"
                      className="w-full px-3 py-2 text-center font-mono text-base tracking-widest rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Verify & Continue
                  </button>
                </form>
              )}

              {otpStep === 'new_password' && (
                <form onSubmit={handleSavePassword} className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-300">Create a new secure password with at least 8 characters.</p>
                  <div>
                    <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Update Password & Complete Reset
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
