// NZT48 V1 stage: one persistent 3D bottle that travels between [data-nzt-anchor] slots as the page scrolls,
// over a full-screen amber smoke shader whose light follows the bottle.
// Anchor attributes: data-ry (yaw deg), data-tilt (roll deg), data-open (0-1 cap), data-pills (0-1),
// data-fit (bottle height / slot height), data-scrub (extra yaw deg across the slot's parent), data-out="right".
import * as THREE from './vendor/three.module.min.js';
import { setupNZTStudio } from './studio-lighting.js';
import { loadNZT } from './nzt-model.js';
import { setupGoldStudio } from './gold-studio.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);
const D2R = Math.PI / 180;

// One physical scale per viewport. Scroll changes position and orientation only.
export function stageBottleHeight(width, height) {
  return Math.min(360, height * .39, width * (width < 820 ? .43 : .27));
}

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `precision highp float;
uniform vec2 uR;uniform float uT;uniform vec3 uG;uniform float uS;uniform float uA;uniform vec4 uP;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 fc=gl_FragCoord.xy;vec2 uv=fc/uR.y;
  vec2 gp=uG.xy/uR.y;float gs=max(uG.z/uR.y,.05);
  vec2 dv=(uv-gp)/gs;dv.y*=.75;float d=length(dv);
  vec2 q=uv*1.35+vec2(0.,uS*.55);
  float w=fbm(q*1.2+vec2(uT*.018,-uT*.012));
  float sm=fbm(q+vec2(w*1.7,w*.9)+vec2(uT*.028,uT*.008));
  float halo=exp(-d*d*.85)*uA,core=exp(-d*d*4.5)*uA;
  vec3 c=vec3(.03,.029,.034);
  c+=vec3(.95,.55,.12)*halo*(.05+.34*sm*sm);
  c+=vec3(1.,.78,.38)*core*.07;
  c+=vec3(.5,.3,.1)*smoothstep(.56,.98,sm)*.09;
  if(uP.w>.002){
    vec2 pp=uP.xy/uR.y;float ps=uP.z/uR.y;vec2 q2=uv-pp;
    float top=uR.x/uR.y>0.?1.:1.;float tt=max(top-uv.y,0.);
    float bw=ps*.1+tt*.3;
    float beam=exp(-pow(q2.x/bw,2.))*smoothstep(pp.y-ps*.9,pp.y+ps*.2,uv.y);
    float flick=.6+.4*fbm(vec2(q2.x*7.,uv.y*2.-uT*.15));
    float pool=exp(-dot(q2,q2)/(ps*ps)*2.2);
    float floorg=exp(-pow(q2.x/(ps*.9),2.))*exp(-pow((q2.y+ps*.95)/(ps*.07),2.));
    float streak=exp(-pow(q2.y/(ps*.018),2.))*exp(-abs(q2.x)/(ps*1.4));
    vec2 g=uv*vec2(52.)+vec2(sin(uT*.2)*.6,-uT*.35);vec2 id=floor(g);vec2 fq=fract(g)-.5;float r=h(id);
    float mote=smoothstep(.09,0.,length(fq-(vec2(h(id+3.1),h(id+7.3))-.5)*.6))*step(.83,r)*(.45+.55*sin(uT*1.7+r*40.));
    vec3 L=vec3(1.,.74,.32)*beam*flick*.24+vec3(1.,.66,.22)*pool*.2+vec3(1.,.86,.55)*streak*.22+vec3(.95,.62,.2)*floorg*.18+vec3(1.,.85,.55)*mote*(beam*1.6+pool*.9);
    c=mix(c,c*.55,uP.w*(1.-pool))+L*uP.w;
  }
  vec2 v=fc/uR-.5;c*=1.-dot(v,v)*.85;
  c+=(h(fc+fract(uT*.7)*91.)-.5)*.028;
  gl_FragColor=vec4(max(c,0.),1.);
}`;

function makeBg() {
  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  Object.assign(c.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '-1', pointerEvents: 'none' });
  const gl = c.getContext('webgl', { antialias: false, depth: false, alpha: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n), uR = U('uR'), uT = U('uT'), uG = U('uG'), uS = U('uS'), uA = U('uA'), uP = U('uP');
  const scale = .5;
  const resize = () => { c.width = Math.ceil(innerWidth * scale); c.height = Math.ceil(innerHeight * scale); gl.viewport(0, 0, c.width, c.height); };
  resize();
  document.body.prepend(c);
  return {
    resize,
    render(t, gx, gy, gs, s, a, px = 0, py = 0, pz = 0, pw = 0) {
      gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, t);
      gl.uniform3f(uG, gx * scale, (innerHeight - gy) * scale, gs * scale);
      gl.uniform1f(uS, s); gl.uniform1f(uA, a);
      gl.uniform4f(uP, px * scale, (innerHeight - py) * scale, pz * scale, pw);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() { c.remove(); }
  };
}

function setupReveal(cleanup) {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target);
  }), { rootMargin: '0px 0px -6% 0px' });
  const arm = () => document.querySelectorAll('[data-reveal]:not([data-reveal-armed])').forEach(el => {
    el.setAttribute('data-reveal-armed', '');
    if (el.getBoundingClientRect().top < innerHeight) return;
    el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)';
    io.observe(el);
  });
  arm();
  const iv = setInterval(arm, 1200);
  cleanup.push(() => { clearInterval(iv); io.disconnect(); });
}

function readAnchors() {
  const out = [], vc = innerHeight / 2;
  for (const el of document.querySelectorAll('[data-nzt-anchor]')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const d = el.dataset;
    const h = stageBottleHeight(innerWidth, innerHeight);
    let ry = (+d.ry || 0) * D2R;
    if (d.scrub) {
      const p = el.parentElement.getBoundingClientRect();
      ry += (+d.scrub) * D2R * clamp((vc - p.top - r.height / 2) / Math.max(1, p.height - r.height));
    }
    out.push({
      cx: d.out === 'right' ? innerWidth + h * .95 : r.left + r.width / 2,
      cy: r.top + r.height / 2, top: r.top + scrollY, h, ry,
      tilt: (+d.tilt || 0) * D2R, open: +d.open || 0, pills: +d.pills || 0, solo: +d.solo || 0, arm: d.bottling === '1' ? 1 : 0, bottle: 1, glow: 1
    });
  }
  return out.sort((a, b) => a.top - b.top);
}

export function mountStage(opts = {}) {
  if (window.__nztStage) window.__nztStage.dispose();
  const base = opts.base || './3d/';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanup = [];
  const api = { force: null, ready: false };
  let alive = true, raf = 0, three = null, mx = 0, my = 0, aspect = .62, primed = false;

  let bg = null;
  // Background shader removed by request; the page background stays flat.
  if (bg) cleanup.push(() => bg.dispose());
  if (!reduced) setupReveal(cleanup);
  // Soft warm glow behind the bottle (under page content, follows the bottle, flares during bottling).
  const halo = document.createElement('div');
  halo.setAttribute('aria-hidden', 'true');
  Object.assign(halo.style, { position: 'fixed', left: '0', top: '0', width: '100px', height: '100px', zIndex: '0', pointerEvents: 'none', borderRadius: '50%', opacity: '0', willChange: 'transform,opacity',
    background: 'radial-gradient(closest-side, rgba(255,200,92,.42), rgba(244,170,48,.2) 38%, rgba(200,120,20,.07) 68%, rgba(0,0,0,0))', filter: 'blur(8px)' });
  document.body.prepend(halo);
  cleanup.push(() => halo.remove());
  let haloBoost = 0;

  const onPM = e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', onPM, { passive: true });
  cleanup.push(() => removeEventListener('pointermove', onPM));
  const onResize = () => { bg && bg.resize(); three && three.resize(); };
  addEventListener('resize', onResize);
  cleanup.push(() => removeEventListener('resize', onResize));

  const cur = { x: innerWidth * .72, y: innerHeight * .5, h: innerHeight * .6, ry: 0, tilt: 0, open: 0, pills: 0, solo: 0, arm: 0, bottle: 1, glow: 1 };

  function target() {
    const A = readAnchors();
    if (!A.length) return null;
    const vc = innerHeight / 2, L = A[A.length - 1];
    let a = A[0], b = A[0], t = 0;
    if (vc >= L.cy) a = b = L;
    else if (vc > A[0].cy) for (let i = 0; i < A.length - 1; i++) {
      if (vc >= A[i].cy && vc <= A[i + 1].cy) { a = A[i]; b = A[i + 1]; t = (vc - a.cy) / Math.max(1, b.cy - a.cy); break; }
    }
    const e = smooth(clamp((t - .14) / .72));
    const o = {};
    for (const k of ['h', 'ry', 'tilt', 'open', 'pills', 'solo', 'arm', 'bottle', 'glow']) o[k] = lerp(a[k], b[k], e);
    o.h = stageBottleHeight(innerWidth, innerHeight);
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 72;
    o.x = lerp(a.cx, b.cx, e);
    // Reserve the full cap-open envelope before the animation starts. Never
    // resize the bottle to fit a section. Dense content has a smooth side exit.
    o.y = clamp(lerp(a.cy, b.cy, e), headerBottom + 24 + o.h * (.56 + .24 * o.arm), innerHeight - 28 - o.h * .57);
    return api.force ? Object.assign(o, api.force) : o;
  }

  async function initThree() {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '3', pointerEvents: 'none', opacity: '1' });
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    renderer.physicallyCorrectLights = true;
    renderer.setClearColor(0x000000, 0);
    const dpr = () => Math.min(window.devicePixelRatio || 1, innerWidth < 820 ? 1.5 : 2);
    renderer.setPixelRatio(dpr()); renderer.setSize(innerWidth, innerHeight, false);
    const scene = new THREE.Scene();
    const studio = setupNZTStudio(renderer, scene);
    renderer.toneMappingExposure = 1.12;
    const camera = new THREE.PerspectiveCamera(20, innerWidth / innerHeight, .1, 50);
    camera.position.set(0, 0, 4);
    // Contact shadow disc under the bottle, fades with the bottle's lean.
    const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const r = g.createRadialGradient(128, 128, 10, 128, 128, 128); r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(.45, 'rgba(0,0,0,.22)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); return t; })();
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false }));
    shadow.renderOrder = -1; scene.add(shadow);
    cleanup.push(() => { shadow.geometry.dispose(); shadow.material.dispose(); shadowTex.dispose(); }); camera.lookAt(0, 0, 0);
    const product = await loadNZT(scene, { bottleUrl: base + 'nzt48-bottle-cap.glb', pillUrl: base + 'nzt48-gold-pill-pbr.glb' });
    if (!alive) { product.dispose(); studio.dispose(); renderer.dispose(); return null; }
    const bottleEnv = scene.environment;
    const goldStudio = setupGoldStudio(renderer, scene);
    scene.environment = bottleEnv;
    renderer.toneMappingExposure = 1.0;
    cleanup.push(() => goldStudio.dispose());
    // The approved PBR capsule already contains the doubled dimensions in meters.
    // Clone the loader's single template; no baked capsule or second GLB request.
    const makePill = parent => {
      const holder = new THREE.Group();
      product.createPill(holder);
      parent.add(holder);
      return holder;
    };

    const model = product.model;
    model.rotation.set(0, 0, 0); product.resetCap();
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const H = size.y; aspect = Math.max(size.x, size.z) / H;
    // Bottling sequence geometry: mouth height (in bottle heights from centre) and cap-local units per bottle height.
    const capBox = new THREE.Box3().setFromObject(product.cap);
    const mouthY = (capBox.min.y - ctr.y) / H;
    const capUnit = H / product.cap.parent.getWorldScale(new THREE.Vector3()).y;
    const composition = new THREE.Group(); scene.add(composition);
    const pivot = new THREE.Group(), yawG = new THREE.Group();
    composition.add(pivot); pivot.add(yawG); yawG.add(model); model.position.sub(ctr);

    const pillsG = new THREE.Group(); composition.add(pillsG);
    const ORBIT = [[-.64, .30, .25], [.64, .02, .32], [-.54, -.40, -.35], [.52, .46, -.42], [.10, .80, -.22], [-.80, -.08, -.6], [.74, -.46, .06]];
    const SPILL = [[-.30, .64, .18], [.02, .80, .26], [.31, .67, .12], [-.17, .95, -.06], [.25, .97, -.1], [-.47, .84, -.25], [.47, .82, -.2]];
    const pills = ORBIT.map((o, i) => {
      const obj = makePill(pillsG), mats = [];
      obj.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.envMap = goldStudio.texture; m.material.envMapIntensity = .8; m.material.transparent = true; m.material.opacity = 0; mats.push(m.material); } });
      obj.visible = false;
      return { obj, mats, v: 0, spin: 0, init: false, pos: new THREE.Vector3(), o, s: SPILL[i], b: new THREE.Euler(i * 1.3, i * 2.1, .4 + i * .7), spd: (.07 + (i % 3) * .035) * (i % 2 ? 1 : -1) };
    });

    const tv = new THREE.Vector3();
    const key = new THREE.PointLight(0xffc56a, 0, 0, 2), rim = new THREE.PointLight(0xffe2b0, 0, 0, 2);
    scene.add(key, rim);
    let orbA = 0, lastT = 0;
    // "Genie" bottling timeline (seconds from arrival at the data-bottling anchor):
    // settle upright → cap unscrews and floats up → capsules swirl in a vortex and dive into the mouth → cap screws shut → bottle spins.
    const TAU = Math.PI * 2, P0 = 1.5, PSTEP = .2, PDUR = 1.6, C0 = .5, C1 = 1.9, S0 = 4.25, S1 = 5.4, SP0 = 5.15, SP1 = 7.3;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const seq = { t0: -1, yawOff: 0, lastYaw: 0 };
    function pose(c, time, ie) {
      const vh = 2 * 4 * Math.tan(10 * D2R), k = vh / innerHeight;
      const s = stageBottleHeight(innerWidth, innerHeight) * k / H;
      const open = 0;
      const idle = reduced ? 0 : 1;
      const dt = Math.min(.05, Math.max(0, time - lastT)); lastT = time;
      if (c.arm > .95 && !reduced && ie > .99) { if (seq.t0 < 0) seq.t0 = time; }
      else if (c.arm < .4 && seq.t0 >= 0) { seq.t0 = -1; seq.yawOff = ((seq.lastYaw % TAU) + TAU + Math.PI) % TAU - Math.PI; }
      const st = seq.t0 >= 0 ? time - seq.t0 : -1;
      seq.yawOff *= Math.exp(-dt * 2.5);
      // Settle: bob and lean ease out on arrival, return gently once the spin is done.
      const calm = st >= 0 ? Math.min(1, 1 - smooth(clamp(st / .9)) + smooth(clamp((st - 7) / 1.6))) : 1;
      const tilt = c.tilt * (st >= 0 ? 1 - smooth(clamp(st / 1.1)) : 1);
      const seal = st >= 0 ? Math.exp(-Math.pow((st - S1) / .14, 2)) : 0;
      const bob = Math.sin(time * .9) * c.h * .012 * idle * calm - seal * c.h * .012;
      pivot.position.set((c.x - innerWidth / 2) * k, -(c.y - innerHeight / 2) * k + bob * k, 0);
      pivot.scale.setScalar(s);
      pivot.rotation.set(my * .06 * idle + .04, 0, tilt + Math.sin(time * .6) * .018 * idle * calm);
      shadow.position.set(pivot.position.x + Math.sin(pivot.rotation.z) * .1, pivot.position.y - H * s * .54 - bob * k * .5, -.05);
      shadow.scale.set(H * s * .9, H * s * .26, 1);
      shadow.material.opacity = ie * (1 - Math.min(1, Math.abs(tilt) * 2.2)) * .9;
      let sy = 0;
      if (st >= 0) {
        const d = Math.max(0, st - 6.9);
        sy = -.55 * smooth(clamp((st - 1) / 3.3)) - TAU * easeOut(clamp((st - SP0) / (SP1 - SP0))) - .32 * (d < 1 ? d * d / 2 : d - .5);
        seq.lastYaw = sy;
      }
      yawG.rotation.y = c.ry + sy + seq.yawOff + (Math.sin(time * .45) * .12 * calm + mx * .2) * idle;
      if (st >= 0) {
        const capP = smooth(clamp((st - C0) / (C1 - C0))) * (1 - smooth(clamp((st - S0) / (S1 - S0))));
        // A short mechanical lift leaves room for the floating cap and pills.
        product.setCapOpening(capP, { lift: .18 * capUnit });
        const lift = smooth(clamp((capP - .45) / .55));
        product.cap.position.y += lift * .06 * capUnit;
        product.cap.position.x += Math.sin(time * 1.4) * .012 * capUnit * lift;
      } else product.resetCap();
      pillsG.position.copy(pivot.position); pillsG.scale.setScalar(s);
      let pulse = 0;
      if (st >= 0) for (let i = 0; i < pills.length; i++) { const u = clamp((st - P0 - i * PSTEP) / PDUR); pulse = Math.max(pulse, Math.exp(-Math.pow((u - .9) / .08, 2))); }
      haloBoost = (pulse * .35 + seal * .6) * c.arm;
      key.intensity = 5 * c.solo + (pulse * 7 + seal * 10) * c.arm; rim.intensity = 4 * c.solo + (pulse * 4 + seal * 6) * c.arm;
      key.position.set(pivot.position.x - .45, pivot.position.y + .5, .9);
      rim.position.set(pivot.position.x + .5, pivot.position.y + .2, -.4);
      pillsG.rotation.set(pivot.rotation.x, 0, 0);
      orbA += dt * .05 * idle * (1 - open);
      const ca = Math.cos(orbA), sa = Math.sin(orbA);
      const want = Math.round(c.pills * pills.length);
      const kf = 1 - Math.exp(-dt * 2.4), kp = 1 - Math.exp(-dt * 2.8);
      pills.forEach((p, i) => {
        const pst = P0 + i * PSTEP;
        if (st >= pst) {
          if (!p.vx) { p.vx = { r: Math.hypot(p.pos.x, p.pos.z), a: Math.atan2(p.pos.z, p.pos.x), y: p.pos.y, v: p.v }; }
          const u = clamp((st - pst) / PDUR), m = mouthY * H, hover = m + .5 * H;
          const r = p.vx.r * Math.pow(1 - Math.min(u / .85, 1), 1.4);
          const a = p.vx.a - (u * u * 2 + u * 2.6) * Math.PI;
          const y = u < .62 ? lerp(p.vx.y, hover, smooth(u / .62)) : lerp(hover, m - .08 * H, Math.pow((u - .62) / .38, 2));
          p.pos.set(Math.cos(a) * r, y, Math.sin(a) * r);
          p.obj.position.copy(p.pos);
          p.spin += dt * (1.5 + u * 6);
          const up = smooth(clamp((u - .45) / .4));
          p.obj.rotation.set(lerp(p.b.x, 0, up), p.b.y + p.spin, lerp(p.b.z, Math.PI / 2, up));
          p.obj.scale.setScalar(1 - .65 * smooth(clamp((u - .72) / .28)));
          p.v = Math.max(p.vx.v, smooth(clamp(u / .15))) * (1 - smooth(clamp((u - .88) / .12)));
          p.obj.visible = p.v > .004;
          for (const mm of p.mats) mm.opacity = p.v;
          return;
        }
        if (p.vx) { p.vx = null; if (st < 0) p.v = 0; }
        if (st >= 0 && st > P0 + PSTEP * pills.length + PDUR) return;
        const so = i ? 0 : c.solo;
        const tgt = i < want && (i === 0 || c.solo < .5) ? ie : 0;
        p.v += (tgt - p.v) * (p.init ? kf : 1);
        p.obj.visible = p.v > .004;
        const ox = p.o[0] * ca - p.o[2] * sa, oz = p.o[0] * sa + p.o[2] * ca;
        const f = Math.sin(time * .6 + i * 1.7) * .025 * idle;
        tv.set(lerp(lerp(ox, p.s[0], open), -.34, so) * H, (lerp(lerp(p.o[1], p.s[1], open), -.1, so) + f) * H, lerp(lerp(oz, p.s[2], open), .6, so) * H);
        if (!p.init) { p.pos.copy(tv); p.init = true; } else p.pos.lerp(tv, kp);
        p.obj.position.copy(p.pos);
        p.spin += dt * lerp(p.spd, .2, so) * (reduced ? 0 : 1);
        p.obj.rotation.set(lerp(p.b.x + p.spin * .2, .14, so), p.b.y + p.spin, lerp(p.b.z, Math.PI / 2 - .3, so));
        p.obj.scale.setScalar((.85 + .15 * p.v) * (1 + so * 1.5));
        for (const m of p.mats) m.opacity = p.v;
      });
    }

    // Product still for bundle cards and cart, rendered from the same model and lighting.
    function still() {
      const w = 480, h = 720;
      renderer.setPixelRatio(1); renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      pillsG.visible = false; product.resetCap();
      pivot.position.set(0, 0, 0); pivot.rotation.set(.05, 0, 0); yawG.rotation.y = -.28;
      pivot.scale.setScalar(2 * 4 * Math.tan(10 * D2R) * .92 / H);
      renderer.render(scene, camera);
      const url = canvas.toDataURL('image/png');
      pillsG.visible = true;
      resize();
      return url;
    }
    function resize() {
      renderer.setPixelRatio(dpr()); renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    }
    try { window.__nztStill = still(); window.dispatchEvent(new Event('nzt-still')); } catch (e) { console.warn(e); }
    document.body.appendChild(canvas);

    cleanup.push(() => { canvas.remove(); product.dispose(); studio.dispose(); renderer.dispose(); });
    return {
      resize,
      draw(c, time) {
        pose(c, time, 1);
        // The same composition stays visible and keeps its physical scale.
        canvas.dataset.nztMotion = 'continuous';
        canvas.dataset.nztBottleScale = String(pivot.scale.x);
        canvas.dataset.nztBottleYaw = String(yawG.rotation.y);
        renderer.render(scene, camera);
      }
    };
  }

  initThree().then(t => { three = t; api.ready = !!t; }).catch(e => {
    console.warn('NZT 3D unavailable, showing static bottle', e);
    document.querySelectorAll('[data-nzt-fallback]').forEach(el => { el.style.opacity = '1'; });
  });

  // Pinned horizontal tracks ([data-hscroll] > sticky > [data-htrack]) and drifting display type ([data-parallax]).
  function layoutFx() {
    for (const el of document.querySelectorAll('[data-hscroll]')) {
      const track = el.querySelector('[data-htrack]');
      if (!track) continue;
      const travel = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      const want = Math.round(travel + innerHeight) + 'px';
      if (el.style.height !== want) el.style.height = want;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
      track.style.transform = 'translate3d(' + (-p * travel).toFixed(1) + 'px,0,0)';
    }
    if (reduced) return;
    for (const el of document.querySelectorAll('[data-parallax]')) {
      const r = el.getBoundingClientRect();
      const d = (r.top + r.height / 2 - innerHeight / 2) * (+el.dataset.parallax || .15);
      el.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0)';
    }
  }

  let last = performance.now();
  const t0 = last;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const dt = Math.min((now - last) / 1000, .05); last = now;
    const time = (now - t0) / 1000;
    layoutFx();
    const tg = target();
    if (tg) {
      const k = primed && !reduced ? 1 - Math.exp(-dt * 6.5) : 1;
      for (const key in cur) cur[key] += (tg[key] - cur[key]) * k;
      primed = true;
    }
    if (three) three.draw(cur, time);
    {
      const sz = cur.h * 1.45 * (1 + haloBoost * .25), breathe = reduced ? 1 : .92 + .08 * Math.sin(time * .8);
      halo.style.transform = 'translate3d(' + (cur.x - 50).toFixed(1) + 'px,' + (cur.y - 50).toFixed(1) + 'px,0) scale(' + (sz / 100).toFixed(3) + ',' + (sz * 1.08 / 100).toFixed(3) + ')';
      halo.style.opacity = (three ? Math.min(1, cur.bottle * cur.glow * (breathe + haloBoost)) : 0).toFixed(3);
    }
    if (bg) bg.render(reduced ? 0 : time, cur.x, cur.y, cur.h * .95, scrollY / innerHeight, cur.glow);
  }
  raf = requestAnimationFrame(frame);

  api.dispose = () => {
    alive = false; cancelAnimationFrame(raf);
    cleanup.forEach(f => { try { f(); } catch (e) { } });
    if (window.__nztStage === api) window.__nztStage = null;
  };
  api.cur = cur;
  window.__nztStage = api;
  return api;
}
