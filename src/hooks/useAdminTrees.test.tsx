import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUpdateTree } from './useAdminTrees';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from },
}));

vi.mock('sonner', () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { invalidate, Wrapper };
}

describe('useUpdateTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue({ update: mocks.update });
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.single.mockResolvedValue({ data: { id: 7 }, error: null });
  });

  it('refreshes the catalog, the quality report and the provenance of the edited tree', async () => {
    const { invalidate, Wrapper } = setup();
    const { result } = renderHook(() => useUpdateTree(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 7, altura_adulta_max_m: 20 });
    });

    expect(mocks.update).toHaveBeenCalledWith({ altura_adulta_max_m: 20 });
    expect(mocks.eq).toHaveBeenCalledWith('id', 7);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['trees'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['admin-tree-quality'] });
    // "Valor alterado após o registro da fonte" não pode esperar o staleTime de 15 minutos.
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tree-provenance', 7] });
  });

  it('does not invalidate the provenance of other trees', async () => {
    const { invalidate, Wrapper } = setup();
    const { result } = renderHook(() => useUpdateTree(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 7, nome_popular: 'Ipê' });
    });

    const provenanceKeys = invalidate.mock.calls
      .map(([filters]) => filters?.queryKey)
      .filter((key) => key?.[0] === 'tree-provenance');
    expect(provenanceKeys).toEqual([['tree-provenance', 7]]);
  });

  it('invalidates nothing when the update fails', async () => {
    mocks.single.mockResolvedValue({ data: null, error: new Error('permissão negada') });
    const { invalidate, Wrapper } = setup();
    const { result } = renderHook(() => useUpdateTree(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 7, nome_popular: 'Ipê' }).catch(() => undefined);
    });

    await waitFor(() => expect(mocks.toastError).toHaveBeenCalled());
    expect(invalidate).not.toHaveBeenCalled();
  });
});
