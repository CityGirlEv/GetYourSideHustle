import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Eye, EyeOff, ShieldCheck, Save, LogOut, CheckCircle2, TestTube } from 'lucide-react';
import { AppUser, UserRole, loginUserAsync, registerUserAsync, updateUserProfileAsync, logoutUserAsync, isSuperAdmin } from '../lib/userAuth';
import { phoneSignupError } from '../lib/phoneNumber';
import { sendPasswordResetEmail, sendSignupConfirmationEmail, sendSignupPendingEmail, shouldAutoSendSignupConfirmation } from '../lib/email/notifications';
import {
  completePasswordResetAsync,
  PASSWORD_RESET_NOTICE,
  readPasswordResetToken,
  requestPasswordResetAsync,
} from '../lib/passwordReset';
import { BRAND_TAB_ROW_CLASS, brandTabClass } from '../lib/brandUi';
import { HEADER_OVERLAY_OFFSET } from '../lib/headerClearance';
import { Logo } from './Logo';
import {
  LOGIN_EMAIL_AUTOCOMPLETE,
  LOGIN_EMAIL_FIELD_NAME,
  LOGIN_FORM_AUTOCOMPLETE,
  LOGIN_PASSWORD_AUTOCOMPLETE,
  LOGIN_PASSWORD_FIELD_NAME,
  emptyAuthCredentials,
  shouldPrefillLoginEmail,
} from '../lib/loginFields';

interface UserAuthModalProps {
  isOpen: boolean;
  currentUser?: AppUser | null;
  initialMemberSignup?: boolean;
  initialLoginEmail?: string;
  initialResetToken?: string;
  notice?: string;
  onClose: () => void;
  onUserChange: (user: AppUser | null) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  currentUser,
  initialMemberSignup = false,
  initialLoginEmail = '',
  initialResetToken = '',
  notice = '',
  onClose,
  onUserChange,
}) => {
  const blank = emptyAuthCredentials();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'profile' | 'forgot' | 'reset'>(
    initialResetToken ? 'reset' : initialMemberSignup ? 'register' : 'login'
  );
  const [emailInput, setEmailInput] = useState(blank.email);
  const [passInput, setPassInput] = useState(blank.password);
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const [wantsBeta, setWantsBeta] = useState(false);
  const [isMemberSignup, setIsMemberSignup] = useState(initialMemberSignup);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [blockAutofill, setBlockAutofill] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setAuthMode('profile');
      setNameInput(currentUser.name);
      setEmailInput(currentUser.email);
      setPhoneInput(currentUser.phone || '');
      setSelectedRole(currentUser.role);
      setWantsBeta(Boolean(currentUser.wantsBeta));
      setIsMemberSignup(false);
      setPassInput('');
      setConfirmPassInput('');
    } else if (initialResetToken) {
      const record = readPasswordResetToken(initialResetToken);
      setIsMemberSignup(false);
      setPassInput('');
      setConfirmPassInput('');
      setSuccessMsg('');
      if (record) {
        setAuthMode('reset');
        setEmailInput(record.email);
        setAuthError('');
      } else {
        setAuthMode('forgot');
        setEmailInput('');
        setAuthError('This reset link is invalid or has expired. Request a new one below.');
      }
    } else if (initialMemberSignup) {
      setAuthMode('register');
      setSelectedRole('member');
      setIsMemberSignup(true);
      setWantsBeta(false);
      setAuthError('');
      setSuccessMsg('');
      setNameInput('');
      setEmailInput('');
      setPhoneInput('');
      setPassInput('');
      setConfirmPassInput('');
      setBlockAutofill(true);
    } else {
      setAuthMode('login');
      setEmailInput(shouldPrefillLoginEmail(initialLoginEmail) ? initialLoginEmail : '');
      setPassInput('');
      setConfirmPassInput('');
      setWantsBeta(false);
      setIsMemberSignup(false);
      setBlockAutofill(true);
      setAuthError(notice || '');
    }
  }, [currentUser, isOpen, initialMemberSignup, initialLoginEmail, initialResetToken, notice]);

  const unlockLoginFields = () => setBlockAutofill(false);

  const openFreeMemberSignup = () => {
    setAuthMode('register');
    setSelectedRole('member');
    setIsMemberSignup(true);
    setWantsBeta(false);
    setAuthError('');
    setSuccessMsg('');
    setNameInput('');
    setEmailInput('');
    setPhoneInput('');
    setPassInput('');
    setConfirmPassInput('');
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    const res = await loginUserAsync(emailInput, passInput);
    if (res.success && res.user) {
      const nextUser = wantsBeta && !res.user.wantsBeta
        ? ((await updateUserProfileAsync(res.user.id, { wantsBeta: true })).user ?? res.user)
        : res.user;
      onUserChange(nextUser);
      onClose();
    } else {
      setAuthError(res.error || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    if (!nameInput.trim()) {
      setAuthError('Please enter your full name');
      return;
    }
    const phoneError = phoneSignupError(phoneInput);
    if (phoneError) {
      setAuthError(phoneError);
      return;
    }
    if (passInput !== confirmPassInput) {
      setAuthError('Passwords do not match. Please verify your entries.');
      return;
    }
    const signupRole = isMemberSignup ? 'member' : selectedRole;
    const res = await registerUserAsync(nameInput, emailInput, passInput, signupRole, false, {
      wantsBeta,
      phone: phoneInput,
    });
    if (res.success && res.user) {
      if (res.message) {
        await sendSignupPendingEmail(res.user);
        if (shouldAutoSendSignupConfirmation()) {
          await sendSignupConfirmationEmail(res.user);
        }
        setSuccessMsg(res.message);
        setAuthMode('login');
      } else {
        onUserChange(res.user);
        onClose();
      }
    } else {
      setAuthError(res.error || 'Registration failed.');
    }
  };

  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setAuthError('');
    setSuccessMsg('');

    if (passInput && passInput !== confirmPassInput) {
      setAuthError('New passwords do not match. Please verify your entries.');
      return;
    }

    const phoneError = phoneSignupError(phoneInput);
    if (phoneError) {
      setAuthError(phoneError);
      return;
    }

    const res = await updateUserProfileAsync(currentUser.id, {
      name: nameInput,
      email: emailInput,
      role: selectedRole,
      password: passInput.trim() ? passInput : undefined,
      wantsBeta,
      phone: phoneInput,
    }, currentUser);

    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMsg('User account profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setAuthError(res.error || 'Failed to update user profile.');
    }
  };

  const handleLogout = async () => {
    await logoutUserAsync();
    onUserChange(null);
    setAuthMode('login');
    setEmailInput('');
    setPassInput('');
    onClose();
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    const result = await requestPasswordResetAsync(emailInput, window.location.origin);
    if (result.send) {
      await sendPasswordResetEmail(result.send);
    }
    setSuccessMsg(result.message || PASSWORD_RESET_NOTICE);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    if (passInput !== confirmPassInput) {
      setAuthError('Passwords do not match. Please verify your entries.');
      return;
    }
    const result = await completePasswordResetAsync(initialResetToken, passInput);
    if (!result.success) {
      setAuthError(result.error || 'Unable to reset password.');
      return;
    }
    setSuccessMsg('Password updated. Sign in with your new password.');
    setAuthMode('login');
    setPassInput('');
    setConfirmPassInput('');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center px-4 pb-6 overflow-y-auto ${HEADER_OVERLAY_OFFSET}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1F1917]/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#FAF8F5] border-4 border-[#C2410C] rounded-3xl p-6 sm:p-8 max-w-md w-full text-[#1F1917] shadow-2xl z-10 font-sans space-y-6 max-h-[calc(100dvh-14rem)] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#3F3832] hover:text-[#1F1917] p-1 rounded-full border border-[#1F1917] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo variant="seal-only" size="lg" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight font-serif text-[#1F1917]">
            {currentUser
              ? 'USER PORTAL & PROFILE'
              : authMode === 'forgot'
              ? 'LOST PASSWORD'
              : authMode === 'reset'
              ? 'CHOOSE NEW PASSWORD'
              : isMemberSignup
              ? 'REGISTER'
              : 'MY PLAN ACCOUNT'}
          </h3>
          <p className="text-xs text-[#3F3832] font-medium leading-relaxed">
            {currentUser
              ? 'Manage your user account credentials, update full name, email, password, and active role permissions.'
              : authMode === 'forgot'
              ? 'Enter the email on your activated account. We will send a reset link if that account exists on this device.'
              : authMode === 'reset'
              ? 'Choose a new password, then sign in. Open this page in the same browser you used to sign up.'
              : isMemberSignup
              ? 'Create a Free Member account. Check the Beta Test box if you want to join the tester program.'
              : 'Sign in or register your account to access Community Receipts, 7-Day Challenges & Role Permissions.'}
          </p>
        </div>

        {/* Tab Switcher (When Not Signed In) */}
        {!currentUser && authMode !== 'reset' && (
          <div className={BRAND_TAB_ROW_CLASS} role="tablist" aria-label="Account">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'login'}
              onClick={() => { setAuthMode('login'); setAuthError(''); setSuccessMsg(''); }}
              className={brandTabClass(authMode === 'login')}
            >
              User Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'register'}
              onClick={() => { setAuthMode('register'); setSelectedRole('member'); setIsMemberSignup(true); setAuthError(''); setSuccessMsg(''); }}
              className={brandTabClass(authMode === 'register')}
            >
              Register
            </button>
          </div>
        )}

        {authError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {authError}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* MODE 1: USER PROFILE & ACCOUNT UPDATER (WHEN SIGNED IN) */}
        {currentUser ? (
          <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
            <div className="bg-[#FFEDD5] border-2 border-[#C2410C] rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
                <div>
                  <div className="font-mono font-black text-[#1F1917] uppercase">{currentUser.name}</div>
                  <div className="text-[10px] text-[#3F3832] font-mono">{currentUser.email}</div>
                </div>
              </div>
              <span className="font-mono font-black text-[10px] bg-[#C2410C] text-white px-2 py-0.5 rounded uppercase">
                {currentUser.role}
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Full Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                required
              />
            </div>

            <PhoneField value={phoneInput} onChange={setPhoneInput} />

            <BetaTestBox checked={wantsBeta} onChange={setWantsBeta} />

            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Account Access Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none cursor-pointer"
              >
                {isSuperAdmin(currentUser) && (
                  <option value="super_admin">Super Admin (Full Executive — separate from Admin)</option>
                )}
                <option value="admin">Admin (Portal & Operations — not Super Admin)</option>
                <option value="dev">Developer (Task & IP Portal Access)</option>
                <option value="qa">QA Tester (Testing Matrix Access)</option>
                <option value="member">Member (Storefront Customer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">New Password (Optional)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passInput.length > 0 && (
              <div>
                <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917] flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save User Profile Updates
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-3 bg-red-600 hover:bg-red-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-[#1F1917] flex items-center gap-1.5"
                title="Log out of user session"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </form>
        ) : authMode === 'login' ? (
          /* MODE 2: LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete={LOGIN_FORM_AUTOCOMPLETE} data-testid="user-auth-login-form">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Email Address</label>
              <input
                type="email"
                name={LOGIN_EMAIL_FIELD_NAME}
                autoComplete={LOGIN_EMAIL_AUTOCOMPLETE}
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                readOnly={blockAutofill}
                onFocus={unlockLoginFields}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                required
                data-testid="user-auth-login-email"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name={LOGIN_PASSWORD_FIELD_NAME}
                  autoComplete={LOGIN_PASSWORD_AUTOCOMPLETE}
                  readOnly={blockAutofill}
                  onFocus={unlockLoginFields}
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                  required
                  data-testid="user-auth-login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isMemberSignup && (
              <BetaTestBox checked={wantsBeta} onChange={setWantsBeta} />
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign In To Account
            </button>

            <p className="text-center text-xs font-medium">
              <button
                type="button"
                onClick={() => { setAuthMode('forgot'); setAuthError(''); setSuccessMsg(''); }}
                className="text-[#C2410C] font-black underline underline-offset-2 hover:text-[#1F1917] cursor-pointer min-h-[44px]"
                data-testid="forgot-password-link"
              >
                Forgot password?
              </button>
            </p>

            <p className="text-center text-xs text-[#1F1917] font-medium leading-relaxed" data-testid="user-auth-beta-cta">
              If You Are Interested in being a Beta Tester{' '}
              <button
                type="button"
                onClick={openFreeMemberSignup}
                className="text-[#C2410C] font-black underline underline-offset-2 hover:text-[#1F1917] cursor-pointer"
                data-testid="user-auth-beta-cta-link"
              >
                click here
              </button>
              .
            </p>
          </form>
        ) : authMode === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4" data-testid="forgot-password-form">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917]"
            >
              Send Reset Link
            </button>
            <p className="text-center text-xs font-medium">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); setSuccessMsg(''); }}
                className="text-[#C2410C] font-black underline underline-offset-2 hover:text-[#1F1917] cursor-pointer min-h-[44px]"
              >
                Back to sign in
              </button>
            </p>
          </form>
        ) : authMode === 'reset' ? (
          <form onSubmit={handleResetSubmit} className="space-y-4" data-testid="password-reset-form">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Account Email</label>
              <input
                type="email"
                value={emailInput}
                readOnly
                className="w-full bg-[#FFEDD5] border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917]"
            >
              Save New Password
            </button>
          </form>
        ) : (
          /* MODE 3: REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4" autoComplete={LOGIN_FORM_AUTOCOMPLETE}>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Full Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Angela Harris"
                className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Email Address</label>
              <input
                type="email"
                name={LOGIN_EMAIL_FIELD_NAME}
                autoComplete={LOGIN_EMAIL_AUTOCOMPLETE}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="angela@example.com"
                className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                required
              />
            </div>

            <PhoneField value={phoneInput} onChange={setPhoneInput} testId="user-auth-register-phone" />

            <div className="bg-[#FFEDD5] border-2 border-[#C2410C] rounded-2xl px-3.5 py-2.5" data-testid="user-auth-free-member">
              <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">Account Type</div>
              <div className="text-xs font-black uppercase text-[#1F1917]">Free Member</div>
              <p className="text-[11px] text-[#3F3832] font-medium mt-0.5">
                Community storefront access. Check Beta Test below if you want to help test the platform.
              </p>
            </div>

            <BetaTestBox checked={wantsBeta} onChange={setWantsBeta} />

            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Choose Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name={LOGIN_PASSWORD_FIELD_NAME}
                  autoComplete={LOGIN_PASSWORD_AUTOCOMPLETE}
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete={LOGIN_PASSWORD_AUTOCOMPLETE}
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917] flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Register User Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

function PhoneField({
  value,
  onChange,
  testId = 'user-auth-phone',
}: {
  value: string;
  onChange: (next: string) => void;
  testId?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1" htmlFor={testId}>
        Phone Number
      </label>
      <input
        id={testId}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="(619) 555-0100"
        className="w-full min-h-[44px] bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
        required
        data-testid={testId}
      />
      <p className="mt-1 text-[11px] text-[#3F3832] font-medium">
        Required on every signup, including Beta Testers, in case we need to call you.
      </p>
    </div>
  );
}

function BetaTestBox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-2xl border-2 px-3.5 py-3 cursor-pointer transition-all ${
        checked ? 'bg-[#FFEDD5] border-[#C2410C]' : 'bg-white border-[#1F1917] hover:border-[#C2410C]'
      }`}
      data-testid="user-auth-beta-box"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#C2410C] cursor-pointer"
        data-testid="user-auth-beta-box-input"
      />
      <span className="space-y-0.5">
        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-[#1F1917]">
          <TestTube className="w-3.5 h-3.5 text-[#C2410C]" />
          Beta Test
        </span>
        <span className="block text-[11px] text-[#3F3832] font-medium leading-relaxed">
          Apply as a Beta Tester. An admin still activates your Free Member account before you can sign in.
        </span>
      </span>
    </label>
  );
}
