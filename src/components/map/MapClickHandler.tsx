import { useMapEvents } from 'react-leaflet';
import type { LatLng } from 'leaflet';

interface MapClickHandlerProps {
  onClick: (latlng: LatLng) => void;
  onMoveEnd: (lat: number, lng: number, zoom: number) => void;
}

export function MapClickHandler({ onClick, onMoveEnd }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
    moveend(e) {
      const map = e.target;
      const center = map.getCenter();
      onMoveEnd(center.lat, center.lng, map.getZoom());
    },
  });

  return null;
}
