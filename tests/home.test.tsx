import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ExperienceSection } from '../src/components/sections/ExperienceSection';
import { Hero } from '../src/components/sections/Hero';

describe('Open-source showcase content', () => {
  it('shows the four core project experiences', () => {
    render(<MemoryRouter><ExperienceSection/></MemoryRouter>);
    for (const title of ['Together Mode','Companion Mode','Voice + Multi-AI','VR + AR Presence']) expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('keeps the scene selector in a reserved row after the trust copy', () => {
    const { container } = render(<Hero theme="light"/>);
    const trust = screen.getByText(/Clone it, run it locally/i);
    const copy = trust.closest('.hero__copy');
    const sceneRow = container.querySelector('.hero__scene-row');
    const controls = container.querySelector('.ambient__controls');

    expect(copy).toBeInTheDocument();
    expect(sceneRow).toBeInTheDocument();
    expect(controls).toBeInTheDocument();
    expect(copy).not.toContainElement(controls as HTMLElement);
    expect(sceneRow).toContainElement(controls as HTMLElement);
    expect(screen.queryByText('Immersive Audio Best Practices')).not.toBeInTheDocument();
    expect(Boolean(copy && sceneRow && (copy.compareDocumentPosition(sceneRow) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  });
});
