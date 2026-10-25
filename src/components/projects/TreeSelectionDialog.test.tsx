import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TreeSelectionDialog } from './TreeSelectionDialog';
import { staticTrees } from '../../data/trees';
import type { Arvore } from '../../types/tree';

const trees: Arvore[] = [
  { ...staticTrees[0], id: 1, nome_popular: 'Ipê Amarelo', nome_cientifico: 'Handroanthus albus', foto: null },
  { ...staticTrees[0], id: 2, nome_popular: 'Pau-brasil', nome_cientifico: 'Paubrasilia echinata', foto: null },
];

const BUSCA = 'Buscar por nome ou espécie...';
const OBSERVACAO = 'Comentário sobre esta muda ou local...';

interface Props {
  isOpen: boolean;
  initialTreeId?: number | null;
  initialObservacao?: string;
}

function dialog({ isOpen, initialTreeId, initialObservacao }: Props) {
  return (
    <TreeSelectionDialog
      isOpen={isOpen}
      trees={trees}
      initialTreeId={initialTreeId}
      initialObservacao={initialObservacao}
      onSelect={() => {}}
      onClose={() => {}}
    />
  );
}

describe('TreeSelectionDialog', () => {
  // jsdom não implementa scrollIntoView, usado ao destacar opções da lista
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });


  it('ao abrir, mostra a árvore e a observação iniciais, com a busca vazia', () => {
    render(dialog({ isOpen: true, initialTreeId: 1, initialObservacao: 'Perto do poste' }));

    expect(screen.getByText('Ipê Amarelo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(OBSERVACAO)).toHaveValue('Perto do poste');
    expect(screen.getByPlaceholderText(BUSCA)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Confirmar Seleção' })).toBeEnabled();
  });

  it('sem árvore inicial, não há seleção e confirmar fica desabilitado', () => {
    render(dialog({ isOpen: true }));

    expect(screen.queryByText('Ipê Amarelo')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(OBSERVACAO)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Confirmar Seleção' })).toBeDisabled();
  });

  it('reabrir reseta busca, seleção e observação para os valores iniciais', async () => {
    const user = userEvent.setup();
    const { rerender } = render(dialog({ isOpen: true, initialTreeId: 1, initialObservacao: 'Perto do poste' }));

    // Troca a seleção, altera a observação e deixa um termo de busca pendente
    await user.type(screen.getByPlaceholderText(BUSCA), 'pau');
    await user.click(screen.getByRole('option', { name: /Pau-brasil/ }));
    await user.clear(screen.getByPlaceholderText(OBSERVACAO));
    await user.type(screen.getByPlaceholderText(OBSERVACAO), 'Outra anotação');
    await user.type(screen.getByPlaceholderText(BUSCA), 'xyz');

    expect(screen.getByText('Pau-brasil')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma árvore encontrada')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(BUSCA)).toHaveValue('xyz');

    rerender(dialog({ isOpen: false, initialTreeId: 1, initialObservacao: 'Perto do poste' }));
    rerender(dialog({ isOpen: true, initialTreeId: 1, initialObservacao: 'Perto do poste' }));

    expect(screen.getByPlaceholderText(BUSCA)).toHaveValue('');
    expect(screen.getByText('Ipê Amarelo')).toBeInTheDocument();
    expect(screen.queryByText('Pau-brasil')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(OBSERVACAO)).toHaveValue('Perto do poste');
  });

  it('reabrir sem valores iniciais limpa a seleção e a observação anteriores', async () => {
    const user = userEvent.setup();
    const { rerender } = render(dialog({ isOpen: true }));

    await user.type(screen.getByPlaceholderText(BUSCA), 'pau');
    await user.click(screen.getByRole('option', { name: /Pau-brasil/ }));
    await user.type(screen.getByPlaceholderText(OBSERVACAO), 'Rascunho');
    expect(screen.getByRole('button', { name: 'Confirmar Seleção' })).toBeEnabled();

    rerender(dialog({ isOpen: false }));
    rerender(dialog({ isOpen: true }));

    expect(screen.queryByText('Pau-brasil')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(OBSERVACAO)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Confirmar Seleção' })).toBeDisabled();
  });
});
