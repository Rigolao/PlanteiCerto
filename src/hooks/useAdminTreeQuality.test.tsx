import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminTreeQuality } from './useAdminTreeQuality';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  order: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from },
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useAdminTreeQuality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ order: mocks.order });
    mocks.order.mockResolvedValue({ data: [], error: null });
  });

  it('loads the authoritative tree table directly without a static fallback', async () => {
    const tree = { id: 7, nome_popular: 'Ipê-amarelo' };
    mocks.order.mockResolvedValue({ data: [tree], error: null });

    const { result } = renderHook(() => useAdminTreeQuality(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mocks.from).toHaveBeenCalledWith('trees');
    expect(mocks.select).toHaveBeenCalledWith('*');
    expect(result.current.trees).toEqual([tree]);
    expect(result.current.error).toBeNull();
  });

  it('does not query or return static data when Supabase is not configured', () => {
    mocks.isSupabaseConfigured.mockReturnValue(false);

    const { result } = renderHook(() => useAdminTreeQuality(), { wrapper: makeWrapper() });

    expect(result.current.isConfigured).toBe(false);
    expect(result.current.error).toBe('not-configured');
    expect(result.current.trees).toEqual([]);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('reports an unavailable query instead of silently treating it as an empty catalog', async () => {
    mocks.order.mockResolvedValue({ data: null, error: new Error('local backend unavailable') });

    const { result } = renderHook(() => useAdminTreeQuality(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.error).toBe('load-failed'));
    expect(result.current.trees).toEqual([]);
  });
});
