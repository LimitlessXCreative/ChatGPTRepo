# NZT-48: standalone polished gold pill

`nzt48-gold-pill-pbr.glb` contains only one capsule, centered at the origin, with its long axis along X. It has one mesh, one material, 1,632 triangles, no textures, no baked lighting, no animations, no lights and no cameras. The file is approximately 35 KB.

The existing doubled pill dimensions are preserved: 16.504 × 5.666 × 5.666 mm. Units are meters, with an identity root transform. Keep scale 1 unless your website intentionally changes its size.

The entire capsule uses the same metallic gold PBR material, with metalness 1 and roughness 0.15. Highlights come from the website's reflection environment and move as the pill rotates. Natural shading will vary with the environment; there are no painted shadow bands or fixed highlights in this model.

## Load into Three.js

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setupGoldStudio } from './gold-studio.js';

// Run once per scene to match the bright, even gold preview.
const studio = setupGoldStudio(renderer, scene);
const gltf = await new GLTFLoader().loadAsync('/assets/nzt48-gold-pill-pbr.glb');
const pill = gltf.scene;
scene.add(pill);

// Animate this group, or clone it to create more pills.
pill.rotation.y = Math.PI / 4;
const secondPill = pill.clone(true);
scene.add(secondPill);

// When this scene is disposed:
// studio.dispose();
```

`gold-studio.js` supplies a neutral studio environment with softbox reflections and enough fill to keep all sides gold. You can use your own PMREM/HDR environment instead. Set an environment for metallic reflections; ambient light alone will not reproduce this shine. The GLB itself is self-contained and does not require this specific helper or any image textures.

`index.html` is a standalone review page with drag rotation, automatic rotation and reset. Serve this folder over HTTP. The vendored Three.js and loader are only for this review page; your application can use its existing Three.js installation.

This material and geometry were rebuilt locally, without paid image or video generation.
