import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AmbientSlider } from '../src/components/ambient/AmbientSlider';

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(() => ({ matches:false, addEventListener:vi.fn(), removeEventListener:vi.fn() })) });

describe('AmbientSlider', () => {
  it('keeps the slow rotation label visible', () => {
    render(<AmbientSlider theme="light"/>);
    expect(screen.getByText(/Ambient scenes rotate slowly/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBe(5);
  });
});
