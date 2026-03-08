import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    
    if (updateError) {
      if (updateError.includes('New password should be different from the old password')) {
        toast.error('A nova senha deve ser diferente da atual.');
      } else {
        toast.error(updateError);
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl shadow-primary/5 p-8 border border-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">Nova Senha</h1>
          <p className="text-muted-foreground mt-2">Crie uma nova senha segura para sua conta.</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-6 rounded-2xl mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <p className="font-bold text-lg mb-1">Senha atualizada!</p>
              <p className="text-sm opacity-90">Sua senha foi alterada com sucesso. Redirecionando para o início...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground/70 ml-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="No mínimo 6 caracteres"
                required
                className="px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground/70 ml-1">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className="px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground font-bold py-4 rounded-xl border-none cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 mt-2 shadow-sm"
            >
              {loading ? 'Alterando...' : 'Atualizar Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
