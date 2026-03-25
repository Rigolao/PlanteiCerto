import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'confirm' | 'forgot-password' | 'forgot-password-success';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const resetForm = () => {
    setNome('');
    setEmail('');
    setSenha('');
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        const result = await resetPassword(email);
        if (result.error) {
          if (result.error.includes('rate limit exceeded')) {
            toast.error('Muitas solicitações em pouco tempo. Aguarde 60 segundos e tente novamente.');
          } else {
            toast.error('Ocorreu um erro ao recuperar a senha. Verifique o e-mail ou tente mais tarde.');
          }
        } else {
          setMode('forgot-password-success');
        }
      } else if (mode === 'register' && !nome.trim()) {
        toast.error('Preencha seu nome.');
        setLoading(false);
        return;
      } else if (mode === 'login') {
        const result = await signIn(email, senha);
        if (result.error) {
          if (result.error.includes('Invalid login credentials')) {
            toast.error('E-mail ou senha incorretos.');
          } else if (result.error.includes('Email not confirmed')) {
             toast.error('Confirme seu e-mail antes de fazer login.');
          } else {
            toast.error('Ocorreu um erro ao fazer login. Tente novamente mais tarde.');
          }
        } else {
          handleClose();
        }
      } else if (mode === 'register') {
        const result = await signUp(nome, email, senha);
        if (result.error) {
          if (result.error.includes('already registered') || result.error.includes('já está cadastrado')) {
            toast.error('Este e-mail já está em uso. Tente fazer login.');
          } else {
            toast.error(result.error);
          }
        } else if (result.needsConfirmation) {
          setMode('confirm');
        } else {
          handleClose();
        }
      }
    } catch (err: any) {
      toast.error('Ocorreu um erro na requisição. Verifique sua conexão ou tente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('Erro ao entrar com Google. Tente novamente.');
      setLoadingGoogle(false);
    }
    // Se sucesso, o Supabase fará redirect e a página recarregará automaticamente
  };

  // Telas Especiais (Confirmação e Sucesso de Reset)
  if (mode === 'confirm' || mode === 'forgot-password-success') {
    const isReset = mode === 'forgot-password-success';
    return (
      <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" centered>
        <div className="p-8 text-center">
          <Mail size={48} className="text-muted-foreground mb-6" />
          <h2 className="text-primary text-2xl font-bold mb-3 font-display">
            {isReset ? 'E-mail enviado' : 'Confirme seu e-mail'}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {isReset 
              ? `Enviamos as instruções para você recuperar sua senha para ${email}. Verifique sua caixa de entrada.`
              : `Enviamos um link de confirmação para ${email}. Clique no link para ativar sua conta.`
            }
          </p>
          <button
            onClick={handleClose}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl border-none cursor-pointer hover:shadow-lg transition-all"
          >
            Entendido
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" centered>
      <div className="p-8">
        <h2 className="text-primary text-2xl font-bold mb-6 font-display">
          {mode === 'login' && 'Entrar'}
          {mode === 'register' && 'Criar Conta'}
          {mode === 'forgot-password' && 'Recuperar Senha'}
        </h2>

        {/* Social Login — only on login and register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex flex-col gap-3 mb-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle || loading}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-all disabled:opacity-50 cursor-pointer"
            >
              {loadingGoogle ? (
                <span className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.6-4.9 7.3v6h7.9c4.6-4.3 7.3-10.6 7.3-17.6z" fill="#4285F4"/>
                  <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 43.1 14.8 48 24 48z" fill="#34A853"/>
                  <path d="M10.8 28.8A14.8 14.8 0 0 1 10 24c0-1.7.3-3.3.8-4.8v-6.2H2.7A23.9 23.9 0 0 0 0 24c0 3.9.9 7.6 2.7 10.8l8.1-6z" fill="#FBBC05"/>
                  <path d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.5 30.5 0 24 0 14.8 0 6.7 4.9 2.7 13.2l8.1 6.2C12.7 13.6 17.9 9.5 24 9.5z" fill="#EA4335"/>
                </svg>
              )}
              {loadingGoogle ? 'Redirecionando...' : 'Continuar com Google'}
            </button>
          </div>
        )}

        {/* Separator */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-foreground/70 ml-1">Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                maxLength={80}
                className="px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-foreground/70 ml-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          {mode !== 'forgot-password' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-foreground/70">Senha</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-[10px] font-bold text-primary hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="******"
                required
                minLength={6}
                className="px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground font-bold py-4 rounded-xl border-none cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 mt-2 shadow-sm"
          >
            {loading ? 'Processando...' : (
              <>
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Cadastrar'}
                {mode === 'forgot-password' && 'Enviar Instruções'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
          {mode === 'forgot-password' ? (
            <button
              onClick={() => setMode('login')}
              className="w-full text-center text-primary text-sm font-semibold bg-transparent border-none cursor-pointer hover:underline"
            >
              Voltar para o login
            </button>
          ) : (
            <p
              className="text-center text-muted-foreground text-sm cursor-pointer"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); }}
            >
              {mode === 'login' ? (
                <>Não tem conta? <span className="text-primary font-bold hover:underline">Cadastre-se</span></>
              ) : (
                <>Já tem conta? <span className="text-primary font-bold hover:underline">Entre aqui</span></>
              )}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
