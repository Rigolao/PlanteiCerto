import { Drawer } from 'vaul';

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints: (string | number)[];
  activeSnapPoint: string | number | null;
  onSnapPointChange: (point: string | number | null) => void;
}

export function BottomSheet({ children, snapPoints, activeSnapPoint, onSnapPointChange }: BottomSheetProps) {
  return (
    <Drawer.Root
      open
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={onSnapPointChange}
      dismissible={false}
      noBodyStyles
    >
      <Drawer.Content
        className="fixed bottom-0 left-0 right-0 z-40 bg-card rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] outline-none"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        {children}
      </Drawer.Content>
    </Drawer.Root>
  );
}
