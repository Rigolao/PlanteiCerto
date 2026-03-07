import { useState } from 'react';
import { Popup } from 'react-leaflet';
import type { LatLng } from 'leaflet';
import type { Arvore } from '../../types/tree';

interface TreeSelectionPopupProps {
  position: LatLng;
  trees: Arvore[];
  onSelect: (treeId: number, lat: number, lng: number, observacao: string) => void;
  onClose: () => void;
}

export function TreeSelectionPopup({ position, trees, onSelect, onClose }: TreeSelectionPopupProps) {
  const [observacao, setObservacao] = useState('');

  const handleSelect = (treeId: number) => {
    onSelect(treeId, position.lat, position.lng, observacao);
    setObservacao('');
    onClose();
  };

  return (
    <Popup
      position={position}
      maxWidth={250}
      eventHandlers={{ remove: onClose }}
    >
      <div className="popup-selecao">
        <h4>Escolha a árvore:</h4>
        {trees.map(a => (
          <button
            key={a.id}
            className="popup-arvore-btn"
            onClick={() => handleSelect(a.id)}
          >
            {a.nomePopular} (Calçada: {a.atributos.compatibilidade.nota}/5)
          </button>
        ))}
        <input
          type="text"
          className="popup-obs-input"
          placeholder="Observação (opcional)"
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
        />
      </div>
    </Popup>
  );
}
