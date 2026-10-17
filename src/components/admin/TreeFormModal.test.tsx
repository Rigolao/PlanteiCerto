import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { TreeFormModal } from './TreeFormModal';
import { staticTrees } from '../../data/trees';
import type { Arvore } from '../../types/tree';

const mocks = vi.hoisted(() => ({
  updateMutate: vi.fn(),
  createMutate: vi.fn(),
}));

vi.mock('../../hooks/useAdminTrees', () => ({
  useCreateTree: () => ({ mutate: mocks.createMutate, isPending: false }),
  useUpdateTree: () => ({ mutate: mocks.updateMutate, isPending: false }),
  useUploadTreeImage: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const PLACEHOLDER_BIFURCACAO = 'Ex: 2,0 - 3,0';

async function abrirMorfologia(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Morfologia' }));
  return screen.getByPlaceholderText(PLACEHOLDER_BIFURCACAO);
}

describe('TreeFormModal first fork', () => {
  beforeEach(() => {
    mocks.updateMutate.mockReset();
    mocks.createMutate.mockReset();
  });

  it('keeps a range typed as text instead of converting it to NaN', async () => {
    const user = userEvent.setup();
    const tree: Arvore = { ...staticTrees[0], altura_primeira_bifurcacao_m: '0,5 - 1,0' };
    render(<TreeFormModal isOpen onClose={vi.fn()} tree={tree} />);

    const campo = await abrirMorfologia(user);
    expect(campo).toHaveValue('0,5 - 1,0');

    await user.clear(campo);
    await user.type(campo, '1,5 - 2,5');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mocks.updateMutate).toHaveBeenCalledTimes(1));
    expect(mocks.updateMutate.mock.calls[0][0]).toMatchObject({
      id: tree.id,
      altura_primeira_bifurcacao_m: '1,5 - 2,5',
    });
  });

  it('saves a cleared field as NULL, not as an empty string', async () => {
    const user = userEvent.setup();
    const tree: Arvore = { ...staticTrees[0], altura_primeira_bifurcacao_m: '0,5 - 1,0' };
    render(<TreeFormModal isOpen onClose={vi.fn()} tree={tree} />);

    const campo = await abrirMorfologia(user);
    await user.clear(campo);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mocks.updateMutate).toHaveBeenCalledTimes(1));
    expect(mocks.updateMutate.mock.calls[0][0].altura_primeira_bifurcacao_m).toBeNull();
  });
});
