# Canonical companion posters

The light and dark launch posters are text-based SVG assets so repository review and pull-request tooling remain portable. They render immediately before optional WebGL and contain no embedded raster data.

For the final licensed character release, replace them with transparent AVIF/WebP exports from the canonical VRM, update `src/config/avatar.ts` and the `<picture>` sources in `AvatarPoster.tsx`, and retain these SVGs as lightweight emergency fallbacks. Do not include scenery, text, or UI in replacement renders.
