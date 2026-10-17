import type { Arvore } from './tree';

export type Answers = Record<string, string>;

export type ScoreStatus = 'avaliado' | 'nao_avaliado' | 'estimado';

// Espelha ScoreCriterion de supabase/functions/recommend-trees/rules.ts (a Edge Function não importa de src/).
export interface ScoreCriterion {
  label: string;
  points: number;
  maxPoints: number;
  /** Campo da espécie usado, quando o item depende de um único campo. */
  campo?: string;
  status: ScoreStatus;
}

export interface RecommendedTree extends Arvore {
  score: number;
  scoreBreakdown: ScoreCriterion[];
}

/** Espécie que passou nos critérios conhecidos, mas tem critério exigido sem dado. */
export interface PendingTree extends RecommendedTree {
  /** Critérios exigidos sem dado, no formato "<Critério>: não avaliado". */
  pendencias: string[];
}

export interface CriteriaSummary {
  eliminatory: string[];
  classificatory: string[];
}

export interface RecommendationResult {
  /** Só espécies aprovadas. */
  trees: RecommendedTree[];
  /** Espécies que requerem avaliação técnica; nunca entram em `trees`. */
  pending_review: PendingTree[];
  /** Só espécies eliminadas por violação conhecida. */
  eliminated_count: number;
  pending_count: number;
  criteriaSummary: CriteriaSummary;
}
