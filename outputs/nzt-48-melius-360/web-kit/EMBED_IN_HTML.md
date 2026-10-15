# NZT-48 studio turntable for HTML

The bottle rotation is rendered in Melius, then the flat chroma background is removed to create true alpha transparency. The scene requires no Three.js model or runtime lighting.

## Video embed

Copy the WebM and poster into your public assets:

```html
<video
  autoplay loop muted playsinline
  poster="/assets/nzt48/poster.png"
  style="display:block;width:100%;max-width:720px;background:transparent"
  aria-label="NZT-48 bottle rotating in studio lighting"
>
  <source src="/assets/nzt48/nzt48-studio-360-alpha.webm" type="video/webm">
</video>
```

The video is silent and includes an alpha channel. Put it over the actual page background. WebM alpha support varies between browsers; use the supplied transparent frame-sequence viewer when identical compositing across browsers is required.

## Universal frame-sequence viewer

`index.html` plays the same studio render from RGBA WebP frames on a transparent canvas. It also supports dragging through the rotation, pause/play, reduced motion and dark/light/checker backgrounds for reviewing the alpha edges. It uses no dependencies or CDN. Copy the complete web-kit folder and serve it over HTTP.

The canvas can be embedded in a site with an iframe, or copy its module into your own section and remove the preview header/navigation. Keep `frames.json` and the `frames/` directory at the configured relative path.

```html
<iframe
  src="/assets/nzt48/index.html?embed=1"
  title="NZT-48 studio product turntable"
  style="border:0;width:100%;height:760px"
></iframe>
```

The `?embed=1` view automatically removes the preview header/controls and sets the page background to transparent. The frame pixels and canvas are also transparent, so the product sits directly over the parent website background.

The exact frame count and duration are recorded in frames.json. alpha-verification.json records sampled RGBA transparency and verification of the encoded WebM alpha plane. Dense side-panel typography in AI-generated footage should be checked against the production artwork before use as a readable product-label reference.
