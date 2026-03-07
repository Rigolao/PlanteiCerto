import { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export function MapSearchBox() {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Evita que cliques na barra de pesquisa afetem o mapa por trás (criando pontos acidentalmente)
  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const txt = query.trim();
    if (!txt) return;

    setLoading(true);
    setError('');

    try {
      // Se for um CEP válido (com ou sem traço)
      const isCep = /^\d{5}-?\d{3}$/.test(txt);
      
      if (isCep) {
        const cleanCep = txt.replace('-', '');
        const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
        
        if (brasilApiRes.ok) {
          const cepData = await brasilApiRes.json();
          
          // Se houver coordenadas exatas na BrasilAPI, usa direto
          if (cepData.location?.coordinates?.latitude && cepData.location?.coordinates?.longitude) {
            map.flyTo([cepData.location.coordinates.latitude, cepData.location.coordinates.longitude], 17, { animate: true, duration: 1.5 });
            setQuery('');
            setLoading(false);
            return;
          }
          
          // Busca estruturada no Nominatim com campos separados (muito mais preciso)
          const params = new URLSearchParams({
            format: 'json',
            countrycodes: 'br',
            limit: '1',
            'accept-language': 'pt-BR',
          });
          if (cepData.city) params.append('city', cepData.city);
          if (cepData.state) params.append('state', cepData.state);
          // Usa só o nome da rua sem número para melhor resultado
          if (cepData.street) {
            const streetName = cepData.street.replace(/\s+\d+$/, '').trim();
            params.append('street', streetName);
          }

          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
          const geoData = await geoRes.json();

          if (geoData && geoData.length > 0) {
            const { lat, lon } = geoData[0];
            map.flyTo([parseFloat(lat), parseFloat(lon)], 17, { animate: true, duration: 1.5 });
            setQuery('');
            setLoading(false);
            return;
          }

          // Fallback: tenta buscar só a cidade/estado
          if (cepData.city && cepData.state) {
            const cityParams = new URLSearchParams({ format: 'json', countrycodes: 'br', limit: '1', city: cepData.city, state: cepData.state });
            const cityRes = await fetch(`https://nominatim.openstreetmap.org/search?${cityParams.toString()}`);
            const cityData = await cityRes.json();
            if (cityData && cityData.length > 0) {
              map.flyTo([parseFloat(cityData[0].lat), parseFloat(cityData[0].lon)], 13, { animate: true, duration: 1.5 });
              setQuery('');
              setLoading(false);
              return;
            }
          }
        }
        
        setError('CEP não encontrado');
        setLoading(false);
        return;
      }

      // Para buscas por texto livre (nome de rua, cidade, etc.)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(txt)}&limit=1&countrycodes=br`,
        { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        // Voa até o destino com um zoom próximo e animação
        map.flyTo([parseFloat(lat), parseFloat(lon)], 17, {
          animate: true,
          duration: 1.5
        });
        setQuery(''); // Limpa o input após achar
      } else {
        setError('Localização exata não encontrada');
      }
    } catch (err) {
      console.error('Erro na busca de endereço:', err);
      setError('Erro ao buscar o local');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4"
    >
      <form 
        onSubmit={handleSearch}
        className="relative flex items-center bg-card/95 backdrop-blur-sm rounded-full shadow-xl border border-primary/30 overflow-hidden focus-within:ring-2 focus-within:ring-ring/50 transition-all duration-300 p-1"
      >
        <div className="pl-4 pr-2 text-primary/60 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar endereço, CEP ou cidade..."
          className="flex-1 px-2 py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 font-medium"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/90 transition-all focus:outline-none disabled:bg-secondary active:scale-95 disabled:active:scale-100"
          title="Buscar Local"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          )}
        </button>
      </form>
      {error && (
        <div className="mt-2 bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-center shadow-md font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
