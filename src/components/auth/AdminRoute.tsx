import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: profileLoading } = useProfile();
  const location = useLocation();
  const hasToasted = useRef(false);

  const loading = authLoading || (!!user && profileLoading);

  useEffect(() => {
    if (!loading && user && !isAdmin && !hasToasted.current) {
      hasToasted.current = true;
      toast.error('Acesso restrito a administradores.');
    }
  }, [loading, user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-pulse mb-4">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
        <p className="text-muted-foreground font-medium animate-pulse">Verificando permissões...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
