#!/usr/bin/env python3
"""Download the curated VRoid Hub candidates after OAuth authorization.

This script deliberately refuses to download a model unless the live API still
reports the commercial/download permissions required by this repository. It
writes a per-model license snapshot plus a SHA-256 manifest next to the VRMs.

Authentication order:
  1. VROID_ACCESS_TOKEN environment variable
  2. `.vroid-token.json` created by `scripts/vroid_oauth.py`

Examples:
  python scripts/download_vroid_candidates.py --list
  python scripts/download_vroid_candidates.py --only avatar-sample-o
  python scripts/download_vroid_candidates.py --all
  python scripts/download_vroid_candidates.py --all --check-only
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import struct
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

from vroid_pipeline import api_get, download_vrm, verify_model_for_advertising

TOKEN_FILE = Path(".vroid-token.json")
DEFAULT_CANDIDATES = Path(__file__).resolve().with_name("vroid_candidates.json")
DEFAULT_OUT = Path("public/avatar/models/vroid-hub")


def access_token() -> str:
    token = os.environ.get("VROID_ACCESS_TOKEN")
    if token:
        return token
    if TOKEN_FILE.exists():
        payload = json.loads(TOKEN_FILE.read_text(encoding="utf-8"))
        token = payload.get("access_token")
        if token:
            return token
    raise RuntimeError(
        "No VRoid access token. Set VROID_ACCESS_TOKEN or complete OAuth with "
        "`python scripts/vroid_oauth.py authorize` then `exchange`."
    )


def validate_vrm(path: Path) -> dict[str, int | str]:
    data = path.read_bytes()
    if len(data) < 20 or data[:4] != b"glTF":
        raise ValueError(f"{path}: not a valid GLB/VRM container")
    version, declared_length = struct.unpack_from("<II", data, 4)
    if version != 2:
        raise ValueError(f"{path}: GLB version {version}, expected 2")
    if declared_length != len(data):
        raise ValueError(
            f"{path}: GLB declared length {declared_length} != {len(data)}"
        )
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "glb_version": version,
    }


def load_candidates(path: Path) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    candidates = payload.get("candidates") or []
    if not candidates:
        raise RuntimeError(f"No candidates found in {path}")
    return candidates


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidates", type=Path, default=DEFAULT_CANDIDATES)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--only", action="append", help="Candidate slug; repeat for several.")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--list", action="store_true")
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Validate already downloaded files without calling VRoid Hub.",
    )
    args = parser.parse_args()

    candidates = load_candidates(args.candidates)
    by_slug = {candidate["slug"]: candidate for candidate in candidates}

    if args.list:
        for candidate in candidates:
            print(f"{candidate['slug']:<24} {candidate['model_id']}  {candidate['name']}")
        return 0

    selected_slugs = list(by_slug) if args.all else (args.only or [])
    if not selected_slugs:
        parser.error("choose --all, --only <slug>, or --list")
    unknown = [slug for slug in selected_slugs if slug not in by_slug]
    if unknown:
        parser.error("unknown candidate slug(s): " + ", ".join(unknown))

    args.out_dir.mkdir(parents=True, exist_ok=True)
    token = None if args.check_only else access_token()
    manifest_items = []

    for slug in selected_slugs:
        candidate = by_slug[slug]
        model_id = str(candidate["model_id"])
        vrm_path = args.out_dir / f"{slug}.vrm"
        license_path = args.out_dir / f"{slug}-license.json"

        if args.check_only:
            if not vrm_path.exists():
                raise FileNotFoundError(f"missing downloaded model: {vrm_path}")
            snapshot = (
                json.loads(license_path.read_text(encoding="utf-8"))
                if license_path.exists()
                else {"source_url": candidate["url"], "model_id": model_id}
            )
        else:
            assert token is not None
            print(f"Checking live permissions: {candidate['name']} ({model_id})")
            detail = api_get(token, f"/api/character_models/{model_id}")
            snapshot = verify_model_for_advertising(detail)
            snapshot.update(
                {
                    "candidate_slug": slug,
                    "candidate_name": candidate["name"],
                    "checked_at_utc": datetime.now(timezone.utc).isoformat(),
                }
            )
            license_path.write_text(
                json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"Downloading authorized VRM: {candidate['name']}")
            download_license_id = download_vrm(token, model_id, vrm_path)
            snapshot["download_license_id"] = download_license_id
            license_path.write_text(
                json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

        verified = validate_vrm(vrm_path)
        print(
            f"OK {candidate['name']}: {verified['bytes']} bytes "
            f"sha256={verified['sha256']}"
        )
        manifest_items.append(
            {
                "slug": slug,
                "name": candidate["name"],
                "model_id": model_id,
                "source_url": candidate["url"],
                "file": vrm_path.name,
                "license_snapshot": license_path.name,
                **verified,
            }
        )

    manifest_path = args.out_dir / "models.json"
    manifest_path.write_text(
        json.dumps(
            {
                "generated_at_utc": datetime.now(timezone.utc).isoformat(),
                "notice": "Each model is downloaded only after the live VRoid Hub API passes this repository's commercial/download policy. Re-check terms before a new advertising campaign.",
                "items": manifest_items,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except requests.HTTPError as exc:
        detail = exc.response.text[:1000] if exc.response is not None else ""
        print(f"HTTP error: {exc}\n{detail}", file=sys.stderr)
        raise SystemExit(2)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(2)
