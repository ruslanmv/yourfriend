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
    const { container } = render(<NightSkyEffect theme="dark"/>);

    expect(container.querySelector('.night-sky-effect')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(container.querySelector('.night-sky-effect')).toBeInTheDocument();
    expect(container.querySelectorAll('.shooting-star')).toHaveLength(2);

    act(() => {
      vi.advanceTimersByTime(2_800);
    });

    expect(container.querySelector('.night-sky-effect')).not.toBeInTheDocument();
  });

  it('does not add the effect in light mode', () => {
    const { container } = render(<NightSkyEffect theme="light"/>);

    act(() => {
      vi.advanceTimersByTime(120_000);
    });

    expect(container.querySelector('.night-sky-effect')).not.toBeInTheDocument();
  });
});
