#!/usr/bin/env python3
"""
VRoid Hub -> licensed VRM -> transparent PNG/WebP poster.

Requirements:
  pip install requests pillow

Environment:
  VROID_ACCESS_TOKEN=<OAuth access token>

Example:
  python scripts/vroid_pipeline.py \
    --model-id 3390783334862270831 \
    --out-dir ./public/avatar/posters \
    --name avatar-sample-o \
    --blender blender \
    --webp \
    --svg-wrapper

This script:
  1) Reads the VRoid Hub model details and checks commercial/download permissions.
  2) Saves a dated license snapshot.
  3) Issues a VRoid Hub download license and downloads the .vrm.
  4) Calls Blender in background mode to render a transparent PNG.
  5) Optionally writes WebP and an SVG wrapper.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

API_ROOT = "https://hub.vroid.com"
API_VERSION = "11"


class PipelineError(RuntimeError):
    pass


def api_headers(token: str, json_body: bool = False) -> dict[str, str]:
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Api-Version": API_VERSION,
    }
    if json_body:
        headers["Content-Type"] = "application/json"
    return headers


def api_get(token: str, path: str) -> dict:
    response = requests.get(
        f"{API_ROOT}{path}",
        headers=api_headers(token),
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def verify_model_for_advertising(model_detail: dict) -> dict:
    data = model_detail.get("data") or {}
    model = data.get("character_model") or {}
    license_info = model.get("license") or {}

    problems: list[str] = []

    if not model.get("is_downloadable"):
        problems.append("model is not downloadable")
    if not model.get("is_other_users_available"):
        problems.append("model is not available for other users")

    corporate = license_info.get("corporate_commercial_use")
    personal = license_info.get("personal_commercial_use")
    modification = license_info.get("modification")

    if corporate != "allow":
        problems.append(
            f"corporate commercial use is {corporate!r}, expected 'allow'"
        )

    if personal not in {"profit", "allow"}:
        problems.append(
            f"individual for-profit use is {personal!r}, expected 'profit'/'allow'"
        )

    if modification not in {"allow", "allow_modification", "allow_modification_redistribution"}:
        problems.append(
            f"modification is {modification!r}; choose a model that explicitly allows it"
        )

    if problems:
        raise PipelineError(
            "The model does not meet the advertising-safe policy used by this script:\n- "
            + "\n- ".join(problems)
        )

    character = model.get("character") or {}
    return {
        "id": model.get("id"),
        "name": model.get("name"),
        "character": character.get("name"),
        "is_downloadable": model.get("is_downloadable"),
        "is_other_users_available": model.get("is_other_users_available"),
        "license": license_info,
        "published_at": model.get("published_at"),
        "latest_character_model_version": model.get(
            "latest_character_model_version"
        ),
        "source_url": (
            f"https://hub.vroid.com/en/characters/{character.get('id', '')}"
            f"/models/{model.get('id', '')}"
        ),
    }


def download_vrm(token: str, model_id: str, output: Path) -> str:
    license_response = requests.post(
        f"{API_ROOT}/api/download_licenses",
        headers=api_headers(token, json_body=True),
        json={"character_model_id": model_id},
        timeout=30,
    )
    license_response.raise_for_status()
    license_id = (license_response.json().get("data") or {}).get("id")
    if not license_id:
        raise PipelineError("VRoid Hub did not return a download license ID.")

    redirect_response = requests.get(
        f"{API_ROOT}/api/download_licenses/{license_id}/download",
        headers={
            **api_headers(token),
            "Accept-Encoding": "gzip",
        },
        allow_redirects=False,
        timeout=30,
    )
    if redirect_response.status_code not in {301, 302, 303, 307, 308}:
        raise PipelineError(
            "Expected a download redirect, received HTTP "
            f"{redirect_response.status_code}: {redirect_response.text[:500]}"
        )

    download_url = redirect_response.headers.get("Location")
    if not download_url:
        raise PipelineError("VRoid Hub did not provide the presigned download URL.")

    with requests.get(download_url, stream=True, timeout=120) as response:
        response.raise_for_status()
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("wb") as f:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

    return license_id


def run_blender(
    blender: str,
    render_script: Path,
    vrm_path: Path,
    png_path: Path,
    width: int,
    height: int,
    yaw: float,
) -> None:
    blender_bin = shutil.which(blender) or blender
    cmd = [
        blender_bin,
        "--background",
        "--python",
        str(render_script),
        "--",
        "--input",
        str(vrm_path),
        "--output",
        str(png_path),
        "--width",
        str(width),
        "--height",
        str(height),
        "--yaw",
        str(yaw),
    ]
    print("Running:", " ".join(cmd))
    subprocess.run(cmd, check=True)


def png_to_webp(png_path: Path, webp_path: Path) -> None:
    try:
        from PIL import Image
    except ImportError as exc:
        raise PipelineError(
            "Pillow is required for --webp. Install with: pip install pillow"
        ) from exc

    with Image.open(png_path) as image:
        image.save(webp_path, "WEBP", lossless=True, method=6)


def write_svg_wrapper(png_path: Path, svg_path: Path, width: int, height: int) -> None:
    encoded = base64.b64encode(png_path.read_bytes()).decode("ascii")
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{width}" height="{height}" viewBox="0 0 {width} {height}">\n'
        f'  <image width="{width}" height="{height}" '
        f'href="data:image/png;base64,{encoded}" />\n'
        f'</svg>\n'
    )
    svg_path.write_text(svg, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-id", required=True, help="VRoid Hub character model ID")
    parser.add_argument("--out-dir", default="./output")
    parser.add_argument("--name", default="companion")
    parser.add_argument("--blender", default="blender")
    parser.add_argument("--render-script", default=None)
    parser.add_argument("--width", type=int, default=800)
    parser.add_argument("--height", type=int, default=1100)
    parser.add_argument(
        "--yaw",
        type=float,
        default=180.0,
        help="Rotate avatar around vertical axis. Use 0 if the first render faces backward.",
    )
    parser.add_argument("--webp", action="store_true")
    parser.add_argument(
        "--svg-wrapper",
        action="store_true",
        help="Create an SVG containing the rendered PNG. This is not true vector artwork.",
    )
    args = parser.parse_args()

    token = os.environ.get("VROID_ACCESS_TOKEN")
    if not token:
        raise PipelineError(
            "Set VROID_ACCESS_TOKEN to an OAuth access token from your VRoid Hub app."
        )

    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    script_dir = Path(__file__).resolve().parent
    render_script = (
        Path(args.render_script).resolve()
        if args.render_script
        else script_dir / "blender_vrm_render.py"
    )
    if not render_script.exists():
        raise PipelineError(f"Blender render script not found: {render_script}")

    print("Checking model license...")
    model_detail = api_get(token, f"/api/character_models/{args.model_id}")
    snapshot = verify_model_for_advertising(model_detail)

    snapshot["checked_at_utc"] = datetime.now(timezone.utc).isoformat()
    snapshot_path = out_dir / f"{args.name}-license.json"
    snapshot_path.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"License snapshot: {snapshot_path}")

    vrm_path = out_dir / f"{args.name}.vrm"
    print("Downloading VRM...")
    license_id = download_vrm(token, args.model_id, vrm_path)
    print(f"Downloaded: {vrm_path} (download license {license_id})")

    png_path = out_dir / f"{args.name}.png"
    print("Rendering transparent PNG...")
    run_blender(
        args.blender,
        render_script,
        vrm_path,
        png_path,
        args.width,
        args.height,
        args.yaw,
    )
    print(f"PNG: {png_path}")

    if args.webp:
        webp_path = out_dir / f"{args.name}.webp"
        png_to_webp(png_path, webp_path)
        print(f"WebP: {webp_path}")

    if args.svg_wrapper:
        svg_path = out_dir / f"{args.name}.svg"
        write_svg_wrapper(png_path, svg_path, args.width, args.height)
        print(f"SVG wrapper: {svg_path}")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except requests.HTTPError as exc:
        body = ""
        if exc.response is not None:
            body = exc.response.text[:1000]
        print(f"HTTP error: {exc}\n{body}", file=sys.stderr)
        raise SystemExit(2)
    except PipelineError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(2)
