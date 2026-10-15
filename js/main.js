/* Enterijeri RC10 — animacije i interakcije (bez biblioteka) */
(function () {
  'use strict';

  /* ===== PODEŠAVANJE FORME =====
     Unesite Formspree (ili sličan) endpoint, npr. 'https://formspree.io/f/xxxxxxx'.
     Dok je prazno, forma prikazuje poruku da slanje još nije aktivno. */
  var FORM_ENDPOINT = '';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
  var html = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.8,.2,1)';

  var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Meni ---------- */
  var header = $('.header'), burger = $('.burger');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    updateFab();
  }
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $$('#mobilni-meni a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Otkrivanje pri skrolu ---------- */
  function hide(el) {
    var d = +(el.getAttribute('data-delay') || 0);
    if (el.hasAttribute('data-line')) {
      el.style.transform = 'translateY(105%)';
      el.style.transition = 'transform .7s ' + EASE + ' ' + d + 'ms';
    } else if (el.hasAttribute('data-img')) {
      el.style.clipPath = 'inset(0 100% 0 0 round 32px)';
      el.style.transition = 'clip-path .85s cubic-bezier(.7,0,.2,1) ' + d + 'ms';
      var z = el.querySelector('.zoom');
      if (z) { z.style.transform = 'scale(1.12)'; z.style.transition = 'transform 1.1s ' + EASE + ' ' + d + 'ms'; }
    } else {
      el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .6s ' + EASE + ' ' + d + 'ms, transform .6s ' + EASE + ' ' + d + 'ms';
    }
  }
  function show(el) {
    el.style.opacity = ''; el.style.transform = ''; el.style.clipPath = '';
    var z = el.querySelector && el.querySelector('.zoom');
    if (z) {
      z.style.transform = '';
      setTimeout(function () { z.style.transition = ''; }, 1300);
    }
  }
  var revealEls = $$('[data-reveal],[data-line],[data-img]');
  if (!reduced && 'IntersectionObserver' in window) {
    revealEls.forEach(hide);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    revealEls.filter(function (el) { return !el.closest('[data-hero]'); }).forEach(function (el) { io.observe(el); });
  }
  function startHero() {
    if (reduced) return;
    $$('[data-hero] [data-reveal],[data-hero] [data-line],[data-hero] [data-img]').forEach(show);
  }

  /* ---------- Parallax ---------- */
  var pxEls = $$('.px');
  function parallax() {
    if (reduced) return;
    var vh = window.innerHeight;
    pxEls.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = 'translate3d(0,' + (p * -7).toFixed(2) + '%,0)';
    });
  }

  /* ---------- Usluge (zadržavanje pri skrolu) ---------- */
  var svc = $('#usluge'), svcItems = $$('.svc-item'), svcImgs = $$('.svc-img');
  var svcCount = $('.svc-count'), svcBar = $('.svc-bar span'), svcIdx = -1;
  function pinned() {
    var w = window.innerWidth, h = window.innerHeight;
    return (w >= 960 && h >= 640) || (w < 960 && h >= 560);
  }
  function setSvc(i) {
    if (i === svcIdx) return; svcIdx = i;
    svcItems.forEach(function (li, k) {
      li.classList.toggle('is-active', k === i);
      li.querySelector('button').setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
    svcImgs.forEach(function (im, k) { im.classList.toggle('is-active', k === i); });
    svcCount.textContent = ('0' + (i + 1)).slice(-2) + ' / 0' + svcItems.length;
  }
  function svcScroll() {
    if (!pinned()) return;
    var r = svc.getBoundingClientRect(), span = r.height - window.innerHeight;
    var p = span > 0 ? clamp(-r.top / span) : 0;
    setSvc(Math.min(svcItems.length - 1, Math.floor(p * svcItems.length)));
    svcBar.style.width = (p * 100).toFixed(1) + '%';
  }
  svcItems.forEach(function (li, i) {
    var b = li.querySelector('button');
    var pick = function () { if (!pinned()) setSvc(i); };
    b.addEventListener('mouseenter', pick);
    b.addEventListener('focus', pick);
    b.addEventListener('click', function () {
      if (pinned()) {
        var top = svc.getBoundingClientRect().top + window.scrollY;
        var span = svc.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + span * (i + 0.5) / svcItems.length, behavior: reduced ? 'auto' : 'smooth' });
      } else setSvc(i);
    });
  });
  setSvc(0);

  /* ---------- Proces (linije na mobilnom) ---------- */
  var procList = $('.proc-list'), procItems = $$('.proc-item');
  var NS = 'http://www.w3.org/2000/svg';
  function buildFrames() {
    var mob = window.innerWidth < 720;
    procItems.forEach(function (li) {
      var old = li.querySelector('.proc-frame'); if (old) old.remove();
      li._paths = [];
      if (!mob) return;
      var w = li.offsetWidth, h = li.offsetHeight, r = 31, o = 1, c = w / 2;
      var L = 'M' + c + ' ' + o + 'H' + (o + r) + 'A' + r + ' ' + r + ' 0 0 0 ' + o + ' ' + (o + r) + 'V' + (h - o - r) + 'A' + r + ' ' + r + ' 0 0 0 ' + (o + r) + ' ' + (h - o) + 'H' + c;
      var R = 'M' + c + ' ' + o + 'H' + (w - o - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (w - o) + ' ' + (o + r) + 'V' + (h - o - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (w - o - r) + ' ' + (h - o) + 'H' + c;
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'proc-frame'); svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      [L, R].forEach(function (d) {
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d); p.setAttribute('pathLength', '1');
        svg.appendChild(p); li._paths.push(p);
      });
      li.appendChild(svg);
    });
  }
  function procScroll() {
    if (window.innerWidth >= 720) return;
    var r = procList.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduced ? 1 : clamp((vh * 0.72 - r.top) / Math.max(1, r.height));
    var n = procItems.length, at = p * (n * 3 - 1);
    procItems.forEach(function (li, i) {
      var fp = clamp((at - i * 3) / 2), lp = clamp(at - (i * 3 + 2));
      (li._paths || []).forEach(function (pa) { pa.style.strokeDashoffset = 1 - fp; pa.style.opacity = fp > 0 ? 1 : 0; });
      var line = li.querySelector('.proc-line span');
      if (line) line.style.transform = 'scaleY(' + lp.toFixed(3) + ')';
    });
  }

  /* ---------- Pre / posle ---------- */
  var cmp = $('.cmp'), cmpPre = $('.cmp-pre'), cmpHandle = $('.cmp-handle'), cmpRange = $('.cmp-range'), dragging = false;
  function setCmp(v) {
    v = Math.max(0, Math.min(100, v));
    cmpPre.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
    cmpHandle.style.left = v + '%';
    cmpRange.value = Math.round(v);
  }
  function cmpFromEvent(e) { var r = cmp.getBoundingClientRect(); setCmp((e.clientX - r.left) / r.width * 100); }
  cmpHandle.addEventListener('pointerdown', function (e) { dragging = true; cmpHandle.setPointerCapture(e.pointerId); cmpFromEvent(e); });
  cmpHandle.addEventListener('pointermove', function (e) { if (dragging) cmpFromEvent(e); });
  ['pointerup', 'pointercancel'].forEach(function (t) { cmpHandle.addEventListener(t, function () { dragging = false; }); });
  cmpRange.addEventListener('input', function () { setCmp(+cmpRange.value); });
  setCmp(50);

  /* ---------- Natpis u footeru (popunjava širinu) ---------- */
  var fitEl = $('.footer-word'), fitting = false;
  function fitText() {
    if (!fitEl) return;
    var box = fitEl.parentElement.clientWidth; if (!box) return;
    fitting = true;
    var size = 100; fitEl.style.fontSize = size + 'px';
    for (var k = 0; k < 6; k++) {
      var w = fitEl.getBoundingClientRect().width; if (!w) break;
      if (w <= box && box - w < 0.75) break;
      size = size * box / w * (w > box ? 0.998 : 1);
      fitEl.style.fontSize = size.toFixed(2) + 'px';
    }
    while (fitEl.getBoundingClientRect().width > box && size > 10) { size -= 0.25; fitEl.style.fontSize = size.toFixed(2) + 'px'; }
    requestAnimationFrame(function () { fitting = false; });
  }
  if (fitEl && 'ResizeObserver' in window) new ResizeObserver(function () { if (!fitting) fitText(); }).observe(fitEl.parentElement);

  /* ---------- Plutajuće dugme (mobilni) ---------- */
  var fab = $('.fab'), fabLink = fab && fab.querySelector('a'), everScrolled = false, kontakt = $('#kontakt');
  function updateFab() {
    if (!fab) return;
    var atContact = kontakt.getBoundingClientRect().top < window.innerHeight * 0.85;
    var on = everScrolled && !atContact && !document.body.classList.contains('menu-open') && !html.classList.contains('is-loading');
    fab.classList.toggle('is-on', on);
    fab.setAttribute('aria-hidden', on ? 'false' : 'true');
    fabLink.tabIndex = on ? 0 : -1;
  }

  /* ---------- Skrol ---------- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    if (y > 30) everScrolled = true;
    updateFab();
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { parallax(); svcScroll(); procScroll(); ticking = false; });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { fitText(); buildFrames(); svcScroll(); procScroll(); parallax(); }, 80);
  });

  /* ---------- Preloader ---------- */
  var loader = $('.loader');
  function endLoader() {
    if (loader) loader.remove();
    html.classList.remove('is-loading');
    updateFab();
  }
  function runLoader() {
    var segs = { F: [0, 900], D: [350, 1100], P: [600, 1300], H: [900, 1400], M: [1000, 1750] };
    var shapes = $$('[data-s]', loader);
    var tw = $('#ld-w'), th = $('#ld-h'), status = $('.loader-status'), tag = $('.loader-tag'), art = $('.loader-art');
    var doorL = $('.loader-door.l'), doorR = $('.loader-door.r'), handles = $$('.loader-handle');
    var out = function (p) { return 1 - Math.pow(1 - p, 3); };
    var io3 = function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
    var t0 = performance.now(), heroed = false;
    function seg(lt, a, b) { return clamp((lt - a) / (b - a)); }
    function tick(t) {
      var lt = t - t0;
      shapes.forEach(function (s) { var g = segs[s.getAttribute('data-s')]; s.style.strokeDashoffset = 1 - out(seg(lt, g[0], g[1])); });
      var pM = out(seg(lt, 1000, 1750)), W = Math.round(240 * pM), H = Math.round(260 * pM);
      tw.textContent = W + ' cm'; th.textContent = H + ' cm'; tw.style.opacity = th.style.opacity = pM;
      status.textContent = lt < 1000 ? 'SKICA' : lt < 1800 ? 'MERENJE · ' + W + ' × ' + H + ' CM' : 'OD IDEJE DO REALIZACIJE';
      var tg = out(seg(lt, 1500, 1850));
      tag.style.opacity = tg; tag.style.transform = 'translateY(' + (10 * (1 - tg)).toFixed(1) + 'px)';
      var fade = io3(seg(lt, 2000, 2300)), door = io3(seg(lt, 2250, 3150));
      art.style.opacity = 1 - fade;
      art.style.transform = 'translateY(' + (-12 * fade).toFixed(1) + 'px) scale(' + (1 - .04 * fade).toFixed(3) + ')';
      handles.forEach(function (h) { h.style.opacity = io3(seg(lt, 2050, 2300)); });
      doorL.style.transform = 'translate3d(' + (-door * 101).toFixed(2) + '%,0,0)';
      doorR.style.transform = 'translate3d(' + (door * 101).toFixed(2) + '%,0,0)';
      loader.style.pointerEvents = door > .4 ? 'none' : 'auto';
      if (!heroed && lt >= 2550) { heroed = true; startHero(); }
      if (lt < 3250) requestAnimationFrame(tick); else endLoader();
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Kontakt forma ---------- */
  var form = $('#upit-forma'), card = $('.form-card'), statusEl = $('.form-status'), submitBtn = $('.btn-submit'), submitTxt = $('.btn-submit span');
  var note = $('.form-note'); if (note && FORM_ENDPOINT) note.remove();
  function setErr(name, msg) {
    var input = form.elements[name], errEl = $('[data-err="' + name + '"]');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    errEl.textContent = msg || '';
  }
  function validate() {
    var f = form.elements, ok = true, c = f.kontakt.value.trim();
    var mail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c);
    var phone = /^\+?[\d\s\/().-]{6,}$/.test(c) && c.replace(/\D/g, '').length >= 6;
    var rules = [
      ['ime', f.ime.value.trim().length < 2 ? 'Unesite ime i prezime.' : ''],
      ['kontakt', !mail && !phone ? 'Unesite ispravan broj telefona ili e-mail adresu.' : ''],
      ['vrsta', !f.vrsta.value ? 'Izaberite vrstu nameštaja.' : ''],
      ['opis', f.opis.value.trim().length < 10 ? 'Opišite projekat u nekoliko reči (najmanje 10 karaktera).' : '']
    ];
    var first = null;
    rules.forEach(function (r) { setErr(r[0], r[1]); if (r[1]) { ok = false; if (!first) first = f[r[0]]; } });
    if (first) first.focus();
    return ok;
  }
  ['ime', 'kontakt', 'vrsta', 'opis'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () { setErr(n, ''); statusEl.textContent = ''; });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) { statusEl.textContent = 'Proverite označena polja i pokušajte ponovo.'; return; }
    if (!FORM_ENDPOINT) { statusEl.textContent = 'Slanje upita još nije aktivirano. Do tada nam pišite u DM na Instagramu @enterijerirc10.'; return; }
    submitBtn.disabled = true; submitTxt.textContent = 'Šaljem…'; statusEl.textContent = '';
    var f = form.elements;
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ime_i_prezime: f.ime.value, kontakt: f.kontakt.value, vrsta_namestaja: f.vrsta.value, opis: f.opis.value, _subject: 'Novi upit — Enterijeri RC10' })
    }).then(function (r) {
      if (!r.ok) throw new Error('bad');
      card.classList.add('is-sent');
      $('.form-sent').focus();
    }).catch(function () {
      statusEl.textContent = 'Upit trenutno nije moguće poslati. Pokušajte ponovo ili nam pišite u DM na Instagramu @enterijerirc10.';
    }).then(function () { submitBtn.disabled = false; submitTxt.textContent = 'Pošaljite upit'; });
  });
  $('.form-reset').addEventListener('click', function () { form.reset(); card.classList.remove('is-sent'); });

  /* ---------- Start ---------- */
  fitText(); buildFrames(); svcScroll(); procScroll(); parallax(); onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitText(); buildFrames(); procScroll(); });
  if (loader && !reduced) runLoader();
  else { endLoader(); startHero(); }
})();
