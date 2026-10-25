import { act, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Modal content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Modal content</p>
      </Modal>
    );
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Modal — ciclo de abertura e fechamento', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = '';
  });

  // O painel é o pai do conteúdo; estado de entrada = opacidade 1 e sem deslocamento.
  const panel = () => screen.getByText('Conteúdo').parentElement as HTMLElement;
  const modal = (isOpen: boolean, onClose: () => void = () => {}) => (
    <Modal isOpen={isOpen} onClose={onClose}>
      <p>Conteúdo</p>
    </Modal>
  );

  it('ao abrir, mostra o conteúdo e entra em estado de entrada após os requestAnimationFrame', () => {
    render(modal(true));

    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(panel().style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(panel().style.opacity).toBe('1');
    expect(panel().style.transform).toBe('scale(1) translateY(0)');
  });

  it('ao fechar, continua montado até 300 ms e desmonta depois', () => {
    const { rerender } = render(modal(true));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender(modal(false));

    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(panel().style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
  });

  it('Esc chama onClose', () => {
    const onClose = vi.fn();
    render(modal(true, onClose));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('bloqueia o scroll do body enquanto aberto e restaura ao fechar', () => {
    const { rerender } = render(modal(true));
    expect(document.body.style.overflow).toBe('hidden');

    rerender(modal(false));

    expect(document.body.style.overflow).toBe('');
  });

  it('restaura o scroll do body quando desmontado ainda aberto', () => {
    const { unmount } = render(modal(true));
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });
});
