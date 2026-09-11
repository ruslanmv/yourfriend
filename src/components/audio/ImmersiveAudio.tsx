import { useEffect, useRef, useState } from 'react';
import {
  ambientTracks,
  AUDIO_FADE_IN_MS,
  AUDIO_FADE_OUT_MS,
  AUDIO_MUTED_STORAGE_KEY,
  AUDIO_VOLUME,
} from '../../config/audio';

type FadeController = {
  frame: number | null;
  resolve: (() => void) | null;
};

function persist(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in privacy-focused browsing modes. Audio still works for this visit.
  }
}

function stopFade(controller: FadeController) {
  if (controller.frame !== null) window.cancelAnimationFrame(controller.frame);
  controller.frame = null;
  controller.resolve?.();
  controller.resolve = null;
}

function fadeVolume(audio: HTMLAudioElement, target: number, duration: number, controller: FadeController) {
  stopFade(controller);
  return new Promise<void>((resolve) => {
    const from = audio.volume;
    const startedAt = window.performance.now();
    controller.resolve = resolve;

    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      audio.volume = from + (target - from) * progress;

      if (progress < 1) {
        controller.frame = window.requestAnimationFrame(step);
        return;
      }

      controller.frame = null;
      controller.resolve = null;
      resolve();
    };

    controller.frame = window.requestAnimationFrame(step);
  });
}

function AudioStateIcon({ playing }: { playing: boolean }) {
  if (!playing) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" fill="currentColor"/></svg>;
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" fill="currentColor"/>
      <path d="M17 8.2a5 5 0 0 1 0 7.6M19.6 5.8a8.4 8.4 0 0 1 0 12.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function NextIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 8 6-8 6V6Zm9 0h2v12h-2V6Z" fill="currentColor"/></svg>;
}

export function ImmersiveAudio() {
  const [gatewayOpen, setGatewayOpen] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const beginButtonRef = useRef<HTMLButtonElement>(null);
  const fadeControllerRef = useRef<FadeController>({ frame: null, resolve: null });
  const actionIdRef = useRef(0);
  const resumeAfterTrackChangeRef = useRef(false);
  const mountedTrackEffectRef = useRef(false);
  const track = ambientTracks[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio.muted = true;
    }

    return () => stopFade(fadeControllerRef.current);
  }, []);

  useEffect(() => {
    if (!gatewayOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    beginButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [gatewayOpen]);

  useEffect(() => {
    if (!mountedTrackEffectRef.current) {
      mountedTrackEffectRef.current = true;
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.load();

    if (!resumeAfterTrackChangeRef.current) return;
    resumeAfterTrackChangeRef.current = false;
    const actionId = ++actionIdRef.current;
    audio.muted = false;
    audio.volume = 0;
    setIsStarting(true);

    void audio.play().then(() => {
      if (actionId !== actionIdRef.current) return;
      setAudioUnavailable(false);
      setIsStarting(false);
      setIsPlaying(true);
      void fadeVolume(audio, AUDIO_VOLUME, AUDIO_FADE_IN_MS, fadeControllerRef.current);
    }).catch(() => {
      if (actionId !== actionIdRef.current) return;
      setIsStarting(false);
      setIsPlaying(false);
      setAudioUnavailable(true);
    });
  }, [trackIndex]);

  async function playAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    const actionId = ++actionIdRef.current;
    stopFade(fadeControllerRef.current);
    setAudioUnavailable(false);
    setIsStarting(true);
    audio.muted = false;
    audio.volume = 0;

    try {
      await audio.play();
      if (actionId !== actionIdRef.current) return;
      setIsStarting(false);
      setAudioUnavailable(false);
      persist(AUDIO_MUTED_STORAGE_KEY, 'false');
      setIsPlaying(true);
      void fadeVolume(audio, AUDIO_VOLUME, AUDIO_FADE_IN_MS, fadeControllerRef.current);
    } catch {
      if (actionId !== actionIdRef.current) return;
      setIsStarting(false);
      setIsPlaying(false);
      setAudioUnavailable(true);
    }
  }

  async function pauseAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    const actionId = ++actionIdRef.current;
    setIsStarting(false);
    persist(AUDIO_MUTED_STORAGE_KEY, 'true');
    setIsPlaying(false);
    await fadeVolume(audio, 0, AUDIO_FADE_OUT_MS, fadeControllerRef.current);

    if (actionId !== actionIdRef.current) return;
    audio.pause();
    audio.muted = true;
  }

  function beginJourney() {
    setGatewayOpen(false);
    void playAudio();
  }

  function toggleAudio() {
    if (isPlaying) {
      void pauseAudio();
      return;
    }

    setGatewayOpen(false);
    void playAudio();
  }

  function cycleTrack() {
    const nextIndex = (trackIndex + 1) % ambientTracks.length;
    resumeAfterTrackChangeRef.current = isPlaying;
    ++actionIdRef.current;
    stopFade(fadeControllerRef.current);
    setIsStarting(false);
    setIsPlaying(false);
    setAudioUnavailable(false);
    setTrackIndex(nextIndex);
  }

  const status = audioUnavailable ? 'Retry music' : isStarting ? 'Starting…' : isPlaying ? 'Playing' : 'Play music';

  return <>
    <audio
      ref={audioRef}
      className="ambient-audio"
      src={track.mp3}
      loop
      preload="metadata"
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onCanPlay={() => setAudioUnavailable(false)}
      onError={() => {
        setIsStarting(false);
        setIsPlaying(false);
        setAudioUnavailable(true);
      }}
    />

    {gatewayOpen && <div className="immersion-gateway" role="dialog" aria-modal="true" aria-labelledby="immersion-title">
      <div className="immersion-gateway__panel">
        <div className="immersion-gateway__eyebrow"><span aria-hidden="true">✦</span> Your Friend</div>
        <h2 id="immersion-title">Begin your journey</h2>
        <button ref={beginButtonRef} className="immersion-gateway__begin" type="button" onClick={beginJourney}>Begin Journey</button>
      </div>
    </div>}

    <div className="audio-dock" aria-live="polite">
      <button className="audio-toggle" type="button" aria-label="Toggle background music" aria-pressed={isPlaying} onClick={toggleAudio}>
        <span className="audio-toggle__icon"><AudioStateIcon playing={isPlaying}/></span>
        <span className="audio-toggle__meta">
          <span className="audio-toggle__status">{status}</span>
          <span className="audio-toggle__track">{track.name} · {track.bpm} BPM</span>
        </span>
      </button>
      <button className="audio-next" type="button" aria-label="Play next ambient track" title="Next ambient track" onClick={cycleTrack}><NextIcon/></button>
    </div>
  </>;
}
