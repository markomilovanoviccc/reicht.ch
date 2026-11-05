'use strict';
/* REICHT / V7 — Startseite: Boot-Sequenz, wachsende Skyline, Ticker. */
(() => {
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch {} } };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || store.get('genug-motion') === 'reduce' || $motion && $motion.checked;
  const $motion = document.querySelector('#low-fx');
  if ($motion) { $motion.checked = store.get('genug-motion') === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches; $motion.addEventListener('change', () => store.set('genug-motion', $motion.checked ? 'reduce' : 'full')); }

  // Titel für den Glitch-Layer
  const em = document.querySelector('.title-screen h1 em'); if (em) em.dataset.t = em.textContent;

  /* ---------- Boot-Sequenz ---------- */
  function boot() {
    if (store.get('genug-boot') || reduced()) return;
    document.body.classList.add('booting');
    const el = document.createElement('div'); el.className = 'boot'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Startsequenz. Beliebige Taste überspringt.');
    const pre = document.createElement('pre'); el.append(pre);
    const hint = document.createElement('span'); hint.className = 'hint'; hint.textContent = 'KLICK ODER TASTE: ÜBERSPRINGEN'; el.append(hint);
    document.body.append(el);
    const lines = [
      ['REICHT_ / SYSTEM STARTET', 0],
      ['', 0],
      ['> lade Ehrgeiz ............... OK', 0],
      ['> lade Ziele ................. OK', 0],
      ['> lade Vergleich mit anderen . OK', 0],
      ['> suche Schlaf ............... NICHT GEFUNDEN', 1],
      ['> suche Pausen ............... NICHT GEFUNDEN', 1],
      ['> suche dich ................. ...', 1],
      ['', 0],
      ['> starte Aufstieg', 0]
    ];
    let done = false;
    const finish = () => {
      if (done) return; done = true; store.set('genug-boot', '1');
      el.classList.add('out'); setTimeout(() => { el.remove(); document.body.classList.remove('booting'); }, 650);
      removeEventListener('keydown', finish);
    };
    el.addEventListener('click', finish); addEventListener('keydown', finish);
    (async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      for (const [text, warn] of lines) {
        if (done) return;
        const row = document.createElement('div'); if (warn) row.className = 'warn'; pre.append(row);
        for (const ch of text) { if (done) return; row.textContent += ch; await wait(text.length > 40 ? 17 : 26); }
        await wait(text ? 380 : 150);
      }
      const cur = document.createElement('span'); cur.className = 'cursor'; pre.lastChild.append(' ', cur);
      const note = document.createElement('div'); note.className = 'fx-note-boot';
      note.textContent = 'Hinweis: Dieses Spiel arbeitet mit Flackern, Glitch-Effekten und lauter werdender Musik. Unter dem Start kannst du die Effekte reduzieren.';
      el.append(note);
      await wait(9000); finish();
    })();
  }
  boot();

  /* ---------- Skyline, die nie aufhört zu wachsen ---------- */
  const art = document.querySelector('.title-art');
  if (art) {
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); art.prepend(cv); art.classList.add('has-canvas');
    const g = cv.getContext('2d', { alpha: false });
    const W = 220, H = 139; cv.width = W; cv.height = H;
    const R = Math.random;
    const B = Array.from({ length: 15 }, (_, i) => ({ x: i * 15 - 4, w: 13 + (i * 7) % 6, h: 0, t: 14 + (i * 23) % 36, v: .35 + R() * .5, crane: i % 4 === 2, seed: i * 13.7 }));
    const stars = Array.from({ length: 40 }, () => ({ x: R() * W, y: R() * 70, p: R() * 6 }));
    let mx = 0, t0 = performance.now(), followers = 0, last = t0, cars = [{ x: 10, s: 22 }, { x: 120, s: -30 }];
    art.addEventListener('pointermove', e => { const r = art.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width - .5) * 2; });
    const rect = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
    function draw(now) {
      const dt = Math.min(.1, (now - last) / 1000); last = now; const t = (now - t0) / 1000, still = reduced();
      g.imageSmoothingEnabled = false;
      for (let y = 0; y < H; y += 6) rect(0, y, W, 6, `hsl(${150 - y * .05},${14 + y * .06}%,${6 + y * .045}%)`);
      for (const s of stars) { if (Math.sin(t * 1.4 + s.p) > -.2 || still) rect(s.x, s.y, 1, 1, '#6f7e60'); }
      const mxs = still ? 0 : mx;
      // Mond
      rect(168 - mxs * 3, 16, 14, 14, '#d4da9d'); rect(166 - mxs * 3, 19, 18, 8, '#d4da9d'); rect(176 - mxs * 3, 16, 7, 10, '#101a14');
      // Hintere Ebene
      for (let i = 0; i < 22; i++) { const h = 22 + (i * 17) % 30; rect(i * 11 - mxs * 5, H - 22 - h, 10, h, '#17221b'); }
      followers += dt * (still ? 0 : 120 * (1 + t * .15));
      for (const b of B) {
        if (!still) { if (b.h < b.t) b.h += dt * 22 * b.v + .15; else if (R() < dt * .08) b.t += 10 + R() * 22; if (b.t > 95) b.t = 95; } else b.h = b.t;
        const x = b.x - mxs * 9, top = H - 18 - b.h;
        rect(x, top, b.w, b.h, '#2a3a2d'); rect(x + b.w, top + 2, 3, b.h - 2, '#1b2a21'); rect(x, top, b.w, 2, '#4a5d3f');
        for (let wy = top + 5; wy < H - 22; wy += 6) for (let wx = x + 2; wx < x + b.w - 2; wx += 4) {
          const on = Math.sin(wx * 7.1 + wy * 3.3 + b.seed + (still ? 0 : t * (.3 + b.v * .5))) > -.15;
          rect(wx, wy, 2, 3, on ? (((wx + wy) | 0) % 7 ? '#b0bb66' : '#ee684b') : '#18221b');
        }
        if (b.crane && b.h > 25) {
          const sw = still ? 0 : Math.sin(t * .8 + b.seed) * 5;
          rect(x + 5, top - 16, 1, 16, '#8f8851'); rect(x - 4, top - 17, 22, 1, '#a99b58'); rect(x + 14 + sw, top - 16, 1, 9, '#7c8558'); rect(x + 12 + sw, top - 7, 5, 3, '#d5e952');
        }
      }
      // Boden, Strasse, Autos
      rect(0, H - 18, W, 18, '#20291f'); rect(0, H - 9, W, 1, '#3c4a37');
      for (const c of cars) { c.x += (still ? 0 : c.s * dt); if (c.x > W + 10) c.x = -10; if (c.x < -10) c.x = W + 10; rect(c.x, H - 13, 6, 3, c.s > 0 ? '#d5e952' : '#ee684b'); rect(c.x + (c.s > 0 ? 5 : -2), H - 12, 2, 1, '#fff'); }
      // Zähler
      g.font = '9px Pixel, monospace'; g.fillStyle = '#d5e952'; g.fillText('FOLLOWER ' + Math.floor(followers).toLocaleString('de-CH'), 6, 14);
      g.fillStyle = '#ee684b'; g.fillText('NÄCHSTES ZIEL: ' + Math.pow(10, Math.max(2, Math.ceil(Math.log10(followers + 1)))).toLocaleString('de-CH'), 6, 26);
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ---------- Ticker ---------- */
  const how = document.querySelector('.how-to');
  if (how) {
    const t = document.createElement('div'); t.className = 'ticker'; t.setAttribute('aria-hidden', 'true');
    const items = ['MEHR.', 'NOCH EIN ZIEL.', 'SCHNELLER.', 'DIE ANDEREN SIND WEITER.', 'KONTOSTAND ↑', 'FOLLOWER ↑', 'SCHLAF ↓', 'PAUSEN ↓', 'NOCH EIN SCHRITT.', 'GENUG?'];
    const span = document.createElement('div'); span.innerHTML = items.concat(items).map(s => /↓|GENUG/.test(s) ? `<b>${s}</b>` : s).join(' &nbsp;/&nbsp; ');
    t.append(span); how.after(t);
  }
})();
