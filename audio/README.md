# Ambient audio assets

The production player currently uses these deployed MP3 files:

- `track1-ambient-ocean-65bpm.mp3` — default track
- `track2-lofi-chill-70bpm.mp3`
- `track3-ethereal-meditation-60bpm.mp3`

The UI intentionally references only files that are present in production. If alternate OGG/WebM versions are added later, update the player and tests at the same time so browsers never try a missing source first.

Keep the files reasonably compressed for web delivery and test seamless looping before publishing.

## Licensing

Only ship audio whose license you have verified for web redistribution. Do not assume a track is CC0 because it came from a royalty-free library. Record the source URL, license, creator/attribution requirements, and download date for each final asset before deployment.
