import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface Props {
  url: string;
}

export function PdfViewer({ url }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setCurrentPage(1);
    setNumPages(0);

    const task = pdfjsLib.getDocument({ url });
    task.promise
      .then((pdf) => {
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[PdfViewer] falha ao carregar PDF:', err);
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      task.destroy();
      pdfRef.current?.cleanup();
      pdfRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (!pdfRef.current || !canvasRef.current || !containerRef.current || numPages === 0) return;

    renderTaskRef.current?.cancel();

    pdfRef.current.getPage(currentPage).then((page) => {
      if (!canvasRef.current || !containerRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(containerWidth / viewport.width, containerHeight / viewport.height);
      const scaledViewport = page.getViewport({ scale });

      canvasRef.current.width = Math.floor(scaledViewport.width * dpr);
      canvasRef.current.height = Math.floor(scaledViewport.height * dpr);
      canvasRef.current.style.width = `${scaledViewport.width}px`;
      canvasRef.current.style.height = `${scaledViewport.height}px`;

      const ctx = canvasRef.current.getContext('2d')!;
      ctx.scale(dpr, dpr);
      const renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport, canvas: canvasRef.current });
      renderTaskRef.current = renderTask;
      renderTask.promise.catch(() => {});
    });
  }, [currentPage, numPages]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground text-sm">
        <p>Não foi possível carregar o PDF.</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          Abrir em nova aba
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={containerRef} className="flex-1 overflow-auto bg-muted/30 flex justify-center p-4">
        <canvas ref={canvasRef} className="shadow-sm max-w-full" />
      </div>
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-4 p-3 border-t border-border bg-card text-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded hover:bg-muted disabled:opacity-40 transition-colors"
          >
            ←
          </button>
          <span className="text-muted-foreground">
            {currentPage} / {numPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage === numPages}
            className="px-3 py-1 rounded hover:bg-muted disabled:opacity-40 transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
