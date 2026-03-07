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
  if (!arvore) {
    // Renderiza um pino genérico para Ponto Pendente
    const pendingIcon = L.divIcon({
      className: 'marker-arvore-wrapper', // Usa o mesmo wrapper transparente
      html: `<div class="marker-pin" style="background: none; border: none; box-shadow: none;">
        <div class="marker-pin-head" style="background-color: #f59e0b; color: white; border-color: #d97706;">⚠️ Pendente</div>
        <div class="marker-pin-tail" style="border-top-color: #f59e0b; border-bottom: none; border-left: 8px solid transparent; border-right: 8px solid transparent;"></div>
      </div>`,
      iconSize: [120, 50],
      iconAnchor: [60, 50],
    });

    return (
      <Marker position={[ponto.lat, ponto.lng]} icon={pendingIcon}>
        <Tooltip>Ponto Pendente: Vincule uma árvore na lista</Tooltip>
      </Marker>
    );
  }

  const icon = createTreeIcon(arvore.taxonomia.nomeComum);
  const tooltipText = ponto.observacao
    ? `${arvore.taxonomia.nomeComum} - ${ponto.observacao}`
    : arvore.taxonomia.nomeComum;

  return (
    <Marker position={[ponto.lat, ponto.lng]} icon={icon}>
      <Tooltip>{tooltipText}</Tooltip>
    </Marker>
  );
}
