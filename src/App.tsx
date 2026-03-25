import { Routes, Route } from 'react-router-dom';
import { useTrees } from './hooks/useTrees';
import { Layout } from './components/layout/Layout';
import { TreesPage } from './pages/TreesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { RecommendationPage } from './pages/RecommendationPage';
import { AdminTreesPage } from './pages/AdminTreesPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { Toaster } from 'sonner';
import { useTheme } from './contexts/ThemeContext';
import { InstallPWABanner } from './components/ui/InstallPWABanner';

export default function App() {
  const { trees } = useTrees();
  const { theme } = useTheme();

  return (
    <>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TreesPage trees={trees} />} />
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
    <Toaster position="bottom-center" richColors theme={theme as any} />
    <InstallPWABanner />
    </>
  );
}
