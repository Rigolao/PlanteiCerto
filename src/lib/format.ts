import { ROTULO_SEM_DADO } from './provenance';

export type UnidadeMedida = 'm' | 'cm' | 'm²' | 'm³' | 'kg' | '%';

/**
 * Medida em pt-BR com unidade: "15 m", "85%". `0` é valor válido; só NULL/undefined/NaN
 * são lacuna, e viram o rótulo único `ROTULO_SEM_DADO`.
 */
export function formatMedida(
  valor: number | null | undefined,
  unidade: UnidadeMedida,
  casas = 2,
): string {
  if (valor == null || Number.isNaN(valor)) return ROTULO_SEM_DADO;
  const numero = valor.toLocaleString('pt-BR', { maximumFractionDigits: casas });
  return unidade === '%' ? `${numero}%` : `${numero} ${unidade}`;
}

/**
 * Medida seguida da classe entre parênteses ("15 m (Grande)"). Cada parte ausente vira o
 * rótulo de lacuna; sem nenhuma das duas, devolve um único rótulo em vez de repeti-lo.
 */
export function formatMedidaClasse(
  valor: number | null | undefined,
  unidade: UnidadeMedida,
  classe: string | null | undefined,
): string {
  if ((valor == null || Number.isNaN(valor)) && classe == null) return ROTULO_SEM_DADO;
  return `${formatMedida(valor, unidade)} (${classe ?? ROTULO_SEM_DADO})`;
}

/** Texto de atributo de espécie: NULL, vazio ou só espaços é lacuna. */
export function formatTexto(valor: string | null | undefined): string {
  return valor != null && valor.trim() !== '' ? valor : ROTULO_SEM_DADO;
}

const NUMERO = /^\d+(?:[.,]\d+)?$/;
// hífen, en dash e em dash, com ou sem espaços
const SEPARADOR_FAIXA = /\s*[-–—]\s*/;

function virgula(numero: string): string {
  return numero.replace('.', ',');
}

/**
 * Altura da primeira bifurcação, que no banco é `text`. Faixa ("2,0 - 3,0", "1.5-2.5") vira
 * "2,0–3,0 m" e número único vira "10 m", preservando as casas do texto. NULL, vazio ou
 * "Não encontrado" é lacuna. Qualquer outro texto volta sem alteração: dado não se reinterpreta.
 */
export function formatBifurcacao(texto: string | null | undefined): string {
  if (texto == null) return ROTULO_SEM_DADO;
  const limpo = texto.trim();
  if (limpo === '' || limpo.toLowerCase() === 'não encontrado') return ROTULO_SEM_DADO;

  if (NUMERO.test(limpo)) return `${virgula(limpo)} m`;

  const partes = limpo.split(SEPARADOR_FAIXA);
  if (partes.length === 2 && partes.every(parte => NUMERO.test(parte))) {
    return `${virgula(partes[0])}–${virgula(partes[1])} m`;
  }

  return texto;
}
