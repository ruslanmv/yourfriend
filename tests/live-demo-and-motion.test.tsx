import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { MotionSection } from '../src/components/sections/MotionSection';

describe('live demo and motion presentation', () => {
  it('uses the public YourFriend deployment for the live demo', () => {
    expect(site.liveDemoUrl).toBe('https://www.yourfriend.online/');
    expect(site.appUrl).toBe('https://www.yourfriend.online/');
  });

  it('uses the generated Waiting-standard avatar instead of screenshot crops or a T-pose preview', () => {
    render(<MotionSection/>);
    const portrait = screen.getByAltText('Close-up of the companion avatar');
    expect(portrait).toHaveAttribute('src', expect.stringContaining('companion-waiting-standard.png'));
    expect(portrait).not.toHaveAttribute('src', expect.stringContaining('companion-fullscreen.png'));
    expect(portrait).not.toHaveAttribute('src', expect.stringContaining('companion-512.png'));

    const sources = within(screen.getByLabelText('Motion sources'));
    for (const label of ['VRMA clips', 'Procedural idle', 'Gaze', 'Expressions', 'Lip sync']) {
      expect(sources.getByText(label)).toBeInTheDocument();
    }
  });
});
