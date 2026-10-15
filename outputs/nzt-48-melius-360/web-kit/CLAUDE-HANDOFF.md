# NZT-48 studio rotation: Claude handoff

Use the supplied Melius render as the product visual. It already contains the studio lighting, glossy amber-black body, gold cap and foil, and matte label. Keep the pixels at their original color; do not apply brightness, saturation or glow filters.

## Files

- `nzt48-studio-360-alpha.webm`: 1080 × 1080, 24 fps, 9 seconds, silent, true alpha. Approximately 3 MB.
- `poster.png`: transparent front view, 960 × 960.
- `frames/`: 216 transparent WebP frames, 960 × 960.
- `frames.json`: frame count, timing and asset information.
- `index.html`: dependency-free canvas viewer, autoplay, drag to rotate and pause/play.
- `EMBED_IN_HTML.md`: copyable video and iframe examples.

## Integration

Copy this folder to `/public/assets/nzt48/`. For identical transparency across browsers, embed `/assets/nzt48/index.html?embed=1` or adapt the canvas module from index.html into your page. The embed view has no header or controls, and its page and canvas backgrounds are transparent. Give the iframe a square or near-square area.

The frame sequence is a photographed-style turntable, not a GLB. Frame selection controls the bottle angle. It cannot independently move the cap or pills. There are no live lights to set up.

## Label accuracy

The approved 6 × 2 inch artwork was supplied to Melius. The main front branding, four benefit lines and 60 CAPS design are represented. Tiny side-panel lettering, barcode and production fields are AI approximations and are not an exact reproduction of the source artwork.
