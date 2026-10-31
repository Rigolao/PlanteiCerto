import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EscalaNota } from './EscalaNota';

function linha(campo: string): HTMLElement {
  const elemento = document.querySelector<HTMLElement>(`[data-campo="${campo}"]`);
  if (!elemento) throw new Error(`Sem item ${campo}`);
  return elemento;
}

describe('EscalaNota', () => {
  it('paints the filled squares with the low level when higher is worse', () => {
    render(
      <EscalaNota campo="potencial_dano_calcada_1a5" rotulo="Dano à calçada" valor={5} polaridade="maior_pior" selo={null} />,
    );

    expect(linha('potencial_dano_calcada_1a5').querySelectorAll('.bg-nivel-baixo')).toHaveLength(5);
    expect(screen.getByText('5/5')).toBeInTheDocument();
  });

  it('paints a 4 as high when higher is better', () => {
    render(<EscalaNota campo="tolerancia_ventos_fortes_1a5" rotulo="Ventos fortes" valor={4} polaridade="maior_melhor" selo={null} />);

    const item = linha('tolerancia_ventos_fortes_1a5');
    expect(item.querySelectorAll('.bg-nivel-alto')).toHaveLength(4);
    expect(item.querySelectorAll('.bg-border')).toHaveLength(1);
    expect(screen.getByText('4/5')).toBeInTheDocument();
  });

  it('shows "Não avaliado" and no squares for NULL', () => {
    render(<EscalaNota campo="tolerancia_seca_1a5" rotulo="Seca" valor={null} polaridade="maior_melhor" selo={null} />);

    const item = linha('tolerancia_seca_1a5');
    expect(screen.getByText('Não avaliado')).toBeInTheDocument();
    expect(item.querySelectorAll('[class*="bg-nivel-"], .bg-border')).toHaveLength(0);
    expect(screen.queryByText(/\/5$/)).not.toBeInTheDocument();
  });

  it('shows the hint under the label and the seal below', () => {
    render(
      <EscalaNota
        campo="potencial_sujeira_1a5"
        rotulo="Sujeira"
        dica="potencial; quanto maior, pior"
        valor={3}
        polaridade="maior_pior"
        selo={<span>Estimado (rubrica)</span>}
      />,
    );

    expect(screen.getByText('Sujeira')).toBeInTheDocument();
    expect(screen.getByText('potencial; quanto maior, pior')).toBeInTheDocument();
    expect(linha('potencial_sujeira_1a5')).toHaveTextContent('Estimado (rubrica)');
    expect(linha('potencial_sujeira_1a5').querySelectorAll('.bg-nivel-medio')).toHaveLength(3);
  });
});
