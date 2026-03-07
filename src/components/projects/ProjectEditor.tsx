import { useRef, useState } from 'react';
import type { Projeto } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { useProjectPoints } from '../../hooks/useProjectPoints';
import { PointsList } from './PointsList';
import { ProjectMap } from '../map/ProjectMap';
import { generateProjectPDF } from '../../lib/pdf';

interface ProjectEditorProps {
  project: Projeto;
  trees: Arvore[];
  onBack: () => void;
  onUpdateMapCenter: (projectId: string, lat: number, lng: number, zoom: number) => Promise<void>;
}

export function ProjectEditor({ project, trees, onBack, onUpdateMapCenter }: ProjectEditorProps) {
  const { points, addPoint, removePoint } = useProjectPoints(project.id);
  const mapRef = useRef<HTMLDivElement>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button
          onClick={onBack}
          className="bg-white text-verde-primario font-bold px-4 py-2 rounded-lg border-2 border-verde-primario cursor-pointer hover:bg-verde-claro transition-colors text-sm"
        >
          ← Voltar
        </button>
        <h2 className="text-verde-primario text-xl font-bold flex-1 text-center">{project.nome}</h2>
        <button
          onClick={handleGeneratePDF}
          disabled={generatingPdf}
          className="bg-terra-escuro text-white font-bold px-4 py-2 rounded-lg border-none cursor-pointer hover:brightness-110 transition-all text-sm disabled:opacity-50"
        >
          {generatingPdf ? '⏳ Gerando...' : '📄 Gerar Relatório PDF'}
        </button>
      </div>

      {/* Instruction */}
      <p className="text-center text-texto-secundario text-sm mb-3">
        Clique no mapa para adicionar uma árvore em um ponto.
      </p>

      {/* Map */}
      <div ref={mapRef}>
        <ProjectMap
          project={project}
          points={points}
          trees={trees}
          onAddPoint={addPoint}
          onUpdateMapCenter={onUpdateMapCenter}
        />
      </div>

      {/* Points List */}
      <PointsList
        points={points}
        trees={trees}
        onRemovePoint={removePoint}
      />
    </div>
  );
}
