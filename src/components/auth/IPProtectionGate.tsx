import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

interface IPProtectionGateProps {
  children: ReactNode;
}

export function IPProtectionGate({ children }: IPProtectionGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(true); // default true to avoid flicker before mount check
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unlocked = sessionStorage.getItem('ip_unlocked');
    if (unlocked !== 'true') {
      setIsUnlocked(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'plantei_admin_certo') {
      sessionStorage.setItem('ip_unlocked', 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Credenciais inválidas. Acesso negado.');
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Coluna da Esquerda / Topo (Mobile): Identidade Visual */}
      <div
        className="w-full md:w-1/2 lg:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col items-center relative text-center overflow-hidden bg-[#d6e8d8]"
      >
        {/* Subtle Botanical SVG Pattern */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-30.86 30.86-5.83-1.66-1.66-5.83 30.86-30.86.83.83-29.35 29.35 4.3 1.23 1.23 4.3 29.35-29.35zM22.95 24.3l.83.83-14.7 14.7-5.83-1.66-1.66-5.83 14.7-14.7.83.83-13.19 13.19 4.3 1.23 1.23 4.3 13.19-13.19zM48.27 34.95l.83.83-21.36 21.36-5.83-1.66-1.66-5.83 21.36-21.36.83.83-19.85 19.85 4.3 1.23 1.23 4.3 19.85-19.85z' fill='%23052e16' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '120px'
          }}
        ></div>

        <div className="relative z-10 max-w-md mx-auto flex flex-col items-center justify-center flex-grow mt-8">
          <div className="flex flex-col items-center gap-6 mb-10">
            <img src="/logo.png" alt="PlanteiCerto Logo" className="w-32 h-32 object-contain drop-shadow-sm" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-lora font-bold text-foreground tracking-tight">
              PlanteiCerto
            </h1>
          </div>

          <div className="w-24 border-t border-primary/20 mb-10"></div>

          <p className="text-lg md:text-xl text-foreground/80 font-light leading-relaxed mb-12 px-4">
            Um sistema de recomendação de espécies arbóreas para calçadas urbanas, desenvolvido para apoiar cidadãos na escolha da árvore certa para o lugar certo.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 mb-8 bg-white/50 backdrop-blur px-6 py-4 rounded-2xl shadow-sm border border-primary/10">
            <a 
              href="https://unaerp.br" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
            >
              <img src="/logos/unaerp.png" alt="UNAERP" className="h-16 md:h-20 w-auto object-contain" />
            </a>
            <div className="hidden md:block w-px h-14 bg-primary/20"></div>
            <a 
              href="https://unaerp.br/pos-graduacao-stricto-sensu/tecnologia-ambiental/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
            >
              <img src="/logos/mestrado.png" alt="Mestrado Tecnologia Ambiental" className="h-12 md:h-14 w-auto object-contain" />
            </a>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="relative z-10 w-full pt-8 mt-12 border-t border-primary/10 text-xs text-muted-foreground flex flex-col items-center">
          <p className="mb-3 font-medium">Para dúvidas ou liberação de acesso temporário, contate:</p>
          <div className="flex flex-col md:flex-row gap-3 md:gap-8 text-center">
            <p>
              <strong className="text-foreground">Matheus Rigolão:</strong>
              <span className="ml-1.5">mrssouza@unaerp.br</span>
            </p>
            <p>
              <strong className="text-foreground">Dr. Murilo Daniel De Mello Innocentini:</strong>
              <span className="ml-1.5">minnocentini@unaerp.br</span>
            </p>
          </div>
        </div>
      </div>

      {/* Coluna da Direita / Base (Mobile): Login de Proteção */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-card">
        <div className="max-w-md w-full mx-auto">
          <div className="flex flex-col items-center md:items-start text-center md:text-left mb-8">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground text-sm">
              Insira as credenciais administrativas para liberar a interface.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-secondary/60 p-4 rounded-xl text-sm text-left border border-border mb-8 shadow-sm">
            <ShieldAlert className="shrink-0 mt-0.5 text-primary" size={22} />
            <p className="text-foreground leading-relaxed">
              <strong className="block mb-1 text-base font-semibold">Proteção Intelectual Ativa</strong>
              Este software encontra-se em processo de registro no INPI. O acesso é restrito e monitorado para proteção de propriedade intelectual.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="username">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                placeholder="Digite o usuário de acesso"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                placeholder="Digite a senha de acesso"
                required
              />
            </div>

            {error && (
              <div className="text-destructive text-sm font-medium animate-in fade-in bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm transition-colors mt-2 flex items-center justify-center gap-2"
            >
              Acessar Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
