import { useEffect, useState, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  centered?: boolean;
}

export function Modal({ isOpen, onClose, children, maxWidth = 'max-w-2xl', centered = false }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      setVisible(true);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Dispara a animação de entrada no próximo frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      // Aguarda a animação de saída antes de desmontar
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!visible) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className={`fixed inset-0 z-[10000] flex justify-center overflow-y-auto p-4 md:p-8 ${centered ? 'items-center' : 'items-start'}`}
      style={{
        backgroundColor: animating ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        backdropFilter: animating ? 'blur(6px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <div
        className={`bg-card rounded-2xl shadow-2xl w-full ${maxWidth} my-6 relative overflow-hidden`}
        style={{
          opacity: animating ? 1 : 0,
          transform: animating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(24px)',
          transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 cursor-pointer border-none z-10 text-lg transition-colors"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
