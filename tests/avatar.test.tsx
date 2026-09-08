import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { avatarConfig } from '../src/config/avatar';
import { AvatarPoster } from '../src/components/avatar/AvatarPoster';
import { HeroAvatar } from '../src/components/avatar/HeroAvatar';

describe('single Waiting-standard marketing avatar', () => {
  it('renders the generated Waiting-standard capture without requiring WebGL', () => {
    const { container } = render(<HeroAvatar theme="light"/>);
    const poster = container.querySelector('.avatar-poster img');
    expect(poster).toBeInTheDocument();
    expect(poster).toHaveAttribute('src', expect.stringContaining('avatar/posters/companion-waiting-standard.png'));
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(container.querySelector('.avatar-canvas')).not.toBeInTheDocument();
  });

  it('uses the same canonical Waiting-standard render in dark mode', () => {
    const { container } = render(<HeroAvatar theme="dark"/>);
    expect(container.querySelector('.avatar-poster img')).toHaveAttribute('src', expect.stringContaining('companion-waiting-standard.png'));
    expect(avatarConfig.posters.dark).toBe(avatarConfig.posters.light);
  });

  it('uses the same authored pose for the motion preview', () => {
    expect(avatarConfig.motionPortrait).toBe(avatarConfig.posters.light);
    expect(avatarConfig.source.animation).toContain('waiting-standard.vrma');
  });

  it('keeps the poster mounted if live WebGL is enabled for development later', () => {
    const { container } = render(<AvatarPoster theme="light" hidden/>);
    expect(container.querySelector('.avatar-poster')).toHaveClass('is-hidden');
    expect(container.querySelector('.avatar-poster img')).toBeInTheDocument();
  });
});
