import { z } from 'zod';

export const projectSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional().or(z.literal('')),
});

export type ProjectInput = z.infer<typeof projectSchema>;
