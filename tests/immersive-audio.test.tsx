import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImmersiveAudio } from '../src/components/audio/ImmersiveAudio';
import {
  ambientTracks,
  AUDIO_MUTED_STORAGE_KEY,
  AUDIO_VOLUME,
} from '../src/config/audio';

describe('immersive ambient audio', () => {
  let playSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    window.localStorage.clear();
    playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('starts the first deployed MP3 when Begin Journey is clicked', async () => {
    const { container } = render(<ImmersiveAudio/>);

    expect(screen.getByRole('heading', { name: 'Begin your journey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Begin Journey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle background music' })).toBeInTheDocument();
    expect(screen.getByText('Ambient Ocean · 65 BPM')).toBeInTheDocument();
    expect(screen.getByText('Play music')).toBeInTheDocument();

    const audio = container.querySelector('audio');
    expect(audio).toHaveAttribute('loop');
    expect(audio).toHaveAttribute('preload', 'metadata');
    expect(audio).toHaveAttribute('src', expect.stringContaining('track1-ambient-ocean-65bpm.mp3'));
    expect(audio?.querySelectorAll('source')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Begin Journey' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Playing')).toBeInTheDocument());
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('false');
    expect(screen.queryByText('Audio unavailable')).not.toBeInTheDocument();
  });

  it('keeps the persistent control and cycles through the deployed MP3 playlist', async () => {
    const { container } = render(<ImmersiveAudio/>);

    fireEvent.click(screen.getByRole('button', { name: 'Begin Journey' }));
    await waitFor(() => expect(screen.getByText('Playing')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Play next ambient track' }));
    expect(screen.getByText('Lo-Fi Chill · 70 BPM')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('audio')).toHaveAttribute('src', expect.stringContaining('track2-lofi-chill-70bpm.mp3')));
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: 'Toggle background music' }));
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('true');
    expect(screen.getByText('Play music')).toBeInTheDocument();
  });

  it('keeps the playlist inside the intended calm range', () => {
    expect(AUDIO_VOLUME).toBeGreaterThanOrEqual(0.2);
    expect(AUDIO_VOLUME).toBeLessThanOrEqual(0.3);

    expect(ambientTracks[0].mp3).toMatch(/track1-ambient-ocean-65bpm\.mp3$/);

    for (const track of ambientTracks) {
      expect(track.bpm).toBeGreaterThanOrEqual(60);
      expect(track.bpm).toBeLessThanOrEqual(80);
      expect(track.mp3).toMatch(/\.mp3$/);
    }
  });
});
