import { ReactNode, useEffect } from 'react';

interface ModalProps {
  titulo: string;
  children: ReactNode;
  onFechar: () => void;
}

export default function Modal({ titulo, children, onFechar }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onFechar();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onFechar]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onFechar();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>{titulo}</h2>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

