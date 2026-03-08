import { Routes, Route } from 'react-router-dom';
import { useTrees } from './hooks/useTrees';
import { Layout } from './components/layout/Layout';
import { TreesPage } from './pages/TreesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { Toaster } from 'sonner';
import { useTheme } from './contexts/ThemeContext';

export default function App() {
  const { trees } = useTrees();
  const { theme } = useTheme();

  return (
    <>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TreesPage trees={trees} />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
    </Routes>
    <Toaster position="bottom-right" richColors theme={theme as any} />
    </>
  );
}
