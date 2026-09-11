import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ImmersiveAudio } from '../src/components/audio/ImmersiveAudio';
import {
  ambientTracks,
  audioBestPractices,
  AUDIO_MUTED_STORAGE_KEY,
  AUDIO_VOLUME,
} from '../src/config/audio';

describe('immersive ambient audio', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders a user-gesture gateway, persistent control, and optimized source order', () => {
    const { container } = render(<ImmersiveAudio/>);

    expect(screen.getByRole('button', { name: 'Begin Journey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle background music' })).toBeInTheDocument();
    expect(screen.getByText('Ambient Ocean · 65 BPM')).toBeInTheDocument();

    const audio = container.querySelector('audio');
    expect(audio).toHaveAttribute('loop');
    const sources = Array.from(audio?.querySelectorAll('source') ?? []);
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('type', 'audio/ogg');
    expect(sources[0]).toHaveAttribute('src', expect.stringContaining('track1-ambient-ocean-65bpm.ogg'));
    expect(sources[1]).toHaveAttribute('type', 'audio/mpeg');
    expect(sources[1]).toHaveAttribute('src', expect.stringContaining('track1-ambient-ocean-65bpm.mp3'));
  });

  it('persists a muted choice and lets the visitor cycle tracks without starting playback', () => {
    render(<ImmersiveAudio/>);

    fireEvent.click(screen.getByRole('button', { name: 'Continue without sound' }));
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('true');
    expect(screen.getByText('Muted')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Play next ambient track' }));
    expect(screen.getByText('Lo-Fi Chill · 70 BPM')).toBeInTheDocument();
  });

  it('keeps the playlist and best-practice contract inside the intended calm range', () => {
    expect(audioBestPractices).toHaveLength(10);
    expect(AUDIO_VOLUME).toBeGreaterThanOrEqual(0.2);
    expect(AUDIO_VOLUME).toBeLessThanOrEqual(0.3);

    for (const track of ambientTracks) {
      expect(track.bpm).toBeGreaterThanOrEqual(60);
      expect(track.bpm).toBeLessThanOrEqual(80);
      expect(track.ogg).toMatch(/\.ogg$/);
      expect(track.mp3).toMatch(/\.mp3$/);
    }
  });
});
