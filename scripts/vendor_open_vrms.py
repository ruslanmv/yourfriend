#!/usr/bin/env python3
"""Download and verify the small CC0 VRM redesign set used by YourFriend.

These URLs are the same public VRoid sample sources consumed by
ruslanmv/3D-Avatar-Chatbot/scripts/vendor-avatars.sh. No API credentials are
required.

Examples:
    python scripts/vendor_open_vrms.py --all
    python scripts/vendor_open_vrms.py --model fem-vroid --model masc-vroid
    python scripts/vendor_open_vrms.py --all --check-only

The downloader verifies that every file is a GLB/VRM container (``glTF`` magic),
that the GLB header declares version 2, and that the declared length matches the
file on disk. It writes a manifest with SHA-256 hashes so redesign assets remain
reproducible.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import struct
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

MODELS = {
    "avatar-sample-a": {
        "name": "AvatarSample A",
        "file": "AvatarSample_A.vrm",
        "presentation": "feminine",
        "source": "https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/stable/AvatarSample_A.vrm",
        "license": "CC0",
    },
    "avatar-sample-b": {
        "name": "AvatarSample B",
        "file": "AvatarSample_B.vrm",
        "presentation": "masculine",
        "source": "https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/stable/AvatarSample_B.vrm",
        "license": "CC0",
    },
    "avatar-sample-c": {
        "name": "AvatarSample C",
        "file": "AvatarSample_C.vrm",
        "presentation": "feminine",
        "source": "https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/stable/AvatarSample_C.vrm",
        "license": "CC0",
    },
    "fem-vroid": {
        "name": "VRoid Female",
        "file": "fem_vroid.vrm",
        "presentation": "feminine",
        "source": "https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/fem_vroid.vrm",
        "license": "CC0",
    },
    "masc-vroid": {
        "name": "VRoid Male",
        "file": "masc_vroid.vrm",
        "presentation": "masculine",
        "source": "https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/masc_vroid.vrm",
        "license": "CC0",
    },
}


def validate_glb(path: Path) -> dict[str, int | str]:
    data = path.read_bytes()
    if len(data) < 20:
        raise ValueError(f"{path}: file is too small to be a VRM/GLB")
    if data[:4] != b"glTF":
        raise ValueError(f"{path}: invalid GLB magic {data[:4]!r}")
    version, declared_length = struct.unpack_from("<II", data, 4)
    if version != 2:
        raise ValueError(f"{path}: unsupported GLB version {version}; expected 2")
    if declared_length != len(data):
        raise ValueError(
            f"{path}: GLB header length {declared_length} != file length {len(data)}"
        )
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "glb_version": version,
    }


def download(url: str, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    tmp = output.with_suffix(output.suffix + ".part")
    request = urllib.request.Request(url, headers={"User-Agent": "yourfriend-vrm-vendor/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=120) as response, tmp.open("wb") as handle:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                handle.write(chunk)
    except (urllib.error.HTTPError, urllib.error.URLError) as exc:
        tmp.unlink(missing_ok=True)
        raise RuntimeError(f"download failed for {url}: {exc}") from exc
    tmp.replace(output)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--out-dir",
        default="public/avatar/models/cc0",
        help="Directory used for vendored redesign models.",
    )
    parser.add_argument(
        "--model",
        action="append",
        choices=sorted(MODELS),
        help="Download one model. Repeat for more than one.",
    )
    parser.add_argument("--all", action="store_true", help="Download the complete curated CC0 set.")
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Do not download; only validate files already present.",
    )
    args = parser.parse_args()

    selected = list(MODELS) if args.all else (args.model or [])
    if not selected:
        parser.error("choose --all or at least one --model")

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    entries = []

    for slug in selected:
        spec = MODELS[slug]
        path = out_dir / str(spec["file"])
        if not args.check_only:
            print(f"Downloading {spec['name']} -> {path}")
            download(str(spec["source"]), path)
        if not path.exists():
            raise FileNotFoundError(f"missing model: {path}")
        verification = validate_glb(path)
        print(
            f"OK {spec['name']}: {verification['bytes']} bytes "
            f"sha256={verification['sha256']}"
        )
        entries.append(
            {
                "slug": slug,
                **spec,
                **verification,
            }
        )

    manifest = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "license_note": "Curated public VRoid sample models identified by the upstream 3D-Avatar-Chatbot project as CC0. Keep source metadata with redistributed files.",
        "items": entries,
    }
    manifest_path = out_dir / "models.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
