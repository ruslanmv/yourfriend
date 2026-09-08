# Curated VRoid avatar workflow

The repository contains a small, advertising-oriented VRoid Hub candidate list in `scripts/vroid_candidates.json` plus two processing entry points:

- `vroid_pipeline.py` checks one model's current VRoid Hub license, downloads the authorized VRM, renders a transparent PNG with Blender, and can also produce WebP and an SVG wrapper.
- `vroid_batch.py` runs that same verified pipeline across the curated candidate list.

## Why the license is re-checked

The JSON manifest is discovery metadata, not a permanent license grant. VRoid Hub creators can change model conditions. Every actual download goes through `vroid_pipeline.py`, which re-fetches the model details and rejects a model if the required advertising/commercial permissions are no longer present.

## Requirements

```bash
pip install requests pillow
```

Install Blender. For best VRM/MToon fidelity also install the VRM Add-on for Blender.

Set a VRoid Hub OAuth token:

```bash
export VROID_ACCESS_TOKEN="YOUR_OAUTH_ACCESS_TOKEN"
```

## Render AvatarSample_O

```bash
python scripts/vroid_pipeline.py \
  --model-id 3390783334862270831 \
  --out-dir public/avatar/posters/avatar-sample-o \
  --name avatar-sample-o \
  --webp \
  --svg-wrapper
```

## Render the best work candidates

```bash
python scripts/vroid_batch.py --tag work --limit 3 --webp --svg-wrapper
```

## Render the adult fan-service candidates

```bash
python scripts/vroid_batch.py --tag fan-service --webp --svg-wrapper
```

The manifest deliberately excludes school-age/minor-coded models from fan-service recommendations. Keep that separation when adding new candidates.

## Output

Each processed candidate receives its own folder containing the authorized `.vrm`, transparent `.png`, optional `.webp`, optional SVG wrapper, and a dated JSON license snapshot.

Do not commit VRM binaries or rendered assets until you have reviewed both the current license snapshot and the visual result.
