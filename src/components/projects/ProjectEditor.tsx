import { useRef, useState } from 'react';
import type { Projeto, Ponto, PontoPendente } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { useProjectPoints } from '../../hooks/useProjectPoints';
import { PointsList } from './PointsList';
import { ProjectMap } from '../map/ProjectMap';
import { generateProjectPDF } from '../../lib/pdf';
import { TreeSelectionDialog } from './TreeSelectionDialog';

interface ProjectEditorProps {
  project: Projeto;
  trees: Arvore[];
  onBack: () => void;
  onUpdateMapCenter: (projectId: string, lat: number, lng: number, zoom: number) => Promise<void>;
}

export function ProjectEditor({ project, trees, onBack, onUpdateMapCenter }: ProjectEditorProps) {
  const { points, loading: pointsLoading, addPoint, removePoint, updatePoint } = useProjectPoints(project.id);
  const mapRef = useRef<HTMLDivElement>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Pending Points State
  const [pendingPoints, setPendingPoints] = useState<PontoPendente[]>([]);
  
  // Dialog States
  const [pointToLink, setPointToLink] = useState<PontoPendente | null>(null);
  const [pointToEdit, setPointToEdit] = useState<Ponto | null>(null);

  const handleGeneratePDF = async () => {
    if (!mapRef.current) return;
    setGeneratingPdf(true);
    try {
      // Delay para garantir que o mapa terminou de renderizar os tiles
      await new Promise(resolve => setTimeout(resolve, 1000));
      await generateProjectPDF(project, points, trees, mapRef.current);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleBack = () => {
    if (pendingPoints.length > 0) {
      const confirmLeave = window.confirm('Você tem pontos pendentes que não foram salvos. Certeza que deseja sair?');
      if (!confirmLeave) return;
    }
    onBack();
  };

  const handleAddPendingPoint = (lat: number, lng: number) => {
    const newPendingPoint: PontoPendente = {
      id: Math.random().toString(36).substr(2, 9),
      lat,
      lng
    };
    setPendingPoints(prev => [...prev, newPendingPoint]);
  };

  const handleRemovePendingPoint = (id: string) => {
    setPendingPoints(prev => prev.filter(p => p.id !== id));
  };

  const handleLinkOrUpdateTree = async (treeId: number, observacao: string) => {
    // Modo: Criação de um Ponto Pendente
    if (pointToLink) {
      const saved = await addPoint(treeId, pointToLink.lat, pointToLink.lng, observacao);
      if (saved) {
        handleRemovePendingPoint(pointToLink.id);
      } else {
        alert("Houve um erro ao vincular a árvore ao servidor. Tente novamente.");
      }
      setPointToLink(null);
    } 
    // Modo: Edição de um Ponto Existente
    else if (pointToEdit) {
      const updated = await updatePoint(pointToEdit.id, treeId, observacao);
      if (!updated) {
        alert("Houve um erro ao editar a árvore no servidor. Tente novamente.");
      }
      setPointToEdit(null);
    }
  };
  
  const handleCloseDialog = () => {
    setPointToLink(null);
    setPointToEdit(null);
  };

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span className="text-sm font-medium">Voltar</span>
            </button>
            <h2 className="text-foreground text-2xl font-bold font-display">{project.nome}</h2>
          </div>
          
          <button
            onClick={handleGeneratePDF}
            disabled={generatingPdf || pendingPoints.length > 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full border-none cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
            title={pendingPoints.length > 0 ? "Salve os pontos pendentes primeiro." : ""}
          >
            {generatingPdf ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Gerando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Baixar Relatório PDF
              </span>
            )}
          </button>
        </div>

        {/* Instruction */}
        <p className="text-center text-muted-foreground text-sm mb-3">
          Clique no mapa para adicionar pontos na lista, depois vincule-os a árvores.
        </p>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Points List (Left on Desktop, Bottom on Mobile) */}
          <div className="w-full lg:w-1/3 order-2 lg:order-1">
            <PointsList
              points={points}
              loading={pointsLoading}
              pendingPoints={pendingPoints}
              trees={trees}
              onRemovePoint={removePoint}
              onEditPoint={(point) => setPointToEdit(point)}
              onRemovePendingPoint={handleRemovePendingPoint}
              onLinkTree={(point) => setPointToLink(point)}
            />
          </div>

          {/* Map (Right on Desktop, Top on Mobile) */}
          <div className="w-full lg:w-2/3 order-1 lg:order-2" ref={mapRef}>
            <ProjectMap
              project={project}
              points={points}
              pendingPoints={pendingPoints}
              trees={trees}
              onAddPendingPoint={handleAddPendingPoint}
              onUpdateMapCenter={onUpdateMapCenter}
            />
          </div>

        </div>
      </div>

      <TreeSelectionDialog
        isOpen={!!pointToLink || !!pointToEdit}
        trees={trees}
        initialTreeId={pointToEdit?.tree_id}
        initialObservacao={pointToEdit?.observacao}
        onSelect={handleLinkOrUpdateTree}
        onClose={handleCloseDialog}
      />
    </>
  );
}
