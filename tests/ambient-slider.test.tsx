import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AmbientSlider } from '../src/components/ambient/AmbientSlider';

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(() => ({ matches:false, addEventListener:vi.fn(), removeEventListener:vi.fn() })) });

describe('AmbientSlider', () => {
  it('keeps auto rotation visible and lets the user switch scenes', () => {
    render(<AmbientSlider theme="light"/>);
    expect(screen.getByText(/Auto-rotating · click a scene/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next ambient scene/i }));

    expect(screen.getByRole('button', { name: /Show Lake ambient scene/i })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText(/Manual selection · auto resumes soon/i)).toBeInTheDocument();
  });
});
