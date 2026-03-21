import { useState } from 'react';
import { Plus, TreePine } from 'lucide-react';
import { useTrees } from '../hooks/useTrees';
import { useDeleteTree } from '../hooks/useAdminTrees';
import { TreeDataTable } from '../components/admin/TreeDataTable';
import { TreeFormModal } from '../components/admin/TreeFormModal';
import { SearchInput } from '../components/ui/SearchInput';
import type { Arvore } from '../types/tree';

export function AdminTreesPage() {
  const { trees, loading } = useTrees();
  const deleteTree = useDeleteTree();
  const [search, setSearch] = useState('');
  const [editingTree, setEditingTree] = useState<Arvore | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (tree: Arvore) => {
    setEditingTree(tree);
    setShowForm(true);
  };

  const handleDelete = (tree: Arvore) => {
    deleteTree.mutate(tree.id);
  };

  const handleCreate = () => {
    setEditingTree(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTree(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground animate-pulse">Carregando árvores...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TreePine size={28} className="text-primary" />
            Gerenciar Árvores
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {trees.length} {trees.length === 1 ? 'árvore cadastrada' : 'árvores cadastradas'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={18} />
          Cadastrar Nova Árvore
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome popular ou científico..."
        />
      </div>

      {/* Data Table */}
      <TreeDataTable
        trees={trees}
        searchQuery={search}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <TreeFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        tree={editingTree}
      />
    </div>
  );
}
