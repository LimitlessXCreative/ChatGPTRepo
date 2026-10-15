# NZT-48 static Three.js pieces

Deliver two static, self-contained GLBs. Neither file contains animation clips. Animate the parts with your own JavaScript, GSAP, scroll timeline or React Three Fiber code. No AnimationMixer is needed.

## Files and hierarchy

`nzt48-bottle-cap.glb` contains the assembled bottle and cap, already seated:

```
NZT48Product                 ← rotate the whole product
├── Bottle                  ← body and label move together
│   ├── BottleBody
│   └── Label
└── Cap                     ← twist/lift this independently
    ├── Gold cap
    └── Cap liner
```

`nzt48-gold-pill.glb` contains one centered golden amber capsule. Its root is `GoldPill`, with a `Pill` group containing two shell meshes. Clone the root to create any number of pills. Clones share geometry, textures and materials while retaining independent transforms.

Both files use meters with root scale `(1,1,1)`. The bottle axis is Y and its base is at the origin. The cap pivot is centered on its underside, so local Y rotation twists it naturally. The pill pivot is at its center and its long axis is X. The requested 2× pill size is incorporated into geometry; do not double its scale again.

Bottle + cap: 7,104 triangles, four mesh draws, 721,524 bytes. Single pill: 864 triangles, two mesh draws, 793,940 bytes. Embedded textures need no external image URLs or decoder.

## Prompt for Claude

> Integrate the two supplied static GLBs into my dark-background Three.js website: nzt48-bottle-cap.glb and nzt48-gold-pill.glb. Use the supplied studio-lighting.js and nzt-model.js to preserve the visual baseline. There are zero embedded animation clips. Animate NZT48Product for whole-product rotation; animate Cap independently around local Y to unscrew, lift and reseat it; clone the single GoldPill asset and animate each clone independently. Snapshot the cap's original position and quaternion and restore those exactly when closing. All transforms use meters and unit root scales. Keep the bottle amber-black and glossy, the label matte black, and the label's gold foil/logo matched to the reflective gold cap. Preserve the exact supplied label and its packed foil/specular maps. Capsules have baked studio highlights: preserve KHR_materials_unlit and set toneMapped=false; do not relight them. Pill geometry already includes the requested 2× size. The demo's opening controls are illustrative JavaScript transforms, not animation stored in the GLBs. Author the site's own timing and motion. Use index.html as the lighting baseline and smoothly adjust camera framing for raised cap and pills.

## Load and animate

Use your installed Three.js package and its standard GLTFLoader. Copy the two helper modules into your source directory and GLBs into public assets.

```js
import * as THREE from 'three';
import { setupNZTStudio } from './studio-lighting.js';
import { loadNZT } from './nzt-model.js';

const studio = setupNZTStudio(renderer, scene);
const product = await loadNZT(scene, {
  bottleUrl: '/assets/nzt48-bottle-cap.glb',
  pillUrl: '/assets/nzt48-gold-pill.glb',
});

// Whole product turntable; body, label and seated cap rotate together.
product.model.rotation.y = angle;

// Direct cap control. Save the seated transform before any movement.
const closedPosition = product.capClosed.position;
const closedQuaternion = product.capClosed.quaternion;
const yAxis = new THREE.Vector3(0, 1, 0);
const twist = new THREE.Quaternion();
function moveCap(turns, riseMeters) {
  product.cap.position.copy(closedPosition);
  product.cap.position.y += riseMeters;
  twist.setFromAxisAngle(yAxis, turns * Math.PI * 2);
  product.cap.quaternion.copy(closedQuaternion).multiply(twist);
}
moveCap(1.75, 0.042); // Example open pose; your timeline controls values.
product.resetCap();  // Exact original seated pose.

// One standalone pill, cloned as needed. Pass scene for world-space motion.
const pill = product.createPill(scene);
pill.position.set(-0.01, 0.10, 0.02);
pill.rotation.set(0.15, 0.3, 0.8);

// Or parent pills to the product to rotate with the bottle:
const anotherPill = product.createPill(product.model);
// Animate each pill.position / pill.quaternion independently.

renderer.render(scene, camera);
// On teardown: product.dispose(); studio.dispose();
```

`product.setCapOpening(progress)` is an optional transform recipe for your timeline: progress 0 restores the seated cap; 1 twists 1.75 turns and lifts it. It does not start playback and does not move pills. `index.html` shows independent pill movement using three clones of the single asset. The suggested screw pitch (2.38 mm per turn) and turns are visual estimates, not measured production thread dimensions. Customize them freely.

For just the bottle, pass `pillUrl: null`. You can also load both files directly with GLTFLoader and find the named roots/groups. After direct loading, call `applyNZTStudioMaterials(gltf.scene, scene.environment)` from studio-lighting.js.

## Finishes and lighting

Call `setupNZTStudio(renderer, scene)` before `loadNZT`. It creates broad HDR reflection softboxes and warm/cool edge lighting in memory, with no HDRI download. The bottle, cap and foil reflections respond to rotation. Preserve the embedded packed material maps and KHR_materials_specular; replacing the whole label material loses foil/matte separation.

Gold foil and the cap share color #ffbd16 and roughness approximately 0.105. The label's G channel controls roughness, B controls metalness and A controls specular intensity. Black stock and white ink stay matte dielectric; gold spots are metallic foil.

Capsule lighting is baked into its two 1024 × 512 textures and uses KHR_materials_unlit. Those highlights rotate with the capsule rather than responding to new lights. Set baked materials' `toneMapped=false` to preserve the bake. `capsule-preview.html` demonstrates the pill without any scene lights or environment.

## Artwork and scale

The label is physically 6 inches wide × 2 inches high (152.4 × 50.8 mm). The width is treated as a full circumference without overlap; remaining bottle dimensions are inferred from photographs.

`artwork/approved-label.png` is the latest supplied correct artwork. Its original typography, barcode, QR, facts, warnings and printed “60 CAPS” are retained. The source also prints “Servings Per Container 30”; the supplied copy is preserved exactly. The 78-pixel outer bleed is removed, leaving the original 3600 × 1200 trim area, resampled to 3072 × 1024. Gold spot color becomes cap-matched reflective foil without replacing the design.

## Preview

Serve the folder over HTTP and open `index.html`. Included Three.js r160 files support the example without npm or a CDN. The example opens only in response to controls; the delivered models remain static. `previews/static-bottle-closed.jpg`, `static-pieces-open.jpg` and `static-gold-pill.jpg` show the actual imported assets. `model-stats.json` records geometry/file sizes; `verification.json` records structure and scale checks.
