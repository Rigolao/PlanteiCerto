import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Projeto, Ponto } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { TreeMarker } from './TreeMarker';
import { MapClickHandler } from './MapClickHandler';
import { TreeSelectionPopup } from './TreeSelectionPopup';

function MapBoundsFitter({ points }: { points: Ponto[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      // Se houver apenas um ponto, centraliza com um zoom adequado
      map.setView([points[0].lat, points[0].lng], 16);
    } else {
      // Se houver múltiplos pontos, cria um bounding box e ajusta o mapa
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, points]);

  return null;
}

interface ProjectMapProps {
  project: Projeto;
  points: Ponto[];
  trees: Arvore[];
  onAddPoint: (treeId: number, lat: number, lng: number, observacao: string) => Promise<unknown>;
  onUpdateMapCenter: (projectId: string, lat: number, lng: number, zoom: number) => Promise<void>;
}

export function ProjectMap({ project, points, trees, onAddPoint, onUpdateMapCenter }: ProjectMapProps) {
  const [popupPosition, setPopupPosition] = useState<LatLng | null>(null);

  const handleMapClick = useCallback((latlng: LatLng) => {
    setPopupPosition(latlng);
  }, []);

  const handleMoveEnd = useCallback((lat: number, lng: number, zoom: number) => {
    onUpdateMapCenter(project.id, lat, lng, zoom);
  }, [project.id, onUpdateMapCenter]);

  const handleSelectTree = useCallback(async (treeId: number, lat: number, lng: number, observacao: string) => {
    await onAddPoint(treeId, lat, lng, observacao);
  }, [onAddPoint]);

  return (
    <MapContainer
      center={[project.centro_lat, project.centro_lng]}
      zoom={project.centro_zoom}
      style={{ height: '450px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onClick={handleMapClick} onMoveEnd={handleMoveEnd} />

      {points.map(p => (
        <TreeMarker
          key={p.id}
          ponto={p}
          arvore={trees.find(a => a.id === p.tree_id)}
        />
      ))}

      {popupPosition && (
        <TreeSelectionPopup
          position={popupPosition}
          trees={trees}
          onSelect={handleSelectTree}
          onClose={() => setPopupPosition(null)}
        />
      )}

      {/* Auto fit bounds based on points */}
      <MapBoundsFitter points={points} />
    </MapContainer>
  );
}
