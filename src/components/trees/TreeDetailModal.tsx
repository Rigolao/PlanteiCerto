import { useRef } from 'react';
import type { Arvore } from '../../types/tree';
import { Modal } from '../ui/Modal';

interface TreeDetailModalProps {
  arvore: Arvore | null;
  isOpen: boolean;
  onClose: () => void;
}

function compatFiacaoLabel(v: 'N' | 'A' | 'C' | null): string {
  if (v === 'N') return 'Incompatível';
  if (v === 'A') return 'Compatível c/ Alta Tensão';
  if (v === 'C') return 'Compatível';
  return '—';
}

export function TreeDetailModal({ arvore, isOpen, onClose }: TreeDetailModalProps) {
  const lastArvore = useRef<Arvore | null>(null);
  if (arvore) lastArvore.current = arvore;

  const displayArvore = lastArvore.current;
  if (!displayArvore) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <img
        src={displayArvore.foto ?? ''}
        alt={displayArvore.nome_popular}
        className="w-full h-64 object-cover rounded-t-2xl"
      />
      <div className="p-6 md:p-8">
        <h2 className="text-primary text-2xl font-bold mb-0.5 font-display">{displayArvore.nome_popular}</h2>
        <p className="text-muted-foreground italic mb-5">{displayArvore.nome_cientifico}</p>

        {/* Info Cards */}
        <div className="bg-background rounded-xl p-5 mb-6 space-y-3 border border-border">
          <div className="flex items-center gap-3">
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <polyline points="6 10 12 4 18 10"></polyline>
            </svg>
            <p className="text-sm text-foreground">
              <strong>Altura Máxima:</strong> {displayArvore.altura_adulta_max_m ? `${displayArvore.altura_adulta_max_m}m` : '—'} ({displayArvore.porte_altura_classe ?? '—'})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <p className="text-sm text-foreground">
              <strong>Diâmetro da Copa:</strong> {displayArvore.diametro_copa_adulto_max_m ? `${displayArvore.diametro_copa_adulto_max_m}m` : '—'} ({displayArvore.copa_classe ?? '—'})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <polyline points="10 6 4 12 10 18"></polyline>
              <polyline points="14 6 20 12 14 18"></polyline>
            </svg>
            <p className="text-sm text-foreground">
              <strong>Origem:</strong> {displayArvore.origem}
            </p>
          </div>
        </div>

        <h3 className="text-foreground font-bold text-lg mb-4 font-display">Características Botânicas</h3>

        <div className="space-y-4">
          <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
            <h4 className="font-semibold text-purple-900 mb-2">Morfologia</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li><strong>Forma da Copa:</strong> {displayArvore.forma_copa ?? '—'}</li>
              <li><strong>DAP (Diâmetro):</strong> {displayArvore.dap_adulto_max_cm ? `${displayArvore.dap_adulto_max_cm}cm` : '—'}</li>
              <li><strong>Altura da 1ª Bifurcação:</strong> {displayArvore.altura_primeira_bifurcacao_m ?? '—'}</li>
            </ul>
          </div>

          <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
            <h4 className="font-semibold text-green-900 mb-2">Tolerâncias Ecológicas (1-5 escala)</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li><strong>Sol Pleno:</strong> {displayArvore.tolerancia_sol_pleno ? '✓' : '✗'}</li>
              <li><strong>Meia Sombra:</strong> {displayArvore.tolerancia_meia_sombra ? '✓' : '✗'}</li>
              <li><strong>Sombra:</strong> {displayArvore.tolerancia_sombra ? '✓' : '✗'}</li>
              <li><strong>Seca:</strong> {displayArvore.tolerancia_seca_1a5 ?? '—'}/5</li>
              <li><strong>Encharcamento:</strong> {displayArvore.tolerancia_encharcamento_1a5 ?? '—'}/5</li>
              <li><strong>Poluição Atmosférica:</strong> {displayArvore.tolerancia_poluicao_atmosferica_1a5 ?? '—'}/5</li>
              <li><strong>Compactação do Solo:</strong> {displayArvore.tolerancia_compactacao_solo_1a5 ?? '—'}/5</li>
              <li><strong>Ventos Fortes:</strong> {displayArvore.tolerancia_ventos_fortes_1a5 ?? '—'}/5</li>
            </ul>
          </div>

          <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">
            <h4 className="font-semibold text-yellow-900 mb-2">Fenologia</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li><strong>Folhagem:</strong> {displayArvore.decidua_perenifolia ?? '—'}</li>
              <li><strong>Floração:</strong> {displayArvore.epoca_floracao ?? '—'}</li>
              <li><strong>Frutificação:</strong> {displayArvore.epoca_frutificacao ?? '—'}</li>
            </ul>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2">Urbanismo & Manutenção</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Compatibilidade c/ Fiação:</strong> {compatFiacaoLabel(displayArvore.compat_fiacao)}</li>
              <li><strong>Potencial Dano à Calçada (1-5):</strong> {displayArvore.potencial_dano_calcada_1a5 ?? '—'}</li>
              <li><strong>Faixa de Serviço Mín. Recomendada:</strong> {displayArvore.faixa_serv_min_m_recomendada ? `${displayArvore.faixa_serv_min_m_recomendada}m` : '—'}</li>
              <li><strong>Berço Mín. Recomendado:</strong> {displayArvore.berco_area_min_m2_recomendada ? `${displayArvore.berco_area_min_m2_recomendada}m²` : '—'}</li>
              <li><strong>Volume de Solo Mín. Recomendado:</strong> {displayArvore.volume_solo_min_m3_recomendado ? `${displayArvore.volume_solo_min_m3_recomendado}m³` : '—'}</li>
              <li><strong>Presença de Espinhos:</strong> {displayArvore.presenca_espinhos ? 'Sim' : 'Não'}</li>
              <li><strong>Potencial Sujeira (1-5):</strong> {displayArvore.potencial_sujeira_1a5 ?? '—'}</li>
            </ul>
          </div>
        </div>

      </div>
    </Modal>
  );
}
