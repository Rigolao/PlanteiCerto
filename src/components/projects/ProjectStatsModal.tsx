import { useMemo } from 'react';
import { Modal } from '../ui/Modal';
import type { Ponto } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { BarChart3, TreeDeciduous, Leaf, Expand, TrendingUp } from 'lucide-react';

interface ProjectStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: Ponto[];
  trees: Arvore[];
}

export function ProjectStatsModal({ isOpen, onClose, points, trees }: ProjectStatsModalProps) {
  const stats = useMemo(() => {
    let nativasCount = 0;
    let exoticasCount = 0;
    let areaCopaTotal = 0;
    
    let pequenoCount = 0;
    let medioCount = 0;
    let grandeCount = 0;

    const especiesUnicas = new Set<number>();

    points.forEach(point => {
      const tree = trees.find(t => t.id === point.tree_id);
      if (!tree) return;

      especiesUnicas.add(tree.id);

      // Origem
      if (tree.origem === 'Nativa BR') nativasCount++;
      else exoticasCount++;

      // Copa (Área do círculo = π * r²)
      if (tree.diametro_copa_adulto_max_m) {
        const raio = tree.diametro_copa_adulto_max_m / 2;
        areaCopaTotal += Math.PI * Math.pow(raio, 2);
      }

      // Porte
      const porte = tree.porte_altura_classe?.toLowerCase() || '';
      if (porte.includes('pequeno')) pequenoCount++;
      else if (porte.includes('médio') || porte.includes('medio')) medioCount++;
      else if (porte.includes('grande')) grandeCount++;
    });

    const total = points.length;
    const nativasPct = total > 0 ? Math.round((nativasCount / total) * 100) : 0;
    const exoticasPct = total > 0 ? Math.round((exoticasCount / total) * 100) : 0;

    return {
      total,
      diversidade: especiesUnicas.size,
      nativasCount,
      exoticasCount,
      nativasPct,
      exoticasPct,
      areaCopaTotal: Math.round(areaCopaTotal), // em m²
      pequenoCount,
      medioCount,
      grandeCount
    };
  }, [points, trees]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground font-display">Dashboard do Projeto</h2>
            <p className="text-muted-foreground text-sm">Resumo do impacto ambiental do seu plantio</p>
          </div>
        </div>

        {stats.total === 0 ? (
          <div className="text-center py-10 bg-muted/30 rounded-2xl border border-dashed">
            <TreeDeciduous className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-foreground font-semibold mb-1">Nenhuma árvore plantada ainda</h3>
            <p className="text-sm text-muted-foreground">Adicione pontos no mapa para ver as estatísticas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5"><TreeDeciduous className="w-3.5 h-3.5"/> Total</span>
                <span className="text-3xl font-bold text-foreground font-display">{stats.total}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">Árvores mapeadas</span>
              </div>
              <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5"/> Espécies</span>
                <span className="text-3xl font-bold text-foreground font-display">{stats.diversidade}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">Tipos diferentes</span>
              </div>
              <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 shadow-sm col-span-2 md:col-span-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Expand className="w-3.5 h-3.5"/> Cobertura</span>
                <span className="text-3xl font-bold text-foreground font-display">{stats.areaCopaTotal}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">m² de copa estimada</span>
              </div>
            </div>

            {/* Nativas vs Exóticas */}
            <div className="bg-card border rounded-2xl p-5 shadow-sm mt-2">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Origem das Espécies
              </h3>
              
              <div className="flex justify-between text-sm mb-2">
                <div>
                  <span className="font-bold text-green-600 dark:text-green-500">{stats.nativasPct}%</span>
                  <span className="text-muted-foreground ml-1">Nativas ({stats.nativasCount})</span>
                </div>
                <div>
                  <span className="text-muted-foreground mr-1">Exóticas ({stats.exoticasCount})</span>
                  <span className="font-bold text-yellow-600 dark:text-yellow-500">{stats.exoticasPct}%</span>
                </div>
              </div>
              
              <div className="w-full h-3 bg-yellow-400 dark:bg-yellow-500/80 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-green-500 dark:bg-green-500 transition-all duration-1000 ease-out"
                  style={{ width: `${stats.nativasPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {stats.nativasPct > 70 
                  ? "Excelente! Você priorizou espécies nativas da região." 
                  : stats.nativasPct > 40 
                  ? "Bom equilíbrio entre nativas e exóticas." 
                  : "Considere aumentar o número de nativas para beneficiar o ecossistema local."}
              </p>
            </div>

            {/* Porte */}
            <div className="bg-card border rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição por Porte</h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm text-foreground font-medium text-right">Pequeno</span>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full" style={{ width: `${stats.total > 0 ? (stats.pequenoCount/stats.total)*100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-sm text-muted-foreground text-right">{stats.pequenoCount}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm text-foreground font-medium text-right">Médio</span>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full" style={{ width: `${stats.total > 0 ? (stats.medioCount/stats.total)*100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-sm text-muted-foreground text-right">{stats.medioCount}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm text-foreground font-medium text-right">Grande</span>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${stats.total > 0 ? (stats.grandeCount/stats.total)*100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-sm text-muted-foreground text-right">{stats.grandeCount}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Action Bottom */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold hover:border-primary/30 transition-colors"
          >
            Fechar Dashboard
          </button>
        </div>
      </div>
    </Modal>
  );
}
