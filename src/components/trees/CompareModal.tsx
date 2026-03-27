import { useState, memo } from 'react';
import type { Arvore } from '../../types/tree';
import { Modal } from '../ui/Modal';
import { Droplets, Wind, MoveHorizontal, Ruler, Leaf, Sun, Building2, Home } from 'lucide-react';

interface CompareModalProps {
  trees: Arvore[];
  isOpen: boolean;
  onClose: () => void;
}

// Helper to render check or cross
function CheckText({ value, label }: { value: boolean | null | undefined, label: string }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 ${value ? 'text-green-600 dark:text-green-500 font-medium' : 'text-red-500/80 dark:text-red-400/80'}`}>
      {value ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      )}
      {label}
    </span>
  );
}

// Helper for 1-5 scale rating bar
function ScaleRating({ value }: { value: number | null | undefined }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`h-1.5 w-full rounded-sm ${i <= value ? 'bg-primary' : 'bg-muted'}`} />
      ))}
    </div>
  );
}

export const CompareModal = memo(function CompareModal({ trees, isOpen, onClose }: CompareModalProps) {
  const [activeTab, setActiveTab] = useState<'dimensoes' | 'botanica' | 'tolerancias' | 'urbano'>('dimensoes');

  if (!trees || trees.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl">
      <div className="p-4 md:p-6">
        <div className="mb-4 pb-3 border-b">
          <h2 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
            <MoveHorizontal className="text-primary w-5 h-5" />
            Comparação Lado a Lado
          </h2>
          <p className="text-muted-foreground text-xs">
            Comparando {trees.length} espécie{trees.length > 1 ? 's' : ''}.
          </p>
        </div>

        {/* DESKTOP LAYOUT (Hidden on Mobile) */}
        <div className="hidden md:block w-full overflow-x-auto pb-4">
          <div className="grid gap-3 w-full" style={{ gridTemplateColumns: `repeat(${trees.length}, minmax(${trees.length === 1 ? '100%' : '220px'}, 1fr))` }}>

            {/* Headers (Image & Name) */}
            {trees.map(tree => (
              <div key={`header-${tree.id}`} className="flex flex-col gap-2">
                <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-muted border">
                  {tree.foto ? (
                    <img src={tree.foto} alt={tree.nome_popular} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5 text-primary">
                      <svg width="32" height="32" viewBox="0 0 48 48" fill="none" className="opacity-40">
                        <path d="M24 44V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M24 20C24 20 18 16 14 10C18 8 24 12 24 20Z" fill="currentColor" opacity="0.6"/>
                        <path d="M24 20C24 20 30 16 34 10C30 8 24 12 24 20Z" fill="currentColor" opacity="0.4"/>
                      </svg>
                      <span className="text-xs font-medium opacity-60">Sem foto</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground font-display leading-tight">{tree.nome_popular}</h3>
                  <p className="text-xs text-muted-foreground italic truncate">{tree.nome_cientifico}</p>
                </div>
              </div>
            ))}

            {/* Section: Porte e Dimensões */}
            <div className="col-span-full mt-3 mb-1">
              <h4 className="font-bold text-primary uppercase text-xs tracking-wider flex items-center gap-1.5 opacity-80">
                <Ruler size={14} /> Porte e Dimensões
              </h4>
            </div>
            {trees.map(tree => (
              <div key={`dim-${tree.id}`} className="bg-card border rounded-lg p-3 flex flex-col gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Altura Máxima</span>
                  <span className="font-semibold text-foreground">{tree.altura_adulta_max_m ? `${tree.altura_adulta_max_m}m` : '—'}</span>
                  <span className="text-muted-foreground ml-1">({tree.porte_altura_classe || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Diâmetro da Copa</span>
                  <span className="font-semibold text-foreground">{tree.diametro_copa_adulto_max_m ? `${tree.diametro_copa_adulto_max_m}m` : '—'}</span>
                  <span className="text-muted-foreground ml-1">({tree.copa_classe || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Raízes / Dano à Calçada</span>
                  <span className="font-semibold text-foreground">{tree.potencial_dano_calcada_1a5 ? `${tree.potencial_dano_calcada_1a5}/5 Risco` : '—'}</span>
                  <ScaleRating value={tree.potencial_dano_calcada_1a5} />
                </div>
              </div>
            ))}

            {/* Section: Características */}
            <div className="col-span-full mt-3 mb-1">
              <h4 className="font-bold text-primary uppercase text-xs tracking-wider flex items-center gap-1.5 opacity-80">
                <Leaf size={14} /> Características Botânicas
              </h4>
            </div>
            {trees.map(tree => (
              <div key={`char-${tree.id}`} className="bg-card border rounded-lg p-3 flex flex-col gap-2 text-sm space-y-1">
                <div className="flex justify-between items-center border-b pb-1.5 border-border/50">
                  <span className="text-muted-foreground">Origem</span>
                  <span className="font-semibold text-foreground">{tree.origem === 'Nativa BR' ? <span className="inline-flex items-center gap-1"><Home size={12} /> Nativa</span> : 'Exótica'}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5 border-border/50">
                  <span className="text-muted-foreground">Folhagem</span>
                  <span className="font-semibold text-foreground">{tree.decidua_perenifolia || '—'}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5 border-border/50">
                  <span className="text-muted-foreground">Floração</span>
                  <span className="font-semibold text-foreground truncate max-w-[120px]" title={tree.epoca_floracao || ''}>{tree.epoca_floracao || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Espinhos</span>
                  <span className="font-semibold text-foreground">{tree.presenca_espinhos ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            ))}

            {/* Section: Tolerâncias */}
            <div className="col-span-full mt-3 mb-1">
              <h4 className="font-bold text-primary uppercase text-xs tracking-wider flex items-center gap-1.5 opacity-80">
                <Sun size={14} /> Tolerâncias Climáticas
              </h4>
            </div>
            {trees.map(tree => (
              <div key={`tol-${tree.id}`} className="bg-card border rounded-xl p-4 flex flex-col gap-2.5 text-sm shadow-sm">
                <div>
                  <CheckText value={tree.tolerancia_sol_pleno} label="Sol Pleno" />
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5 flex items-center gap-1"><Droplets className="w-3 h-3"/> Tolerância a Seca (1-5)</span>
                  <span className="font-semibold text-foreground">{tree.tolerancia_seca_1a5 || '—'}</span>
                  <ScaleRating value={tree.tolerancia_seca_1a5} />
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5 flex items-center gap-1"><Wind className="w-3 h-3"/> Ventos Fortes (1-5)</span>
                  <span className="font-semibold text-foreground">{tree.tolerancia_ventos_fortes_1a5 || '—'}</span>
                  <ScaleRating value={tree.tolerancia_ventos_fortes_1a5} />
                </div>
              </div>
            ))}

            {/* Section: Uso Urbano */}
            <div className="col-span-full mt-3 mb-1">
              <h4 className="font-bold text-primary uppercase text-xs tracking-wider flex items-center gap-1.5 opacity-80">
                <Building2 size={14} /> Uso Urbano
              </h4>
            </div>
            {trees.map(tree => (
              <div key={`urb-${tree.id}`} className="bg-card border rounded-lg p-3 flex flex-col gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Compatibilidade com Fiação</span>
                  <span className={`font-semibold inline-flex px-2 py-0.5 rounded-full text-xs ${
                    tree.compat_fiacao === 'C' ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300' :
                    tree.compat_fiacao === 'A' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    tree.compat_fiacao === 'N' ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {tree.compat_fiacao === 'C' ? 'Total' :
                     tree.compat_fiacao === 'A' ? 'Apenas Alta Tensão' :
                     tree.compat_fiacao === 'N' ? 'Incompatível' : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Potencial de Sombra (1-5)</span>
                  <span className="font-semibold text-foreground">{tree.potencial_sombra_1a5 || '—'}</span>
                  <ScaleRating value={tree.potencial_sombra_1a5} />
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Berço Mínimo (m²)</span>
                  <span className="font-semibold text-foreground">{tree.berco_area_min_m2_recomendada || '—'}</span>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* MOBILE LAYOUT (Tabs - Hidden on Desktop) */}
        <div className="block md:hidden">
          {/* Tabs Nav */}
          <div className="flex overflow-x-auto gap-2 pb-3 mb-5 snap-x border-b border-border/50 hide-scrollbar">
            {([
              { id: 'dimensoes' as const, label: 'Dimensões' },
              { id: 'botanica' as const, label: 'Botânica' },
              { id: 'tolerancias' as const, label: 'Tolerâncias' },
              { id: 'urbano' as const, label: 'Uso Urbano' },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 snap-start px-3.5 py-2 text-sm font-semibold rounded-xl border transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="flex flex-col gap-6">
            {trees.map(tree => (
              <div key={`mob-${tree.id}`} className="flex flex-col gap-3">
                {/* Tree Identity */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted border flex items-center justify-center text-xl">
                    {tree.foto ? <img src={tree.foto} alt={tree.nome_popular} className="w-full h-full object-cover" loading="lazy" /> : (
                      <svg width="24" height="24" viewBox="0 0 48 48" fill="none" className="opacity-40">
                        <path d="M24 44V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M24 20C24 20 18 16 14 10C18 8 24 12 24 20Z" fill="currentColor" opacity="0.6"/>
                        <path d="M24 20C24 20 30 16 34 10C30 8 24 12 24 20Z" fill="currentColor" opacity="0.4"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground font-display leading-tight">{tree.nome_popular}</h3>
                    <p className="text-xs text-muted-foreground italic truncate max-w-[200px]">{tree.nome_cientifico}</p>
                  </div>
                </div>

                {/* Tab Specific Attributes */}
                <div className="bg-card border rounded-lg p-3 flex flex-col gap-2 text-sm relative pl-4 border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
                  
                  {activeTab === 'dimensoes' && (
                    <>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-0.5">Altura Máxima</span>
                        <span className="font-semibold text-foreground">{tree.altura_adulta_max_m ? `${tree.altura_adulta_max_m}m` : '—'}</span>
                        <span className="text-muted-foreground ml-1">({tree.porte_altura_classe || 'N/A'})</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-0.5">Diâmetro da Copa</span>
                        <span className="font-semibold text-foreground">{tree.diametro_copa_adulto_max_m ? `${tree.diametro_copa_adulto_max_m}m` : '—'}</span>
                        <span className="text-muted-foreground ml-1">({tree.copa_classe || 'N/A'})</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-0.5">Raízes / Dano à Calçada</span>
                        <span className="font-semibold text-foreground">{tree.potencial_dano_calcada_1a5 ? `${tree.potencial_dano_calcada_1a5}/5 Risco` : '—'}</span>
                        <ScaleRating value={tree.potencial_dano_calcada_1a5} />
                      </div>
                    </>
                  )}

                  {activeTab === 'botanica' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center border-b pb-1.5 border-border/50">
                        <span className="text-muted-foreground">Origem</span>
                        <span className="font-semibold text-foreground">{tree.origem === 'Nativa BR' ? <span className="inline-flex items-center gap-1"><Home size={12} /> Nativa</span> : 'Exótica'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-1.5 border-border/50">
                        <span className="text-muted-foreground">Folhagem</span>
                        <span className="font-semibold text-foreground">{tree.decidua_perenifolia || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-1.5 border-border/50">
                        <span className="text-muted-foreground">Floração</span>
                        <span className="font-semibold text-foreground truncate max-w-[120px]" title={tree.epoca_floracao || ''}>{tree.epoca_floracao || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Espinhos</span>
                        <span className="font-semibold text-foreground">{tree.presenca_espinhos ? 'Sim' : 'Não'}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tolerancias' && (
                    <>
                      <div>
                        <CheckText value={tree.tolerancia_sol_pleno} label="Sol Pleno" />
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-0.5 flex items-center gap-1"><Droplets className="w-3 h-3"/> Tolerância a Seca (1-5)</span>
                        <span className="font-semibold text-foreground">{tree.tolerancia_seca_1a5 || '—'}</span>
                        <ScaleRating value={tree.tolerancia_seca_1a5} />
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-0.5 flex items-center gap-1"><Wind className="w-3 h-3"/> Ventos Fortes (1-5)</span>
                        <span className="font-semibold text-foreground">{tree.tolerancia_ventos_fortes_1a5 || '—'}</span>
                        <ScaleRating value={tree.tolerancia_ventos_fortes_1a5} />
                      </div>
                    </>
                  )}

                  {activeTab === 'urbano' && (
                    <>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-0.5">Compatibilidade com Fiação</span>
                        <span className={`font-semibold inline-flex px-2 py-0.5 rounded-full text-xs ${
                          tree.compat_fiacao === 'C' ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300' :
                          tree.compat_fiacao === 'A' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          tree.compat_fiacao === 'N' ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {tree.compat_fiacao === 'C' ? 'Total' :
                           tree.compat_fiacao === 'A' ? 'Apenas Alta Tensão' :
                           tree.compat_fiacao === 'N' ? 'Incompatível' : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-0.5">Potencial de Sombra (1-5)</span>
                        <span className="font-semibold text-foreground">{tree.potencial_sombra_1a5 || '—'}</span>
                        <ScaleRating value={tree.potencial_sombra_1a5} />
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-0.5">Berço Mínimo (m²)</span>
                        <span className="font-semibold text-foreground">{tree.berco_area_min_m2_recomendada || '—'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Fechar */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
});
