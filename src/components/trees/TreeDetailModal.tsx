import { useRef } from 'react';
import type { Arvore } from '../../types/tree';
import { Modal } from '../ui/Modal';

interface TreeDetailModalProps {
  arvore: Arvore | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TreeDetailModal({ arvore, isOpen, onClose }: TreeDetailModalProps) {
  const lastArvore = useRef<Arvore | null>(null);
  if (arvore) lastArvore.current = arvore;

  const displayArvore = lastArvore.current;
  if (!displayArvore) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <img
        src={displayArvore.imagem}
        alt={displayArvore.taxonomia.nomeComum}
        className="w-full h-64 object-cover rounded-t-2xl"
      />
      <div className="p-6 md:p-8">
        <h2 className="text-primary text-2xl font-bold mb-0.5 font-display">{displayArvore.taxonomia.nomeComum}</h2>
        <p className="text-muted-foreground italic mb-5">{displayArvore.taxonomia.nomeBotanico}</p>
        <p className="text-foreground leading-relaxed mb-6 text-[15px]">{displayArvore.descricao}</p>

        {/* Info Cards */}
        <div className="bg-background rounded-xl p-5 mb-6 space-y-3 border border-border">
          <div className="flex items-center gap-3">
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <polyline points="6 10 12 4 18 10"></polyline>
            </svg>
            <p className="text-sm text-foreground">
              <strong>Altura Máxima:</strong> {displayArvore.morfologia.altura.maxima.min} a {displayArvore.morfologia.altura.maxima.max}{displayArvore.morfologia.altura.maxima.unidade}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <p className="text-sm text-foreground">
              <strong>Tipo de Raiz:</strong> {displayArvore.morfologia.raizes.tipo} ({displayArvore.morfologia.raizes.agressividade} agressividade)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <polyline points="10 6 4 12 10 18"></polyline>
              <polyline points="14 6 20 12 14 18"></polyline>
            </svg>
            <p className="text-sm text-foreground">
              <strong>Origem:</strong> {displayArvore.taxonomia.origem.join(', ')}
            </p>
          </div>
        </div>

        <h3 className="text-foreground font-bold text-lg mb-4 font-display">Aprofundamento Botânico</h3>
        
        <div className="space-y-4">
          <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
            <h4 className="font-semibold text-green-900 mb-2">Ecologia</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li><strong>Exigência de Luz:</strong> {displayArvore.ecologia.exigenciaLuz}</li>
              <li><strong>Tolerância à Seca:</strong> {displayArvore.ecologia.toleranciaSeca}</li>
              <li><strong>Umidade do Solo:</strong> {displayArvore.ecologia.umidadeSolo}</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">
            <h4 className="font-semibold text-yellow-900 mb-2">Fenologia</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li><strong>Floração:</strong> {displayArvore.fenologia.floracao.cor} ({displayArvore.fenologia.floracao.periodo.join(', ')})</li>
              <li><strong>Folhagem:</strong> {displayArvore.fenologia.folhagem.tipo} ({displayArvore.fenologia.folhagem.formato})</li>
              <li><strong>Frutos:</strong> {displayArvore.fenologia.frutificacao.tipo} ({displayArvore.fenologia.frutificacao.dispersao})</li>
            </ul>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2">Uso no Urbanismo</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Manutenção:</strong> {displayArvore.usoUrbanismo.manutencao}</li>
              <li><strong>Espinhos:</strong> {displayArvore.usoUrbanismo.riscos.espinhos ? 'Sim' : 'Não'}</li>
              <li><strong>Queda de Frutos:</strong> {displayArvore.usoUrbanismo.riscos.quedaFrutos ? 'Problema' : 'Tranquilo'}</li>
              <li><strong>Aves e Abelhas:</strong> {displayArvore.usoUrbanismo.atracaoFauna.aves ? 'Atrai Aves' : 'Não Atrai Aves'}, {displayArvore.usoUrbanismo.atracaoFauna.abelhas ? 'Atrai Abelhas' : 'Indiferente'}</li>
            </ul>
          </div>
        </div>

      </div>
    </Modal>
  );
}
