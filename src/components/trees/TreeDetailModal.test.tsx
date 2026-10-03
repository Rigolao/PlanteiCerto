import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TreeDetailModal } from './TreeDetailModal';
import { staticTrees } from '../../data/trees';
import type { Arvore } from '../../types/tree';

describe('TreeDetailModal growth projections', () => {
  it('shows projections for all horizons, available ranges, and existing ten-year indicators', async () => {
    const tree: Arvore = {
      ...staticTrees[0],
      dap_10a_cm: 9.45632,
      dap_10a_min_cm: 9.45632,
      dap_10a_max_cm: 9.45632,
      altura_10a_m: 8.4,
      altura_10a_min_m: 6.18,
      altura_10a_max_m: 10.11,
      dap_20a_cm: 16.836539,
      dap_20a_min_cm: 16.836539,
      dap_20a_max_cm: 16.836539,
      altura_20a_m: 12,
      altura_20a_min_m: 12,
      altura_20a_max_m: 12,
      dap_30a_cm: 21.130801,
      dap_30a_min_cm: 21.130801,
      dap_30a_max_cm: 21.130801,
      altura_30a_m: null,
      altura_30a_min_m: null,
      altura_30a_max_m: null,
      co2e_10a_kg: 45.1405,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const table = await screen.findByRole('table', { name: 'Projeção de crescimento' });
    expect(within(table).getByText('10 anos')).toBeInTheDocument();
    expect(within(table).getByText('20 anos')).toBeInTheDocument();
    expect(within(table).getByText('30 anos')).toBeInTheDocument();
    expect(within(table).getByText('9,46 cm')).toBeInTheDocument();
    expect(within(table).getByText('6,18–10,11 m')).toBeInTheDocument();
    expect(within(table).getByText('16,84 cm')).toBeInTheDocument();
    expect(within(table).getByText('21,13 cm')).toBeInTheDocument();
    expect(within(table).getByText('—')).toBeInTheDocument();
    expect(screen.getByText('CO₂e capturado')).toBeInTheDocument();
    expect(screen.getByText('45,1 kg')).toBeInTheDocument();
    expect(screen.getByText('2,5 - 3,5')).toBeInTheDocument();
  });

  it('does not render a growth table when no growth values or ranges exist', async () => {
    const tree: Arvore = { ...staticTrees[0] };
    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: tree.nome_popular })).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Projeção de crescimento' })).not.toBeInTheDocument();
  });
});
