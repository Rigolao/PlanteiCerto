import { useCallback, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { Projeto, Ponto, PontoPendente } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { TreeMarker } from './TreeMarker';
import { MapClickHandler } from './MapClickHandler';
import { MapSearchBox } from './MapSearchBox';
import { MyLocationButton } from './MyLocationButton';
import MarkerClusterGroup from 'react-leaflet-cluster';

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
  pendingPoints: PontoPendente[];
  trees: Arvore[];
  onAddPendingPoint: (lat: number, lng: number) => void;
  onUpdateMapCenter: (projectId: string, lat: number, lng: number, zoom: number) => Promise<void>;
  selectedPointId?: string | null;
  onSelectPoint?: (id: string | null) => void;
}

export function ProjectMap({ project, points, pendingPoints, trees, onAddPendingPoint, onUpdateMapCenter, selectedPointId, onSelectPoint }: ProjectMapProps) {
  
  const handleMapClick = useCallback((latlng: LatLng) => {
    onAddPendingPoint(latlng.lat, latlng.lng);
  }, [onAddPendingPoint]);

  const handleMoveEnd = useCallback((lat: number, lng: number, zoom: number) => {
    onUpdateMapCenter(project.id, lat, lng, zoom);
  }, [project.id, onUpdateMapCenter]);

  return (
    <div className="relative">
      <MapContainer
        center={[project.centro_lat, project.centro_lng]}
        zoom={project.centro_zoom}
        style={{ height: '450px', width: '100%' }}
      >
        {/* Barra Flutuante de Pesquisa de Endereço */}
        <MapSearchBox />
        <MyLocationButton />

        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          crossOrigin="anonymous"
        />

        {/* Layer opcional para adicionar nomes de ruas/labels sobre o satélite */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          opacity={0.7}
          crossOrigin="anonymous"
        />

        <MapClickHandler onClick={handleMapClick} onMoveEnd={handleMoveEnd} />

        {selectedPointId && (
          <style>{`
            .marker-ponto-${selectedPointId} .marker-pin-head {
              background: #3b82f6 !important;
              border-color: white !important;
              transform: scale(1.15) translateY(-2px);
              box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5) !important;
            }
            .marker-ponto-${selectedPointId} .marker-pin-tail {
              border-top-color: #3b82f6 !important;
              transform: scale(1.15) translateY(-2px);
              transform-origin: top;
            }
            .marker-ponto-${selectedPointId} {
              z-index: 1000 !important;
            }
          `}</style>
        )}

        {useMemo(() => (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
          >
            {points.map(p => (
              <TreeMarker
                key={p.id}
                ponto={p}
                arvore={trees.find(a => a.id === p.tree_id)}
                onClick={() => onSelectPoint?.(p.id)}
              />
            ))}

            {pendingPoints.map(p => {
              // Mock a Ponto and Arvore for TreeMarker so we get a greyed out or temporary pin
              const tempPonto: Ponto = { ...p, project_id: project.id, tree_id: 0, observacao: 'Pendente' };
              return (
                <TreeMarker
                  key={p.id}
                  ponto={tempPonto}
                  arvore={undefined}
                  onClick={() => onSelectPoint?.(p.id)}
                />
              );
            })}
          </MarkerClusterGroup>
        ), [points, pendingPoints, trees, project.id, onSelectPoint])}

      {/* Auto fit bounds based on verified points */}
      <MapBoundsFitter points={points} />
    </MapContainer>
    </div>
  );
}
