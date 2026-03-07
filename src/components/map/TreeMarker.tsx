import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Ponto } from '../../types/project';
import type { Arvore } from '../../types/tree';

interface TreeMarkerProps {
  ponto: Ponto;
  arvore: Arvore | undefined;
}

function createTreeIcon(name: string) {
  return L.divIcon({
    className: 'marker-arvore-wrapper',
    html: `<div class="marker-pin">
      <div class="marker-pin-head">🌳 ${name}</div>
      <div class="marker-pin-tail"></div>
    </div>`,
    iconSize: [120, 50],
    iconAnchor: [60, 50],
  });
}

export function TreeMarker({ ponto, arvore }: TreeMarkerProps) {
  if (!arvore) return null;

  const icon = createTreeIcon(arvore.nomePopular);
  const tooltipText = ponto.observacao
    ? `${arvore.nomePopular} - ${ponto.observacao}`
    : arvore.nomePopular;

  return (
    <Marker position={[ponto.lat, ponto.lng]} icon={icon}>
      <Tooltip>{tooltipText}</Tooltip>
    </Marker>
  );
}
