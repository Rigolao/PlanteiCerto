import type { Arvore } from './tree';

export type Answers = Record<string, string>;

export interface ScoreCriterion {
  label: string;
  points: number;
  maxPoints: number;
}

export interface RecommendedTree extends Arvore {
  score: number;
  scoreBreakdown: ScoreCriterion[];
}

export interface CriteriaSummary {
  eliminatory: string[];
  classificatory: string[];
}

export interface RecommendationResult {
  trees: RecommendedTree[];
  eliminated_count: number;
  criteriaSummary: CriteriaSummary;
}
