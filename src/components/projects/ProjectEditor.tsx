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
  const { points, addPoint, removePoint, updatePoint } = useProjectPoints(project.id);
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
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <button
            onClick={handleBack}
            className="bg-white text-verde-primario font-bold px-4 py-2 rounded-lg border-2 border-verde-primario cursor-pointer hover:bg-verde-claro transition-colors text-sm"
          >
            ← Voltar
          </button>
          <h2 className="text-verde-primario text-xl font-bold flex-1 text-center">{project.nome}</h2>
          <button
            onClick={handleGeneratePDF}
            disabled={generatingPdf || pendingPoints.length > 0}
            className="bg-terra-escuro text-white font-bold px-4 py-2 rounded-lg border-none cursor-pointer hover:brightness-110 transition-all text-sm disabled:opacity-50"
            title={pendingPoints.length > 0 ? "Salve os pontos pendentes primeiro." : ""}
          >
            {generatingPdf ? '⏳ Gerando...' : '📄 Gerar Relatório PDF'}
          </button>
        </div>

        {/* Instruction */}
        <p className="text-center text-texto-secundario text-sm mb-3">
          Clique no mapa para adicionar pontos na lista, depois vincule-os a árvores.
        </p>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Points List (Left on Desktop, Bottom on Mobile) */}
          <div className="w-full lg:w-1/3 order-2 lg:order-1">
            <PointsList
              points={points}
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
