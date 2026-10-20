import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ShieldCheck, AlertCircle, ArrowRight, Loader2, Package } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, login, signup, logout } = useAuth();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset local state when modal opens/closes
  const handleClose = () => {
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
    setIsSubmitting(false);
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await signup(name, email, password);
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await logout();
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Logout failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isAuthenticated ? 'ATELIER CITIZEN' : tab === 'login' ? 'IDENTITY ACCESS' : 'CREATE IDENTITY'}
      subtitle={isAuthenticated ? 'AUTHENTICATED SESSION // WAVE 01' : 'VOID ARCHIVE ACCESS PROTOCOL'}
      maxWidth="md"
    >
      {isAuthenticated && user ? (
        /* Logged In View */
        <div className="space-y-6">
          <div className="border border-[#111111] p-6 bg-white/50 space-y-4">
            <div className="flex items-center justify-between border-b border-[#111111]/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-[#F4F2ED] flex items-center justify-center font-display font-extrabold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#111111] uppercase tracking-wide">
                    {user.name}
                  </h3>
                  <p className="font-mono text-xs text-[#777777] lowercase">
                    {user.email}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono tracking-widest px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                ACTIVE SESSION
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-mono">
              <div>
                <span className="text-[#777777] text-[10px] uppercase block mb-0.5">CITIZEN STATUS</span>
                <span className="text-[#111111] font-bold uppercase">LEVEL 01 ARCHIVE CITIZEN</span>
              </div>
              <div>
                <span className="text-[#777777] text-[10px] uppercase block mb-0.5">ENROLLED</span>
                <span className="text-[#111111] font-bold">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'OCT 2026'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-[#777777]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
              <span>CRYPTOGRAPHICALLY ENCRYPTED SESSION • HTTPO_NLY COOKIE AUTH</span>
            </div>

            {/* Order History Navigation */}
            <div className="pt-3 border-t border-[#111111]/15">
              <Link
                to="/account/orders"
                onClick={handleClose}
                className="w-full py-2.5 px-3.5 bg-[#F4F2ED] border border-[#111111] hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors flex items-center justify-between text-xs font-mono uppercase tracking-wider group"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#111111] group-hover:text-[#F4F2ED] transition-colors" />
                  <span className="font-bold">DISPATCH ARCHIVE // ORDER HISTORY</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 border border-red-500 bg-red-50 text-red-900 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleClose}
              className="text-xs font-mono uppercase text-[#777777] hover:text-[#111111] transition-colors"
            >
              [ RETURN TO ATELIER ]
            </button>
            <button
              onClick={handleLogout}
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#111111] text-[#F4F2ED] font-mono text-xs uppercase tracking-widest hover:bg-[#333333] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        </div>
      ) : (
        /* Logged Out View (Login / Signup Tabs) */
        <div className="space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 border border-[#111111]">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`py-2.5 text-xs font-mono uppercase tracking-widest transition-colors ${
                tab === 'login'
                  ? 'bg-[#111111] text-[#F4F2ED] font-bold'
                  : 'bg-transparent text-[#777777] hover:text-[#111111]'
              }`}
            >
              [ 01 // SIGN IN ]
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`py-2.5 text-xs font-mono uppercase tracking-widest transition-colors ${
                tab === 'signup'
                  ? 'bg-[#111111] text-[#F4F2ED] font-bold'
                  : 'bg-transparent text-[#777777] hover:text-[#111111]'
              }`}
            >
              [ 02 // CREATE IDENTITY ]
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 border border-red-500 bg-red-50 text-red-900 text-xs font-mono flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1">
                  EMAIL FREQUENCY LINK *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="identity@void.atelier"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#111111] text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1">
                  CRYPTOGRAPHIC PASSPHRASE *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#111111] text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#111111] text-[#F4F2ED] font-mono text-xs uppercase tracking-widest hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>VERIFYING PROTOCOL...</span>
                    </>
                  ) : (
                    <>
                      <span>VERIFY IDENTITY // SIGN IN</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setError(null);
                  }}
                  className="text-[11px] font-mono text-[#777777] hover:text-[#111111] uppercase tracking-wider"
                >
                  NEW CITIZEN? CREATE IDENTITY →
                </button>
              </div>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1">
                  FULL NAME // CITIZEN IDENTITY *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ARCHIVE CITIZEN"
                  minLength={2}
                  maxLength={100}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#111111] text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1">
                  EMAIL FREQUENCY LINK *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="identity@void.atelier"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#111111] text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#777777]">
                    PASSPHRASE *
                  </label>
                  <span className="text-[9px] font-mono text-[#777777]">MIN 8 CHARS</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  minLength={8}
                  maxLength={128}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#111111] text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#111111] text-[#F4F2ED] font-mono text-xs uppercase tracking-widest hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>INITIALIZING IDENTITY...</span>
                    </>
                  ) : (
                    <>
                      <span>INITIALIZE IDENTITY // REGISTER</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError(null);
                  }}
                  className="text-[11px] font-mono text-[#777777] hover:text-[#111111] uppercase tracking-wider"
                >
                  EXISTING CITIZEN? SIGN IN →
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};
