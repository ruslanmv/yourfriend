# Companion poster fallback

The production landing page now uses a **real capture from the open-source 3D Avatar Chatbot project** as its static poster and upgrades to the live CC0 VRM when WebGL/device capability allows it.

Source project:

- https://github.com/ruslanmv/3D-Avatar-Chatbot
- Poster: `assets/companion-fullscreen.png`
- Live model: `vendor/avatars/AvatarSample_A.vrm` (listed by the source project as VRoid / CC0)

`companion-light.svg` and `companion-dark.svg` remain intentionally small, text-reviewable emergency fallbacks for offline/CDN failure. They are no longer the normal landing-page character.

When shipping a locally hosted production poster later, prefer transparent AVIF/WebP renders generated directly from the canonical VRM. Do not bake scenery, text, or UI into that final cutout.
