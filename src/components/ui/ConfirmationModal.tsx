import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary'
}: ConfirmationModalProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-destructive text-destructive-foreground hover:brightness-110';
      case 'warning':
        return 'bg-amber-500 text-white hover:bg-amber-600';
      default:
        return 'bg-primary text-primary-foreground hover:brightness-110';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm" centered>
      <div className="p-6 text-center">
        {getIcon()}
        <h3 className="text-xl font-bold text-foreground mb-2 font-display">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors border-none cursor-pointer order-2 sm:order-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all shadow-sm order-1 sm:order-2 ${getVariantStyles()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
