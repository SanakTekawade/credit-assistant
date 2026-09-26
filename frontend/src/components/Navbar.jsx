import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Bot,
  Compass,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: TrendingUp },
    { name: 'Credit Score', path: '/credit-score', icon: ShieldCheck },
    { name: 'Debts & Loans', path: '/debts', icon: CreditCard },
    { name: 'AI Advisor', path: '/ai-advisor', icon: Bot },
    { name: 'Roadmap', path: '/roadmap', icon: Compass },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDemoClick = async () => {
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to load demo:', err);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Credit Assistant
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    IN 🇮🇳
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">AI-Powered Financial Health</p>
              </div>
            </Link>

            {/* Desktop Navigation Links (Authenticated) */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-slate-800/80 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-slate-800/80 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-indigo-600 rounded-full animate-pulse border-2 border-slate-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-900/80 border border-slate-800/80 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-200 hidden sm:inline-block max-w-[120px] truncate">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-800/80">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60"
                        >
                          <User className="w-4 h-4 text-indigo-400" />
                          Financial Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-800/80 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDemoClick}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Try Rahul Demo
                </button>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
