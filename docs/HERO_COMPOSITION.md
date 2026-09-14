# The hero composition

How the companion is placed against the scene behind her, why the numbers are
what they are, and what to do when you change the layout.

## The defect this exists to fix

She floated. Not because she was badly positioned — because the plates were.

Every scene ships a horizon painted somewhere between 0.59 and 0.92 of its own
height, and `background-size: cover` crops around the **centre** of an image. On
a 1920-wide hero that put the horizon at 0.758 of the frame. Her feet were also
at 0.758. She was standing *on* the horizon, which is a thing nothing in front of
it can do, and no amount of adjusting her position could fix it, because the
problem was where the sea was.

## The contract

`src/config/heroCalibration.ts` — the `yourfriend-marketing-hero-v1` profile.
Every number in it was measured with `tools/measure-hero.mjs` against a running
dev server at nineteen viewport widths, reading her head, feet, centre and body
width out of the poster's alpha bounds and the live layout. None of it is
estimated and none of it is borrowed from 3D-Avatar-Chatbot, whose composition
shares almost nothing with this one.

Three findings shaped everything downstream.

**The split is the stylesheets' own 760px breakpoint** — not the aspect, and not
`orientation: portrait`. At 768px the hero is 0.818, taller than it is wide, and
still the desktop composition with her on the right. One pixel narrower and she
is centred and thirteen points lower. Choosing by aspect gets the whole 768–1024
tablet band wrong in both directions.

**The hero's aspect is not constant within a profile either**: 0.82 to 2.54 on
desktop, 0.23 to 0.60 in portrait. A plate here is always cover-cropped, so the
contract has to survive a *range* of crops rather than match one aspect.

**Her feet move six points across desktop widths** — 0.695 to 0.753, about sixty
pixels. A ground line painted at one row and dropped in centred is correct at one
width and wrong at every other.

## Fitting a plate

`src/components/ambient/plateFit.ts`. A scene declares an anchor — "this row of
the plate is the ground" or "this row is the horizon" — and the fit sizes and
positions the plate so that row lands where the calibration says it should.

The trick is deliberate overscan. Cover leaves *zero* vertical slack whenever the
plate is wider than the hero, and a plate with no slack cannot be positioned at
all, so the fit takes `k = max(1 + overscan, heroAspect / plateAspect)` and
positions within the excess. A scale cap (`DEFAULT_MAX_SCALE`, 1.34) stops the
anchor from blowing a plate up until it is visibly soft; when the cap binds, the
fit reports the shortfall in `errorY` rather than hiding it.

Two symbolic targets:

- `heroY: 'feet'` — for a plate with real ground painted under her.
- `heroY: 'eyeline'` — for a plate whose only usable reference is its sea/sky
  line. A level camera puts the true horizon at its own height, always, so this
  is the photographically correct place for one.

## What is still wrong, and the number that says so

Every shipped scene clamps. Getting these horizons to eye level needs a 2.1x
enlargement of a 941px-tall plate, so the fit gives up 15 points short at 1920 —
better than standing on the horizon, and not correct.

Closing the gap needs plates *painted* for this composition: the horizon at
0.471 of the desktop master and 0.650 of the portrait master, and a standing
surface under her feet. Open `?heroCalibration=1` and the gap is the distance
between the yellow line and the cyan one.

## Generating plates that fit

`public/ambient/camera-contract.json` is the seam. It is generated —

```bash
npm run export:camera-contract
```

— from `heroCalibration.ts`, never written by hand, and
`tests/camera-contract.test.mjs` rebuilds it and fails on drift, so re-measuring
the hero without re-exporting cannot reach a commit.

3D-Ambience-Studio generates against it:

```bash
cp public/ambient/camera-contract.json \
   ../3D-Ambience-Studio/examples/backplate-camera/yourfriend-marketing-hero.json
cd ../3D-Ambience-Studio
export OPENAI_API_KEY=...          # never committed, never echoed
python -m ambience.cli generate-presets --contract yourfriend-marketing-hero.json
python -m ambience.cli generate-presets --contract yourfriend-marketing-hero.json --live --yes
```

The first run is a dry run and costs nothing: it prints the compiled prompts, the
sizes and where the files land. The batch is resumable and does not publish a
scene until both its plates exist.

The contract publishes **quiet zones** as well as the keep-clear box — the
regions with type composited over them. They are a different constraint: the
keep-clear box says *put no object here*, a quiet zone says *put no contrast
here*.

Landing the results means adding `lightPortrait` / `darkPortrait` to the scenes
in `src/config/ambientScenes.ts` and changing each anchor from
`{ heroY: 'eyeline' }` to `{ plateY: <ground row>, heroY: 'feet' }`. Until then
`resolveScenePlate` falls back to the landscape plate on mobile and
`composeScene` drops its anchor, because honouring an anchor for a shape the
picture was not composed for claims a precision it does not have.

## Poster and live avatar

They were framed differently: the poster filled 93.9% of the stage, the WebGL
camera 83.3% of it, so going live shrank her 11% and dropped her 3% in the middle
of a 900ms crossfade. `src/components/avatar/posterAlignment.ts` derives both
framings — one from the poster's alpha bounds, one from `fitCameraToObject`'s
padding and bias — and scales the poster to agree.

It adjusts the poster rather than the camera on purpose. Widening the camera to
full bleed would break the headroom guarantee `tests/avatar-framing.test.ts`
pins, and would change the framing at every viewport at once.

## After you change anything

Re-measure. The calibration is a description of a layout, and a description of a
layout the site no longer has is worse than no description, because the art still
generates — it just stops fitting.

```bash
npm run dev                       # one terminal
node tools/measure-hero.mjs       # another
npm run export:camera-contract
npm test
```

Then paste the measurements into the table and the curves in
`heroCalibration.ts`, in the same commit.
