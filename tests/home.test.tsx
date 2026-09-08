import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ExperienceSection } from '../src/components/sections/ExperienceSection';

describe('Open-source showcase content', () => {
  it('shows the four core project experiences', () => {
    render(<MemoryRouter><ExperienceSection/></MemoryRouter>);
    for (const title of ['Together Mode','Companion Mode','Voice + Multi-AI','VR + AR Presence']) expect(screen.getByText(title)).toBeInTheDocument();
  });
});
