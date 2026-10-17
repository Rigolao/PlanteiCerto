import type { Arvore } from './tree';

export type OrigemValor =
  | 'published_table'
  | 'published_equation'
  | 'published_description'
  | 'estimated'
  | 'estimated_rubric'
  | 'estimated_taxon_proxy'
  | 'retido_da_fase_anterior'
  | 'consolidado_de_registro_inativo'
  | 'sem_dado_admissivel';

export interface ProvenanceRecord {
  campo: string;
  variavel: 'dap' | 'altura' | null;
  idade_anos: 10 | 20 | 30 | null;
  unidade: string | null;
  min_operacional: number | null;
  max_operacional: number | null;
  origem: OrigemValor;
  confianca: string | null;
  metodo: string | null;
  fonte: string | null;
  observacao: string | null;
  valor_alterado_em: string | null;
}

export type ProvenanceMap = Partial<Record<keyof Arvore, ProvenanceRecord>>;
