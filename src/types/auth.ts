export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  providers?: string[];
}
