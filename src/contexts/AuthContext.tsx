import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (nome: string, email: string, password: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  updateProfile: (nome: string, avatarFile?: File) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          nome: session.user.user_metadata?.full_name || session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          providers: session.user.identities?.map(i => i.provider) ?? [],
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          nome: session.user.user_metadata?.full_name || session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          providers: session.user.identities?.map(i => i.provider) ?? [],
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error: error?.message || null };
  };

  const signUp = async (nome: string, email: string, password: string) => {
    // Verificar se o e-mail já está cadastrado antes de tentar criar a conta.
    // Isso evita o envio desnecessário de e-mails e erros de rate limit.
    try {
      const checkRes = await supabase.functions.invoke('check-email-exists', {
        body: { email },
      });

      if (!checkRes.error && checkRes.data?.exists) {
        return { error: 'Este e-mail já está cadastrado. Tente fazer login.' };
      }
    } catch {
      // Se a verificação falhar, prosseguir com o cadastro normalmente
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome } },
    });
    if (error) return { error: error.message };

    // Supabase returns an empty identities array when the user already exists
    // (fallback para quando confirmação de e-mail está desabilitada)
    if (data?.user?.identities && data.user.identities.length === 0) {
      return { error: 'Este e-mail já está cadastrado. Tente fazer login.' };
    }

    // session is null when email confirmation is required
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message || null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message || null };
  };

  const updateProfile = async (nome: string, avatarFile?: File) => {
    try {
      let avatar_url = undefined;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }

      const updateData: { data: { nome: string; avatar_url?: string } } = {
        data: { nome }
      };

      if (avatar_url) {
        updateData.data.avatar_url = avatar_url;
      }

      const { error: updateError } = await supabase.auth.updateUser(updateData);
      
      if (updateError) throw updateError;
      
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      return { error: message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword, updatePassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
