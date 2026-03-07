interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-texto-secundario text-lg col-span-full">
      {message}
    </div>
  );
}
