import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTreeProvenance } from './useTreeProvenance';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from },
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

function makeWrapper(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const dapRow = {
  campo: 'dap_10a_cm',
  variavel: 'dap',
  idade_anos: 10,
  unidade: 'cm',
  min_operacional: 12.17,
  max_operacional: 12.17,
  origem: 'published_table',
  confianca: 'alta',
  metodo: 'tabela publicada',
  fonte: 'Fonte A',
  observacao: null,
  valor_alterado_em: null,
};

const alturaRow = {
  campo: 'altura_10a_m',
  variavel: 'altura',
  idade_anos: 10,
  unidade: 'm',
  min_operacional: '7.52',
  max_operacional: '10.84',
  origem: 'estimated',
  confianca: 'media',
  metodo: 'estimativa operacional',
  fonte: null,
  observacao: 'Faixa operacional',
  valor_alterado_em: '2026-10-18T12:00:00Z',
};

describe('useTreeProvenance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockResolvedValue({ data: [], error: null });
  });

  it('returns the records indexed by campo for the requested tree', async () => {
    mocks.eq.mockResolvedValue({ data: [dapRow, alturaRow], error: null });

    const { result } = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.disponivel).toBe(true));
    expect(result.current.loading).toBe(false);
    expect(mocks.from).toHaveBeenCalledWith('tree_value_provenance');
    expect(mocks.select).toHaveBeenCalledWith(expect.stringContaining('campo'));
    expect(mocks.eq).toHaveBeenCalledWith('tree_id', 7);
    expect(Object.keys(result.current.provenance).sort()).toEqual(['altura_10a_m', 'dap_10a_cm']);
    expect(result.current.provenance.dap_10a_cm).toMatchObject({
      campo: 'dap_10a_cm',
      origem: 'published_table',
      min_operacional: 12.17,
      max_operacional: 12.17,
      fonte: 'Fonte A',
    });
  });

  it('treats empty or blank bound strings as null, never as 0', async () => {
    mocks.eq.mockResolvedValue({
      data: [{ ...dapRow, min_operacional: '', max_operacional: '   ' }],
      error: null,
    });

    const { result } = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.disponivel).toBe(true));
    expect(result.current.provenance.dap_10a_cm?.min_operacional).toBeNull();
    expect(result.current.provenance.dap_10a_cm?.max_operacional).toBeNull();
  });

  it('coerces numeric bounds delivered as strings and keeps nulls as null', async () => {
    mocks.eq.mockResolvedValue({ data: [dapRow, alturaRow, { ...dapRow, campo: 'dap_20a_cm', min_operacional: null, max_operacional: null }], error: null });

    const { result } = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper() });

    await waitFor(() => expect(Object.keys(result.current.provenance)).toHaveLength(3));
    expect(result.current.provenance.altura_10a_m?.min_operacional).toBe(7.52);
    expect(result.current.provenance.altura_10a_m?.max_operacional).toBe(10.84);
    expect(result.current.provenance.dap_20a_cm?.min_operacional).toBeNull();
    expect(result.current.provenance.dap_20a_cm?.max_operacional).toBeNull();
  });

  it('is available with an empty map when the query succeeds without rows', async () => {
    mocks.eq.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.disponivel).toBe(true));
    expect(result.current.loading).toBe(false);
    expect(result.current.provenance).toEqual({});
  });

  it('is unavailable with an empty map when the query returns an error', async () => {
    mocks.eq.mockResolvedValue({ data: null, error: new Error('backend unavailable') });

    const { result } = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mocks.eq).toHaveBeenCalled();
    expect(result.current.disponivel).toBe(false);
    expect(result.current.provenance).toEqual({});
  });

  it('is unavailable with an empty map when the response has neither data nor error', async () => {
    mocks.eq.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.disponivel).toBe(false);
    expect(result.current.provenance).toEqual({});
  });

  it('is unavailable with an empty map when the query throws', async () => {
    mocks.eq.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mocks.eq).toHaveBeenCalled();
    expect(result.current.disponivel).toBe(false);
    expect(result.current.provenance).toEqual({});
  });

  it('does not cache a failure as a successful empty result', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mocks.eq.mockRejectedValueOnce(new Error('network down'));

    const first = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper(client) });
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    expect(first.result.current.disponivel).toBe(false);
    first.unmount();

    mocks.eq.mockResolvedValue({ data: [dapRow], error: null });
    const second = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper(client) });

    await waitFor(() => expect(second.result.current.disponivel).toBe(true));
    expect(mocks.eq).toHaveBeenCalledTimes(2);
    expect(Object.keys(second.result.current.provenance)).toEqual(['dap_10a_cm']);
  });

  it('does not call Supabase when it is not configured', () => {
    mocks.isSupabaseConfigured.mockReturnValue(false);

    const { result } = renderHook(() => useTreeProvenance(7), { wrapper: makeWrapper() });

    expect(result.current).toEqual({ provenance: {}, loading: false, disponivel: false });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('does not call Supabase when there is no tree id', () => {
    const { result } = renderHook(() => useTreeProvenance(null), { wrapper: makeWrapper() });

    expect(result.current).toEqual({ provenance: {}, loading: false, disponivel: false });
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
