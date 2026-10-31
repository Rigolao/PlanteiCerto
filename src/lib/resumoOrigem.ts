import type { Arvore } from '../types/tree';
import type { OrigemValor, ProvenanceMap } from '../types/provenance';
import { origemClasse } from './provenance';
import { ABAS_FICHA, CAMPOS_INDICADORES, CAMPOS_PROJECAO, valorParaSelo } from '../components/trees/ficha/abas';

export type CategoriaOrigem =
  | 'publicado'
  | 'calculado'
  | 'estimado'
  | 'fase_anterior'
  | 'consolidado'
  | 'sem_registro'
  | 'nao_avaliado';

/** Separa a classe "outro" nas duas origens que os selos nomeiam de forma diferente. */
function categoriaDoRegistro(origem: OrigemValor): CategoriaOrigem {
  const classe = origemClasse(origem);
  if (classe !== 'outro') return classe;
  return origem === 'retido_da_fase_anterior' ? 'fase_anterior' : 'consolidado';
}

/** Campos com selo exibidos na ficha: os das abas, as 6 células de projeção e os indicadores não NULL. */
function camposExibidos(a: Arvore): (keyof Arvore)[] {
  const dasAbas = ABAS_FICHA.flatMap(aba => aba.grupos.flatMap(grupo => grupo.itens.flatMap(item =>
    item.tipo === 'tile' ? item.campos.map(c => c.campo) : [item.campo])));
  const indicadores = CAMPOS_INDICADORES.filter(campo => a[campo] != null);
  return [...dasAbas, ...CAMPOS_PROJECAO, ...indicadores];
}

/**
 * Quantos valores da ficha vêm de cada origem. Sem a consulta de proveniência resolvida não há como
 * distinguir "sem registro" de "registro não carregado", então devolve null e o resumo não aparece.
 */
export function contarOrigens(
  a: Arvore,
  provenance: ProvenanceMap,
  disponivel: boolean,
): Partial<Record<CategoriaOrigem, number>> | null {
  if (!disponivel) return null;
  const contagem: Partial<Record<CategoriaOrigem, number>> = {};
  for (const campo of camposExibidos(a)) {
    const registro = provenance[campo];
    const categoria: CategoriaOrigem = registro
      ? categoriaDoRegistro(registro.origem)
      : valorParaSelo(a, campo) != null ? 'sem_registro' : 'nao_avaliado';
    contagem[categoria] = (contagem[categoria] ?? 0) + 1;
  }
  return contagem;
}
