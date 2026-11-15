import { useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';
import DashboardLayout from '@/layouts/DashboardLayout';
import PublicLayout from '@/layouts/PublicLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ErrorBoundary from '@/components/system/ErrorBoundary';
import { lazyWithRetry } from '@/lib/lazyWithRetry';
import { useThemeInit } from '@/hooks/useTheme';

// Lazy load pages for code splitting. lazyWithRetry recovers from stale
// hashed chunks after a deployment instead of leaving a blank screen.
const HomePage = lazyWithRetry(() => import('@/pages/public/HomePage'));
const LoginPage = lazyWithRetry(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazyWithRetry(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazyWithRetry(() => import('@/pages/auth/ResetPasswordPage'));
const PricingPage = lazyWithRetry(() => import('@/pages/public/PricingPage'));
const FeaturesPage = lazyWithRetry(() => import('@/pages/public/FeaturesPage'));

// Dashboard pages
const DashboardOverview = lazyWithRetry(() => import('@/pages/dashboard/DashboardOverview'));
const CreateLinkPage = lazyWithRetry(() => import('@/pages/dashboard/CreateLinkPage'));
const MyLinksPage = lazyWithRetry(() => import('@/pages/dashboard/MyLinksPage'));
const LinkDetailPage = lazyWithRetry(() => import('@/pages/dashboard/LinkDetailPage'));
const AnalyticsPage = lazyWithRetry(() => import('@/pages/dashboard/AnalyticsPage'));
const AIInsightsPage = lazyWithRetry(() => import('@/pages/dashboard/AIInsightsPage'));
const QRCenterPage = lazyWithRetry(() => import('@/pages/dashboard/QRCenterPage'));
const CampaignsPage = lazyWithRetry(() => import('@/pages/dashboard/CampaignsPage'));
const TeamPage = lazyWithRetry(() => import('@/pages/dashboard/TeamPage'));
const BulkShortenerPage = lazyWithRetry(() => import('@/pages/dashboard/BulkShortenerPage'));
const ExportCenterPage = lazyWithRetry(() => import('@/pages/dashboard/ExportCenterPage'));
const ActivityLogsPage = lazyWithRetry(() => import('@/pages/dashboard/ActivityLogsPage'));
const SettingsPage = lazyWithRetry(() => import('@/pages/dashboard/SettingsPage'));
const ProfilePage = lazyWithRetry(() => import('@/pages/dashboard/ProfilePage'));
const NotificationsPage = lazyWithRetry(() => import('@/pages/dashboard/NotificationsPage'));
const TrashPage = lazyWithRetry(() => import('@/pages/dashboard/TrashPage'));
const AdminPage = lazyWithRetry(() => import('@/pages/dashboard/AdminPage'));

// Public smart pages
const PublicStatsPage = lazyWithRetry(() => import('@/pages/public/PublicStatsPage'));
const NotFoundPage = lazyWithRetry(() => import('@/pages/public/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Wrapper — waits for the session check before redirecting.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

// Guest Route Wrapper (redirect to dashboard if logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard/overview" replace />;
  return children;
};

// Admin-only route. Prevents normal users from landing on the admin screen
// and triggering 403s in the console.
const AdminRoute = ({ children }) => {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingScreen />;
  if (!['admin', 'superadmin'].includes(user?.role)) {
    return <Navigate to="/dashboard/overview" replace />;
  }
  return children;
};

function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname}>
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
          <Route path="/stats/:shortCode" element={<PublicStatsPage />} />
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="create-link" element={<CreateLinkPage />} />
            <Route path="links" element={<MyLinksPage />} />
            <Route path="my-links" element={<MyLinksPage />} />
            <Route path="link/:id" element={<LinkDetailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="ai-insights" element={<AIInsightsPage />} />
            <Route path="qr-center" element={<QRCenterPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="team-collaboration" element={<TeamPage />} />
            <Route path="bulk-shortener" element={<BulkShortenerPage />} />
            <Route path="export-center" element={<ExportCenterPage />} />
            <Route path="activity-logs" element={<ActivityLogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="trash" element={<TrashPage />} />
            <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  useThemeInit();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />

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
