export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  providers?: string[];
}

export interface Profile {
  id: string;
  nome: string | null;
  email: string | null;
  role: 'admin' | 'user';
  created_at: string;
}
