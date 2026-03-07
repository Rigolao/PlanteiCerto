import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'confirm'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setErro('');
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    if (mode === 'register' && !nome.trim()) {
      setErro('Preencha seu nome.');
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      const result = await signIn(email, senha);
      if (result.error) {
        setErro(result.error);
      } else {
        handleClose();
      }
    } else {
      const result = await signUp(nome, email, senha);
      if (result.error) {
        setErro(result.error);
      } else if (result.needsConfirmation) {
        setMode('confirm');
      } else {
        handleClose();
      }
    }
    setLoading(false);
  };

  // Tela de confirmação de e-mail
  if (mode === 'confirm') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" centered>
        <div className="p-6 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-primary text-xl font-bold mb-2 font-display">Confirme seu e-mail</h2>
          <p className="text-muted-foreground mb-6">
            Enviamos um link de confirmação para <strong>{email}</strong>.
            Clique no link para ativar sua conta e poder fazer login.
          </p>
          <button
            onClick={handleClose}
            className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg border-none cursor-pointer hover:brightness-110 transition-all"
          >
            Entendido
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" centered>
      <div className="p-6">
        <h2 className="text-primary text-xl font-bold mb-4 font-display">
          {mode === 'login' ? 'Entrar' : 'Criar Conta'}
        </h2>

        {erro && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome"
              className="px-4 py-3 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="px-4 py-3 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
          />
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Senha"
            required
            minLength={6}
            className="px-4 py-3 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground font-bold py-3 rounded-lg border-none cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p
          className="text-center mt-4 text-primary text-sm cursor-pointer hover:underline"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErro(''); }}
        >
          {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui'}
        </p>
      </div>
    </Modal>
  );
}
