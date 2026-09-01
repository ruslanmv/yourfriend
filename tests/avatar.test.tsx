import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroAvatar } from '../src/components/avatar/HeroAvatar';

describe('static-first avatar', () => {
  it('renders the canonical poster without requiring WebGL', () => {
    const { container } = render(<HeroAvatar theme="light"/>);
    const poster = container.querySelector('.avatar-poster img');
    expect(poster).toBeInTheDocument();
    expect(poster).toHaveAttribute('src', expect.stringContaining('companion-light.svg'));
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(container.querySelector('.avatar-canvas')).not.toBeInTheDocument();
  });

  it('switches to the dark lighting poster', () => {
    const { container } = render(<HeroAvatar theme="dark"/>);
    expect(container.querySelector('.avatar-poster img')).toHaveAttribute('src', expect.stringContaining('companion-dark.svg'));
  });
});
