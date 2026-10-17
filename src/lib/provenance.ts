import type { OrigemValor, ProvenanceRecord } from '../types/provenance';

/** Rótulo único para lacunas de atributo de espécie. Alterar só aqui se o orientador pedir outro texto. */
export const ROTULO_SEM_DADO = 'Não avaliado';

const ROTULOS_ORIGEM: Record<OrigemValor, string> = {
  published_table: 'Publicado (tabela)',
  published_equation: 'Calculado por equação publicada',
  published_description: 'Descrição botânica publicada',
  estimated: 'Estimado',
  estimated_rubric: 'Estimado (rubrica)',
  estimated_taxon_proxy: 'Estimado por táxon próximo',
  retido_da_fase_anterior: 'Fase anterior da homologação',
  consolidado_de_registro_inativo: 'Copiado de registro consolidado',
  sem_dado_admissivel: ROTULO_SEM_DADO,
};

export function origemLabel(origem: OrigemValor): string {
  return ROTULOS_ORIGEM[origem];
}

export type OrigemClasse = 'publicado' | 'calculado' | 'estimado' | 'outro' | 'nao_avaliado';

export function origemClasse(origem: OrigemValor): OrigemClasse {
  switch (origem) {
    case 'published_table':
    case 'published_description':
      return 'publicado';
    case 'published_equation':
      return 'calculado';
    case 'estimated':
    case 'estimated_rubric':
    case 'estimated_taxon_proxy':
      return 'estimado';
    case 'retido_da_fase_anterior':
    case 'consolidado_de_registro_inativo':
      return 'outro';
    case 'sem_dado_admissivel':
      return 'nao_avaliado';
  }
}

/** Formata número em pt-BR com no máximo `casas` decimais, sem zeros à toa. */
function num(valor: number, casas = 2): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: casas });
}

export interface ProjecaoFormatada {
  valor: string;
  faixa?: string;
  faixaTipo?: 'operacional' | 'ponto_publicado';
}

/**
 * Formata um valor de projeção (DAP/altura). A faixa nunca é intervalo de confiança:
 * - NULL → rótulo de lacuna;
 * - publicado com mín = máx → ponto publicado, sem faixa;
 * - mín ≠ máx → faixa operacional (qualquer origem);
 * - só um limite → "mín." / "máx." operacional;
 * - sem proveniência e mín = máx = valor → só o valor.
 */
export function formatProjection(
  value: number | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
  unit: string,
  prov?: ProvenanceRecord,
): ProjecaoFormatada {
  if (value == null) return { valor: ROTULO_SEM_DADO };

  const valor = `${num(value)} ${unit}`;

  if (min != null && max != null) {
    if (min === max) {
      if (prov?.origem.startsWith('published_')) return { valor, faixaTipo: 'ponto_publicado' };
      if (min === value) return { valor };
    }
    return { valor, faixa: `${num(min)}–${num(max)} ${unit}`, faixaTipo: 'operacional' };
  }

  if (min != null) return { valor, faixa: `mín. ${num(min)} ${unit}`, faixaTipo: 'operacional' };
  if (max != null) return { valor, faixa: `máx. ${num(max)} ${unit}`, faixaTipo: 'operacional' };
  return { valor };
}

export interface SegmentoLink {
  tipo: 'texto' | 'link';
  valor: string;
}

const TRECHO_HTTP = /https?:\/\/[^\s<>"']+/gi;
const PONTUACAO_FINAL = '.,;:!?';
const FECHAMENTO_ABERTURA: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

function contar(texto: string, caractere: string): number {
  return texto.split(caractere).length - 1;
}

/** Tira do fim da URL a pontuação da frase e os fechamentos sem abertura ("(https://x.com)" → "https://x.com"). */
function aparar(trecho: string): string {
  let url = trecho;
  while (url.length > 0) {
    const ultimo = url[url.length - 1];
    const abertura = FECHAMENTO_ABERTURA[ultimo];
    if (PONTUACAO_FINAL.includes(ultimo) || (abertura && contar(url, ultimo) > contar(url, abertura))) {
      url = url.slice(0, -1);
    } else {
      break;
    }
  }
  return url;
}

function ehHttp(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return (protocol === 'http:' || protocol === 'https:') && hostname !== '';
  } catch {
    return false;
  }
}

/**
 * Separa um texto (ex.: a fonte de um registro de proveniência) em trechos de texto e links.
 * Só URLs http(s) viram `link`; qualquer outro esquema (javascript:, data:, ftp:, mailto:...) e
 * qualquer trecho que não valide como URL http(s) continua texto.
 */
export function segmentarLinks(texto: string): SegmentoLink[] {
  const segmentos: SegmentoLink[] = [];
  const acrescentarTexto = (valor: string) => {
    if (valor === '') return;
    const ultimo = segmentos[segmentos.length - 1];
    if (ultimo?.tipo === 'texto') ultimo.valor += valor;
    else segmentos.push({ tipo: 'texto', valor });
  };

  let cursor = 0;
  for (const encontrado of texto.matchAll(TRECHO_HTTP)) {
    const inicio = encontrado.index;
    const url = aparar(encontrado[0]);
    acrescentarTexto(texto.slice(cursor, inicio));
    if (ehHttp(url)) {
      segmentos.push({ tipo: 'link', valor: url });
      acrescentarTexto(encontrado[0].slice(url.length));
    } else {
      acrescentarTexto(encontrado[0]);
    }
    cursor = inicio + encontrado[0].length;
  }
  acrescentarTexto(texto.slice(cursor));
  return segmentos;
}
