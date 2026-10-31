/** Nível de uma nota na paleta da ficha e do resultado: verde (alto), mostarda (médio), coral claro (baixo). */
export type Nivel = 'alto' | 'medio' | 'baixo';

/** Sentido da escala de 1 a 5: em dano à calçada e sujeira, nota alta é desfavorável. */
export type Polaridade = 'maior_melhor' | 'maior_pior';

/** Nota 1–5 da ficha: favorabilidade 4–5 alto, 3 médio, 1–2 baixo; inverte quando maior é pior. */
export function nivelDaNota(valor: number, polaridade: Polaridade): Nivel {
  const favorabilidade = polaridade === 'maior_melhor' ? valor : 6 - valor;
  if (favorabilidade >= 4) return 'alto';
  if (favorabilidade >= 3) return 'medio';
  return 'baixo';
}

/** Barra de critério do resultado: ≥ 75% alto, ≥ 40% médio, abaixo baixo. */
export function nivelDoPercentual(percentual: number): Nivel {
  if (percentual >= 75) return 'alto';
  if (percentual >= 40) return 'medio';
  return 'baixo';
}

/** Selo de pontos do resultado: ≥ 70 alto, ≥ 40 médio, abaixo baixo. */
export function nivelDaPontuacao(pontos: number): Nivel {
  if (pontos >= 70) return 'alto';
  if (pontos >= 40) return 'medio';
  return 'baixo';
}

/** Classes completas (o Tailwind só gera classes escritas por inteiro no código). */
export const CLASSES_NIVEL: Record<Nivel, { barra: string; fundo: string; texto: string; anel: string }> = {
  alto: { barra: 'bg-nivel-alto', fundo: 'bg-nivel-alto-fundo', texto: 'text-nivel-alto-texto', anel: 'ring-nivel-alto' },
  medio: { barra: 'bg-nivel-medio', fundo: 'bg-nivel-medio-fundo', texto: 'text-nivel-medio-texto', anel: 'ring-nivel-medio' },
  baixo: { barra: 'bg-nivel-baixo', fundo: 'bg-nivel-baixo-fundo', texto: 'text-nivel-baixo-texto', anel: 'ring-nivel-baixo' },
};
