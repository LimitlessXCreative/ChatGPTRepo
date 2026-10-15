# NZT-48 original product assets

The current deliverable is `web-kit/`: two static low-poly GLBs for piece-by-piece Three.js animation. Use `web-kit/nzt48-bottle-cap.glb` for the assembled bottle with separately controllable Bottle and Cap groups, and `web-kit/nzt48-gold-pill.glb` for one centered, clonable golden pill. Both files use meters, unit root scales and zero animation clips.

The bottle is glossy deep amber-black; the 2 × 6 inch label is matte black with reflective cap-matched gold foil lettering, logo and accents. The current source is `references/approved-label.png`, including its printed 60 CAPS. Golden amber capsule geometry includes the requested 2× size and embedded baked studio illumination.

`web-kit/CLAUDE_HANDOFF.md` documents hierarchy, pivots, direct cap rotation/lift, exact reseating, independent pill cloning and lighting. `nzt-model.js` loads the parts; `studio-lighting.js` reproduces the studio reflections. The preview's motion is authored in JavaScript; no animation is stored in either delivered GLB.

## Preview and download

Serve `web-kit/index.html` over HTTP. The current local preview is http://127.0.0.1:4186/outputs/nzt-48-original-3d/web-kit/ . `capsule-preview.html` displays the standalone pill without lights. Current screenshots are under `web-kit/previews/`.

`NZT-48-Threejs-Static-Pieces-Claude-Kit.zip` is the current handoff bundle. It includes exactly two GLBs, helper modules, offline-capable examples, source artwork, material maps and verification.

## Scale and artwork

Scale is anchored to the 6-inch circumference and 2-inch label height with no seam overlap. Remaining bottle dimensions are inferred from photographs. Source bleed is cropped from 3756 × 1356 to 3600 × 1200, then resampled to the 3072 × 1024 embedded wrap. Original side panels, barcode, QR and copy are retained. Source artwork also prints Servings Per Container 30.

## Rebuild and earlier iterations

`build-piece-models.cjs` converts the approved existing geometry/materials into the two static meter-scale assets. `verify-piece-models.cjs` checks structure, units, physical label dimensions, embedded texture preservation and absence of animation clips. The native model pipeline is `model.js`, `low-poly.js`, `capsule-bake.js`, `capsule-uv-bake.js` and `export-glb.js`.

Earlier animated models remain in `model/` as build inputs/history. Earlier renders and generated packshots remain outside the final web kit. Use the two static GLBs in `web-kit/` for the website. Prior lighting, labels and animation snapshots are not the current handoff.
