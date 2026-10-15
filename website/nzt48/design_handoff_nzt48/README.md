# Handoff: NZT48 Original — "The Limitless Pill" landing pages (V1 + V2)

## Overview
Two single-product landing pages (funnels) for **NZT48 Original** (limitlessx.com/products/nzt-48, Shopify product 8231919059246). Both sell the same product, with the same three sizes (30, 60 and 90 capsules) and the same Subscribe & Save plans. They differ in how they look and feel:

- **V1 High-Tech** (`NZT48 V1 - 3D.dc.html`) — the primary version. Cinematic dark page with a real-time 3D bottle (three.js) that moves between sections as you scroll, studio lighting, gold capsules and a "genie" bottling animation in the final CTA.
- **V2 Refined** (`NZT48 V2 - Magazine.dc.html`) — a warm, editorial light-mode version: cream paper, Newsreader serif headlines, photography slots and a static bottle PNG. No 3D.

Both pages read all product facts, copy lists, pricing math, analytics and checkout-URL building from **`nzt48-shared.js`**. Port that file first; it is the source of truth for both pages.

## About the design files
The files in this bundle are **design references created in HTML**. They are prototypes that show the intended look and behavior, not production code to copy directly. The `.dc.html` files use a small in-house template runtime (`support.js`, `{{ }}` holes, `<sc-if>`/`<sc-for>`, a `class Component` logic block). **Do not ship that runtime.**

Your task is to **recreate these designs in the target codebase**. The storefront is Shopify, so that means a Shopify Online Store 2.0 theme (Liquid sections + vanilla JS), or Hydrogen/React if that is what the team uses. Follow that codebase's existing patterns. Two pieces can be reused nearly as-is because they are plain ES modules or plain JS:
- `3d/*.js` (three.js stage, model loader, lighting), with `3d/vendor/` (three.js r16x module build + GLTFLoader)
- `nzt48-shared.js`, the data and commerce logic. Swap the hardcoded variant data for Liquid/Storefront API data when you wire it up.

To view the references: run `python3 -m http.server 4173` from this folder and open `http://127.0.0.1:4173/NZT48%20V1%20-%203D.dc.html`. Don't use `file://`, because the module imports and fonts will fail.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy, pricing logic and motion are final. Recreate them pixel-accurately. All copy is compliance-reviewed wording, so change it only with approval (see `LAUNCH-NOTES.md`). Every inline `style` in the HTML gives the exact values. When this README and the HTML disagree, **the HTML wins**.

---

## Shared behavior (both versions)

### Product and pricing data (`nzt48-shared.js`)
| Size | Bottles | Variant ID | SKU | One-time | Tag | Default sub frequency |
|---|---|---|---|---|---|---|
| 30 caps | 1 | 45002639769902 | 888-NZT48-30C | $59.95 | Start Here | 30 days |
| 60 caps | 2 | 45002639802670 | 888-NZT48-60CK | $79.95 | Stay Ready | 60 days |
| 90 caps | 3 | 45002639835438 | 888-NZT48-90CG | $94.95 | Best Value | 90 days |

Skio selling plans: 30 days = 20% off (689969725742), 45 days = 15% off (689969758510), 60 days = 15% off (689969791278), 90 days = 15% off (689969824046).

The price math is in `calc(key, plan, freq)`:
- Subscription price = `round(price × (100 − pct)) / 100`.
- Strike-through "singles" price = $59.95 × bottles.
- Savings = singles − total.
- Price per capsule = total ÷ count.
- Free shipping applies when total ≥ $70.

### State
| State | Values | Default |
|---|---|---|
| `size` | '30' \| '60' \| '90' | prop `defaultSize` ('30') |
| `plan` | 'sub' \| 'once' | prop `defaultPlan` ('subscribe') |
| `freq` | 30 \| 45 \| 60 \| 90 | the selected size's default frequency |
| `cartOpen` | bool | false |
| `notice` | bool (preview-only "checkout disabled" note) | false |
| `faq` | index of the open FAQ item (only one open at a time); −1 = none open | 0 |
| `scrolled` | `scrollY > 700` | — |
| `w` | viewport width. `wide = w ≥ 820` (desktop layout); the mobile sticky bar shows when `w < 900` | — |

When you pick a size while Subscribe is active, the frequency resets to that size's default unless the user has already chosen a frequency.

### Commerce flow
1. Select a size and plan, then **Add to cart**. This opens the right-hand cart drawer (420px wide, full height, dark overlay; clicking the overlay closes it).
2. The cart drawer shows the line item, an upsell button for 30 → 60 or 60 → 90 (shown as "Switch to 60 capsules: $X per capsule"), subtotal, shipping, tax and the auto-renew disclosure.
3. **Secure checkout** builds `https://www.limitlessx.com/cart/{variantId}:1?selling_plan={planId}&{utm…}`. Leave out `selling_plan` for one-time purchases. UTM parameters and click IDs (`utm_*`, `fbclid`, `gclid`, `ttclid`) are captured on landing into `sessionStorage.nzt48_utm` and added to the checkout URL. In the real build, use the theme's cart API or Skio rather than the permalink if that is the house pattern.
4. **Disclosure copy** (required for auto-renewal law; render it next to every subscription CTA):
   - Subscribe: "Subscription: {total} charged today and every {freq} days until you cancel ({pct}% off the {price} one-time price). Skip, reschedule or cancel anytime from your account. Taxes calculated at checkout."
   - One-time: "One-time purchase of {total}. No subscription and no future charges. Taxes calculated at checkout."

### Analytics (dataLayer)
Every event pushes `{event, product:'nzt-48', funnel:'nzt48-original', …}`:
- `PageView` with `version` = 'v1-high-tech' or 'v2-refined'
- `ViewContent` with all three variant IDs
- `SelectVariant`, `SelectPlan`, `SelectFrequency`
- `AddToCart` (variant, plan, value, currency)
- `CartUpgrade`
- `InitiateCheckout` (with the checkout URL)

### Props / CRO toggles (both pages)
- `ctaLabel`: "Get The Limitless Pill" (default), "Add To Cart" or "Start With One Capsule"
- `defaultPlan`: subscribe or one-time
- `defaultSize`: 30, 60 or 90
- `showInternal` (bool): reveals placeholder review slots for internal review only. Never enable in production.
- V1 also reads `factsAngle` (the bottle's yaw in the Supplement Facts section; default −114°).

### Mobile sticky bar
When `scrolled && w < 900 && !cartOpen`, a fixed pill bar appears 10px from the left, right and bottom edges (respecting the safe-area inset). It shows "{caps} · {total}" and "{perCap} per capsule", plus an **Add to cart** button.

### Compliance (must keep)
- An FDA asterisk disclaimer (`D.fda`) appears in the footer of both pages.
- The caffeine warning (`D.warning`) appears in the Supplement Facts section.
- Film non-affiliation line in the footer: "'The Limitless Pill' is a Limitless X campaign name… not affiliated with… any film…"
- No individual reviews are shown until approved ones exist. Only the rating summary appears: "4.9 from 5,100+ reviews".
- See `LAUNCH-NOTES.md` for open legal and product questions. These **block launch**.

---

## V1 High-Tech

### Global
- Page background `#08090B`; body text color `#F3F1EC`; `overflow-x: clip`.
- Content max-width is 1320px (1272px for the footer), with 24px side padding. Section vertical padding is mostly `clamp(64px, 9vw, 140px)`.
- Links are `#F4C430`, and `#FFE07A` on hover. Focus ring: 2px solid `#F4C430`, offset 3px. Text selection: `#F4C430` background with `#08090B` text.
- Elements marked `[data-reveal]` fade and rise into view when they enter the viewport (handled in `nzt-stage.js` → `setupReveal`).
- `prefers-reduced-motion` turns off every animation and transition, along with the 3D idle motion and the bottling sequence.

### Sections (top to bottom)
1. **Announcement marquee**: background `rgba(244,196,48,.08)`; text 500 12px Poppins, uppercase, letter-spacing .14em, `#F4C430`. Four messages are duplicated and scroll on a 46s linear infinite loop (`translateX(0 → -50%)`).
2. **Header**: sticky; background `rgba(8,9,11,.5)` with `backdrop-filter: blur(18px) saturate(1.2)`. Contains the logo (22px tall, inverted), nav links (Formula / Supplement Facts / FAQ in `#C9CBD0`, hover `#F3F1EC`; desktop only) and a "Shop NZT48" pill (44px tall, `#F3F1EC` background, `#08090B` text, hover `#F4C430`).
3. **Hero**: two columns on desktop.
   - Left column (flex 1.05): a sticky 3D anchor (`top: 80px`, height `calc(100svh − 120px)`, 460–900px). Behind the bottle sits a giant Boldonse "NZT" glyph.
   - Right column (max 560px): the checkout area — eyebrow, product name, rating, description, the 30/60/90 size tiles in a three-across grid, the Subscribe & Save and One-time radio rows, a frequency `<select>` (shown only when Subscribe is active), the price, the CTA and the disclosure.
   - Bottom of the hero: a huge scrolling "Limitless Pill" wordmark marquee, with a mask that fades it to black at both edges.
   - Mobile: the 3D anchor `hero-m` sits above the checkout, `min(96vw, 500px)` tall.
4. **One Capsule** (`#serving`): text plus an anchor where the bottle is **hidden**. One gold PBR capsule hangs nearly vertical, slightly tilted, slowly spinning under dramatic top and side light.
5. **Benefits**: a sticky bottle on the left (`top: 12vh`, 76vh tall) and four numbered benefit items on the right (data: `D.benefits`).
6. **Ingredients** (`#formula`): eight key-ingredient rows. The bottle on the right spins a full 360° as you scroll through the section (`data-scrub="360"`).
7. **Daily Routine**: the bottle exits to the right.
8. **Who It Fits**: eight scenario cards (data: `D.scenarios`).
9. **Comparison**: NZT48 vs Alpha BRAIN® vs Qualia Mind®, comparing capsules per serving with gold or grey pill icons. The NZT row is highlighted with a gold gradient and a ring.
10. **Supplement Facts** (`#facts`): an FDA-style label in a black-on-white panel. Shows the 750mg NZT-48™ Blend with its 23 ingredients, plus the directions and the warning. The bottle sits on the right with its label facing the viewer.
11. **Reviews**: 4.9 stars and "5,100+ reviews" summary only.
12. **Bundles**: three tier cards with stacked bottle stills (rendered from the 3D model). The 90-count card is highlighted gold.
13. **Subscribe vs One-Time**: two cards. The Subscribe card has a gold gradient background (`150deg, #FFD650 → #F4C430 45% → #D9A514`) with `#08090B` text.
14. **Guarantee**: a 148px badge with a conic-gradient gold ring and "30-day money-back".
15. **FAQ** (`#faq`): accordion with 16 Q&As from `D.faq`. Only one item is open at a time; the toggle shows "+" or "−".
16. **Final CTA**: a 3D anchor `min(70vh, 640px)` tall that runs the **bottling sequence** (described below), followed by the headline and the CTA.
17. **Footer**: logo, FDA disclaimer, non-affiliation line and the Returns Policy link (`#8D9097`, 12.5px). Below that, an edge-to-edge **LIMITLESS** wordmark: an SVG `<text>` in Boldonse with a vertical gradient of `#F4C430` from .55 to .04 opacity. Its viewBox is fitted to the measured glyph box at runtime so it exactly fills the content width (see `fitMark` in the logic block).

### 3D stage (`3d/nzt-stage.js`, `mountStage({ base: './3d/' })`)
- **One persistent WebGL canvas** fixed behind the page. It holds the bottle (`nzt48-bottle-cap.glb`) and capsules (`nzt48-gold-pill-pbr.glb`).
- A full-screen amber smoke shader acts as the background, and its light follows the bottle.
- There is also a warm radial halo `<div>` behind the bottle: `rgba(255,200,92,.42)` fading to transparent, blurred 8px, gently "breathing" (opacity varies ±8% at about 0.8 rad/s).
- **Anchors**: each `[data-nzt-anchor]` element is a slot. Every frame, the stage finds the active slot from scroll position and eases the bottle's screen position, size and pose toward it.

| Attribute | Meaning |
|---|---|
| `data-ry` | yaw in degrees |
| `data-tilt` | roll in degrees |
| `data-open` | cap opening, 0–1 |
| `data-pills` | floating-capsule visibility, 0–1 |
| `data-solo` | 1 = hide the bottle and show one hero capsule |
| `data-fit` | bottle height as a fraction of the slot height |
| `data-scrub` | extra yaw in degrees spread across the parent section's scroll |
| `data-out="right"` | slot sits offscreen, so the bottle exits |
| `data-bottling="1"` | run the bottling sequence |

- **Idle motion**: a gentle vertical bob (1.2% of height at about 0.9 rad/s), a slight yaw sway, and parallax that follows the mouse.
- **Floating capsules**: three appear in the hero, one in One Capsule and none elsewhere. They cross-fade between sections.
- **Lighting** (`studio-lighting.js`):
  - Warm key light from the front-left, plus a sharp vertical glass highlight.
  - Cool edge light, a gold backlight and a soft overhead fill.
  - Bottle glass: near-black (`0x0a0806`) with a faint amber edge tint (attenuation `0x1a1008`), transmission ≤ .25, roughness ≤ .08.
  - Gold capsule lighting is in `gold-studio.js`.
- **Bottling sequence** (the Final CTA slot, timed in seconds from arrival; plays once each time the slot becomes active, and resets if you scroll away and back):

| Time (s) | What happens |
|---|---|
| 0–1.1 | The bottle straightens to upright; the bob and lean ease out. |
| 0.5–1.9 | The cap unscrews and floats about 0.3 bottle-heights above the mouth, with a slight drift. |
| 1.5 onward | The 7 capsules launch one after another, 0.2s apart, each flight lasting 1.6s. Each swirls in a tightening spiral, hovers above the mouth, turns upright, shrinks and dives into the bottle. A gold flash (key and rim lights) pulses as each one goes in. |
| 4.25–5.4 | The cap lowers and screws shut, ending in a small downward bump and a brighter flash. |
| 5.15–7.3 | One full 360° spin, eased out (cubic). |
| after 6.9 | A slow continuous turn; idle motion fades back in around 7–8.6s. |

- **Fallback**: when WebGL fails, every anchor shows its `<img data-nzt-fallback src="assets/bottle.png">`. Bundle cards and the cart use `window.__nztStill`, a still captured from the 3D render.

### V1 tokens
| Role | Value |
|---|---|
| Background | `#08090B` |
| Drawer background | `#0F1014` |
| Main text | `#F3F1EC` |
| Secondary text | `#C9CBD0` |
| Muted text | `#9A9DA3` / `#B9BBC0` |
| Footer text | `#8D9097` |
| Gold (main) | `#F4C430` |
| Gold (light) | `#FFE07A` / `#FFE58A` / `#FFD650` |
| Gold (deep) | `#D9A514` / `#B8860B` |
| Surfaces | `rgba(255,255,255,.035)` with a 1–1.5px `rgba(255,255,255,.06)` border |
| Selected surface | `rgba(244,196,48,.10)` with a 1.5px `#F4C430` border |
| Corner radii | 999px (pills), 30px (tier and plan cards), 20–22px (tiles and rows), 16–18px (small cards) |
| Shadows | cards `0 30px 70px rgba(0,0,0,.4)`; drawer `-30px 0 80px rgba(0,0,0,.5)`; bottle stills `drop-shadow(0 22px 24px rgba(0,0,0,.6))` |
| Display type | **Boldonse** 400, uppercase (CTAs, eyebrows, numerals). CTA size 12–14.5px. |
| Body type | **Poppins** 400/500/600/700. Body text 15–17px, line-height 1.6–1.7. |
| Transitions | `.2s`–`.25s` on border-color, background and box-shadow |

---

## V2 Refined

### Global
- Paper background `#F5F1E8` with ink-colored text `#16171A`. Content max-width 1240px, 24px side padding. Section padding `clamp(64px, 8vw, 120px)`.
- Sections are separated by 1px `#DCD5C6` borders. Some sections alternate to `#EFE9DC` or `#FFFFFF`; dark sections use `#16171A`.
- Links are `#7A5C14`, hover `#16171A`. Focus ring: 2px solid `#16171A`.
- Headlines use **Newsreader** (Google Fonts, optical size 6–72, weights 400/500/600): weight 500, letter-spacing −.01 to −.02em. The H1 is `clamp(52px, 7.2vw, 104px)` with line-height .98; H2s are `clamp(36px, 4.4vw, 60px)`.
- Eyebrows: Boldonse 12px uppercase, letter-spacing .06em, `#7A5C14`. Body text: Poppins 17–18px, line-height 1.7, `#3B3D43`.

### Sections
In order: announcement bar (dark), sticky header (`rgba(245,241,232,.94)` with 12px blur), **Hero**, Benefits ("Built For Four Jobs"), Nootropics + One Capsule (dark), Ingredients, Daily Routine, Who It Fits, Comparison (white), Supplement Facts, Reviews, Bundles, Subscribe vs One-Time (white), Guarantee, FAQ (white), Final CTA (dark) and the footer.

**Hero:**
- Layout: a two-column auto-fit grid (min 480px) with the copy on the left. The right side holds a 5:4 photo frame (28px radius, `linear-gradient(160deg, #EDE6D6, #E3D9C4)`) containing an image slot, with `bottle.png` placed bottom-right at 78% height and a `drop-shadow(0 26px 30px rgba(22,23,26,.35))`.
- Below the hero sits the `#buy` card: white, 28px radius, 1px `#DCD5C6` border, shadow `0 30px 60px -40px rgba(22,23,26,.35)`.
  - Left: size radio rows.
  - Right: a Subscribe / One-time segmented control (pill track `#F1EADB`), a 2×2 frequency grid, the price (700 32px), the CTA (60px tall, `#16171A`, Boldonse 14.5px uppercase, hover `#2E3036`), the disclosure, and a free-shipping progress bar (6px tall, track `#EDE6D6`).

**Image slots:** these need real lifestyle photography — the hero shows "bottle on a morning desk or breakfast table, warm natural light" and the routine section also needs a photo. They are drag-and-drop placeholders (`image-slot.js`) and must be replaced with real `<img>` tags in production.

### V2 tokens
| Role | Value |
|---|---|
| Paper | `#F5F1E8` |
| Alternate backgrounds | `#EFE9DC`, `#FFFFFF` |
| Ink / dark sections | `#16171A` |
| Text | `#2E3036`, `#3B3D43`, `#4A4C52` |
| Muted / strike-through | `#6B6D73` |
| Lines | `#DCD5C6`, `#E7E1D4` |
| Tint | `#F1EADB` |
| Gold | `#B08A2E` (stars, rules) |
| Gold text | `#7A5C14` / `#5E4710` |
| Light gold on dark | `#E2C675` |
| Corner radii | 999px, 28px, 16px |

---

## Assets
| File | Use |
|---|---|
| `assets/logo-limitlessx.svg` | Brand logo. V1 inverts it with a CSS filter. |
| `assets/bottle.png` | Bottle PNG for fallbacks and V2. |
| `assets/nzt48-float-still.png`, `nzt48-float-frame.png`, `nzt48-float.webm` | Float render stills and video from the 3D reference. |
| `assets/Boldonse-Regular.ttf` | Display font. |
| `assets/fonts/Poppins-{Regular,Medium,SemiBold,Bold}.woff2` | Body font. `BebasNeuePro-Bold.woff2` is included but unused. |
| `3d/nzt48-bottle-cap.glb` | Bottle model with a separate cap node; the cap moves for the open and close animation. |
| `3d/nzt48-gold-pill-pbr.glb` | Gold capsule model (PBR) used on the page. `nzt48-gold-pill.glb` is an older version. |
| Newsreader | Loaded from Google Fonts (V2 only). Self-host it in production. |

## Files
- `NZT48 V1 - 3D.dc.html`: V1 page (template, logic block and CRO props).
- `NZT48 V2 - Magazine.dc.html`: V2 page.
- `nzt48-shared.js`: shared data, pricing, analytics, UTM handling and checkout URLs. **Start here.**
- `3d/nzt-stage.js`: scroll-anchored 3D stage, bottling sequence, halo and reveal-on-scroll.
- `3d/nzt-model.js`: GLB loader and cap rig (`setCapOpening`, `resetCap`).
- `3d/studio-lighting.js`: bottle studio lighting and glass material.
- `3d/gold-studio.js`: capsule lighting.
- `3d/vendor/`: three.js module build and GLTFLoader.
- `LAUNCH-NOTES.md`: verified product data, **open launch blockers**, the ingredient claim matrix and the post-purchase plan.
- `archive/`: earlier V1 iterations, kept for reference only. Do not build from these.
- `support.js`, `image-slot.js`: preview runtime only. Do not port.

## Out of scope / not live in the preview
The preview does not include a real cart, Skio subscription APIs, live inventory, review widgets or form handling. The checkout button only shows a notice ("Preview build: checkout is turned off"). In production, connect it to Shopify checkout using the URL logic above.
