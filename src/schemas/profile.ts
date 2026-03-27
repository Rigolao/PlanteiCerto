import { z } from 'zod';

export const profileSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(80, 'Nome deve ter no máximo 80 caracteres'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
