import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CreditScorePage from './pages/CreditScorePage';
import DebtsPage from './pages/DebtsPage';
import AIAdvisorPage from './pages/AIAdvisorPage';
import RoadmapPage from './pages/RoadmapPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Guard
function ProtectedRoute({ children, requireOnboarded = true }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-xs text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOnboarded && user && !user.is_onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

// App Layout Wrapper
function AppLayout() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {!isAuthPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Onboarding Wizard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarded={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboard & App Features */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/credit-score"
            element={
              <ProtectedRoute>
                <CreditScorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debts"
            element={
              <ProtectedRoute>
                <DebtsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-advisor"
            element={
              <ProtectedRoute>
                <AIAdvisorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAuthPage && !isLandingPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppLayout />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
