import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TreePhoto } from './TreePhoto';

const LEGENDA = 'Imagem ilustrativa — espécie sem foto';

describe('TreePhoto', () => {
  it('renders the photo with its alt text and layout classes when a URL exists', () => {
    render(<TreePhoto foto="https://example.com/ipe.jpg" alt="Ipê Amarelo" className="w-full h-64" />);

    const img = screen.getByRole('img', { name: 'Ipê Amarelo' });
    expect(img).toHaveAttribute('src', 'https://example.com/ipe.jpg');
    expect(img).toHaveClass('w-full', 'h-64');
    expect(screen.queryByText(LEGENDA)).not.toBeInTheDocument();
  });

  it('lazy-loads the photo only when asked to', () => {
    const { rerender } = render(<TreePhoto foto="https://example.com/a.jpg" alt="A" />);
    expect(screen.getByRole('img', { name: 'A' })).not.toHaveAttribute('loading');

    rerender(<TreePhoto foto="https://example.com/a.jpg" alt="A" lazy />);
    expect(screen.getByRole('img', { name: 'A' })).toHaveAttribute('loading', 'lazy');
  });

  it('shows the generic leaf drawing and the identifying caption when there is no photo', () => {
    const { container } = render(<TreePhoto foto={null} alt="Ipê Amarelo" className="w-full h-64" />);

    expect(screen.getByText(LEGENDA)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const svg = container.querySelector('svg[viewBox="0 0 48 48"]');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild).toHaveClass('w-full', 'h-64');
  });

  it('treats an empty photo URL as missing', () => {
    render(<TreePhoto foto="" alt="Sem foto" />);
    expect(screen.getByText(LEGENDA)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('moves the caption to screen readers and a tooltip in compact mode', () => {
    const { container } = render(<TreePhoto foto={null} alt="Ipê" compact className="w-14 h-14" />);

    const legenda = screen.getByText(LEGENDA);
    expect(legenda).toHaveClass('sr-only');
    expect(container.firstElementChild).toHaveAttribute('title', LEGENDA);
    expect(container.querySelector('svg[viewBox="0 0 48 48"]')).toBeInTheDocument();
  });

  it('does not add a tooltip to the regular placeholder, whose caption is visible', () => {
    const { container } = render(<TreePhoto foto={null} alt="Ipê" />);

    expect(screen.getByText(LEGENDA)).not.toHaveClass('sr-only');
    expect(container.firstElementChild).not.toHaveAttribute('title');
  });
});
