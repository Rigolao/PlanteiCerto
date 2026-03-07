import { useState } from 'react';
import type { Arvore } from '../types/tree';
import { TreeGrid } from '../components/trees/TreeGrid';
import { TreeDetailModal } from '../components/trees/TreeDetailModal';

interface TreesPageProps {
  trees: Arvore[];
}

export function TreesPage({ trees }: TreesPageProps) {
  const [selectedTree, setSelectedTree] = useState<Arvore | null>(null);

  return (
    <>
      <TreeGrid trees={trees} onSelectTree={setSelectedTree} />
      <TreeDetailModal
        arvore={selectedTree}
        isOpen={!!selectedTree}
        onClose={() => setSelectedTree(null)}
      />
    </>
  );
}
