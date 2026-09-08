import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { avatarConfig } from '../src/config/avatar';
import { AvatarPoster } from '../src/components/avatar/AvatarPoster';
import { HeroAvatar } from '../src/components/avatar/HeroAvatar';

describe('static-first avatar', () => {
  it('renders a real project capture without requiring WebGL', () => {
    const { container } = render(<HeroAvatar theme="light"/>);
    const poster = container.querySelector('.avatar-poster img');
    expect(poster).toBeInTheDocument();
    expect(poster).toHaveAttribute('src', expect.stringContaining('3D-Avatar-Chatbot/master/assets/companion-fullscreen.png'));
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(container.querySelector('.avatar-canvas')).not.toBeInTheDocument();
  });

  it('uses the same canonical project capture in dark mode', () => {
    const { container } = render(<HeroAvatar theme="dark"/>);
    expect(container.querySelector('.avatar-poster img')).toHaveAttribute('src', expect.stringContaining('companion-fullscreen.png'));
  });

  it('keeps the poster mounted even when live WebGL is shown above it', () => {
    const { container } = render(<AvatarPoster theme="light" hidden/>);
    expect(container.querySelector('.avatar-poster')).toHaveClass('is-hidden');
    expect(container.querySelector('.avatar-poster img')).toBeInTheDocument();
  });

  it('requires a deliberate hold, multiple stable frames, and a cinematic crossfade', () => {
    expect(avatarConfig.transition.minimumPosterMs).toBeGreaterThanOrEqual(1500);
    expect(avatarConfig.transition.minimumPosterMs).toBeLessThanOrEqual(2000);
    expect(avatarConfig.transition.stableFrames).toBeGreaterThan(1);
    expect(avatarConfig.transition.posterToLive).toBeGreaterThanOrEqual(700);
    expect(avatarConfig.transition.posterToLive).toBeLessThanOrEqual(1000);
  });
});
