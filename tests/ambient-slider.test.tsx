import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '../src/components/sections/Hero';
import { ambientScenes } from '../src/config/ambientScenes';

const matchMedia = (reduced: boolean) =>
  vi.fn().mockImplementation(() => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: matchMedia(false),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const activeLayers = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.ambient__layer'));

describe('the hero scene selector', () => {
  it('keeps auto rotation visible and lets the user switch scenes', () => {
    render(<Hero theme="light" />);
    expect(screen.getByText(/Auto-rotating · click a scene/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next ambient scene/i }));

    expect(screen.getByRole('button', { name: /Show Lake ambient scene/i })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByText(/Manual selection · auto resumes soon/i)).toBeInTheDocument();
  });

  it('wraps around at both ends', () => {
    render(<Hero theme="light" />);
    fireEvent.click(screen.getByRole('button', { name: /Previous ambient scene/i }));
    expect(screen.getByRole('button', { name: /Show Open sky ambient scene/i })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('says it is manual, and stops rotating, when the visitor prefers reduced motion', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: matchMedia(true),
    });
    vi.useFakeTimers();
    const { container } = render(<Hero theme="light" />);
    expect(screen.getByText(/Manual scene selection/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(120_000);
    });
    expect(activeLayers(container)[0]).toHaveClass('is-active');
    vi.useRealTimers();
  });

  it('paints only the scene on screen, so choosing one does not download the whole set', () => {
    const { container } = render(<Hero theme="light" />);
    const layers = activeLayers(container);
    const withImage = layers.filter((layer) => layer.style.backgroundImage !== '');
    expect(withImage).toHaveLength(1);
    expect(withImage[0]).toHaveClass('is-active');
  });

  it('uses the small thumbnails on the buttons, never the full plates', () => {
    const { container } = render(<Hero theme="light" />);
    const thumbs = container.querySelectorAll<HTMLElement>('.ambient__thumb');
    expect(thumbs).toHaveLength(ambientScenes.length);
    thumbs.forEach((thumb, i) => {
      expect(thumb.style.backgroundImage).toContain(ambientScenes[i].thumbs.light);
      expect(thumb.style.backgroundImage).not.toContain('/ambient/light/');
    });
  });

  it('does not re-assert cover on the layer, so the fitted size survives', () => {
    const { container } = render(<Hero theme="light" />);
    const active = container.querySelector<HTMLElement>('.ambient__layer.is-active')!;
    expect(active.style.backgroundSize).toMatch(/^auto /);
    expect(active.style.backgroundSize).not.toContain('cover');
    expect(active.style.backgroundPosition).toMatch(/^50% /);
  });

  it('keeps the chosen scene when the theme changes, and swaps only the picture', () => {
    const { container, rerender } = render(<Hero theme="light" />);
    fireEvent.click(screen.getByRole('button', { name: /Show Garden ambient scene/i }));
    const before = container.querySelector<HTMLElement>('.ambient__layer.is-active')!;
    expect(before.dataset.scene).toBe('garden');
    expect(before.style.backgroundImage).toContain('/ambient/light/');

    rerender(<Hero theme="dark" />);
    const after = container.querySelector<HTMLElement>('.ambient__layer.is-active')!;
    expect(after.dataset.scene).toBe('garden');
    expect(after.style.backgroundImage).toContain('/ambient/dark/');
    expect(screen.getByRole('button', { name: /Show Garden ambient scene/i })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('exposes one current scene through both control groups', () => {
    const { container } = render(<Hero theme="light" />);
    fireEvent.click(screen.getByRole('button', { name: /Show Terrace ambient scene/i }));
    const current = container.querySelectorAll('[aria-current="true"]');
    // The thumbnail row and the dot shortcuts each mark the same scene, and nothing else does.
    expect(current).toHaveLength(2);
    const dots = within(container.querySelector<HTMLElement>('.ambient__dots')!).getAllByRole(
      'button',
    );
    expect(dots[3]).toHaveAttribute('aria-current', 'true');
  });

  it('names every scene for a screen reader', () => {
    render(<Hero theme="light" />);
    for (const scene of ambientScenes) {
      expect(
        screen.getByRole('button', { name: `Show ${scene.label} ambient scene` }),
      ).toBeInTheDocument();
    }
  });

  it('keeps the layers out of the accessibility tree entirely', () => {
    const { container } = render(<Hero theme="light" />);
    expect(container.querySelector('.ambient__layers')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.hero__contact-shadow')).toHaveAttribute('aria-hidden', 'true');
  });

  it('grounds the companion with a shadow tinted by the active scene', () => {
    const { container } = render(<Hero theme="light" />);
    const shadow = container.querySelector<HTMLElement>('.hero__contact-shadow')!;
    expect(shadow.dataset.scene).toBe('ocean');
    expect(shadow.style.background).toContain('radial-gradient');
    // React reuses the node, so the tint has to be copied out before the scene changes.
    const oceanTint = shadow.style.background;

    fireEvent.click(screen.getByRole('button', { name: /Show Garden ambient scene/i }));
    const after = container.querySelector<HTMLElement>('.hero__contact-shadow')!;
    expect(after.dataset.scene).toBe('garden');
    expect(after.style.background).not.toBe(oceanTint);
  });

  it('does not mount the calibration overlay without the query flag', () => {
    const { container } = render(<Hero theme="light" />);
    expect(container.querySelector('.hero-calibration')).not.toBeInTheDocument();
  });
});
