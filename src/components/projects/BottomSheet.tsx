import { useRef, useCallback, useEffect, useState } from 'react';

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints: (string | number)[];
  activeSnapPoint: string | number | null;
  onSnapPointChange: (point: string | number | null) => void;
}

function resolveSnapPx(snap: string | number | null, containerH: number): number {
  if (snap === null) return 0;
  if (typeof snap === 'string') return parseFloat(snap);
  return snap * containerH;
}

export function BottomSheet({ children, snapPoints, activeSnapPoint, onSnapPointChange }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [dragging, setDragging] = useState(false);

  const getContainerH = useCallback(() => window.innerHeight, []);

  // Sync height when activeSnapPoint changes
  useEffect(() => {
    setCurrentHeight(resolveSnapPx(activeSnapPoint, getContainerH()));
  }, [activeSnapPoint, getContainerH]);

  const snapToNearest = useCallback((h: number) => {
    const containerH = getContainerH();
    const resolved = snapPoints.map(sp => ({ snap: sp, px: resolveSnapPx(sp, containerH) }));
    let closest = resolved[0];
    for (const r of resolved) {
      if (Math.abs(r.px - h) < Math.abs(closest.px - h)) closest = r;
    }
    setCurrentHeight(closest.px);
    onSnapPointChange(closest.snap);
  }, [snapPoints, onSnapPointChange, getContainerH]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStartY.current = touch.clientY;
    dragStartHeight.current = currentHeight;
    setDragging(true);
  }, [currentHeight]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const dy = dragStartY.current - touch.clientY;
    const newH = Math.max(0, Math.min(dragStartHeight.current + dy, getContainerH() * 0.9));
    setCurrentHeight(newH);
  }, [dragging, getContainerH]);

  const handleTouchEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    snapToNearest(currentHeight);
  }, [dragging, currentHeight, snapToNearest]);

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-card rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      style={{
        height: `${currentHeight}px`,
        maxHeight: '90dvh',
        transition: dragging ? 'none' : 'height 0.3s ease-out',
        touchAction: 'none',
      }}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-9 h-1 rounded-full bg-border" />
      </div>
      <div className="overflow-y-auto" style={{ height: `calc(100% - 20px)` }}>
        {children}
      </div>
    </div>
  );
}
