import { useRef, useState, useEffect } from 'react';
import type { Projeto, Ponto, PontoPendente } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { useProjectPoints } from '../../hooks/useProjectPoints';
import { PointsPanel } from './PointsPanel';
import { BottomSheet } from './BottomSheet';
import { ProjectMap } from '../map/ProjectMap';
import { generateProjectPDF } from '../../lib/pdf';
import { TreeSelectionDialog } from './TreeSelectionDialog';
import { ProjectStatsModal } from './ProjectStatsModal';
import { BarChart3, ArrowLeft, FileText, Loader2 } from 'lucide-react';

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

  const [pendingPoints, setPendingPoints] = useState<PontoPendente[]>([]);
  const [pointToLink, setPointToLink] = useState<PontoPendente | null>(null);
  const [pointToEdit, setPointToEdit] = useState<Ponto | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<string | number | null>('150px');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const speciesCount = new Set(points.map(p => p.tree_id)).size;
  const isDisabled = points.length === 0;

  const handleGeneratePDF = async () => {
    if (!mapRef.current) return;
    setGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1600));
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
    setPendingPoints(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      lat,
      lng
    }]);
  };

  const handleRemovePendingPoint = (id: string) => {
    setPendingPoints(prev => prev.filter(p => p.id !== id));
  };

  const handleLinkOrUpdateTree = async (treeId: number, observacao: string) => {
    if (pointToLink) {
      const saved = await addPoint(treeId, pointToLink.lat, pointToLink.lng, observacao);
      if (saved) {
        handleRemovePendingPoint(pointToLink.id);
      } else {
        alert("Houve um erro ao vincular a árvore ao servidor. Tente novamente.");
      }
      setPointToLink(null);
    } else if (pointToEdit) {
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
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header Bar */}
        <div className="px-1 py-3 border-b border-border flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors bg-transparent cursor-pointer flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h2 className="text-foreground text-[17px] font-bold leading-tight truncate">
                {project.nome}
              </h2>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                {points.length} árvore{points.length !== 1 ? 's' : ''} · {speciesCount} espécie{speciesCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsStatsOpen(true)}
              disabled={isDisabled}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground text-sm font-semibold cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <BarChart3 size={15} className="text-primary" />
              <span className="hidden sm:inline">Estatísticas</span>
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPdf || isDisabled}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nature-dark text-white text-sm font-semibold cursor-pointer hover:bg-nature-dark/90 transition-all border-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generatingPdf ? (
                <><Loader2 size={15} className="animate-spin" /><span className="hidden sm:inline">Gerando...</span></>
              ) : (
                <><FileText size={15} /><span className="hidden sm:inline">Relatório</span></>
              )}
            </button>
          </div>
        </div>

        {/* Desktop: Side-by-side */}
        <div className="hidden lg:flex flex-1 min-h-0">
          {/* Map */}
          <div className="flex-1 min-w-0 relative" ref={mapRef}>
            <div className="h-full">
              <ProjectMap
                project={project}
                points={points}
                pendingPoints={pendingPoints}
                trees={trees}
                selectedPointId={selectedPointId}
                onSelectPoint={setSelectedPointId}
                onAddPendingPoint={handleAddPendingPoint}
                onUpdateMapCenter={onUpdateMapCenter}
                disableClustering={generatingPdf}
              />
            </div>
            {/* Hint overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-nature-dark/80 text-white/90 text-xs px-4 py-2 rounded-lg backdrop-blur-sm z-[20] pointer-events-none">
              Clique no mapa para adicionar um ponto de plantio
            </div>
          </div>
          {/* Panel */}
          <PointsPanel
            className="w-[340px] flex-shrink-0 border-l border-border"
            points={points}
            loading={pointsLoading}
            trees={trees}
            pendingPoints={pendingPoints}
            selectedPointId={selectedPointId}
            onSelectPoint={setSelectedPointId}
            onEditPoint={(point) => setPointToEdit(point)}
            onRemovePoint={removePoint}
            onRemovePendingPoint={handleRemovePendingPoint}
            onLinkTree={(p) => setPointToLink(p)}
          />
        </div>

        {/* Mobile: Map + BottomSheet */}
        <div className="lg:hidden flex-1 min-h-0 relative">
          <div className="h-full" onClick={() => { if (sheetSnap === 0.9) setSheetSnap('150px'); }}>
            <ProjectMap
              project={project}
              points={points}
              pendingPoints={pendingPoints}
              trees={trees}
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              onAddPendingPoint={handleAddPendingPoint}
              onUpdateMapCenter={onUpdateMapCenter}
              disableClustering={generatingPdf}
            />
          </div>
          {/* Hint overlay */}
          <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-nature-dark/80 text-white/90 text-xs px-4 py-2 rounded-lg backdrop-blur-sm z-[20] pointer-events-none">
            Toque para adicionar ponto
          </div>
          {isMobile && (
            <BottomSheet
              snapPoints={['150px', 0.5, 0.9]}
              activeSnapPoint={sheetSnap}
              onSnapPointChange={setSheetSnap}
            >
              <PointsPanel
                points={points}
                loading={pointsLoading}
                trees={trees}
                pendingPoints={pendingPoints}
                selectedPointId={selectedPointId}
                onSelectPoint={setSelectedPointId}
                onEditPoint={(point) => setPointToEdit(point)}
                onRemovePoint={removePoint}
                onRemovePendingPoint={handleRemovePendingPoint}
                onLinkTree={(p) => setPointToLink(p)}
              />
            </BottomSheet>
          )}
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

      <ProjectStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        points={points}
        trees={trees}
      />
    </>
  );
}
