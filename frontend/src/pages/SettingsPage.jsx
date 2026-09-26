import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Lock,
  Moon,
  Sun,
  Bell,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import ConfirmModal from '../components/ConfirmModal';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Danger zone
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preferences toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long with uppercase, lowercase, and numbers.');
      return;
    }

    try {
      setIsChangingPass(true);
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.detail || 'Failed to change password. Check your current password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await authService.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-800/60">
        <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Account Settings</h1>
          <p className="text-xs text-slate-400">Manage security credentials, theme preferences, and account controls.</p>
        </div>
      </div>

      {/* Section 1: Security & Password */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          Security & Password Change
        </h3>

        {passwordMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordMsg}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isChangingPass ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Section 2: Preferences */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          Appearance & App Preferences
        </h3>

        <div className="divide-y divide-slate-800/80">
          
          {/* Theme Selector */}
          <div className="py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Application Color Theme</p>
              <p className="text-[11px] text-slate-400">Toggle between sleek fintech dark mode and light mode.</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white flex items-center gap-2"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* In-app notification sounds / banner toggle */}
          <div className="py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">In-App Milestone Notifications</p>
              <p className="text-[11px] text-slate-400">Receive alerts on credit score improvements and DTI ratio changes.</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative ${emailAlerts ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${emailAlerts ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* AI Advisor proactive prompts */}
          <div className="py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">AI Financial Diagnostics</p>
              <p className="text-[11px] text-slate-400">Allow AI advisor to dynamically evaluate updated loan and card balances.</p>
            </div>
            <button
              type="button"
              onClick={() => setAiSuggestions(!aiSuggestions)}
              className={`w-11 h-6 rounded-full transition-colors relative ${aiSuggestions ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${aiSuggestions ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Section 3: Danger Zone */}
      <div className="rounded-3xl bg-rose-950/20 border border-rose-500/30 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-bold text-white">Danger Zone</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
          Permanently delete your Credit Assistant user profile, financial metrics, debt records, AI consultations, and historical score points. This action is irreversible.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account Permanently</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Permanently Delete Account?"
        message="Are you completely sure you want to delete your account? All credit score histories, debts, and AI consultations will be permanently erased."
        confirmText="Yes, Permanently Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteAccount}
        onClose={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />

    </div>
  );
}
