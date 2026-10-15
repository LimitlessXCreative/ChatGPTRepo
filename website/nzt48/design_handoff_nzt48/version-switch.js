/* Preview-only version switcher (bottom right). Add a new version = add one line below. Not for production. */
(function () {
  var VERSIONS = [
    { v: 'V1', name: '3D', file: 'NZT48 V1 - 3D.dc.html' },
    { v: 'V2', name: 'Magazine', file: 'NZT48 V2 - Magazine.dc.html' },
    { v: 'V3', name: 'Cinematic', file: 'NZT48 V3 - Cinematic.html' },
  ];
  if (/[?&]embed=1/.test(location.search)) return;
  var path = decodeURIComponent(location.pathname);
  var cur = VERSIONS.findIndex(function (x) { return path.endsWith('/' + x.file); });

  // Section the viewer is on, so switching lands on the same spot
  function sectionNow() {
    var hit = null, H = innerHeight;
    document.querySelectorAll('section[id],[data-section]').forEach(function (s) {
      if (s.getBoundingClientRect().top <= H * 0.35) hit = s.id || s.getAttribute('data-section');
    });
    return hit;
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.id = 'lx-version-switch';
    wrap.style.cssText = 'position:fixed;right:16px;bottom:' + (innerWidth < 900 ? '88px' : '16px') + ';z-index:2147483000;display:flex;gap:4px;padding:5px;border-radius:999px;background:#111;box-shadow:0 10px 30px rgba(0,0,0,.4);font:600 13px/1 Poppins,Arial,sans-serif';
    VERSIONS.forEach(function (x, i) {
      var b = document.createElement('button'), on = i === cur;
      b.type = 'button';
      b.textContent = x.v + ' · ' + x.name;
      b.style.cssText = 'border:0;cursor:pointer;height:36px;padding:0 14px;border-radius:999px;white-space:nowrap;font:inherit;background:' + (on ? '#E2C675' : 'rgba(255,255,255,.1)') + ';color:' + (on ? '#111' : '#fff');
      if (!on) b.onclick = function () { var id = sectionNow(); location.href = encodeURI(x.file) + (id ? '#v=' + id : ''); };
      wrap.appendChild(b);
    });
    document.body.appendChild(wrap);
  }

  function restore() {
    var m = /#v=([\w-]+)/.exec(location.hash), tries = 0;
    if (!m) return;
    (function go() {
      var el = document.getElementById(m[1]) || document.querySelector('[data-section="' + m[1] + '"]');
      if (el && tries > 3) { scrollTo(0, el.getBoundingClientRect().top + scrollY); history.replaceState(null, '', location.pathname); }
      else if (tries++ < 30) setTimeout(go, 200);
    })();
  }

  function init() { build(); restore(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
