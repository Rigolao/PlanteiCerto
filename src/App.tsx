import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTrees } from './hooks/useTrees';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { Toaster } from 'sonner';
import { useTheme } from './contexts/ThemeContext';
import { InstallPWABanner } from './components/ui/InstallPWABanner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { IPProtectionGate } from './components/auth/IPProtectionGate';

const TreesPage = lazy(() => import('./pages/TreesPage').then(m => ({ default: m.TreesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const RecommendationPage = lazy(() => import('./pages/RecommendationPage').then(m => ({ default: m.RecommendationPage })));
const AdminTreesPage = lazy(() => import('./pages/AdminTreesPage').then(m => ({ default: m.AdminTreesPage })));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));

function PageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </div>
  );
}

export default function App() {
  const { trees } = useTrees();
  const { theme } = useTheme();

  return (
    <ErrorBoundary>
      <IPProtectionGate>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<TreesPage trees={trees} />} />
              <Route path="/quem-somos" element={<AboutPage />} />
              <Route path="/recomendacao" element={<RecommendationPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/projetos" element={<ProjectsPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/arvores" element={<AdminTreesPage />} />
                <Route path="/admin/equipe" element={<AdminUsersPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
        <Toaster position="bottom-center" richColors theme={theme as 'light' | 'dark' | 'system'} />
        <InstallPWABanner />
      </IPProtectionGate>
    </ErrorBoundary>
  );
}
