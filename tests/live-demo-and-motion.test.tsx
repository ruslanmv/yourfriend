import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { MotionSection } from '../src/components/sections/MotionSection';

describe('live demo and motion presentation', () => {
  it('uses the public YourFriend deployment for the live demo', () => {
    expect(site.liveDemoUrl).toBe('https://www.yourfriend.online/');
    expect(site.appUrl).toBe('https://www.yourfriend.online/');
  });

  it('uses the dedicated companion portrait instead of the fullscreen app screenshot', () => {
    render(<MotionSection/>);
    const portrait = screen.getByAltText('Close-up of the companion avatar');
    expect(portrait).toHaveAttribute('src', expect.stringContaining('assets/companion-512.png'));
    expect(portrait).not.toHaveAttribute('src', expect.stringContaining('companion-fullscreen.png'));

    const sources = within(screen.getByLabelText('Motion sources'));
    for (const label of ['VRMA clips', 'Procedural idle', 'Gaze', 'Expressions', 'Lip sync']) {
      expect(sources.getByText(label)).toBeInTheDocument();
    }
  });
});
