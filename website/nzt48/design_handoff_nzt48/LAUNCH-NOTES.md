# NZT48 Original: "The Limitless Pill" funnels

Routes: `NZT48 V1 - 3D.dc.html`, `NZT48 V2 - Magazine.dc.html`.
Shared facts, copy lists and commerce logic: `nzt48-shared.js` (edit there; both pages update).
Gummy and Super Greens funnels were not modified.

## Verified product data (limitlessx.com/products/nzt-48, product 8231919059246)
| Size | Variant ID | SKU | One-time | Per capsule |
|---|---|---|---|---|
| 30 caps (1 bottle) | 45002639769902 | 888-NZT48-30C | $59.95 | $2.00 |
| 60 caps (2 bottles) | 45002639802670 | 888-NZT48-60CK | $79.95 | $1.33 |
| 90 caps (3 bottles) | 45002639835438 | 888-NZT48-90CG | $94.95 | $1.06 |

Skio selling plans: every 30 days 20% off (689969725742), 45 days 15% (689969758510), 60 days 15% (689969791278), 90 days 15% (689969824046).
Serving: 1 capsule; 30 per bottle. Directions: 1 capsule daily with 8oz water, preferably with a meal.
Free shipping: $70+ (site cart banner). Guarantee: 30-day money-back (product page). Reviews: 4.9 / 5,148 (Judge.me).
Checkout link format: `/cart/{variant}:1?selling_plan={id}` + preserved UTM/click IDs (sessionStorage `nzt48_utm`). Disabled in the static preview.
Analytics (dataLayer): PageView, ViewContent, SelectVariant, SelectPlan, SelectFrequency, AddToCart, CartUpgrade, InitiateCheckout.

## Open items before launch
1. **No 50-count exists.** Built on 30/60/90 as sold.
2. **Uploaded Supplement Facts is a different formula** (lists Bacopa Monnieri Ext. and Lion’s Mane; no Caffeine HCL, EGCG or Guarana). Pages use the panel on /products/nzt-48, which matches the site text and caffeine warnings. Confirm which formula is currently shipping.
3. **Two listings share these SKUs** (/products/nzt48 at $49.95 with no subscription). Confirm the $59.95 listing is canonical.
4. **Caffeine mg is not disclosed.** The site's comparison image says "Caffeine (200mg)"; not used. Add the confirmed amount to the label copy and FAQ if possible.
5. **Guarantee conflict:** product page text says 30 days; the main product image badge says 90 days. Pages use 30. Confirm the Returns Policy window (from purchase or delivery).
6. Confirm the Skio plans apply to all three variants and how discount codes stack with subscriptions.
7. Confirm the "GMP-certified facility" and "Made in USA" claims with documentation. Not used: "100% all-natural" (formula contains Caffeine HCL), non-GMO, gluten-free, antibiotic-free.
8. Legal review: "The Limitless Pill" trademark/film association; named competitor comparison (re-verify Alpha BRAIN® 2-capsule and Qualia Mind® 6-capsule servings at launch); auto-renewal disclosure language for state ARL requirements.
9. Individual reviews hidden; toggle `showInternal` to see placeholder slots. Add only approved NZT48 Original reviews.
10. V2 photo slots (hero, routine) need real lifestyle photography.

## Ingredient claim matrix (internal)
All amounts undisclosed inside a 750mg, 23-ingredient blend. Single-ingredient studies generally use amounts at or above what the whole blend weighs, so no dose-dependent outcome claims are made.
| Ingredient | Typical study amounts (verify citations) | Evidence notes | Allowed claim |
|---|---|---|---|
| Caffeine HCL + Guarana | ~40–300mg caffeine | Strong for alertness | Helps you feel more alert* |
| L-Theanine | ~100–200mg, often with caffeine | Moderate, mixed | Included with caffeine for focus support* |
| Alpha GPC | ~300–1,200mg | Mostly older adults/athletes | Provides choline* |
| Bacopaside (Bacopa) | ~300mg extract, 8–12 weeks | Moderate for memory in healthy adults | Cognitive support*; no memory claim |
| Ginkgo Biloba | ~120–240mg extract | Mixed in healthy adults | Traditional cognitive support* |
| Phosphatidylserine | ~100–300mg | Limited | Cognitive support* |
| Huperzine A | ~50–400mcg | Mostly clinical populations | No memory/condition claims |
| Ashwagandha / Rhodiola | ~200–600mg extracts | Moderate for occasional stress | Everyday stress support* |

## Post-purchase, thank-you and lifecycle plan
- Upsell (installed app, conditional): one-time buyers of 30 → offer to switch to a subscription; 30 → offer +1 bottle at the 60-count price difference only if the upsell app supports variant swaps. Never offer an item already in the order. No new cross-sell pricing until confirmed.
- Thank-you page: order summary, how to take (1 capsule, 8oz water, with a meal, skip other caffeine), subscription management link, guarantee reminder.
- Email/SMS: Day 0 confirmation + directions; Day 2 shipping + "how to take it"; Day 7 check-in (routine tips, caffeine timing); Day 21 (30-count one-time) reorder reminder + subscription offer; subscribers: 3 days before each renewal with skip/reschedule links (required for auto-renewal compliance); Day 25 review request (no incentive tied to rating).
