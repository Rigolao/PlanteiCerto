import { useState, useEffect } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, TreePine } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useTreeUsageCount } from '../../hooks/useAdminTrees';
import type { Arvore } from '../../types/tree';

interface TreeDataTableProps {
  trees: Arvore[];
  searchQuery: string;
  onEdit: (tree: Arvore) => void;
  onDelete: (tree: Arvore) => void;
  onToggleActive: (tree: Arvore) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 15] as const;
const DEFAULT_PAGE_SIZE = 5;

function DeleteConfirmDialog({
  tree,
  onClose,
  onConfirm,
}: {
  tree: Arvore;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { count, isLoading } = useTreeUsageCount(tree.id);

  const message = isLoading
    ? 'Verificando uso nos projetos...'
    : count > 0
      ? `Atenção: Esta árvore está sendo usada em ${count} ${count === 1 ? 'ponto de projeto' : 'pontos de projetos'} de usuários. Ao excluir, esses pontos ficarão sem árvore associada. Esta ação não pode ser desfeita.`
      : 'Esta árvore não está sendo usada em nenhum projeto. A exclusão é permanente.';

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Excluir "${tree.nome_popular}"?`}
      message={message}
    />
  );
}

export function TreeDataTable({ trees, searchQuery, onEdit, onDelete, onToggleActive }: TreeDataTableProps) {
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [treeToDelete, setTreeToDelete] = useState<Arvore | null>(null);

  const filtered = trees.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.nome_popular.toLowerCase().includes(q) ||
      t.nome_cientifico.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(0);
    }
  }, [page, totalPages]);

  const handleConfirmDelete = () => {
    if (treeToDelete) {
      onDelete(treeToDelete);
      setTreeToDelete(null);
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchQuery ? 'Nenhuma árvore encontrada para esta busca.' : 'Nenhuma árvore cadastrada.'}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Foto</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nome Popular</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Nome Científico</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Porte</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Origem</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((tree) => (
              <tr key={tree.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  {tree.foto ? (
                    <img
                      src={tree.foto}
                      alt={tree.nome_popular}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <TreePine size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{tree.nome_popular}</td>
                <td className="px-4 py-3 text-muted-foreground italic hidden md:table-cell">{tree.nome_cientifico}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{tree.porte_altura_classe ?? '—'}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    tree.origem === 'Nativa BR'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {tree.origem}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <label className="inline-flex items-center justify-center cursor-pointer" title={tree.ativa !== false ? 'Desativar visualização' : 'Ativar visualização'}>
                    <input
                      type="checkbox"
                      checked={tree.ativa !== false}
                      onChange={() => onToggleActive(tree)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(tree)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setTreeToDelete(tree)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors bg-transparent border-none cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination — always visible */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Mostrando {page * itemsPerPage + 1}–{Math.min((page + 1) * itemsPerPage, filtered.length)} de {filtered.length}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label htmlFor="page-size" className="text-sm text-muted-foreground">
              Por página:
            </label>
            <select
              id="page-size"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1 rounded-md border border-border text-sm bg-card text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-transparent border-none cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-transparent border-none cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {treeToDelete && (
        <DeleteConfirmDialog
          tree={treeToDelete}
          onClose={() => setTreeToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
