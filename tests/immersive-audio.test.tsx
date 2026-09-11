import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImmersiveAudio } from '../src/components/audio/ImmersiveAudio';
import {
  ambientTracks,
  audioBestPractices,
  AUDIO_MUTED_STORAGE_KEY,
  AUDIO_VOLUME,
} from '../src/config/audio';

describe('immersive ambient audio', () => {
  let playSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    window.localStorage.clear();
    playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps the entry gateway minimal and silent by default', () => {
    const { container } = render(<ImmersiveAudio/>);

    expect(screen.getByRole('heading', { name: 'Begin your journey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue without sound' })).not.toBeInTheDocument();
    expect(screen.queryByText(/A quiet 60–70 BPM soundscape/i)).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(playSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Play music')).toBeInTheDocument();
  });

  it('starts audio only from the persistent play control and preserves the mute preference', async () => {
    render(<ImmersiveAudio/>);

    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play next ambient track' }));
    expect(screen.getByText('Lo-Fi Chill · 70 BPM')).toBeInTheDocument();
    expect(playSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle background music' }));
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Playing')).toBeInTheDocument());
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle background music' }));
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('true');
    expect(screen.getByText('Play music')).toBeInTheDocument();
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
