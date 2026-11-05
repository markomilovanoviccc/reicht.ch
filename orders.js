'use strict';
/* REICHT. — Aufträge und Lebensbalken: Wer nur «Mehr» drückt, verliert Freunde und Gesundheit. */
(() => {
  const R = Math.random, clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const V = () => (state.vit || (state.vit = { f: 100, h: 100 }));
  window.vitalFactor = () => { const v = V(); return .6 + .4 * Math.min(v.f, v.h) / 100; };
  window.vitalStress = () => { if (!state.clicks || state.clicks < 30) return 0; const m = Math.min(V().f, V().h); return Math.pow((100 - m) / 100, 1.5) * .95; };

  /* ---------- Anzeige ---------- */
  const host = document.querySelector('.hud-mission'), stage = document.querySelector('#scene');
  if (!host || !stage) return;
  const vit = document.createElement('div'); vit.className = 'vitals';
  vit.innerHTML = '<div><span>FREUNDE</span><b><i id="vit-f"></i></b></div><div><span>GESUNDHEIT</span><b><i id="vit-h"></i></b></div>';
  host.append(vit);
  const layer = document.createElement('div'); layer.id = 'orders'; stage.append(layer);
  const bar = { f: vit.querySelector('#vit-f'), h: vit.querySelector('#vit-h') };
  function paint() {
    const v = V();
    for (const k of ['f', 'h']) { bar[k].style.width = v[k] + '%'; bar[k].parentElement.classList.toggle('low', v[k] < 30); }
  }

  /* ---------- Aufträge ---------- */
  const WORK = ['PROJEKT ABGEBEN', 'MAIL VOM CHEF', 'KUNDE WARTET', 'PRÄSENTATION', 'ZIELVEREINBARUNG', 'EILAUFTRAG', 'POST BEANTWORTEN', 'ANGEBOT SCHREIBEN'];
  const FRIEND = ['MAMA RUFT AN', 'FREUNDE: KAFFEE?', 'SPAZIERGANG?', 'ESSEN MIT FREUNDEN', 'FREUND SCHREIBT'];
  { const fs = document.querySelector('.feed-strip'); if (fs) { stage.append(fs); document.body.classList.add('feed-side'); } }
  const orders = new Set(); let spawnIn = 8, last = performance.now(), saveIn = 5, flagF = false, flagH = false;
  const busy = () => state.finished || document.hidden || state.zeit?.on || ['crashing', 'collapsing', 'zeit'].some(c => document.body.classList.contains(c));
  function clearOrders() { for (const o of orders) o.el.remove(); orders.clear(); }
  function fmt(n) { return typeof short === 'function' ? short(n) : String(Math.round(n)); }
  let lastPos = null;
  function pickPos() {
    const w = stage.clientWidth, h = stage.clientHeight, ow = w > 700 ? 210 : 170, oh = 100, fs = document.querySelector('.feed-strip');
    const avoid = [{ x: 8, y: h - 200, w: 360, h: 150 }];
    if (fs && getComputedStyle(fs).display !== 'none') avoid.push({ x: 8, y: 70, w: 280, h: fs.offsetHeight + 20 });
    const others = [...orders].map(o => ({ x: parseFloat(o.el.style.left), y: parseFloat(o.el.style.top) })); if (lastPos) others.push(lastPos);
    let best = null, bs = -1;
    for (let k = 0; k < 40; k++) {
      const x = 10 + R() * Math.max(1, w - ow - 20), y = 48 + R() * Math.max(1, h - oh - 64 - 48);
      if (avoid.some(a => x < a.x + a.w && x + ow > a.x && y < a.y + a.h && y + oh > a.y)) continue;
      const sc = others.length ? Math.min(...others.map(q => Math.hypot(q.x - x, q.y - y))) : R() * 100;
      if (sc > bs) { bs = sc; best = { x: Math.round(x), y: Math.round(y) }; }
    }
    best = best || { x: Math.round(w - ow - 20), y: 80 }; lastPos = best; return best;
  }
  function spawn() {
    const p = pressure(), v = V(), friend = (v.f < 75 || v.h < 60) && R() < .38, r = rates();
    const el = document.createElement('button'); el.type = 'button'; el.className = 'order ' + (friend ? 'friend' : 'work');
    const name = (friend ? FRIEND : WORK)[Math.floor(R() * (friend ? FRIEND : WORK).length)];
    const gain = { cash: Math.floor(r.cash * 10), fans: Math.floor(r.fans * 10) };
    el.innerHTML = `<b class="tag">${friend ? 'ZEIT FÜR DICH!' : 'NEUER AUFTRAG!'}</b><small>${friend ? 'KAFFEE / ZEIT FÜR MENSCHEN' : 'AUFTRAG'}</small><strong>${name}</strong><em>${friend ? '+ FREUNDE / + GESUNDHEIT' : '+' + fmt(gain.cash) + ' CHF / +' + fmt(gain.fans)}</em><u><i></i></u>`;
    const pos = pickPos(); el.style.left = pos.x + 'px'; el.style.top = pos.y + 'px';
    const prog = clamp((Math.log10(Math.max(1, state.followers, state.cash)) - 2) / 5, 0, 1), life = friend ? lerp(4.2, 1.6, Math.max(prog, p)) : lerp(9, 4.2, p), o = { el, friend, gain, life, t: life, bar: el.querySelector('u i') };
    el.addEventListener('pointerdown', e => e.stopPropagation());
    el.addEventListener('click', e => { e.stopPropagation(); take(o); });
    layer.append(el); orders.add(o);
    el.classList.add('fresh'); setTimeout(() => el.classList.remove('fresh'), 2400);
    if (typeof blip === 'function') { try { blip(friend ? 520 : 940); setTimeout(() => blip(friend ? 660 : 1260), 130); } catch {} }
  }
  function take(o) {
    if (!orders.has(o)) return; orders.delete(o); o.el.remove(); const v = V();
    if (typeof blip === 'function') { try { const n = o.friend ? [523, 659, 784, 1047] : [880, 1175, 1568]; n.forEach((f, i) => setTimeout(() => blip(f, o.friend ? .16 : .08, .12), i * (o.friend ? 110 : 75))); } catch {} }
    if (o.friend) {
      v.f = clamp(v.f + 28); v.h = clamp(v.h + 10); state.idle = 0;
      addFeed('DU HAST DIR ZEIT GENOMMEN.', 'Ein paar Minuten mit Menschen, die dich mögen, nicht deine Leistung.', 'FREUNDE');
      notify('DAS TAT GUT.');
    } else {
      state.cash = Math.min(MAX, state.cash + o.gain.cash); state.followers = Math.min(MAX, state.followers + o.gain.fans);
      v.h = clamp(v.h - 2.5); state.orders = (state.orders || 0) + 1; notify('AUFTRAG ERLEDIGT. +' + fmt(o.gain.cash) + ' CHF');
    }
    render(); persist();
  }
  function miss(o) {
    orders.delete(o); o.el.classList.add('gone'); setTimeout(() => o.el.remove(), 260); const v = V();
    if (o.friend) { v.f = clamp(v.f - 9); notify('DU HAST NICHT GEANTWORTET.'); }
    else { v.f = clamp(v.f - 4); v.h = clamp(v.h - 4); notify('AUFTRAG VERPASST. DER DRUCK STEIGT.'); }
  }

  /* ---------- Takt ---------- */
  setInterval(() => {
    const now = performance.now(), dt = Math.min(.5, (now - last) / 1000); last = now;
    if (busy()) { if (state.finished) clearOrders(); paint(); return; }
    const v = V(), p = pressure();
    if (state.clicks && state.seconds > 8) {
      if (state.idle >= 3) { v.f = clamp(v.f + 1.6 * dt); v.h = clamp(v.h + 2 * dt); }
      else { v.f = clamp(v.f - (.16 + .22 * p) * dt); v.h = clamp(v.h - (.2 + .26 * p) * dt); }
    }
    if (v.h < 30 && !flagH) { flagH = true; addFeed('DEINE GESUNDHEIT LEIDET.', 'Dein Körper meldet sich. Du hörst ihn nicht.', 'KÖRPER'); } else if (v.h > 50) flagH = false;
    if (v.f < 30 && !flagF) { flagF = true; addFeed('FREUNDE MELDEN SICH NICHT MEHR.', 'Du hast nicht geantwortet. Schon wieder.', 'FREUNDE'); } else if (v.f > 50) flagF = false;
    for (const o of [...orders]) { o.t -= dt; o.bar.style.width = clamp(o.t / o.life * 100) + '%'; if (o.t <= 0) miss(o); }
    spawnIn -= dt;
    if (spawnIn <= 0) {
      if (state.clicks && state.seconds > 20 && orders.size < 1 + Math.floor(p * 3)) spawn();
      spawnIn = lerp(11, 3.5, p) * (.7 + R() * .6);
    }
    if (Math.min(v.f, v.h) <= 0 && !state.errorSeen && state.seconds > 45 && typeof triggerOverload === 'function') triggerOverload();
    if ((saveIn -= dt) <= 0) { saveIn = 5; persist(); }
    paint();
  }, 200);
  window.addEventListener('pagehide', () => { try { persist(); } catch {} });

  /* ---------- Hooks ---------- */
  const click0 = window.FX?.click; if (click0) window.FX.click = function (...a) { const v = V(); v.h = clamp(v.h - .05); v.f = clamp(v.f - .035); return click0.apply(this, a); };
  const ret0 = window.applyReturn;
  if (ret0) window.applyReturn = function () { const how = ret0(); const v = V(), s = state.lastPause || 0; v.f = clamp(v.f + s * 1.1); v.h = clamp(v.h + s * 1.3); clearOrders(); spawnIn = 12; return how; };
  const res0 = window.restart; if (res0) window.restart = function (...a) { clearOrders(); const r = res0.apply(this, a); state.vit = { f: 100, h: 100 }; return r; };
  stage.addEventListener('mouseover', e => { const b = e.target.closest?.('.plot'); if (!b) return; const r = b.getBoundingClientRect(), s = stage.getBoundingClientRect(); b.dataset.tip = (r.top - s.top < 190) ? 'below' : 'above'; b.dataset.side = (r.left - s.left < 150) ? 'right' : (s.right - r.right < 150) ? 'left' : ''; });
  /* Markierungen entzerren: nicht ausserhalb der Karte, nicht übereinander */
  const pp0 = window.positionPlots;
  if (pp0) window.positionPlots = function (...a) {
    const r = pp0.apply(this, a); const bs = [...document.querySelectorAll('#plots .plot')]; if (!bs.length) return r;
    { const Wd = stage.clientWidth, Hd = stage.clientHeight, size = landSize(), fr = v => v - Math.floor(v);
      bs.forEach(b => { const idx = Math.max(0, products.findIndex(p => p.id === b.dataset.plot)), pa = .9 + fr(.5 + idx * .7548776662) * Math.max(1, size - 1.8), pb = .9 + fr(.5 + idx * .5698402910) * Math.max(1, size - 1.8), q = iso(pa, pb), s = projectMap({ x: q.x, y: q.y - 14 });
        b.style.left = s.x / canvas.width * Wd + 'px'; b.style.top = s.y / canvas.height * Hd + 'px'; }); }
    const W = stage.clientWidth, H = stage.clientHeight, top0 = 62, bot0 = H - 56;
    const it = bs.map(b => { const w = b.offsetWidth || 90, h = b.offsetHeight || 56; return { b, w, h, x: parseFloat(b.style.left) || 0, y: parseFloat(b.style.top) || 0 }; });
    const fit = q => { q.x = clamp(q.x, q.w / 2 + 8, W - q.w / 2 - 8); q.y = clamp(q.y, top0 + q.h, bot0); };
    it.forEach(fit);
    for (let k = 0; k < 40; k++) {
      let moved = false;
      for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) {
        const A = it[i], B = it[j], ox = (A.w + B.w) / 2 + 6 - Math.abs(A.x - B.x), oy = (A.h + B.h) / 2 + 4 - Math.abs(A.y - B.y);
        if (ox > 0 && oy > 0) {
          moved = true;
          if (oy < ox) { const d = (A.y <= B.y ? -1 : 1) * oy / 2; A.y += d; B.y -= d; } else { const d = (A.x <= B.x ? -1 : 1) * ox / 2; A.x += d; B.x -= d; }
        }
      }
      it.forEach(fit); if (!moved) break;
    }
    it.forEach(q => { q.b.style.left = Math.round(q.x) + 'px'; q.b.style.top = Math.round(q.y) + 'px'; });
    return r;
  };
  if (window.positionPlots && typeof drawWorld === 'function') { try { window.positionPlots(); } catch {} }
  paint();
})();
