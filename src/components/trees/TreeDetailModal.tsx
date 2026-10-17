import { useState, type ReactNode } from 'react';
import type { Arvore } from '../../types/tree';
import type { ProvenanceMap, ProvenanceRecord } from '../../types/provenance';
import { formatProjection, ROTULO_SEM_DADO } from '../../lib/provenance';
import { formatBifurcacao, formatMedida, formatMedidaClasse, formatTexto } from '../../lib/format';
import { useTreeProvenance } from '../../hooks/useTreeProvenance';
import { Modal } from '../ui/Modal';
import { ProvenanceBadge } from './ProvenanceBadge';
import { TreePhoto } from './TreePhoto';
import { Sprout, ShieldCheck, CalendarDays, Building2, TrendingUp, Info } from 'lucide-react';

interface TreeDetailModalProps {
  arvore: Arvore | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function compatFiacaoLabel(v: 'N' | 'A' | 'C' | null): string {
  if (v === 'N') return 'Incompatível';
  if (v === 'A') return 'Compatível c/ Alta Tensão';
  if (v === 'C') return 'Compatível';
  return ROTULO_SEM_DADO;
}

const CLASSE_BVOC_LABEL: Record<string, string> = {
  baixo: 'Baixa',
  moderado: 'Moderada',
  alto: 'Alta',
  desconhecido: 'Desconhecida',
  indeterminado: 'Indeterminada',
};

// Constantes da planilha de projeção do orientador — iguais para todas as espécies.
const CENARIO_PROJECAO = 'Muda de DAP 3 cm e altura 1,5 m, plantada em boas condições.';

const NOTA_FAIXA_OPERACIONAL = 'Faixa operacional de incerteza; não é intervalo de confiança estatístico.';

const NOTA_LINHA_DE_BASE =
  'A muda inicial (DAP 3 cm, altura 1,5 m) está abaixo da faixa de calibração da equação alométrica '
  + '(DAP ≥ 5 cm); o valor da linha de base é extrapolado.';

function ProjecaoTile({ label, valor, detalhe, calculoEstimado }: {
  label: string;
  valor: string;
  detalhe?: string;
  /** Biomassa, carbono e CO₂e são cálculos a partir de equação alométrica, não medições. */
  calculoEstimado?: boolean;
}) {
  return (
    <div className="bg-muted rounded-md px-2 py-1.5">
      <div className="text-[9px] text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold text-foreground">{valor}</div>
      {detalhe && <div className="text-[9px] text-muted-foreground">{detalhe}</div>}
      {calculoEstimado && (
        <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-1.5 py-px text-[9px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Cálculo estimado
        </span>
      )}
    </div>
  );
}

const HORIZONTES_PROJECAO = [
  {
    label: '10 anos',
    dap: 'dap_10a_cm',
    dapMin: 'dap_10a_min_cm',
    dapMax: 'dap_10a_max_cm',
    altura: 'altura_10a_m',
    alturaMin: 'altura_10a_min_m',
    alturaMax: 'altura_10a_max_m',
  },
  {
    label: '20 anos',
    dap: 'dap_20a_cm',
    dapMin: 'dap_20a_min_cm',
    dapMax: 'dap_20a_max_cm',
    altura: 'altura_20a_m',
    alturaMin: 'altura_20a_min_m',
    alturaMax: 'altura_20a_max_m',
  },
  {
    label: '30 anos',
    dap: 'dap_30a_cm',
    dapMin: 'dap_30a_min_cm',
    dapMax: 'dap_30a_max_cm',
    altura: 'altura_30a_m',
    alturaMin: 'altura_30a_min_m',
    alturaMax: 'altura_30a_max_m',
  },
] as const;

function GrowthProjectionTable({ arvore, provenance }: { arvore: Arvore; provenance: ProvenanceMap }) {
  const hasProjection = HORIZONTES_PROJECAO.some(periodo => [
    arvore[periodo.dap], arvore[periodo.dapMin], arvore[periodo.dapMax],
    arvore[periodo.altura], arvore[periodo.alturaMin], arvore[periodo.alturaMax],
  ].some(value => value != null));

  if (!hasProjection) return null;

  const linhas = [
    {
      rotulo: 'DAP',
      unidade: 'cm',
      campos: HORIZONTES_PROJECAO.map(periodo => ({
        label: periodo.label, valor: periodo.dap, min: periodo.dapMin, max: periodo.dapMax,
      })),
    },
    {
      rotulo: 'Altura',
      unidade: 'm',
      campos: HORIZONTES_PROJECAO.map(periodo => ({
        label: periodo.label, valor: periodo.altura, min: periodo.alturaMin, max: periodo.alturaMax,
      })),
    },
  ].map(linha => ({
    rotulo: linha.rotulo,
    celulas: linha.campos.map(campo => {
      const record = provenance[campo.valor];
      return {
        label: campo.label,
        record,
        semDado: arvore[campo.valor] == null,
        formato: formatProjection(arvore[campo.valor], arvore[campo.min], arvore[campo.max], linha.unidade, record),
      };
    }),
  }));

  const temFaixaOperacional = linhas.some(linha =>
    linha.celulas.some(celula => celula.formato.faixaTipo === 'operacional'));

  return (
    <>
      <table aria-label="Projeção de crescimento" className="w-full table-fixed text-left">
        <caption className="sr-only">DAP e altura projetados para cada horizonte, com faixas quando disponíveis</caption>
        <thead>
          <tr className="text-[9px] text-muted-foreground">
            <th scope="col" className="w-[20%] pb-1 font-medium" />
            {HORIZONTES_PROJECAO.map(periodo => (
              <th key={periodo.label} scope="col" className="pb-1 text-center font-medium">{periodo.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map(linha => (
            <tr key={linha.rotulo}>
              <th scope="row" className="py-1 pr-1 align-top text-[10px] font-medium text-muted-foreground">{linha.rotulo}</th>
              {linha.celulas.map(celula => (
                <td key={celula.label} className="px-0.5 py-1 text-center align-top">
                  <div className={`text-xs font-semibold ${celula.semDado ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {celula.formato.valor}
                  </div>
                  {celula.formato.faixaTipo === 'ponto_publicado' && (
                    <div className="text-[9px] leading-tight text-muted-foreground">ponto publicado</div>
                  )}
                  {celula.formato.faixaTipo === 'operacional' && (
                    <>
                      <div className="text-[9px] leading-tight text-muted-foreground">{celula.formato.faixa}</div>
                      <div className="text-[9px] leading-tight text-muted-foreground">faixa operacional</div>
                    </>
                  )}
                  <ProvenanceBadge record={celula.record} className="mt-0.5 items-center" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {temFaixaOperacional && (
        <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">{NOTA_FAIXA_OPERACIONAL}</p>
      )}
    </>
  );
}

function ProjecaoSection({ arvore, provenance }: { arvore: Arvore; provenance: ProvenanceMap }) {
  const has10YearIndicators = [
    arvore.biomassa_aerea_10a_kg,
    arvore.carbono_armazenado_10a_kg,
    arvore.co2e_10a_kg,
    arvore.co2e_esperado_por_muda_10a_kg,
    arvore.sobrevivencia_10a_pct,
  ].some(value => value != null);
  const hasBvocData = arvore.classe_bvoc != null || arvore.exibir_aviso_bvoc;
  const hasGrowthData = HORIZONTES_PROJECAO.some(periodo => [
    arvore[periodo.dap], arvore[periodo.dapMin], arvore[periodo.dapMax],
    arvore[periodo.altura], arvore[periodo.alturaMin], arvore[periodo.alturaMax],
  ].some(value => value != null));

  if (!hasGrowthData && !has10YearIndicators && !hasBvocData) return null;

  return (
    <div className="py-3 px-3.5 border-b border-border last:border-b-0">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
          Projeções de crescimento
        </span>
      </div>
      <GrowthProjectionTable arvore={arvore} provenance={provenance} />

      {has10YearIndicators && (
        <>
          <div className="mt-3 mb-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Indicadores em 10 anos
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {arvore.biomassa_aerea_10a_kg != null && (
              <ProjecaoTile
                label="Biomassa aérea"
                valor={formatMedida(arvore.biomassa_aerea_10a_kg, 'kg', 1)}
                calculoEstimado
              />
            )}
            {arvore.carbono_armazenado_10a_kg != null && (
              <ProjecaoTile
                label="Carbono armazenado"
                valor={formatMedida(arvore.carbono_armazenado_10a_kg, 'kg', 1)}
                calculoEstimado
              />
            )}
            {arvore.co2e_10a_kg != null && (
              <ProjecaoTile
                label="CO₂ equivalente armazenado na biomassa aérea"
                valor={formatMedida(arvore.co2e_10a_kg, 'kg', 1)}
                detalhe="estoque aos 10 anos; não é remoção anual"
                calculoEstimado
              />
            )}
            {arvore.sobrevivencia_10a_pct != null && (
              <ProjecaoTile
                label="Sobrevivência (cenário)"
                valor={formatMedida(arvore.sobrevivencia_10a_pct, '%', 1)}
                detalhe="premissa do cenário, não taxa publicada da espécie"
              />
            )}
            {arvore.co2e_esperado_por_muda_10a_kg != null && (
              <ProjecaoTile
                label="CO₂e esperado por muda"
                valor={formatMedida(arvore.co2e_esperado_por_muda_10a_kg, 'kg', 1)}
                detalhe="(CO₂e aos 10 anos − CO₂e da muda inicial) × sobrevivência do cenário"
              />
            )}
          </div>
          {arvore.co2e_esperado_por_muda_10a_kg != null && (
            <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">{NOTA_LINHA_DE_BASE}</p>
          )}
        </>
      )}

      {arvore.classe_bvoc && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
            Emissão de BVOC: {CLASSE_BVOC_LABEL[arvore.classe_bvoc] ?? arvore.classe_bvoc}
          </span>
        </div>
      )}

      {arvore.exibir_aviso_bvoc && (
        <div className="flex items-start gap-1.5 mt-2">
          <Info size={11} className="text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-[10px] text-muted-foreground leading-snug">
            Classificação de BVOC com evidência limitada
            {arvore.evidencia_bvoc ? ` (${arvore.evidencia_bvoc})` : ''}
            {arvore.confianca_bvoc ? ` — confiança ${arvore.confianca_bvoc}` : ''}.
          </span>
        </div>
      )}

      {(hasGrowthData || has10YearIndicators) && (
        <p className="text-[10px] text-muted-foreground mt-2 leading-snug">{CENARIO_PROJECAO}</p>
      )}
    </div>
  );
}

function BarIndicator({ label, value, record }: { label: string; value: number | null; record?: ProvenanceRecord }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-foreground/80">{label}</span>
        {value == null ? (
          <span className="text-[11px] text-muted-foreground">{ROTULO_SEM_DADO}</span>
        ) : (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-sm ${
                  i <= value ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <ProvenanceBadge record={record} className="items-end" />
    </div>
  );
}

function LightIndicator({ label, value, record }: { label: string; value: boolean | null; record?: ProvenanceRecord }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-foreground/80">{label}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            value == null ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
          }`}
        >
          {value == null ? ROTULO_SEM_DADO : value ? 'Sim' : 'Não'}
        </span>
      </div>
      <ProvenanceBadge record={record} className="items-end" />
    </div>
  );
}

function AttributeChip({ children, record }: { children: ReactNode; record?: ProvenanceRecord }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">{children}</span>
      <ProvenanceBadge record={record} />
    </div>
  );
}

export function TreeDetailModal({ arvore, isOpen, onClose, isFavorite, onToggleFavorite }: TreeDetailModalProps) {
  const [lastArvore, setLastArvore] = useState<Arvore | null>(arvore);
  if (arvore && arvore !== lastArvore) setLastArvore(arvore);

  const displayArvore = arvore ?? lastArvore;
  // Proveniência só é consultada com a ficha aberta; sem registro (ou sem Supabase) o mapa vem vazio.
  const { provenance } = useTreeProvenance(isOpen && displayArvore ? displayArvore.id : null);
  if (!displayArvore) return null;

  const toleranceFields: { label: string; campo: keyof Arvore; value: number | null }[] = [
    { label: 'Seca', campo: 'tolerancia_seca_1a5', value: displayArvore.tolerancia_seca_1a5 },
    { label: 'Encharcamento', campo: 'tolerancia_encharcamento_1a5', value: displayArvore.tolerancia_encharcamento_1a5 },
    { label: 'Poluição Atmosférica', campo: 'tolerancia_poluicao_atmosferica_1a5', value: displayArvore.tolerancia_poluicao_atmosferica_1a5 },
    { label: 'Compactação do Solo', campo: 'tolerancia_compactacao_solo_1a5', value: displayArvore.tolerancia_compactacao_solo_1a5 },
    { label: 'Ventos Fortes', campo: 'tolerancia_ventos_fortes_1a5', value: displayArvore.tolerancia_ventos_fortes_1a5 },
    { label: 'Potencial Sujeira', campo: 'potencial_sujeira_1a5', value: displayArvore.potencial_sujeira_1a5 },
    { label: 'Potencial Dano Calçada', campo: 'potencial_dano_calcada_1a5', value: displayArvore.potencial_dano_calcada_1a5 },
    { label: 'Atração de Fauna', campo: 'atracao_fauna_1a5', value: displayArvore.atracao_fauna_1a5 },
    { label: 'Potencial Sombra', campo: 'potencial_sombra_1a5', value: displayArvore.potencial_sombra_1a5 },
    { label: 'Contribuição Biodiversidade', campo: 'contribuicao_biodiversidade_1a5', value: displayArvore.contribuicao_biodiversidade_1a5 },
    { label: 'Tolerância à Poda', campo: 'tolerancia_poda_1a5', value: displayArvore.tolerancia_poda_1a5 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative">
        <TreePhoto
          foto={displayArvore.foto}
          alt={displayArvore.nome_popular}
          className="w-full h-64 rounded-t-2xl"
        />
        {/* Favorite Button */}
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
      <div className="p-4 md:p-6">
        <h2 className="text-primary text-xl font-bold mb-0.5 font-display">{displayArvore.nome_popular}</h2>
        <p className="text-muted-foreground italic text-sm mb-3">{displayArvore.nome_cientifico}</p>

        {/* Morfologia */}
        <div className="py-3 px-3.5 border-b border-border last:border-b-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Sprout size={13} className="text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Morfologia
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">Altura adulta</div>
              <div className="text-xs font-semibold text-foreground">{formatMedida(displayArvore.altura_adulta_max_m, 'm')}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">Copa</div>
              <div className="text-xs font-semibold text-foreground">{formatMedidaClasse(displayArvore.diametro_copa_adulto_max_m, 'm', displayArvore.copa_classe)}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">Porte</div>
              <div className="text-xs font-semibold text-foreground">{displayArvore.porte_altura_classe ?? ROTULO_SEM_DADO}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">Forma da Copa</div>
              <div className="text-xs font-semibold text-foreground">{formatTexto(displayArvore.forma_copa)}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">DAP (Diâmetro)</div>
              <div className="text-xs font-semibold text-foreground">{formatMedida(displayArvore.dap_adulto_max_cm, 'cm')}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">1ª Bifurcação</div>
              <div className="text-xs font-semibold text-foreground">
                {formatBifurcacao(displayArvore.altura_primeira_bifurcacao_m ?? displayArvore.altura_primeira_bifurcacao_faixa)}
              </div>
            </div>
          </div>
        </div>

        {/* Tolerâncias Ecológicas */}
        <div className="py-3 px-3.5 border-b border-border last:border-b-0">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck size={13} className="text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Tolerâncias Ecológicas
            </span>
          </div>
          <div className="space-y-1.5 mb-2">
            <LightIndicator label="Sol Pleno" value={displayArvore.tolerancia_sol_pleno} record={provenance.tolerancia_sol_pleno} />
            <LightIndicator label="Meia Sombra" value={displayArvore.tolerancia_meia_sombra} record={provenance.tolerancia_meia_sombra} />
            <LightIndicator label="Sombra" value={displayArvore.tolerancia_sombra} record={provenance.tolerancia_sombra} />
          </div>
          <div className="space-y-1.5">
            {toleranceFields.map(({ label, campo, value }) => (
              <BarIndicator key={label} label={label} value={value} record={provenance[campo]} />
            ))}
          </div>
        </div>

        {/* Fenologia */}
        <div className="py-3 px-3.5 border-b border-border last:border-b-0">
          <div className="flex items-center gap-1.5 mb-2">
            <CalendarDays size={13} className="text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Fenologia
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              {displayArvore.decidua_perenifolia ?? ROTULO_SEM_DADO}
            </span>
            {displayArvore.epoca_floracao && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                Floração: {displayArvore.epoca_floracao}
              </span>
            )}
            {displayArvore.epoca_frutificacao && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                Frutificação: {displayArvore.epoca_frutificacao}
              </span>
            )}
          </div>
        </div>

        {/* Urbanismo & Manutenção */}
        <div className="py-3 px-3.5 border-b border-border last:border-b-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 size={13} className="text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Urbanismo & Manutenção
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <AttributeChip record={provenance.compat_fiacao}>
              Fiação: {compatFiacaoLabel(displayArvore.compat_fiacao)}
            </AttributeChip>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Faixa Serviço Mín: {formatMedida(displayArvore.faixa_serv_min_m_recomendada, 'm')}
            </span>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Berço Mín: {formatMedida(displayArvore.berco_area_min_m2_recomendada, 'm²')}
            </span>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Vol. Solo Mín: {formatMedida(displayArvore.volume_solo_min_m3_recomendado, 'm³')}
            </span>
            <AttributeChip record={provenance.presenca_espinhos}>
              Espinhos: {displayArvore.presenca_espinhos == null
                ? ROTULO_SEM_DADO
                : displayArvore.presenca_espinhos ? 'Sim' : 'Não'}
            </AttributeChip>
            <AttributeChip record={provenance.presenca_subst_irritantes}>
              Subst. Irritantes: {displayArvore.presenca_subst_irritantes == null
                ? ROTULO_SEM_DADO
                : displayArvore.presenca_subst_irritantes ? 'Sim' : 'Não'}
            </AttributeChip>
          </div>
        </div>

        <ProjecaoSection arvore={displayArvore} provenance={provenance} />

      </div>
    </Modal>
  );
}
