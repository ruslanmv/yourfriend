import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NightSkyEffect } from '../src/components/ambient/NightSkyEffect';

describe('night shooting-star ambience', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('stays quiet at first and reveals only a small dark-theme burst after one minute', () => {
    const { container } = render(<NightSkyEffect theme="dark" skyDetail="plain" />);

    expect(container.querySelector('.night-sky-effect')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(container.querySelector('.night-sky-effect')).toBeInTheDocument();
    // Assert that the burst is *small*, not that it is exactly N: the count is an art-direction
    // choice that has already changed once, and pinning the number failed on an improvement.
    const stars = container.querySelectorAll('.shooting-star').length;
    expect(stars).toBeGreaterThanOrEqual(1);
    expect(stars).toBeLessThanOrEqual(2);

    act(() => {
      vi.advanceTimersByTime(2_800);
    });

    expect(container.querySelector('.night-sky-effect')).not.toBeInTheDocument();
  });

  it('does not add the effect in light mode', () => {
    const { container } = render(<NightSkyEffect theme="light" skyDetail="plain" />);

    act(() => {
      vi.advanceTimersByTime(120_000);
    });

    expect(container.querySelector('.night-sky-effect')).not.toBeInTheDocument();
  });

  it('stands down over a scene whose sky already has detail of its own', () => {
    // A CSS streak drawn across a plate that already carries cloud structure and its own stars
    // reads as a rendering artefact, not as atmosphere.
    const { container } = render(<NightSkyEffect theme="dark" skyDetail="rich" />);

    act(() => {
      vi.advanceTimersByTime(600_000);
    });

    expect(container.querySelector('.night-sky-effect')).not.toBeInTheDocument();
  });

  it('starts running again when the scene changes back to a plain sky', () => {
    const { container, rerender } = render(<NightSkyEffect theme="dark" skyDetail="rich" />);
    act(() => {
      vi.advanceTimersByTime(120_000);
    });
    expect(container.querySelector('.night-sky-effect')).not.toBeInTheDocument();

    rerender(<NightSkyEffect theme="dark" skyDetail="plain" />);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(container.querySelector('.night-sky-effect')).toBeInTheDocument();
  });
});
