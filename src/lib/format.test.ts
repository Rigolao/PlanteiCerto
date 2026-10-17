import { describe, it, expect } from 'vitest';
import { formatBifurcacao, formatMedida, formatMedidaClasse, formatTexto } from './format';
import { ROTULO_SEM_DADO } from './provenance';

describe('formatMedida', () => {
  it('writes the value and the unit separated by a space', () => {
    expect(formatMedida(15, 'm')).toBe('15 m');
    expect(formatMedida(80, 'cm')).toBe('80 cm');
    expect(formatMedida(2, 'm²')).toBe('2 m²');
    expect(formatMedida(4, 'm³')).toBe('4 m³');
    expect(formatMedida(45.1405, 'kg', 1)).toBe('45,1 kg');
  });

  it('treats zero as a valid value', () => {
    expect(formatMedida(0, 'm')).toBe('0 m');
    expect(formatMedida(0, '%')).toBe('0%');
  });

  it('returns the single gap label for NULL and undefined', () => {
    expect(formatMedida(null, 'cm')).toBe('Não avaliado');
    expect(formatMedida(undefined, 'm')).toBe(ROTULO_SEM_DADO);
  });

  it('does not put a space before the percent sign', () => {
    expect(formatMedida(85, '%')).toBe('85%');
  });

  it('uses the pt-BR decimal comma and at most the requested decimals', () => {
    expect(formatMedida(1.8, 'm')).toBe('1,8 m');
    expect(formatMedida(9.45632, 'cm')).toBe('9,46 cm');
    expect(formatMedida(9.45632, 'cm', 0)).toBe('9 cm');
  });
});

describe('formatMedidaClasse', () => {
  it('joins the measure and its class', () => {
    expect(formatMedidaClasse(15, 'm', 'Grande')).toBe('15 m (Grande)');
  });

  it('keeps zero as a measure and labels a missing class', () => {
    expect(formatMedidaClasse(0, 'm', 'Pequeno')).toBe('0 m (Pequeno)');
    expect(formatMedidaClasse(12, 'm', null)).toBe('12 m (Não avaliado)');
    expect(formatMedidaClasse(null, 'm', 'Grande')).toBe('Não avaliado (Grande)');
  });

  it('collapses to a single label when both parts are missing', () => {
    expect(formatMedidaClasse(null, 'm', null)).toBe('Não avaliado');
  });
});

describe('formatTexto', () => {
  it('returns the text and labels NULL, empty and blank values as a gap', () => {
    expect(formatTexto('Arredondada')).toBe('Arredondada');
    expect(formatTexto(null)).toBe('Não avaliado');
    expect(formatTexto(undefined)).toBe('Não avaliado');
    expect(formatTexto('')).toBe('Não avaliado');
    expect(formatTexto('   ')).toBe('Não avaliado');
  });
});

describe('formatBifurcacao', () => {
  it('formats a range with the pt-BR decimal comma and the unit', () => {
    expect(formatBifurcacao('2,0 - 3,0')).toBe('2,0–3,0 m');
    expect(formatBifurcacao('1.5-2.5')).toBe('1,5–2,5 m');
    expect(formatBifurcacao('10-15')).toBe('10–15 m');
    expect(formatBifurcacao('4-6')).toBe('4–6 m');
  });

  it('accepts hyphen, en dash and em dash, with or without spaces', () => {
    expect(formatBifurcacao('2,5 – 3,5')).toBe('2,5–3,5 m');
    expect(formatBifurcacao('2,5–3,5')).toBe('2,5–3,5 m');
    expect(formatBifurcacao('2,5 — 3,5')).toBe('2,5–3,5 m');
    expect(formatBifurcacao('0,5 - 1,0')).toBe('0,5–1,0 m');
  });

  it('formats a single number with the unit', () => {
    expect(formatBifurcacao('10')).toBe('10 m');
    expect(formatBifurcacao('1.5')).toBe('1,5 m');
    expect(formatBifurcacao(' 2,5 ')).toBe('2,5 m');
  });

  it('returns the gap label for NULL, empty, blank and "Não encontrado"', () => {
    expect(formatBifurcacao(null)).toBe('Não avaliado');
    expect(formatBifurcacao(undefined)).toBe('Não avaliado');
    expect(formatBifurcacao('')).toBe('Não avaliado');
    expect(formatBifurcacao('   ')).toBe('Não avaliado');
    expect(formatBifurcacao('Não encontrado')).toBe('Não avaliado');
    expect(formatBifurcacao('NÃO ENCONTRADO')).toBe('Não avaliado');
  });

  it('returns any other text unchanged instead of reinterpreting it', () => {
    expect(formatBifurcacao('acima do fuste')).toBe('acima do fuste');
    expect(formatBifurcacao('2 - 3 - 4')).toBe('2 - 3 - 4');
    expect(formatBifurcacao('2,5 m')).toBe('2,5 m');
  });
});
