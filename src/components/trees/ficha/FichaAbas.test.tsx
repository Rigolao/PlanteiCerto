import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FichaAbas } from './FichaAbas';
import { ABAS_FICHA, type AbaId } from './abas';

function AbasControladas({ inicial, onChange }: { inicial: AbaId; onChange: (id: AbaId) => void }) {
  const [ativa, setAtiva] = useState<AbaId>(inicial);
  return (
    <FichaAbas
      abas={ABAS_FICHA}
      ativa={ativa}
      idBase="f"
      onChange={id => { onChange(id); setAtiva(id); }}
    />
  );
}

describe('FichaAbas', () => {
  it('marks only the active tab as selected and focusable', () => {
    render(<FichaAbas abas={ABAS_FICHA} ativa="urbano" idBase="f" onChange={vi.fn()} />);

    expect(screen.getByRole('tablist', { name: 'Grupos de atributos' })).toBeInTheDocument();
    const abas = screen.getAllByRole('tab');
    expect(abas.map(aba => aba.textContent)).toEqual(['Visão geral', 'Ambiente', 'Urbano', 'Benefícios', 'Crescimento']);
    for (const aba of abas) {
      const ativa = aba.textContent === 'Urbano';
      expect(aba).toHaveAttribute('aria-selected', String(ativa));
      expect(aba).toHaveAttribute('tabindex', ativa ? '0' : '-1');
    }
  });

  it('calls onChange on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FichaAbas abas={ABAS_FICHA} ativa="geral" idBase="f" onChange={onChange} />);

    await user.click(screen.getByRole('tab', { name: 'Benefícios' }));

    expect(onChange).toHaveBeenCalledWith('beneficios');
  });

  it('wraps with arrows and jumps with Home and End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AbasControladas inicial="crescimento" onChange={onChange} />);

    screen.getByRole('tab', { name: 'Crescimento' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('geral');
    expect(screen.getByRole('tab', { name: 'Visão geral' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('crescimento');

    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('geral');

    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('crescimento');
    expect(screen.getByRole('tab', { name: 'Crescimento' })).toHaveFocus();
  });

  it('never shrinks a tab below its label, so narrow screens scroll instead of overlapping', () => {
    render(<FichaAbas abas={ABAS_FICHA} ativa="geral" idBase="f" onChange={vi.fn()} />);

    for (const aba of screen.getAllByRole('tab')) {
      expect(aba).toHaveClass('flex-[1_0_auto]');
    }
    expect(screen.getByRole('tablist')).toHaveClass('overflow-x-auto');
  });

  it('links each tab to its panel id', () => {
    render(<FichaAbas abas={ABAS_FICHA} ativa="geral" idBase="f" onChange={vi.fn()} />);

    const urbano = screen.getByRole('tab', { name: 'Urbano' });
    expect(urbano).toHaveAttribute('aria-controls', 'f-painel-urbano');
    expect(urbano).toHaveAttribute('id', 'f-aba-urbano');
  });
});
