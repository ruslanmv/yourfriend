export type AmbientTrack = {
  id: string;
  name: string;
  bpm: number;
  mp3: string;
};

const audioAsset = (filename: string) => `${import.meta.env.BASE_URL}audio/${filename}`;

export const ambientTracks: readonly AmbientTrack[] = [
  {
    id: 'ambient-ocean',
    name: 'Ambient Ocean',
    bpm: 65,
    mp3: audioAsset('track1-ambient-ocean-65bpm.mp3'),
  },
  {
    id: 'lofi-chill',
    name: 'Lo-Fi Chill',
    bpm: 70,
    mp3: audioAsset('track2-lofi-chill-70bpm.mp3'),
  },
  {
    id: 'ethereal-meditation',
    name: 'Ethereal Meditation',
    bpm: 60,
    mp3: audioAsset('track3-ethereal-meditation-60bpm.mp3'),
  },
];

export const AUDIO_VOLUME = 0.22;
export const AUDIO_FADE_IN_MS = 2_000;
export const AUDIO_FADE_OUT_MS = 1_000;
export const AUDIO_MUTED_STORAGE_KEY = 'yourfriend:ambient-audio-muted';
