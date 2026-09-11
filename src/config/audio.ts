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

export const audioBestPractices = [
  { title: 'User-gesture start', detail: 'Begin Journey starts the ambience from an explicit browser-approved user gesture.' },
  { title: 'Prominent controls', detail: 'A persistent sound control stays within easy reach.' },
  { title: 'Low volume', detail: 'Ambient playback settles at a calm 22% volume.' },
  { title: 'Seamless looping', detail: 'Each selected ambience loops without an abrupt stop.' },
  { title: 'Smooth fades', detail: 'Playback fades in over 2s and fades out over 1s.' },
  { title: 'Licensed sources', detail: 'Only verified royalty-free audio should ship to production.' },
  { title: 'Resting BPM', detail: 'Tracks stay within a relaxed 60–80 BPM range.' },
  { title: 'Browser-ready assets', detail: 'The player references only audio files that are actually deployed, avoiding broken source fallbacks.' },
  { title: 'Preference memory', detail: 'Mute changes are saved; Begin Journey remains the explicit opt-in that starts a new session.' },
  { title: 'Accessible controls', detail: 'Buttons are keyboard-ready and clearly labelled for assistive tech.' },
] as const;

export const AUDIO_VOLUME = 0.22;
export const AUDIO_FADE_IN_MS = 2_000;
export const AUDIO_FADE_OUT_MS = 1_000;
export const AUDIO_MUTED_STORAGE_KEY = 'yourfriend:ambient-audio-muted';
