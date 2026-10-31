import { describe, expect, it } from 'vitest';
import { CLASSES_NIVEL, nivelDaNota, nivelDaPontuacao, nivelDoPercentual } from './escala';

describe('nivelDaNota', () => {
  it('maps a higher-is-better 1–5 grade to its level', () => {
    expect(nivelDaNota(1, 'maior_melhor')).toBe('baixo');
    expect(nivelDaNota(2, 'maior_melhor')).toBe('baixo');
    expect(nivelDaNota(3, 'maior_melhor')).toBe('medio');
    expect(nivelDaNota(4, 'maior_melhor')).toBe('alto');
    expect(nivelDaNota(5, 'maior_melhor')).toBe('alto');
  });

  it('inverts the level when a higher grade is worse', () => {
    expect(nivelDaNota(5, 'maior_pior')).toBe('baixo');
    expect(nivelDaNota(4, 'maior_pior')).toBe('baixo');
    expect(nivelDaNota(3, 'maior_pior')).toBe('medio');
    expect(nivelDaNota(2, 'maior_pior')).toBe('alto');
    expect(nivelDaNota(1, 'maior_pior')).toBe('alto');
  });
});

describe('nivelDoPercentual', () => {
  it('keeps the current criterion bar thresholds (75% and 40%)', () => {
    expect(nivelDoPercentual(39.9)).toBe('baixo');
    expect(nivelDoPercentual(40)).toBe('medio');
    expect(nivelDoPercentual(74.9)).toBe('medio');
    expect(nivelDoPercentual(75)).toBe('alto');
  });
});

describe('nivelDaPontuacao', () => {
  it('keeps the current score seal thresholds (70 and 40 points)', () => {
    expect(nivelDaPontuacao(39)).toBe('baixo');
    expect(nivelDaPontuacao(40)).toBe('medio');
    expect(nivelDaPontuacao(69)).toBe('medio');
    expect(nivelDaPontuacao(70)).toBe('alto');
  });
});

describe('CLASSES_NIVEL', () => {
  it('names the theme tokens of each level as literal Tailwind classes', () => {
    expect(CLASSES_NIVEL.baixo).toEqual({
      barra: 'bg-nivel-baixo',
      fundo: 'bg-nivel-baixo-fundo',
      texto: 'text-nivel-baixo-texto',
      anel: 'ring-nivel-baixo',
    });
    expect(CLASSES_NIVEL.medio).toEqual({
      barra: 'bg-nivel-medio',
      fundo: 'bg-nivel-medio-fundo',
      texto: 'text-nivel-medio-texto',
      anel: 'ring-nivel-medio',
    });
    expect(CLASSES_NIVEL.alto).toEqual({
      barra: 'bg-nivel-alto',
      fundo: 'bg-nivel-alto-fundo',
      texto: 'text-nivel-alto-texto',
      anel: 'ring-nivel-alto',
    });
  });
});
