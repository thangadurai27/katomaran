import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';
import DashboardLayout from '@/layouts/DashboardLayout';
import PublicLayout from '@/layouts/PublicLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useThemeInit } from '@/hooks/useTheme';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const PricingPage = lazy(() => import('@/pages/public/PricingPage'));
const FeaturesPage = lazy(() => import('@/pages/public/FeaturesPage'));

// Dashboard pages
const DashboardOverview = lazy(() => import('@/pages/dashboard/DashboardOverview'));
const CreateLinkPage = lazy(() => import('@/pages/dashboard/CreateLinkPage'));
const MyLinksPage = lazy(() => import('@/pages/dashboard/MyLinksPage'));
const LinkDetailPage = lazy(() => import('@/pages/dashboard/LinkDetailPage'));
const AnalyticsPage = lazy(() => import('@/pages/dashboard/AnalyticsPage'));
const AIInsightsPage = lazy(() => import('@/pages/dashboard/AIInsightsPage'));
const QRCenterPage = lazy(() => import('@/pages/dashboard/QRCenterPage'));
const CampaignsPage = lazy(() => import('@/pages/dashboard/CampaignsPage'));
const TeamPage = lazy(() => import('@/pages/dashboard/TeamPage'));
const PublicPagesPage = lazy(() => import('@/pages/dashboard/PublicPagesPage'));
const BulkShortenerPage = lazy(() => import('@/pages/dashboard/BulkShortenerPage'));
const ExportCenterPage = lazy(() => import('@/pages/dashboard/ExportCenterPage'));
const ActivityLogsPage = lazy(() => import('@/pages/dashboard/ActivityLogsPage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'));
const TrashPage = lazy(() => import('@/pages/dashboard/TrashPage'));
const AdminPage = lazy(() => import('@/pages/dashboard/AdminPage'));

// Public smart pages
const BioPage = lazy(() => import('@/pages/public/BioPage'));
const PublicStatsPage = lazy(() => import('@/pages/public/PublicStatsPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Guest Route Wrapper (redirect to dashboard if logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  useThemeInit();

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

            {/* Public Smart Pages */}
            <Route path="/u/:username" element={<BioPage />} />
            <Route path="/stats/:shortCode" element={<PublicStatsPage />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard/overview" replace />} />
              <Route path="overview" element={<DashboardOverview />} />
              <Route path="create-link" element={<CreateLinkPage />} />
              <Route path="my-links" element={<MyLinksPage />} />
              <Route path="link/:id" element={<LinkDetailPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="ai-insights" element={<AIInsightsPage />} />
              <Route path="qr-center" element={<QRCenterPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="team-collaboration" element={<TeamPage />} />
              <Route path="public-pages" element={<PublicPagesPage />} />
              <Route path="bulk-shortener" element={<BulkShortenerPage />} />
              <Route path="export-center" element={<ExportCenterPage />} />
              <Route path="activity-logs" element={<ActivityLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="trash" element={<TrashPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-right"
          gutter={12}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)',
              padding: '14px 16px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
              style: { borderColor: '#a7f3d0' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
              style: { borderColor: '#fecaca' },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
