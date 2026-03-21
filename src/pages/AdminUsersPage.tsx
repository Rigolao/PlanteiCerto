import { useState } from 'react';
import { Users, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminUsers, useUpdateRole } from '../hooks/useAdminUsers';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Profile } from '../types/auth';

export function AdminUsersPage() {
  const { user } = useAuth();
  const { users, loading } = useAdminUsers();
  const updateRole = useUpdateRole();
  const [confirmTarget, setConfirmTarget] = useState<{ profile: Profile; newRole: 'admin' | 'user' } | null>(null);

  const handleToggleRole = (profile: Profile) => {
    const newRole = profile.role === 'admin' ? 'user' : 'admin';
    setConfirmTarget({ profile, newRole });
  };

  const handleConfirm = () => {
    if (confirmTarget) {
      updateRole.mutate({ id: confirmTarget.profile.id, role: confirmTarget.newRole });
      setConfirmTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground animate-pulse">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users size={28} className="text-primary" />
          Gerenciar Equipe
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {users.length} {users.length === 1 ? 'usuário' : 'usuários'} registrados
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((profile) => {
              const isSelf = profile.id === user?.id;
              return (
                <tr key={profile.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-foreground">{profile.nome ?? '—'}</span>
                      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                      <div className="sm:hidden text-xs text-muted-foreground mt-0.5">{profile.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{profile.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      profile.role === 'admin'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {profile.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleToggleRole(profile)}
                        disabled={isSelf || updateRole.isPending}
                        title={
                          isSelf
                            ? 'Não é possível alterar seu próprio role'
                            : profile.role === 'admin'
                              ? 'Remover privilégios de admin'
                              : 'Promover a administrador'
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer transition-colors ${
                          isSelf
                            ? 'opacity-30 cursor-not-allowed bg-transparent text-muted-foreground'
                            : profile.role === 'admin'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                              : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                        }`}
                      >
                        {profile.role === 'admin' ? (
                          <><ShieldOff size={14} /> Remover Admin</>
                        ) : (
                          <><ShieldCheck size={14} /> Promover</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirm}
        title={
          confirmTarget?.newRole === 'admin'
            ? `Promover "${confirmTarget?.profile.nome}" a Admin?`
            : `Remover admin de "${confirmTarget?.profile.nome}"?`
        }
        message={
          confirmTarget?.newRole === 'admin'
            ? 'Este usuário terá acesso ao painel administrativo e poderá gerenciar árvores e outros usuários.'
            : 'Este usuário perderá o acesso ao painel administrativo.'
        }
      />
    </div>
  );
}
