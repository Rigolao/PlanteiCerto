import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getDocument: vi.fn() }));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: mocks.getDocument,
}));

vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: 'worker.js' }));

import { PdfViewer } from './PdfViewer';

function fakePdf(numPages: number) {
  const page = {
    getViewport: () => ({ width: 100, height: 100 }),
    render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
  };
  return { numPages, getPage: () => Promise.resolve(page), cleanup: vi.fn() };
}

// Cada chamada a getDocument devolve uma tarefa cujo carregamento é resolvido manualmente.
function mockDocuments() {
  const resolvers: Array<() => void> = [];
  mocks.getDocument.mockImplementation(() => {
    let resolve!: (pdf: ReturnType<typeof fakePdf>) => void;
    const promise = new Promise<ReturnType<typeof fakePdf>>((r) => {
      resolve = r;
    });
    resolvers.push(() => resolve(fakePdf(3)));
    return { promise, destroy: vi.fn() };
  });
  return resolvers;
}

async function finishLoading(resolve: () => void) {
  await act(async () => {
    resolve();
  });
}

describe('PdfViewer', () => {
  beforeEach(() => {
    mocks.getDocument.mockReset();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      scale: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mostra o estado de carregando até o PDF abrir e depois a paginação', async () => {
    const resolvers = mockDocuments();
    render(<PdfViewer url="a.pdf" />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();

    await finishLoading(resolvers[0]);

    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('trocar a url volta à página 1 e mostra o estado de carregando', async () => {
    const resolvers = mockDocuments();
    const { rerender } = render(<PdfViewer url="a.pdf" />);
    await finishLoading(resolvers[0]);

    fireEvent.click(screen.getByRole('button', { name: '→' }));
    fireEvent.click(screen.getByRole('button', { name: '→' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();

    rerender(<PdfViewer url="b.pdf" />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('3 / 3')).not.toBeInTheDocument();

    await finishLoading(resolvers[1]);

    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
