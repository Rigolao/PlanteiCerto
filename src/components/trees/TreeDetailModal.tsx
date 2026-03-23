import { useRef } from 'react';
import type { Arvore } from '../../types/tree';
import { Modal } from '../ui/Modal';
import { Sprout, ShieldCheck, CalendarDays, Building2 } from 'lucide-react';

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
  return '—';
}

function BarIndicator({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-foreground/80">{label}</span>
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
    </div>
  );
}

export function TreeDetailModal({ arvore, isOpen, onClose, isFavorite, onToggleFavorite }: TreeDetailModalProps) {
  const lastArvore = useRef<Arvore | null>(null);
  if (arvore) lastArvore.current = arvore;

  const displayArvore = lastArvore.current;
  if (!displayArvore) return null;

  const toleranceFields: { label: string; value: number | null }[] = [
    { label: 'Seca', value: displayArvore.tolerancia_seca_1a5 },
    { label: 'Encharcamento', value: displayArvore.tolerancia_encharcamento_1a5 },
    { label: 'Poluição Atmosférica', value: displayArvore.tolerancia_poluicao_atmosferica_1a5 },
    { label: 'Compactação do Solo', value: displayArvore.tolerancia_compactacao_solo_1a5 },
    { label: 'Ventos Fortes', value: displayArvore.tolerancia_ventos_fortes_1a5 },
    { label: 'Potencial Sujeira', value: displayArvore.potencial_sujeira_1a5 },
    { label: 'Potencial Dano Calçada', value: displayArvore.potencial_dano_calcada_1a5 },
    { label: 'Atração de Fauna', value: displayArvore.atracao_fauna_1a5 },
    { label: 'Potencial Sombra', value: displayArvore.potencial_sombra_1a5 },
    { label: 'Contribuição Biodiversidade', value: displayArvore.contribuicao_biodiversidade_1a5 },
    { label: 'Tolerância à Poda', value: displayArvore.tolerancia_poda_1a5 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative">
        <img
          src={displayArvore.foto ?? ''}
          alt={displayArvore.nome_popular}
          className="w-full h-64 object-cover rounded-t-2xl"
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
              <div className="text-xs font-semibold text-foreground">{displayArvore.altura_adulta_max_m ? `${displayArvore.altura_adulta_max_m}m` : '—'}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">Copa</div>
              <div className="text-xs font-semibold text-foreground">{displayArvore.diametro_copa_adulto_max_m ? `${displayArvore.diametro_copa_adulto_max_m}m` : '—'} ({displayArvore.copa_classe ?? '—'})</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">Porte</div>
              <div className="text-xs font-semibold text-foreground">{displayArvore.porte_altura_classe ?? '—'}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">Forma da Copa</div>
              <div className="text-xs font-semibold text-foreground">{displayArvore.forma_copa ?? '—'}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">DAP (Diâmetro)</div>
              <div className="text-xs font-semibold text-foreground">{displayArvore.dap_adulto_max_cm ? `${displayArvore.dap_adulto_max_cm}cm` : '—'}</div>
            </div>
            <div className="bg-muted rounded-md px-2 py-1.5">
              <div className="text-[9px] text-muted-foreground">1ª Bifurcação</div>
              <div className="text-xs font-semibold text-foreground">{displayArvore.altura_primeira_bifurcacao_m ?? '—'}</div>
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
            {displayArvore.tolerancia_sol_pleno != null && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-foreground/80">Sol Pleno</span>
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                  {displayArvore.tolerancia_sol_pleno ? 'Sim' : 'Não'}
                </span>
              </div>
            )}
            {displayArvore.tolerancia_meia_sombra != null && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-foreground/80">Meia Sombra</span>
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                  {displayArvore.tolerancia_meia_sombra ? 'Sim' : 'Não'}
                </span>
              </div>
            )}
            {displayArvore.tolerancia_sombra != null && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-foreground/80">Sombra</span>
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                  {displayArvore.tolerancia_sombra ? 'Sim' : 'Não'}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {toleranceFields.map(({ label, value }) =>
              value != null ? <BarIndicator key={label} label={label} value={value} /> : null
            )}
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
              {displayArvore.decidua_perenifolia ?? '—'}
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
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Fiação: {compatFiacaoLabel(displayArvore.compat_fiacao)}
            </span>
            {displayArvore.faixa_serv_min_m_recomendada != null && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                Faixa Serviço Mín: {displayArvore.faixa_serv_min_m_recomendada}m
              </span>
            )}
            {displayArvore.berco_area_min_m2_recomendada != null && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                Berço Mín: {displayArvore.berco_area_min_m2_recomendada}m²
              </span>
            )}
            {displayArvore.volume_solo_min_m3_recomendado != null && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                Vol. Solo Mín: {displayArvore.volume_solo_min_m3_recomendado}m³
              </span>
            )}
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Espinhos: {displayArvore.presenca_espinhos ? 'Sim' : 'Não'}
            </span>
            {displayArvore.presenca_subst_irritantes != null && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                Subst. Irritantes: {displayArvore.presenca_subst_irritantes ? 'Sim' : 'Não'}
              </span>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
}
