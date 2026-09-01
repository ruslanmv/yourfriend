import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ExperienceSection } from '../src/components/sections/ExperienceSection';

describe('Commercial content', () => {
  it('shows the four core experiences', () => {
    render(<MemoryRouter><ExperienceSection/></MemoryRouter>);
    for (const title of ['Watch Together','Screen Copilot','Gaming Co-host','Embodied HomePilot']) expect(screen.getByText(title)).toBeInTheDocument();
  });
});
