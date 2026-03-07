import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'confirm' | 'forgot-password' | 'forgot-password-success';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
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

    try {
      if (mode === 'forgot-password') {
        const result = await resetPassword(email);
        if (result.error) {
          if (result.error.includes('rate limit exceeded')) {
            setErro('Muitas solicitações em pouco tempo. Aguarde 60 segundos e tente novamente.');
          } else {
            setErro('Ocorreu um erro ao recuperar a senha. Verifique o e-mail ou tente mais tarde.');
          }
        } else {
          setMode('forgot-password-success');
        }
      } else if (mode === 'register' && !nome.trim()) {
        setErro('Preencha seu nome.');
        setLoading(false);
        return;
      } else if (mode === 'login') {
        const result = await signIn(email, senha);
        if (result.error) {
          if (result.error.includes('Invalid login credentials')) {
            setErro('E-mail ou senha incorretos.');
          } else if (result.error.includes('Email not confirmed')) {
             setErro('Confirme seu e-mail antes de fazer login.');
          } else {
            setErro('Ocorreu um erro ao fazer login. Tente novamente mais tarde.');
          }
        } else {
          handleClose();
        }
      } else if (mode === 'register') {
        const result = await signUp(nome, email, senha);
        if (result.error) {
          if (result.error.includes('already registered')) {
            setErro('Este e-mail já está em uso.');
          } else {
            setErro('Erro ao criar conta. Verifique seus dados e tente novamente.');
          }
        } else if (result.needsConfirmation) {
          setMode('confirm');
        } else {
          handleClose();
        }
      }
    } catch (err: any) {
      setErro('Ocorreu um erro na requisição. Verifique sua conexão ou tente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Telas Especiais (Confirmação e Sucesso de Reset)
  if (mode === 'confirm' || mode === 'forgot-password-success') {
    const isReset = mode === 'forgot-password-success';
    return (
      <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" centered>
        <div className="p-8 text-center">
          <div className="text-6xl mb-6">{isReset ? '✉️' : '📧'}</div>
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

        {erro && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{erro}</span>
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
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErro(''); }}
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
