#!/usr/bin/env python3
"""Batch-download and render the curated VRoid candidate library.

Requires the same dependencies and VROID_ACCESS_TOKEN used by vroid_pipeline.py.
The script deliberately re-checks every model through the VRoid Hub API before
it downloads anything. This keeps commercial/advertising use from relying on a
stale hand-written list when a creator changes their conditions.

Examples:
  # Render the top 3 candidates
  python scripts/vroid_batch.py --limit 3

  # Render only work-friendly candidates
  python scripts/vroid_batch.py --tag work --webp --svg-wrapper

  # Render specific slugs
  python scripts/vroid_batch.py --slug avatar-sample-o --slug model-girl --webp
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def load_manifest(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    candidates = data.get("candidates") or []
    return sorted(candidates, key=lambda item: item.get("priority", 999))


def select_candidates(candidates: list[dict], slugs: list[str], tag: str | None, limit: int | None) -> list[dict]:
    selected = candidates
    if slugs:
        wanted = set(slugs)
        selected = [item for item in selected if item.get("slug") in wanted]
    if tag:
        selected = [item for item in selected if tag in (item.get("recommended_for") or [])]
    if limit is not None:
        selected = selected[:limit]
    return selected


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", default="scripts/vroid_candidates.json")
    parser.add_argument("--out-root", default="output/vroid-library")
    parser.add_argument("--slug", action="append", default=[])
    parser.add_argument("--tag", default=None, help="work, casual, fun, fan-service, premium, etc.")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--blender", default="blender")
    parser.add_argument("--width", type=int, default=800)
    parser.add_argument("--height", type=int, default=1100)
    parser.add_argument("--yaw", type=float, default=180.0)
    parser.add_argument("--webp", action="store_true")
    parser.add_argument("--svg-wrapper", action="store_true")
    args = parser.parse_args()

    manifest_path = Path(args.manifest).resolve()
    pipeline_path = Path(__file__).resolve().parent / "vroid_pipeline.py"
    out_root = Path(args.out_root).resolve()

    candidates = load_manifest(manifest_path)
    selected = select_candidates(candidates, args.slug, args.tag, args.limit)
    if not selected:
        print("No candidates matched the requested filters.", file=sys.stderr)
        return 2

    print(f"Processing {len(selected)} VRoid candidate(s).")
    failures: list[tuple[str, int]] = []

    for index, item in enumerate(selected, 1):
        slug = item["slug"]
        model_id = str(item["model_id"])
        destination = out_root / slug
        cmd = [
            sys.executable,
            str(pipeline_path),
            "--model-id",
            model_id,
            "--out-dir",
            str(destination),
            "--name",
            slug,
            "--blender",
            args.blender,
            "--width",
            str(args.width),
            "--height",
            str(args.height),
            "--yaw",
            str(args.yaw),
        ]
        if args.webp:
            cmd.append("--webp")
        if args.svg_wrapper:
            cmd.append("--svg-wrapper")

        print(f"\n[{index}/{len(selected)}] {item['name']} ({model_id})")
        print(item["url"])
        result = subprocess.run(cmd, check=False)
        if result.returncode:
            failures.append((slug, result.returncode))

    if failures:
        print("\nSome candidates failed:", file=sys.stderr)
        for slug, code in failures:
            print(f"  - {slug}: exit {code}", file=sys.stderr)
        return 1

    print(f"\nFinished. Assets are under {out_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
