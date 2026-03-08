import { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { toast } from 'sonner';
import L from 'leaflet';

export function MyLocationButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      L.DomEvent.disableClickPropagation(buttonRef.current);
      L.DomEvent.disableScrollPropagation(buttonRef.current);
    }
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada pelo seu navegador.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Move o mapa para a localização do usuário com animação
        map.flyTo([latitude, longitude], 18, {
          animate: true,
          duration: 1.5
        });
        setLocating(false);
        toast.success('Localização encontrada!');
      },
      (error) => {
        setLocating(false);
        console.error('Erro de GPS:', error);
        toast.error('Não foi possível obter sua localização. Verifique as permissões de GPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ top: '80px', right: '4px' }}>
      <div className="leaflet-control">
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.preventDefault();
            handleLocate();
          }}
          title="Minha Localização"
          disabled={locating}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border shadow-md text-primary hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
        >
          {locating ? (
            <svg className="animate-spin text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
