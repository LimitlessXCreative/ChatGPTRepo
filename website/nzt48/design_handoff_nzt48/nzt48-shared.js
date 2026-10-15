// NZT48 ORIGINAL: shared verified facts, copy lists and commerce logic for V1 + V2.
// Source: limitlessx.com/products/nzt-48 (product 8231919059246) + official Supplement Facts image on that listing. Snapshot Aug 31 2026, rechecked Oct 8 2026.
(function () {
  var V = [
    { key: '30', count: 30, bottles: 1, title: '1 Bottle', caps: '30 Capsules', supply: '30-day supply', tag: 'Start Here', price: 59.95, id: 45002639769902, sku: '888-NZT48-30C', freq: 30 },
    { key: '60', count: 60, bottles: 2, title: '2 Bottles', caps: '60 Capsules', supply: '60-day supply', tag: 'Stay Ready', price: 79.95, id: 45002639802670, sku: '888-NZT48-60CK', freq: 60 },
    { key: '90', count: 90, bottles: 3, title: '3 Bottles', caps: '90 Capsules', supply: '90-day supply', tag: 'Best Value', price: 94.95, id: 45002639835438, sku: '888-NZT48-90CG', freq: 90 }
  ];
  var PLANS = [
    { days: 30, pct: 20, id: 689969725742 },
    { days: 45, pct: 15, id: 689969758510 },
    { days: 60, pct: 15, id: 689969791278 },
    { days: 90, pct: 15, id: 689969824046 }
  ];
  var SINGLE = 59.95, FREE_SHIP = 70;
  var money = function (n) { return '$' + (Math.round(n * 100 + 1e-6) / 100).toFixed(2); };
  var v = function (k) { return V.filter(function (x) { return x.key === k; })[0] || V[0]; };
  var pl = function (d) { return PLANS.filter(function (x) { return x.days === d; })[0] || PLANS[0]; };
  function calc(key, plan, freq) {
    var x = v(key), p = pl(freq), sub = plan === 'sub';
    var total = sub ? Math.round(x.price * (100 - p.pct)) / 100 : x.price;
    var singles = SINGLE * x.bottles, save = singles - total;
    return { v: x, p: p, sub: sub, total: total, singles: singles, save: save, savePct: Math.round(save / singles * 100), perCap: total / x.count, freeShip: total >= FREE_SHIP };
  }

  var D = {
    reviews: { rating: '4.9', count: '5,100+', exact: 5148, source: 'Judge.me on limitlessx.com/products/nzt-48 (5,148 reviews, 4.92 avg, Aug 31 2026)' },
    blend: ['Alpha GPC', 'EGCG', 'Caffeine HCL', 'Guarana', '5HTP', 'Theobromine', 'Benfotiamine', 'DL Phenylalanine', 'Acetyl-L-carnitine', 'N-acetyl-L-tyrosine (NALT)', 'Ginkgo Biloba', 'Bacopaside', 'Ashwagandha', 'L-Theanine', 'NADH', 'Phosphatidylserine', 'Uridine-5 Monophosphate', 'B-Complex', 'Rhodiola ext', 'Mucuna Pruriens 99% Ext', 'Rauwolcine', 'Piperine', 'Huperzine A'],
    benefits: [
      { n: '01', t: 'Alertness', d: 'Caffeine HCL and guarana, two caffeine sources, to help you feel awake and alert.*' },
      { n: '02', t: 'Focus & Attention', d: 'Alpha GPC, L-Theanine and N-Acetyl-L-Tyrosine, included for focus support.*' },
      { n: '03', t: 'Mental Energy', d: 'B-Complex, Benfotiamine and Acetyl-L-Carnitine for mental energy support.*' },
      { n: '04', t: 'Everyday Stress', d: 'Ashwagandha and Rhodiola, two adaptogens traditionally used for everyday stress.*' }
    ],
    ingredients: [
      { name: 'Caffeine HCL + Guarana', what: 'Two caffeine sources', research: 'Caffeine is one of the most studied compounds for alertness and reaction time in healthy adults.', say: 'Helps you feel more alert.* The caffeine amount per capsule is not listed separately on the label.' },
      { name: 'L-Theanine', what: 'Amino acid found in tea', research: 'Studies that pair L-theanine with caffeine have measured attention on specific tasks, with mixed but encouraging results.', say: 'Included alongside the caffeine in the blend for focus support.*' },
      { name: 'Alpha GPC', what: 'Choline compound', research: 'A source of choline, which the body uses to make acetylcholine. Most studies use larger amounts than a multi-ingredient blend holds.', say: 'Provides choline as part of the blend.*' },
      { name: 'Bacopaside', what: 'Active compounds of Bacopa monnieri', research: 'Bacopa extract has been studied for memory in healthy adults, usually taken daily for 8 to 12 weeks.', say: 'Part of the blend for cognitive support.* We make no specific memory claim.' },
      { name: 'Ginkgo Biloba', what: 'Leaf extract', research: 'Results in healthy adults are mixed. Most studies use standardized extracts at higher amounts.', say: 'A traditional ingredient for cognitive support.*' },
      { name: 'Phosphatidylserine', what: 'Phospholipid', research: 'A natural part of cell membranes, including in the brain. Studied for cognitive function at amounts larger than one blend ingredient.', say: 'Part of the blend for cognitive support.*' },
      { name: 'Huperzine A', what: 'From Chinese club moss', research: 'Influences the breakdown of acetylcholine. Much of the human research is in clinical populations, not healthy adults.', say: 'Part of the blend. Not intended to treat any memory condition.' },
      { name: 'Ashwagandha + Rhodiola', what: 'Adaptogenic herbs', research: 'Both have been studied for occasional stress and mental fatigue, typically as standardized extracts.', say: 'Included to support your response to everyday stress.*' }
    ],
    alsoIn: 'EGCG, 5HTP, Theobromine, Benfotiamine, DL Phenylalanine, Acetyl-L-carnitine, N-acetyl-L-tyrosine (NALT), NADH, Uridine-5 Monophosphate, B-Complex, Mucuna Pruriens 99% Ext, Rauwolcine and Piperine.',
    scenarios: [
      { t: 'Deep Work', who: 'Developers, writers, analysts', d: 'A long block with notifications off and one problem to solve.' },
      { t: 'Back-to-Back Calendars', who: 'Founders, executives, managers', d: 'Days where meetings stack up and decisions keep coming.' },
      { t: 'Presentations', who: 'Working professionals', d: 'Prep time before the pitch, the review or the client call.' },
      { t: 'Creative Projects', who: 'Creators, designers, editors', d: 'Edit days, shoot days and the final push before a deadline.' },
      { t: 'Study Sessions', who: 'Adult students', d: 'Reading, review and practice tests on top of everything else.' },
      { t: 'Competitive Play', who: 'Gamers, 18+', d: 'Ranked sessions and practice blocks that ask for attention.' },
      { t: 'Busy Households', who: 'Parents', d: 'School runs, work and logistics in the same morning.' },
      { t: 'Active Mornings', who: 'Active adults', d: 'One capsule with breakfast, then on to the rest of the day.' }
    ],
    compare: [
      { brand: 'NZT48 Original', maker: 'Limitless X', caps: '1', note: 'Contains caffeine', us: true },
      { brand: 'Alpha BRAIN®', maker: 'Onnit · capsules', caps: '2', note: 'Caffeine-free', us: false },
      { brand: 'Qualia Mind®', maker: 'Qualia Life Sciences', caps: '6', note: 'Contains caffeine · label suggests 3–6', us: false }
    ],
    faq: [
      ['What is NZT48 Original?', 'NZT48 Original is a once-daily nootropic dietary supplement from Limitless X. Each capsule contains the 750mg NZT-48™ Blend of 23 ingredients, including Caffeine HCL, Alpha GPC, L-Theanine, Bacopaside, Ginkgo Biloba, Phosphatidylserine and Huperzine A. It is a supplement, not a drug.'],
      ['What does “The Limitless Pill” mean?', 'It’s our campaign name for NZT48 Original. It refers to a simple one-capsule daily routine. It is not a promise of unlimited ability, and NZT48 is not affiliated with or endorsed by any film, studio or actor.'],
      ['What is a nootropic?', '“Nootropic” is a general term for ingredients and supplements people take to support aspects of cognitive function, such as focus, attention and mental energy. Nootropic supplements are not FDA-approved to treat any condition, and effects vary from person to person.'],
      ['What ingredients and doses are inside?', 'One capsule contains 750mg of the NZT-48™ Blend: Alpha GPC, EGCG, Caffeine HCL, Guarana, 5HTP, Theobromine, Benfotiamine, DL Phenylalanine, Acetyl-L-carnitine, N-acetyl-L-tyrosine (NALT), Ginkgo Biloba, Bacopaside, Ashwagandha, L-Theanine, NADH, Phosphatidylserine, Uridine-5 Monophosphate, B-Complex, Rhodiola ext, Mucuna Pruriens 99% Ext, Rauwolcine, Piperine and Huperzine A. Because it’s a proprietary blend, the label lists the total weight, not the amount of each ingredient. Other ingredients: gelatin, White #100, silica and calcium carbonate.'],
      ['What does each major ingredient support?', 'The ingredient section on this page summarizes what each key ingredient has been studied for. That research looks at each ingredient on its own, usually at larger amounts than one ingredient in a 750mg blend. We don’t cite finished-product clinical trials for NZT48 Original, so we don’t claim it reproduces those study results.'],
      ['How many capsules per serving?', 'One. The labeled serving size is 1 capsule, and every bottle holds 30 servings.'],
      ['What’s the difference between 30, 60 and 90?', 'Same formula, same capsule. 30 is one bottle, 60 is two bottles and 90 is three. Bigger packages lower your price per capsule: $2.00, $1.33 and $1.06 on a one-time purchase.'],
      ['Does it contain caffeine or other stimulants?', 'Yes. The blend includes Caffeine HCL and guarana, a natural caffeine source, plus theobromine and rauwolcine. The caffeine amount per capsule is not listed separately on the label. Do not use NZT48 Original if you are sensitive to caffeine.'],
      ['When and how should I take it?', 'Take 1 capsule daily with 8oz of water, preferably with a meal, or as directed by a healthcare professional. Because it contains caffeine, most people take it earlier in the day.'],
      ['How long does a bottle last?', 'At one capsule a day, a 30-capsule bottle lasts 30 days. The 60-capsule package lasts 60 days and the 90-capsule package lasts 90 days.'],
      ['Is it suitable for older adults?', 'NZT48 Original is for adults 18 and older. If you take medication or manage a health condition, talk with your doctor or pharmacist before you start. It is not intended to treat age-related memory changes or any cognitive condition.'],
      ['Can I take it with coffee or other supplements?', 'The label says to avoid using NZT48 Original with any other caffeinated products, which includes coffee, energy drinks and pre-workouts. Ask a healthcare professional before combining it with other supplements.'],
      ['What about medications, pregnancy or health conditions?', 'Do not use it if you are pregnant or nursing, under 18, sensitive to caffeine, or have any known or suspected medical condition. Check with a qualified healthcare professional before use, especially if you take medication. Stop use if you experience rapid heartbeat, dizziness, severe headache or shortness of breath.'],
      ['What should I realistically expect?', 'The caffeine in the formula may help you feel more alert.* The other ingredients are included for focus and mental energy support.* How you respond depends on you, your sleep, your diet and your caffeine tolerance. NZT48 won’t raise your IQ, replace sleep, or guarantee results at work or school.'],
      ['How does it compare to Alpha BRAIN® or Qualia Mind®?', 'The clearest difference is serving size. NZT48 Original is 1 capsule. The labeled serving for Onnit Alpha BRAIN® capsules is 2 capsules, and Qualia Mind® lists a 6-capsule serving with a suggested 3 to 6. The formulas are different (Alpha BRAIN® is caffeine-free), and we don’t claim NZT48 works better. Serving sizes checked on the brands’ official sites on October 8, 2026.'],
      ['How do shipping, returns and subscriptions work?', 'Orders of $70 or more ship free within the US. Every order is covered by our 30-day money-back guarantee under our Returns Policy. Subscriptions renew automatically at the frequency you choose until you cancel, and you can skip, reschedule or cancel from your account.']
    ],
    fda: '*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.',
    warning: 'Check with a qualified health care professional before taking this product. Keep out of the reach of children. Do not use if you are sensitive to caffeine, pregnant or nursing, under 18 years of age, or have any known or suspected medical conditions. Avoid using with any other caffeinated products. Discontinue if you experience rapid heartbeat, dizziness, severe headache or shortness of breath. Do not use if safety seal is damaged or missing.'
  };

  function track(event, data) { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: event, product: 'nzt-48', funnel: 'nzt48-original' }, data || {})); }
  function utm() {
    try {
      var q = new URLSearchParams(location.search), keep = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid'].forEach(function (k) { if (q.get(k)) keep[k] = q.get(k); });
      if (Object.keys(keep).length) sessionStorage.setItem('nzt48_utm', JSON.stringify(keep));
      return JSON.parse(sessionStorage.getItem('nzt48_utm') || '{}');
    } catch (e) { return {}; }
  }
  function checkoutUrl(c) {
    var u = 'https://www.limitlessx.com/cart/' + c.v.id + ':1?', p = new URLSearchParams();
    if (c.sub) p.set('selling_plan', c.p.id);
    var t = utm(); Object.keys(t).forEach(function (k) { p.set(k, t[k]); });
    return u + p.toString();
  }

  // Builds every template value. cmp = DC logic instance; T = per-version style functions.
  function vals(cmp, T) {
    var s = cmp.state, pr = cmp.props || {};
    var size = s.size || pr.defaultSize || '30';
    var plan = s.plan || (pr.defaultPlan === 'one-time' ? 'once' : 'sub');
    var freq = s.freq || v(size).freq;
    var c = calc(size, plan, freq), sub = plan === 'sub';
    var set = function (o, ev, data) { cmp.setState(o); if (ev) track(ev, data); };
    var sizes = V.map(function (x) {
      var k = calc(x.key, plan, sub ? (s.freq || x.freq) : x.freq), sel = x.key === size;
      return { sel: sel, key: x.key, title: x.title, caps: x.caps, supply: x.supply, tag: x.tag, best: x.key === '90',
        total: money(k.total), singles: money(k.singles), hasStrike: k.save > 0.004, perCap: money(k.perCap) + ' / capsule',
        save: k.save > 0.004 ? 'Save ' + money(k.save) : '', savePct: k.savePct > 0 ? k.savePct + '% off' : '', ship: k.freeShip ? 'Free US shipping' : 'Free shipping at $70+',
        bottles: Array.apply(null, { length: x.bottles }).map(function (_, i) { return { style: T.bottle(i, x.bottles) }; }),
        style: T.size(sel, x.key === '90'), tier: T.tier ? T.tier(sel, x.key === '90') : {}, dot: T.dot(sel),
        pick: function () { set({ size: x.key, freq: sub ? (s.freq || null) : null }, 'SelectVariant', { variant: x.id, count: x.count }); },
        add: function (e) { if (e) e.stopPropagation(); cmp.setState({ size: x.key, cartOpen: true, notice: false }); var k2 = calc(x.key, plan, freq); track('AddToCart', { variant: x.id, plan: plan, value: k2.total }); } };
    });
    var freqs = PLANS.map(function (p) { var on = p.days === freq; return { label: 'Every ' + p.days + ' days', off: p.pct + '% off', on: on, style: T.freq(on), pick: function () { set({ freq: p.days }, 'SelectFrequency', { days: p.days }); } }; });
    var faqs = D.faq.map(function (f, i) { var open = (s.faq === undefined ? 0 : s.faq) === i; return { q: f[0], a: f[1], open: open, sign: open ? '−' : '+', toggle: function () { cmp.setState({ faq: open ? -1 : i }); } }; });
    var shipPct = Math.min(100, c.total / FREE_SHIP * 100);
    var cta = pr.ctaLabel || 'Get The Limitless Pill';
    return {
      cta: cta, D: D, faqs: faqs, sizes: sizes, freqs: freqs, ingredients: D.ingredients, benefits: D.benefits, scenarios: D.scenarios, compare: D.compare.map(function (r) { return Object.assign({ style: T.cmp(r.us), capStyle: T.cmpCaps(r.us), pills: Array.apply(null, { length: +r.caps }).map(function () { return { style: T.pill(r.us) }; }) }, r); }),
      blendText: D.blend.join(', '), alsoIn: D.alsoIn, fda: D.fda, warning: D.warning, rating: D.reviews.rating, reviewCount: D.reviews.count,
      isSub: sub, isOnce: !sub, segSub: T.seg(sub), segOnce: T.seg(!sub),
      pickSub: function () { set({ plan: 'sub' }, 'SelectPlan', { plan: 'sub' }); }, pickOnce: function () { set({ plan: 'once' }, 'SelectPlan', { plan: 'once' }); },
      subLabel: 'Subscribe & Save ' + c.p.pct + '%', bestSubPct: '20%',
      sel: { title: c.v.title, caps: c.v.caps, supply: c.v.supply, total: money(c.total), singles: money(c.singles), hasStrike: c.save > 0.004, save: money(c.save), savePct: c.savePct, perCap: money(c.perCap), price: money(c.v.price), freq: freq },
      disclosure: sub ? 'Subscription: ' + money(c.total) + ' charged today and every ' + freq + ' days until you cancel (' + c.p.pct + '% off the ' + money(c.v.price) + ' one-time price). Skip, reschedule or cancel anytime from your account. Taxes calculated at checkout.' : 'One-time purchase of ' + money(c.total) + '. No subscription and no future charges. Taxes calculated at checkout.',
      shipOn: c.freeShip, shipOff: !c.freeShip, shipAway: money(Math.max(0, FREE_SHIP - c.total)), shipBar: T.shipBar(shipPct, c.freeShip),
      addToCart: function () { cmp.setState({ cartOpen: true, notice: false }); track('AddToCart', { variant: c.v.id, plan: plan, value: c.total, currency: 'USD' }); },
      cartOpen: !!s.cartOpen, closeCart: function () { cmp.setState({ cartOpen: false }); }, stop: function (e) { e.stopPropagation(); },
      cart: { title: 'NZT48 Original · ' + c.v.caps, sub: c.v.title + ' · ' + c.v.supply, plan: sub ? 'Subscribe & Save ' + c.p.pct + '% · every ' + freq + ' days' : 'One-time purchase', total: money(c.total), ship: c.freeShip ? 'Free' : 'Calculated at checkout' },
      canUp: size !== '90', upLabel: size === '30' ? 'Switch to 60 capsules: ' + money(calc('60', plan, sub ? 60 : 60).perCap) + ' per capsule' : 'Switch to 90 capsules: ' + money(calc('90', plan, sub ? 90 : 90).perCap) + ' per capsule',
      cartUp: function () { var n = size === '30' ? '60' : '90'; set({ size: n, freq: sub ? +n : null }, 'CartUpgrade', { to: n }); },
      checkout: function () { var url = checkoutUrl(c); track('InitiateCheckout', { variant: c.v.id, plan: plan, value: c.total, url: url }); cmp.setState({ notice: true, checkoutUrl: url }); },
      notice: !!s.notice, checkoutUrl: s.checkoutUrl || '',
      showSticky: !!s.scrolled && (s.w || 1200) < 900 && !s.cartOpen,
      internal: !!pr.showInternal, wide: (s.w || 1200) >= 820
    };
  }
  window.NZT48 = { V: V, PLANS: PLANS, D: D, calc: calc, money: money, vals: vals, track: track, utm: utm };
  window.dispatchEvent(new Event('nzt48-ready'));
})();
