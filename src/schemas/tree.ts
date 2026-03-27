import { z } from 'zod';

const nullableNumber = z.number().nullable().optional();
const rating1to5 = z.number().min(1).max(5).nullable().optional();

export const treeSchema = z.object({
  nome_popular: z.string().min(1, 'Nome popular é obrigatório').max(150, 'Máximo de 150 caracteres'),
  nome_cientifico: z.string().min(1, 'Nome científico é obrigatório').max(150, 'Máximo de 150 caracteres'),
  foto: z.string().nullable().optional(),
  origem: z.enum(['Nativa BR', 'Exótica']),
  decidua_perenifolia: z.enum(['Perenifólia', 'Decídua', 'Semidecídua']),
  epoca_floracao: z.string().max(100).nullable().optional(),
  epoca_frutificacao: z.string().max(100).nullable().optional(),
  altura_adulta_max_m: nullableNumber,
  porte_altura_classe: z.enum(['Grande', 'Médio', 'Pequeno']).nullable().optional(),
  diametro_copa_adulto_max_m: nullableNumber,
  copa_classe: z.enum(['Grande', 'Média', 'Pequena']).nullable().optional(),
  dap_adulto_max_cm: nullableNumber,
  altura_primeira_bifurcacao_m: nullableNumber,
  forma_copa: z.string().max(100).nullable().optional(),
  faixa_serv_min_m_recomendada: nullableNumber,
  berco_area_min_m2_recomendada: nullableNumber,
  volume_solo_min_m3_recomendado: nullableNumber,
  compat_fiacao: z.enum(['N', 'A', 'C']).nullable().optional(),
  potencial_dano_calcada_1a5: rating1to5,
  tolerancia_sol_pleno: z.boolean().nullable().optional(),
  tolerancia_meia_sombra: z.boolean().nullable().optional(),
  tolerancia_sombra: z.boolean().nullable().optional(),
  tolerancia_seca_1a5: rating1to5,
  tolerancia_encharcamento_1a5: rating1to5,
  tolerancia_poluicao_atmosferica_1a5: rating1to5,
  tolerancia_compactacao_solo_1a5: rating1to5,
  tolerancia_ventos_fortes_1a5: rating1to5,
  potencial_sujeira_1a5: rating1to5,
  presenca_espinhos: z.boolean().nullable().optional(),
  presenca_subst_irritantes: z.boolean().nullable().optional(),
  atracao_fauna_1a5: rating1to5,
  tolerancia_poda_1a5: rating1to5,
  potencial_sombra_1a5: rating1to5,
  contribuicao_biodiversidade_1a5: rating1to5,
});

export type TreeInput = z.infer<typeof treeSchema>;
