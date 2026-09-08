# Companion marketing poster

The production landing page uses one locally hosted companion render generated from the real open-source **3D Avatar Chatbot** application. The poster is captured only after the avatar has loaded and the **Waiting-standard** VRMA animation has been applied, so the marketing page does not jump from one screenshot into a second T-pose/live state.

Source project:

- https://github.com/ruslanmv/3D-Avatar-Chatbot
- Live demo: https://www.yourfriend.online/
- Avatar model: `vendor/avatars/AvatarSample_A.vrm` (VRoid / CC0 in the source project)
- Animation: `vendor/animations/vrma/waiting-standard.vrma`
- Generated poster: `companion-waiting-standard.png`

## Regenerating the poster

The reproducible capture pipeline lives at:

```text
scripts/capture_waiting_standard.py
```

It drives the real application with Playwright, invokes the application's `NEXUS_CLIP_LOADER` API, waits until Waiting-standard is visibly active, isolates the avatar from scenery, and exports a transparent 900×1200 PNG with Pillow.

Local usage:

```bash
pip install playwright pillow
python -m playwright install chromium
python scripts/capture_waiting_standard.py
```

The GitHub Actions workflow `.github/workflows/capture-waiting-standard.yml` runs the same pipeline and commits the generated poster back to the redesign branch.

`companion-light.svg` and `companion-dark.svg` remain intentionally small emergency fallbacks. They are not the normal production character.
