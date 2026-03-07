import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, updateProfile, updatePassword } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState(user?.nome || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate('/');
    return null;
  }

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
    setMessage(null);

    const { error } = await updateProfile(nome, avatarFile || undefined);

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil: ' + error });
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    }
    setLoadingProfile(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    setLoadingAuth(true);
    setMessage(null);

    const { error } = await updatePassword(password);

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha: ' + error });
    } else {
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPassword('');
      setConfirmPassword('');
    }
    setLoadingAuth(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

      {message && (
        <div className={`p-4 rounded-xl mb-8 ${message.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl shadow-sm p-6 md:p-8 mb-8">
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
                  value={user.email} 
                  disabled 
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted text-muted-foreground outline-none cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">O endereço de email não pode ser alterado.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nome de Usuário</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-transparent text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
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

      <div className="bg-white border border-border rounded-2xl shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 border-b border-border pb-4">Segurança</h2>
        
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
      </div>
    </div>
  );
}
