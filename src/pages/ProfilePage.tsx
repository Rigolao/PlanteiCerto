import { useState, useRef } from 'react';
import { Mail, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateProfile, updatePassword } = useAuth();

  // Verifica se o usuário tem uma identidade de e-mail (email+senha)
  const hasEmailIdentity = user?.providers?.includes('email') ?? true;
  const hasGoogleIdentity = user?.providers?.includes('google') ?? false;

  const [nome, setNome] = useState(user?.nome || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);

    const { error } = await updateProfile(nome, avatarFile || undefined);

    if (error) {
      toast.error('Erro ao atualizar perfil: ' + error);
    } else {
      toast.success('Perfil atualizado com sucesso!');
    }
    setLoadingProfile(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoadingAuth(true);

    const { error } = await updatePassword(password);

    if (error) {
      if (error.includes('New password should be different from the old password')) {
        toast.error('A nova senha deve ser diferente da atual.');
      } else {
        toast.error('Erro ao alterar senha: ' + error);
      }
    } else {
      toast.success('Senha alterada com sucesso!');
      setPassword('');
      setConfirmPassword('');
    }
    setLoadingAuth(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 border-b border-border pb-4">Informações Públicas</h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <div 
                className="w-32 h-32 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-muted-foreground">{nome.charAt(0).toUpperCase()}</span>
                )}
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                  <span className="text-white text-sm font-semibold">Alterar Foto</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-primary font-medium hover:underline bg-transparent border-none cursor-pointer"
              >
                Escolher nova foto
              </button>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Email</label>
                <input 
                  type="email" 
                  value={user!.email} 
                  disabled 
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted text-muted-foreground outline-none cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">O endereço de email não pode ser alterado.</p>
              </div>

              {/* Provedores vinculados */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Método de Login</label>
                <div className="flex flex-wrap gap-2">
                  {hasGoogleIdentity && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-foreground">
                      <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.6-4.9 7.3v6h7.9c4.6-4.3 7.3-10.6 7.3-17.6z" fill="#4285F4"/>
                        <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 43.1 14.8 48 24 48z" fill="#34A853"/>
                        <path d="M10.8 28.8A14.8 14.8 0 0 1 10 24c0-1.7.3-3.3.8-4.8v-6.2H2.7A23.9 23.9 0 0 0 0 24c0 3.9.9 7.6 2.7 10.8l8.1-6z" fill="#FBBC05"/>
                        <path d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.5 30.5 0 24 0 14.8 0 6.7 4.9 2.7 13.2l8.1 6.2C12.7 13.6 17.9 9.5 24 9.5z" fill="#EA4335"/>
                      </svg>
                      Google
                    </span>
                  )}
                  {hasEmailIdentity && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-foreground">
                      <Mail size={14} /> E-mail
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nome de Usuário</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={80}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-transparent text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{nome.length}/80</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <button
              type="submit"
              disabled={loadingProfile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-semibold border-none cursor-pointer transition-colors disabled:opacity-50"
            >
              {loadingProfile ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 border-b border-border pb-4">Segurança</h2>
        
        {hasEmailIdentity ? (
          <form onSubmit={handleSavePassword} className="space-y-6">
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
                disabled={loadingAuth}
                className="bg-foreground hover:bg-foreground/90 text-background px-6 py-2.5 rounded-full font-semibold border-none cursor-pointer transition-colors disabled:opacity-50"
              >
                {loadingAuth ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted border border-border">
            <Info size={20} className="mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sua conta usa o <strong>Google</strong> como método de login. Para alterar sua senha, acesse as configurações da sua conta Google.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
