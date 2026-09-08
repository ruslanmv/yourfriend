#!/usr/bin/env python3
"""Capture the real 3D Avatar Chatbot avatar in the Waiting-standard VRMA pose.

This script intentionally drives the public/open-source application rather than
maintaining a second pose implementation in the marketing site. It waits for the
real ViewerEngine + clip loader, plays `waiting-standard.vrma`, isolates the
avatar from scene meshes/background, freezes the rendered pose, and exports the
WebGL canvas' own RGBA PNG buffer.

Reading the raw canvas buffer is important: an element screenshot can composite
transparent WebGL pixels against the app's black viewer/container and bake that
black rectangle into the poster.

Usage:
    pip install playwright pillow
    python -m playwright install chromium
    python scripts/capture_waiting_standard.py

The default output is:
    public/avatar/posters/companion-waiting-standard.png
"""

from __future__ import annotations

import argparse
import asyncio
import base64
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

DEFAULT_URL = "https://www.yourfriend.online/"
DEFAULT_CLIP = "vendor/animations/vrma/waiting-standard.vrma"
DEFAULT_OUTPUT = Path("public/avatar/posters/companion-waiting-standard.png")


def assert_transparent_background(image: Image.Image, label: str) -> None:
    """Fail fast if the capture accidentally contains an opaque viewer background."""
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    width, height = rgba.size

    corners = (
        alpha.getpixel((0, 0)),
        alpha.getpixel((width - 1, 0)),
        alpha.getpixel((0, height - 1)),
        alpha.getpixel((width - 1, height - 1)),
    )
    transparent_pixels = sum(1 for value in alpha.getdata() if value <= 8)
    transparent_ratio = transparent_pixels / float(width * height)

    if min(corners) > 8 or transparent_ratio < 0.10:
        raise RuntimeError(
            f"{label} is not genuinely transparent: corners={corners}, "
            f"transparent_ratio={transparent_ratio:.3f}. Refusing to publish a "
            "poster with a baked viewer/background rectangle."
        )


def normalize_transparent_poster(source: Path, output: Path, width: int, height: int) -> None:
    """Trim transparent margins and place the avatar on a fixed transparent canvas."""
    image = Image.open(source).convert("RGBA")
    assert_transparent_background(image, "Raw WebGL capture")

    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError("Captured canvas is fully transparent; avatar was not rendered")

    avatar = image.crop(bbox)
    max_w = int(width * 0.88)
    max_h = int(height * 0.94)
    scale = min(max_w / avatar.width, max_h / avatar.height)
    resized = avatar.resize(
        (max(1, round(avatar.width * scale)), max(1, round(avatar.height * scale))),
        Image.Resampling.LANCZOS,
    )

    poster = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    x = (width - resized.width) // 2
    # Keep a little more air above the head than below the feet.
    y = max(0, height - resized.height - int(height * 0.025))
    poster.alpha_composite(resized, (x, y))
    assert_transparent_background(poster, "Normalized poster")

    output.parent.mkdir(parents=True, exist_ok=True)
    poster.save(output, optimize=True)


async def capture(args: argparse.Namespace) -> None:
    raw_output = args.output.with_suffix(".raw.png")
    raw_output.parent.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            headless=True,
            args=[
                "--use-gl=swiftshader",
                "--enable-webgl",
                "--ignore-gpu-blocklist",
                "--disable-dev-shm-usage",
            ],
        )
        page = await browser.new_page(
            viewport={"width": args.viewport_width, "height": args.viewport_height},
            device_scale_factor=1,
        )
        page.set_default_timeout(args.timeout_ms)

        await page.goto(args.url, wait_until="domcontentloaded", timeout=args.timeout_ms)
        await page.wait_for_function(
            """() => Boolean(
                window.NEXUS_VIEWER?.avatarManager?._currentVRM &&
                window.NEXUS_VIEWER?.avatarManager?.currentRoot &&
                window.NEXUS_CLIP_LOADER?.playClip
            )""",
            timeout=args.timeout_ms,
        )

        # Use the same public animation API used by the application itself.
        await page.evaluate(
            """async ({ clip }) => {
                const viewer = window.NEXUS_VIEWER;
                const root = viewer.avatarManager.currentRoot;

                if (window.NEXUS_CAMERA_PRESETS?.transitionToFullBody) {
                    window.NEXUS_CAMERA_PRESETS.transitionToFullBody(0);
                } else if (viewer.frameObject) {
                    viewer.frameObject(root);
                }

                const result = window.NEXUS_CLIP_LOADER.playClip(clip, {
                    loop: true,
                    fadeIn: 0,
                });
                if (result && typeof result.then === 'function') await result;
            }""",
            {"clip": args.clip},
        )

        # Capture after the animation has clearly left its bind/T pose. 4.2 s
        # lands in a calm section of the ~11.7 s Waiting-standard loop.
        await page.wait_for_timeout(args.pose_ms)

        # Freeze the current frame, isolate the avatar, render once with an
        # alpha-zero clear, and read the WebGL canvas' own PNG bytes. This avoids
        # Playwright/DOM compositing the transparent canvas over the app's black
        # viewer background.
        data_url = await page.evaluate(
            """() => {
                const viewer = window.NEXUS_VIEWER;
                const root = viewer?.avatarManager?.currentRoot;
                if (!viewer || !root) throw new Error('Avatar viewer is unavailable');

                // Freeze the exact Waiting-standard frame used for the poster.
                viewer.renderer.setAnimationLoop(null);

                const keep = new Set();
                root.traverse((object) => keep.add(object));
                viewer.scene.traverse((object) => {
                    if (object === viewer.scene || keep.has(object) || object.isLight) return;
                    object.visible = false;
                });

                viewer.scene.background = null;
                viewer.renderer.setClearColor(0x000000, 0);
                viewer.renderer.setClearAlpha?.(0);
                viewer.renderer.clear(true, true, true);
                viewer.renderer.render(viewer.scene, viewer.camera);

                const canvas = viewer.renderer.domElement;
                canvas.style.background = 'transparent';
                return canvas.toDataURL('image/png');
            }"""
        )

        if not data_url or not data_url.startswith("data:image/png;base64,"):
            raise RuntimeError("Viewer did not return a PNG data URL")

        _, encoded = data_url.split(",", 1)
        raw_output.write_bytes(base64.b64decode(encoded))
        await browser.close()

    normalize_transparent_poster(raw_output, args.output, args.width, args.height)
    raw_output.unlink(missing_ok=True)
    print(f"Captured transparent Waiting-standard poster: {args.output}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--clip", default=DEFAULT_CLIP)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--width", type=int, default=900)
    parser.add_argument("--height", type=int, default=1200)
    parser.add_argument("--viewport-width", type=int, default=1440)
    parser.add_argument("--viewport-height", type=int, default=1000)
    parser.add_argument("--pose-ms", type=int, default=4200)
    parser.add_argument("--timeout-ms", type=int, default=120000)
    return parser.parse_args()


if __name__ == "__main__":
    asyncio.run(capture(parse_args()))
