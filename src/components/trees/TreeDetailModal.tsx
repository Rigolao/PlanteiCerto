import { Fragment, useId, useState, type ReactNode } from 'react';
import type { Arvore } from '../../types/tree';
import type { ProvenanceMap } from '../../types/provenance';
import { formatProjection, ROTULO_SEM_DADO } from '../../lib/provenance';
import { formatMedida } from '../../lib/format';
import { contarOrigens } from '../../lib/resumoOrigem';
import { useTreeProvenance } from '../../hooks/useTreeProvenance';
import { Modal } from '../ui/Modal';
import { ProvenanceBadge } from './ProvenanceBadge';
import { TreePhoto } from './TreePhoto';
import { ABAS_FICHA, HORIZONTES_PROJECAO, valorParaSelo, type AbaFicha, type AbaId, type CampoSelo, type GrupoFicha } from './ficha/abas';
import { FichaAbas } from './ficha/FichaAbas';
import { EscalaNota } from './ficha/EscalaNota';
import { LegendaNiveis } from './ficha/LegendaNiveis';
import { ResumoOrigem } from './ficha/ResumoOrigem';
import { Globe, Home, Info } from 'lucide-react';

interface TreeDetailModalProps {
  arvore: Arvore | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const CLASSE_BVOC_LABEL: Record<string, string> = {
  baixo: 'Baixa',
  moderado: 'Moderada',
  alto: 'Alta',
  desconhecido: 'Desconhecida',
  indeterminado: 'Indeterminada',
};

const NOTA_FAIXA_OPERACIONAL = 'Faixa operacional de incerteza; não é intervalo de confiança estatístico.';

const NOTA_LINHA_DE_BASE =
  'A muda inicial (DAP 3 cm, altura 1,5 m) está abaixo da faixa de calibração da equação alométrica '
  + '(DAP ≥ 5 cm); o valor da linha de base é extrapolado.';

type ModoSelo = 'tabela' | 'detalhes';

/**
 * "Origem não registrada" só aparece para valor preenchido, sem registro, quando a consulta de
 * proveniência resolveu. Com a consulta indisponível (Supabase ausente ou falha) ou valor NULL, nada.
 */
function modoSelo(disponivel: boolean, valor: unknown): ModoSelo {
  return disponivel && valor != null ? 'detalhes' : 'tabela';
}

/**
 * Selos de um tile, que pode juntar mais de um campo (ex.: diâmetro e classe da copa). Cada campo com
 * registro ganha o seu selo, com o nome do campo na frente quando o tile tem mais de um; sem nenhum
 * registro, um único "Origem não registrada" se algum dos valores estiver preenchido e a consulta de
 * proveniência tiver resolvido.
 */
function SelosDoCampo({ campos, provenance, disponivel, className }: {
  campos: { campo: keyof Arvore; valor: unknown; rotulo?: string }[];
  provenance: ProvenanceMap;
  disponivel: boolean;
  className?: string;
}) {
  const comRegistro = campos.filter(({ campo }) => provenance[campo] != null);
  if (comRegistro.length === 0) {
    const algumValor = campos.some(({ valor }) => valor != null);
    return <ProvenanceBadge modo={modoSelo(disponivel, algumValor ? true : null)} className={className} />;
  }
  return (
    <>
      {comRegistro.map(({ campo, rotulo }) => (campos.length > 1 && rotulo ? (
        <div key={campo} className="mt-1 flex flex-wrap items-baseline gap-x-1">
          <span className="text-[11px] font-medium text-muted-foreground">{`${rotulo}:`}</span>
          <ProvenanceBadge record={provenance[campo]} modo="detalhes" className={className} />
        </div>
      ) : (
        <ProvenanceBadge key={campo} record={provenance[campo]} modo="detalhes" className={className} />
      )))}
    </>
  );
}

function camposComValor(arvore: Arvore, campos: CampoSelo[]) {
  return campos.map(({ campo, rotulo }) => ({ campo, rotulo, valor: valorParaSelo(arvore, campo) }));
}

function AtributoTile({ campo, label, valor, selos }: {
  /** Campo principal do tile, exposto em `data-campo`. */
  campo: keyof Arvore;
  label: string;
  valor: string;
  selos: ReactNode;
}) {
  return (
    <div data-campo={campo} className="min-w-0 rounded-[10px] bg-muted px-[11px] py-[9px]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-[15px] font-semibold [overflow-wrap:anywhere] ${valor === ROTULO_SEM_DADO ? 'text-muted-foreground' : 'text-foreground'}`}>
        {valor}
      </div>
      {selos}
    </div>
  );
}

function ProjecaoTile({ campo, label, valor, detalhe, calculoEstimado, selos }: {
  campo: keyof Arvore;
  label: string;
  valor: string;
  detalhe?: string;
  /** Biomassa, carbono e CO₂e são cálculos a partir de equação alométrica, não medições. */
  calculoEstimado?: boolean;
  /** Selo de procedência do valor (registro, "Origem não registrada" ou nada). */
  selos?: ReactNode;
}) {
  return (
    <div data-campo={campo} className="min-w-0 rounded-[10px] bg-muted px-[11px] py-[9px]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[15px] font-semibold text-foreground [overflow-wrap:anywhere]">{valor}</div>
      {detalhe && <div className="text-[11px] leading-snug text-muted-foreground">{detalhe}</div>}
      {calculoEstimado && (
        <span className="mt-1 inline-block rounded-full bg-amber-100 px-[7px] py-px text-[11px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Cálculo estimado
        </span>
      )}
      {selos}
    </div>
  );
}

const LINHAS_PROJECAO = [
  { rotulo: 'DAP', unidade: 'cm', valor: 'dap', min: 'dapMin', max: 'dapMax' },
  { rotulo: 'Altura', unidade: 'm', valor: 'altura', min: 'alturaMin', max: 'alturaMax' },
] as const;

function celulasProjecao(arvore: Arvore, provenance: ProvenanceMap) {
  return LINHAS_PROJECAO.map(linha => ({
    rotulo: linha.rotulo,
    celulas: HORIZONTES_PROJECAO.map(periodo => {
      const campo = periodo[linha.valor];
      const record = provenance[campo];
      return {
        campo,
        label: periodo.label,
        record,
        semDado: arvore[campo] == null,
        valor: arvore[campo],
        formato: formatProjection(arvore[campo], arvore[periodo[linha.min]], arvore[periodo[linha.max]], linha.unidade, record),
      };
    }),
  }));
}

/** A tabela sempre aparece na aba Crescimento: célula sem valor mostra "Não avaliado", como os demais NULL. */
function GrowthProjectionTable({ arvore, provenance, disponivel }: { arvore: Arvore; provenance: ProvenanceMap; disponivel: boolean }) {
  const linhas = celulasProjecao(arvore, provenance);
  const temFaixaOperacional = linhas.some(linha =>
    linha.celulas.some(celula => celula.formato.faixaTipo === 'operacional'));

  return (
    <>
      <table aria-label="Projeção de crescimento" className="w-full table-fixed text-left">
        <caption className="sr-only">DAP e altura projetados para cada horizonte, com faixas quando disponíveis</caption>
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th scope="col" className="w-[16%] pb-1 font-medium" />
            {HORIZONTES_PROJECAO.map(periodo => (
              <th key={periodo.label} scope="col" className="pb-1 text-center font-semibold">{periodo.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map(linha => (
            <tr key={linha.rotulo} className="border-t border-border">
              <th scope="row" className="py-2 pr-1 align-top text-[13px] font-medium text-muted-foreground">{linha.rotulo}</th>
              {linha.celulas.map(celula => (
                <td key={celula.label} data-campo={celula.campo} className="px-0.5 py-2 text-center align-top">
                  <div className={`text-[15px] font-semibold ${celula.semDado ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {celula.formato.valor}
                  </div>
                  {celula.formato.faixaTipo === 'ponto_publicado' && (
                    <div className="text-[11px] leading-tight text-muted-foreground">ponto publicado</div>
                  )}
                  {celula.formato.faixaTipo === 'operacional' && (
                    <>
                      <div className="text-[11px] leading-tight text-muted-foreground">{celula.formato.faixa}</div>
                      <div className="text-[11px] leading-tight text-muted-foreground">faixa operacional</div>
                    </>
                  )}
                  <ProvenanceBadge record={celula.record} modo={modoSelo(disponivel, celula.valor)} className="mt-1 items-center" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {temFaixaOperacional && (
        <p className="text-xs leading-snug text-muted-foreground">{NOTA_FAIXA_OPERACIONAL}</p>
      )}
    </>
  );
}

const INDICADORES = [
  { campo: 'biomassa_aerea_10a_kg', label: 'Biomassa aérea', unidade: 'kg', calculoEstimado: true },
  { campo: 'carbono_armazenado_10a_kg', label: 'Carbono armazenado', unidade: 'kg', calculoEstimado: true },
  {
    campo: 'co2e_10a_kg',
    label: 'CO₂ equivalente armazenado na biomassa aérea',
    unidade: 'kg',
    detalhe: 'estoque aos 10 anos; não é remoção anual',
    calculoEstimado: true,
  },
  {
    campo: 'sobrevivencia_10a_pct',
    label: 'Sobrevivência (cenário)',
    unidade: '%',
    detalhe: 'premissa do cenário, não taxa publicada da espécie',
  },
  {
    campo: 'co2e_esperado_por_muda_10a_kg',
    label: 'CO₂e esperado por muda',
    unidade: 'kg',
    detalhe: '(CO₂e aos 10 anos − CO₂e da muda inicial) × sobrevivência do cenário',
  },
] as const;

function indicadoresExibidos(arvore: Arvore) {
  return INDICADORES.filter(indicador => arvore[indicador.campo] != null);
}

function PainelCrescimento({ arvore, provenance, disponivel }: { arvore: Arvore; provenance: ProvenanceMap; disponivel: boolean }) {
  const indicadores = indicadoresExibidos(arvore);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans!">DAP e altura projetados</h4>
        <GrowthProjectionTable arvore={arvore} provenance={provenance} disponivel={disponivel} />
      </div>

      {indicadores.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans!">Indicadores em 10 anos</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {indicadores.map(indicador => (
              <ProjecaoTile
                key={indicador.campo}
                campo={indicador.campo}
                label={indicador.label}
                valor={formatMedida(arvore[indicador.campo], indicador.unidade, 1)}
                detalhe={'detalhe' in indicador ? indicador.detalhe : undefined}
                calculoEstimado={'calculoEstimado' in indicador}
                selos={
                  <SelosDoCampo
                    campos={[{ campo: indicador.campo, valor: arvore[indicador.campo] }]}
                    provenance={provenance}
                    disponivel={disponivel}
                  />
                }
              />
            ))}
          </div>
          {arvore.co2e_esperado_por_muda_10a_kg != null && (
            <p className="text-xs leading-snug text-muted-foreground">{NOTA_LINHA_DE_BASE}</p>
          )}
        </div>
      )}

      {arvore.classe_bvoc && (
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[13px] font-medium text-primary">
            Emissão de BVOC: {CLASSE_BVOC_LABEL[arvore.classe_bvoc] ?? arvore.classe_bvoc}
          </span>
        </div>
      )}

      {arvore.exibir_aviso_bvoc && (
        <div className="flex items-start gap-1.5">
          <Info size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
          <span className="text-xs leading-snug text-muted-foreground">
            Classificação de BVOC com evidência limitada
            {arvore.evidencia_bvoc ? ` (${arvore.evidencia_bvoc})` : ''}
            {arvore.confianca_bvoc ? ` — confiança ${arvore.confianca_bvoc}` : ''}.
          </span>
        </div>
      )}
    </>
  );
}

function Grupo({ grupo, arvore, provenance, disponivel }: {
  grupo: GrupoFicha;
  arvore: Arvore;
  provenance: ProvenanceMap;
  disponivel: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans!">{grupo.titulo}</h4>
      <div className={`grid ${grupo.colunas} ${grupo.layout === 'tiles' ? 'gap-2' : 'gap-x-7 gap-y-0.5'}`}>
        {grupo.itens.map(item => {
          if (item.tipo === 'escala') {
            const valor = arvore[item.campo] as number | null;
            return (
              <EscalaNota
                key={item.campo}
                campo={item.campo}
                rotulo={item.rotulo}
                dica={item.dica}
                valor={valor}
                polaridade={item.polaridade}
                selo={<ProvenanceBadge record={provenance[item.campo]} modo={modoSelo(disponivel, valor)} />}
              />
            );
          }
          return (
            <AtributoTile
              key={item.campos[0].campo}
              campo={item.campos[0].campo}
              label={item.rotulo}
              valor={item.valor(arvore)}
              selos={<SelosDoCampo campos={camposComValor(arvore, item.campos)} provenance={provenance} disponivel={disponivel} />}
            />
          );
        })}
      </div>
    </div>
  );
}

/** "N atributos" ou "N atributos · M não avaliados": itens exibidos na aba e quantos mostram a lacuna. */
function contagemDaAba(aba: AbaFicha, arvore: Arvore, provenance: ProvenanceMap): string {
  let total = 0;
  let semDado = 0;
  for (const grupo of aba.grupos) {
    for (const item of grupo.itens) {
      total += 1;
      const lacuna = item.tipo === 'escala' ? arvore[item.campo] == null : item.valor(arvore) === ROTULO_SEM_DADO;
      if (lacuna) semDado += 1;
    }
  }
  if (aba.id === 'crescimento') {
    for (const linha of celulasProjecao(arvore, provenance)) {
      for (const celula of linha.celulas) {
        total += 1;
        if (celula.formato.valor === ROTULO_SEM_DADO) semDado += 1;
      }
    }
    total += indicadoresExibidos(arvore).length;
  }
  const texto = `${total} atributos`;
  return semDado > 0 ? `${texto} · ${semDado} não avaliados` : texto;
}

export function TreeDetailModal({ arvore, isOpen, onClose, isFavorite, onToggleFavorite }: TreeDetailModalProps) {
  const [lastArvore, setLastArvore] = useState<Arvore | null>(arvore);
  const [aba, setAba] = useState<AbaId>('geral');
  const [estavaAberta, setEstavaAberta] = useState(isOpen);
  // A ficha sempre começa na Visão geral: ao abrir (clique no card) e quando a espécie muda.
  // O componente fica montado nas páginas, então o ajuste é feito durante o render.
  if (arvore && arvore !== lastArvore) {
    setLastArvore(arvore);
    setAba('geral');
  }
  if (isOpen !== estavaAberta) {
    setEstavaAberta(isOpen);
    if (isOpen) setAba('geral');
  }
  const idBase = useId();

  const displayArvore = arvore ?? lastArvore;
  // Proveniência só é consultada com a ficha aberta. `disponivel` distingue "consulta resolvida (talvez
  // sem registros)" de "Supabase ausente ou consulta falhou": só no primeiro caso há "Origem não registrada".
  const { provenance, disponivel } = useTreeProvenance(isOpen && displayArvore ? displayArvore.id : null);
  if (!displayArvore) return null;

  const nativa = displayArvore.origem === 'Nativa BR';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5 sm:px-6 sm:pt-6">
          <TreePhoto
            foto={displayArvore.foto}
            alt={displayArvore.nome_popular}
            className="h-44 w-full sm:h-[150px] sm:w-[200px] sm:shrink-0 sm:rounded-xl"
          />
          <div className="min-w-0 px-4 pt-3.5 sm:px-0 sm:pr-24 sm:pt-0">
            <h2 className="text-primary text-[22px] font-bold leading-tight font-display sm:text-[26px]">{displayArvore.nome_popular}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <p className="text-[15px] italic text-muted-foreground">{displayArvore.nome_cientifico}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {nativa ? <Home size={11} aria-hidden="true" /> : <Globe size={11} aria-hidden="true" />}
                {nativa ? 'Nativa BR' : 'Exótica'}
              </span>
            </div>
          </div>
        </div>
        {/* Favorite Button (o botão de fechar é do Modal, no mesmo canto) */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={`absolute top-3 right-14 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200 ${
              isFavorite
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            style={isFavorite ? { animation: 'favorite-pulse 0.3s ease-out' } : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 px-1 sm:px-6">
        <FichaAbas abas={ABAS_FICHA} ativa={aba} onChange={setAba} idBase={idBase} />
      </div>

      {ABAS_FICHA.map(definicao => {
        // A legenda fica logo antes do primeiro grupo de notas de 1 a 5, perto do que ela explica.
        const primeiroGrupoDeEscalas = definicao.grupos.find(grupo => grupo.layout === 'escalas');
        return (
          <div
            key={definicao.id}
            role="tabpanel"
            id={`${idBase}-painel-${definicao.id}`}
            aria-labelledby={`${idBase}-aba-${definicao.id}`}
            hidden={definicao.id !== aba}
            className="flex flex-col gap-5 px-4 pb-6 pt-[18px] sm:px-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">{definicao.titulo}</h3>
              <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{definicao.descricao}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{contagemDaAba(definicao, displayArvore, provenance)}</p>
            </div>

            {definicao.grupos.map(grupo => (
              <Fragment key={grupo.titulo}>
                {grupo === primeiroGrupoDeEscalas && <LegendaNiveis />}
                <Grupo grupo={grupo} arvore={displayArvore} provenance={provenance} disponivel={disponivel} />
              </Fragment>
            ))}

            {definicao.id === 'crescimento' && (
              <PainelCrescimento arvore={displayArvore} provenance={provenance} disponivel={disponivel} />
            )}

            {definicao.id === 'geral' && (
              <ResumoOrigem contagem={contarOrigens(displayArvore, provenance, disponivel)} />
            )}
          </div>
        );
      })}
    </Modal>
  );
}
