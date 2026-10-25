import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProjectModal } from './ProjectModal';
import type { Projeto } from '../../types/project';

const projeto: Projeto = {
  id: 'p1',
  user_id: 'u1',
  nome: 'Rua das Flores',
  descricao: 'Plano para a calçada norte',
  centro_lat: 0,
  centro_lng: 0,
  centro_zoom: 15,
} as Projeto;

const NOME = /Nome do projeto/;
const DESCRICAO = 'Descrição (opcional)';

function modal(isOpen: boolean, projectToEdit?: Projeto | null) {
  return (
    <ProjectModal
      isOpen={isOpen}
      onClose={() => {}}
      onSave={async () => {}}
      projectToEdit={projectToEdit}
    />
  );
}

describe('ProjectModal', () => {
  it('ao editar, mostra nome e descrição do projeto', () => {
    render(modal(true, projeto));

    expect(screen.getByText('Editar Projeto')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(NOME)).toHaveValue('Rua das Flores');
    expect(screen.getByPlaceholderText(DESCRICAO)).toHaveValue('Plano para a calçada norte');
  });

  it('ao criar, mostra os campos vazios', () => {
    render(modal(true, null));

    expect(screen.getByText('Novo Projeto')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(NOME)).toHaveValue('');
    expect(screen.getByPlaceholderText(DESCRICAO)).toHaveValue('');
  });

  it('fechar após digitar e reabrir como novo não mantém o rascunho', async () => {
    const user = userEvent.setup();
    const { rerender } = render(modal(true, null));

    await user.type(screen.getByPlaceholderText(NOME), 'Rascunho');
    await user.type(screen.getByPlaceholderText(DESCRICAO), 'Texto pela metade');
    expect(screen.getByPlaceholderText(NOME)).toHaveValue('Rascunho');

    rerender(modal(false, null));
    rerender(modal(true, null));

    expect(screen.getByPlaceholderText(NOME)).toHaveValue('');
    expect(screen.getByPlaceholderText(DESCRICAO)).toHaveValue('');
  });

  it('reabrir como novo depois de editar não mantém os dados do projeto editado', () => {
    const { rerender } = render(modal(true, projeto));
    expect(screen.getByPlaceholderText(NOME)).toHaveValue('Rua das Flores');

    rerender(modal(false, projeto));
    rerender(modal(true, null));

    expect(screen.getByPlaceholderText(NOME)).toHaveValue('');
    expect(screen.getByPlaceholderText(DESCRICAO)).toHaveValue('');
  });
});
