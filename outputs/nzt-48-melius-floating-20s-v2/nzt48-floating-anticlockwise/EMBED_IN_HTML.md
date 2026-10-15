# NZT-48: floating studio loop for HTML

This is a local rework of the existing Melius studio render. No additional Melius requests were made and no additional Melius credits were used.

The bottle rotates once over 20 seconds anticlockwise while its diagonal tilt sweeps from 24 degrees to the right, through upright, to 32 degrees to the left, then returns to its original pose. The first and last rendered frames are identical. The background is true alpha transparency, so your page can remain dark.

## Transparent video

1080 × 1080, 24 fps, 20 seconds, silent VP9 WebM with alpha.

```html
<video autoplay loop muted playsinline
  poster="/assets/nzt48/poster.png"
  style="display:block;width:100%;background:transparent"
  aria-label="NZT-48 floating studio rotation">
  <source src="/assets/nzt48/nzt48-floating-20s-alpha.webm" type="video/webm">
</video>
```

WebM alpha support varies by browser. For consistent alpha compositing, use the supplied canvas frame viewer:

```html
<iframe src="/assets/nzt48/index.html?embed=1"
  title="NZT-48 floating studio rotation"
  style="display:block;border:0;width:100%;height:min(85vh,800px)">
</iframe>
```

Copy the entire web-kit folder into `/public/assets/nzt48/`. The embed view hides the preview title and controls, and both its page and canvas are transparent. The 480 RGBA WebP frames are loaded as needed with a bounded cache. No dependencies or external services are required. Serve the files over HTTP.

## Claude handoff

Use these existing assets unchanged in color. The studio shine and reflections are already in the pixels. No Three.js lighting is needed. Use the video for lightweight playback where WebM alpha works, or the supplied canvas module/iframe for browser-independent compositing. The preview supports play/pause, starting pose, drag to rotate and dark/light/checker backgrounds.

This uses the original recorded camera view, with local image-plane tilt, floating movement, motion interpolation and loop closure. It does not create a new elevated camera view or new reflection paths. The cap and pills cannot move independently in this video. Tiny side-panel typography remains the original AI approximation.

`verification.json` records the 20-second timing, matching raw loop endpoints, transparent WebM verification and uncropped sample frames. `frames.json` contains the player manifest.
