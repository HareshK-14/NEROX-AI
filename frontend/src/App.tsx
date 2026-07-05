import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import LoadingOrb from './components/ui/LoadingOrb';
import AuroraBackground from './components/ui/AuroraBackground';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CampusHubPage = lazy(() => import('./pages/CampusHubPage'));
const LearningHubPage = lazy(() => import('./pages/LearningHubPage'));
const CodingHubPage = lazy(() => import('./pages/CodingHubPage'));
const PlacementHubPage = lazy(() => import('./pages/PlacementHubPage'));
const CareerHubPage = lazy(() => import('./pages/CareerHubPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const OrchestratorPage = lazy(() => import('./pages/OrchestratorPage'));

// New Officer Pages
const OfficerDashboardPage = lazy(() => import('./pages/officer/OfficerDashboardPage'));
const StudentListPage = lazy(() => import('./pages/officer/StudentListPage'));
const StudentProfileViewPage = lazy(() => import('./pages/officer/StudentProfileViewPage'));
const PlacementAnalyticsPage = lazy(() => import('./pages/officer/PlacementAnalyticsPage'));
const CompanyManagementPage = lazy(() => import('./pages/officer/CompanyManagementPage'));
const NotificationManagementPage = lazy(() => import('./pages/officer/NotificationManagementPage'));

// New Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'placement_officer' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  if (!token && !user) return <Navigate to="/auth" replace />;
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'placement_officer') return <Navigate to="/officer" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050508' }}>
      <AuroraBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar />
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
          <LoadingOrb />
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Student Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/campus" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppLayout><CampusHubPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/learning" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppLayout><LearningHubPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/coding" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppLayout><CodingHubPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/placement" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppLayout><PlacementHubPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/career" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppLayout><CareerHubPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Common Protected Routes (Student & Officer) */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['student', 'placement_officer', 'admin']}>
              <AppLayout><ProfilePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['student', 'placement_officer', 'admin']}>
              <AppLayout><SettingsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/orchestrator" element={
            <ProtectedRoute allowedRoles={['student', 'placement_officer', 'admin']}>
              <AppLayout><OrchestratorPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Placement Officer Protected Routes */}
          <Route path="/officer" element={
            <ProtectedRoute allowedRoles={['placement_officer', 'admin']}>
              <AppLayout><OfficerDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/officer/students" element={
            <ProtectedRoute allowedRoles={['placement_officer', 'admin']}>
              <AppLayout><StudentListPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/officer/students/:id" element={
            <ProtectedRoute allowedRoles={['placement_officer', 'admin']}>
              <AppLayout><StudentProfileViewPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/officer/analytics" element={
            <ProtectedRoute allowedRoles={['placement_officer', 'admin']}>
              <AppLayout><PlacementAnalyticsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/officer/companies" element={
            <ProtectedRoute allowedRoles={['placement_officer', 'admin']}>
              <AppLayout><CompanyManagementPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/officer/notifications" element={
            <ProtectedRoute allowedRoles={['placement_officer', 'admin']}>
              <AppLayout><NotificationManagementPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Administrator Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><AdminDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><AdminDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/logs" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><AdminDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><AdminDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Fallback route */}
          <Route path="*" element={
            user ? (
              user.role === 'placement_officer' ? (
                <Navigate to="/officer" replace />
              ) : user.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
