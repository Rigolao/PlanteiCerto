import { useState } from 'react';
import { toast } from 'sonner';

interface PasswordChangeFormProps {
  onSubmit: (password: string) => Promise<void>;
}

export function PasswordChangeForm({ onSubmit }: PasswordChangeFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(password);
      setPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Nova Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            className="w-full px-4 py-2 rounded-xl border border-border bg-transparent text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Confirmar Nova Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            className="w-full px-4 py-2 rounded-xl border border-border bg-transparent text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
          />
        </div>
      </div>

      <div className="flex justify-start">
        <button
          type="submit"
          disabled={loading}
          className="bg-foreground hover:bg-foreground/90 text-background px-6 py-2.5 rounded-full font-semibold border-none cursor-pointer transition-colors disabled:opacity-50"
        >
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </div>
    </form>
  );
}
