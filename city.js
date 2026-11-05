'use strict';
/* REICHT / V8 — schönere Pixel-Stadt
   Ersetzt die Zeichenfunktionen aus script.js (gleiche globale Namen): Abendhimmel, Licht und Schatten,
   Umrisse, Strassen mit Gehsteig, Bäume, Autos und klar erkennbare Gebäude für alle zwölf Aufstiegsketten.
   Das Pixel-Raster bleibt: alles wird mit Rechtecken und kleinen Polygonen gezeichnet. */
(() => {
const S = .4545;                       // Isometrie-Steigung (10 / 22)
const hash = (a, b, c = 0) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const FR = { p: 0, d: 0, t: 0, lit: .5 };
const pal = (l, r, t) => ({ l, r, t });
const PAL = {
  brick: pal('#b8694e', '#8f4d3a', '#d68a6a'), cream: pal('#dccfa4', '#b4a77f', '#efe6c0'), glass: pal('#4f94a3', '#357483', '#86c6cf'),
  concrete: pal('#8f98a4', '#6b7480', '#b0b8c2'), sand: pal('#d2b07c', '#a98b5d', '#e6cc9a'), slate: pal('#5f6f92', '#465477', '#8394b4'),
  white: pal('#e8e2d2', '#bfb8a6', '#f7f2e6'), mint: pal('#7db38e', '#5a8b6c', '#a1d3ac'), rose: pal('#c98a8f', '#9d6468', '#e3aeb0'),
  dark: pal('#4b5668', '#363f50', '#6a768c'), gold: pal('#d9b44a', '#a8862f', '#f0d27a')
};
const CITY = ['brick', 'cream', 'concrete', 'sand', 'slate', 'white', 'mint', 'rose', 'glass'];
const ROOF = { red: ['#c25b43', '#8f402f'], slate: ['#5c697c', '#444e5d'], brown: ['#8d5d3e', '#674331'], teal: ['#42898b', '#2f6668'], plum: ['#7e5470', '#5d3b52'] };
const ROOFK = Object.keys(ROOF);
const CAR = ['#d5483a', '#e9c24a', '#3f78c4', '#e8e2d2', '#5aa86a', '#9a5ac4', '#2b2f3a'];

/* ---------- Farben ---------- */
const hexRGB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const lc = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
const mixRGB = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t)); };
const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;

/* ---------- Grundformen ---------- */
function line(pts, col, a = 1) {
  ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p[0] + .5, p[1] + .5) : ctx.moveTo(p[0] + .5, p[1] + .5)); ctx.stroke(); ctx.globalAlpha = 1;
}
function shadow(x, y, w, d, h, a = .26) {
  ctx.fillStyle = `rgba(8,10,24,${a})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y - d / 2); ctx.lineTo(x + w + h * .5, y - d / 2 + h * .2); ctx.lineTo(x + h * .5, y + h * .2); ctx.closePath(); ctx.fill();
}
function disc(x, y, rx, ry, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(Math.round(x), Math.round(y), rx, ry, 0, 0, 7); ctx.fill(); }
window.tile = function (x, y, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y - 11); ctx.lineTo(x + 23, y); ctx.lineTo(x, y + 11); ctx.lineTo(x - 23, y); ctx.closePath(); ctx.fill(); };

function win(x, y, on, k, dark) {
  x = Math.round(x); y = Math.round(y);
  if (on) {
    ctx.fillStyle = k < .06 ? 'rgba(130,220,255,.22)' : 'rgba(255,205,110,.2)'; ctx.fillRect(x - 1, y - 1, 4, 5);
    ctx.fillStyle = k < .06 ? '#a6e6ff' : (dark ? '#e6b862' : '#ffd98a'); ctx.fillRect(x, y, 2, 3);
  } else { ctx.fillStyle = dark ? '#151b29' : '#1f2738'; ctx.fillRect(x, y, 2, 3); }
}
function windows(x, y, w, d, h, seed) {
  const sl = d / (2 * w), fx = Math.floor(x), fy = Math.floor(y);
  for (let j = 6; j < h - 3; j += 7) for (let i = 3; i < w - 2; i += 5) {
    const k = hash(fx + i, fy + j, seed), k2 = hash(fx + i + 97, fy + j, seed);
    win(x - w + i, y - h - d / 2 + j + i * sl, k < FR.lit, k, false);
    win(x + i - 1, y - h + j - i * sl - 2, k2 < FR.lit, k2, true);
  }
}
function roofDetail(cx, cy, seed) {
  const k = hash(seed | 0, 3), blink = FR.t % 1200 < 600;
  if (k < .3) { rect(cx - 5, cy - 3, 5, 3, '#d4dae0'); rect(cx - 5, cy, 5, 1, '#8d959e'); rect(cx + 2, cy - 1, 3, 2, '#c0c7ce'); }
  else if (k < .55) { rect(cx + 1, cy - 6, 5, 5, '#8a6246'); rect(cx, cy - 7, 7, 1, '#a98260'); rect(cx + 2, cy - 1, 1, 3, '#5a402e'); rect(cx + 4, cy - 1, 1, 3, '#5a402e'); }
  else if (k < .8) { rect(cx, cy - 12, 1, 12, '#cfd5db'); rect(cx - 3, cy - 8, 7, 1, '#cfd5db'); rect(cx, cy - 13, 1, 1, blink ? '#ff5a4a' : '#7b2b25'); }
  else { rect(cx - 7, cy - 2, 6, 2, '#2b4a78'); rect(cx - 6, cy - 3, 6, 1, '#3a63a0'); rect(cx + 1, cy - 2, 6, 2, '#2b4a78'); rect(cx + 2, cy - 3, 6, 1, '#3a63a0'); }
}

/* Quader mit Schatten, Kantenlicht und Umriss */
window.block = function (x, y, w, d, h, left, right, roof, wins = true, o = {}) {
  x = Math.round(x); y = Math.round(y);
  if (!o.noShadow) shadow(x, y, w, d, h);
  poly([[x - w, y - d / 2 - h], [x, y - h], [x, y], [x - w, y - d / 2]], left);
  poly([[x, y - h], [x + w, y - d / 2 - h], [x + w, y - d / 2], [x, y]], right);
  poly([[x, y - d - h], [x + w, y - d / 2 - h], [x, y - h], [x - w, y - d / 2 - h]], roof);
  ctx.fillStyle = 'rgba(0,0,0,.17)';
  ctx.beginPath(); ctx.moveTo(x - w, y - d / 2 - 3); ctx.lineTo(x, y - 3); ctx.lineTo(x, y); ctx.lineTo(x - w, y - d / 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + w, y - d / 2 - 3); ctx.lineTo(x + w, y - d / 2); ctx.lineTo(x, y); ctx.fill();
  line([[x - w, y - d / 2 - h], [x, y - h], [x + w, y - d / 2 - h]], '#ffffff', .3);
  line([[x - w, y - d / 2 - h], [x, y - d - h], [x + w, y - d / 2 - h], [x + w, y - d / 2], [x, y], [x - w, y - d / 2], [x - w, y - d / 2 - h]], '#0a0e18', .62);
  line([[x, y - h], [x, y]], '#0a0e18', .5);
  if (wins) windows(x, y, w, d, h, o.seed || 0);
  if (o.roof) roofDetail(x, y - h - d / 2, x * 7 + y);
};
const B = (x, y, w, d, h, p, wins = true, o = {}) => window.block(x, y, w, d, h, p.l, p.r, p.t, wins, o);

/* Quader mit getrennten Seitenlängen (Autos, Bühne) */
function isoBox(x, y, wl, wr, h, p, o = {}) {
  x = Math.round(x); y = Math.round(y);
  const Lx = x - wl, Ly = y - wl * S, Rx = x + wr, Ry = y - wr * S, Bx = x - wl + wr, By = y - (wl + wr) * S;
  if (!o.noShadow) { ctx.fillStyle = 'rgba(8,10,24,.25)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(Rx, Ry); ctx.lineTo(Rx + h * .5, Ry + h * .2 + 1); ctx.lineTo(x + h * .5, y + h * .2 + 1); ctx.fill(); }
  poly([[Lx, Ly - h], [x, y - h], [x, y], [Lx, Ly]], p.l);
  poly([[x, y - h], [Rx, Ry - h], [Rx, Ry], [x, y]], p.r);
  poly([[x, y - h], [Rx, Ry - h], [Bx, By - h], [Lx, Ly - h]], p.t);
  if (!o.noLine) line([[Lx, Ly - h], [Bx, By - h], [Rx, Ry - h], [Rx, Ry], [x, y], [Lx, Ly], [Lx, Ly - h], [x, y - h], [x, y]], '#0a0e18', .5);
}
/* Gitterdach / Satteldach */
function gable(x, y, w, d, h, rh, p, roof, o = {}) {
  x = Math.round(x); y = Math.round(y);
  if (!o.noShadow) shadow(x, y, w, d, h + rh * .6);
  poly([[x - w, y - d / 2 - h], [x, y - h], [x, y], [x - w, y - d / 2]], p.l);
  poly([[x, y - h], [x + w, y - d / 2 - h], [x + w, y - d / 2], [x, y]], p.r);
  const m1 = [x - w / 2, y - d * .75 - h - rh], m2 = [x + w / 2, y - d * .25 - h - rh];
  poly([m1, m2, [x + w, y - d / 2 - h], [x, y - d - h]], roof[1]);
  poly([[x, y - h], [x + w, y - d / 2 - h], m2], p.r);
  poly([[x - w, y - d / 2 - h], [x, y - h], m2, m1], roof[0]);
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.moveTo(x - w, y - d / 2 - 2); ctx.lineTo(x, y - 2); ctx.lineTo(x, y); ctx.lineTo(x - w, y - d / 2); ctx.fill();
  line([[x - w, y - d / 2 - h], [x, y - h], m2, m1, [x - w, y - d / 2 - h], [x - w, y - d / 2], [x, y], [x + w, y - d / 2], [x + w, y - d / 2 - h], [x, y - h], [x, y]], '#0a0e18', .6);
  line([m1, m2], '#ffffff', .35);
  if (o.win !== false) {
    const sl = d / (2 * w);
    for (let i = 3; i < w - 2; i += 5) { const k = hash(Math.floor(x) + i, Math.floor(y), 5); win(x - w + i, y - h - d / 2 + 5 + i * sl, k < FR.lit, k, false); }
    win(x + 5, y - h - 4 - 5 * sl + 6, hash(Math.floor(x), 9) < FR.lit, .5, true);
  }
  if (o.door !== false) { rect(x + 2, y - 6 - 2 * S, 3, 5, '#4a3426'); rect(x + 2, y - 6 - 2 * S, 3, 1, '#7a5a3e'); }
}
function floorPad(x, y, c1, c2, r = 1) {
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(x, y - 11 * r); ctx.lineTo(x + 23 * r, y); ctx.lineTo(x, y + 11 * r); ctx.lineTo(x - 23 * r, y); ctx.fill();
  line([[x - 23 * r, y], [x, y + 11 * r], [x + 23 * r, y]], c2, .8);
}

/* ---------- Pflanzen ---------- */
window.tree = function (x, y, shade = 0) {
  x = Math.round(x); y = Math.round(y);
  disc(x + 4, y + 3, 9, 3, 'rgba(8,10,24,.25)');
  rect(x - 1, y - 8, 3, 11, '#5b402b'); rect(x, y - 8, 1, 11, '#6e4d34');
  const base = shade ? '#2f6a3c' : '#3d7d43', mid = shade ? '#3d8247' : '#4f9a4c', hi = shade ? '#5aa35a' : '#7cc464';
  rect(x - 6, y - 15, 13, 8, base); rect(x - 4, y - 21, 9, 8, base); rect(x - 8, y - 12, 17, 5, base);
  rect(x - 5, y - 19, 6, 5, mid); rect(x - 7, y - 13, 7, 5, mid); rect(x - 3, y - 20, 3, 3, hi); rect(x - 6, y - 14, 3, 2, hi); rect(x + 3, y - 11, 5, 3, '#2a5a35');
};
function bush(x, y, k) {
  x = Math.round(x); y = Math.round(y); disc(x + 2, y + 2, 7, 2, 'rgba(8,10,24,.22)');
  rect(x - 5, y - 4, 10, 5, '#3b7a40'); rect(x - 3, y - 6, 6, 3, '#4f9a4c'); rect(x - 2, y - 5, 2, 1, '#7cc464');
  if (k < .5) { rect(x - 4, y - 3, 1, 1, '#f0d56a'); rect(x + 2, y - 4, 1, 1, '#ee8aa0'); rect(x, y - 2, 1, 1, '#ffffff'); }
}
function bench(x, y) { x = Math.round(x); y = Math.round(y); rect(x - 5, y - 4, 10, 2, '#8a6246'); rect(x - 5, y - 2, 10, 1, '#5a402e'); rect(x - 5, y - 1, 1, 2, '#2c2018'); rect(x + 4, y - 1, 1, 2, '#2c2018'); rect(x - 5, y - 7, 10, 2, '#a98260'); }
function lamp(x, y) {
  x = Math.round(x); y = Math.round(y);
  rect(x, y - 22, 2, 23, '#2d3340'); rect(x - 1, y - 24, 6, 2, '#3a4152'); rect(x - 1, y - 22, 3, 1, '#ffe9a8');
  if (FR.d < .6) { disc(x + 1, y + 1, 13, 5, `rgba(255,214,130,${.12 + FR.p * .06})`); disc(x + 1, y + 1, 7, 3, 'rgba(255,224,150,.16)'); disc(x + 1, y - 22, 5, 4, 'rgba(255,224,150,.2)'); }
}

/* ---------- Autos ---------- */
function car(x, y, axis, col, kind = 0, forward = true) {
  x = Math.round(x); y = Math.round(y);
  const wl = axis === 'a' ? 9 + kind : 4, wr = axis === 'a' ? 4 : 9 + kind;
  const p = { l: lc(col, '#000000', .1), r: lc(col, '#000000', .38), t: lc(col, '#ffffff', .22) };
  isoBox(x, y, wl, wr, 3, p, { noLine: true });
  const cl = wl * .55, cr = wr * .55, mL = (wl - cl) / 2, mR = (wr - cr) / 2;
  isoBox(x - mL + mR, y - 3 - (mL + mR) * S, cl, cr, 2, { l: '#79b6d0', r: '#4f8aa6', t: '#9fd0e2' }, { noShadow: true, noLine: true });
  if (forward) { if (axis === 'a') { rect(x + 1, y - 2, 1, 1, '#fff3b0'); rect(x + 3, y - 3, 1, 1, '#fff3b0'); } else { rect(x - 2, y - 2, 1, 1, '#fff3b0'); rect(x - 4, y - 3, 1, 1, '#fff3b0'); } }
}

/* ---------- Himmel ---------- */
const STARS = Array.from({ length: 70 }, (_, i) => ({ x: hash(i, 1), y: hash(i, 2), p: hash(i, 3) * 6 }));
function drawSky(w, h, p, t) {
  const hz = Math.floor(h * .6);
  const top = mixRGB('#16264a', '#1d0a18', p), mid = mixRGB('#3d5282', '#4e1c34', p), hor = mixRGB('#f2b27a', '#d94a3a', p);
  for (let y = 0; y < hz; y += 3) {
    const k = y / hz, c = k < .55 ? top.map((v, i) => v + (mid[i] - v) * (k / .55)) : mid.map((v, i) => v + (hor[i] - v) * ((k - .55) / .45));
    ctx.fillStyle = `rgb(${c.map(Math.round).join(',')})`; ctx.fillRect(0, y, w, 3);
  }
  const below = mixRGB('#1b2542', '#2a0f1c', p);
  for (let y = hz; y < h; y += 4) { const k = (y - hz) / (h - hz); ctx.fillStyle = `rgb(${below.map((v, i) => Math.round(v * (1 - k * .75))).join(',')})`; ctx.fillRect(0, y, w, 4); }
  for (const s of STARS) { const y = s.y * hz * .55; if (!(Math.sin(t / 600 + s.p) > -.3)) continue; ctx.fillStyle = s.p > 4 ? '#ffe9b0' : '#cdd7f0'; ctx.fillRect(Math.round(s.x * w), Math.round(y), 1, 1); }
  const mx = Math.floor(w * .8), my = Math.floor(hz * .3);
  ctx.fillStyle = 'rgba(255,236,180,.07)'; for (const r of [26, 19, 14]) { ctx.beginPath(); ctx.arc(mx, my, r, 0, 7); ctx.fill(); }
  rect(mx - 7, my - 9, 15, 19, '#f7ecc0'); rect(mx - 9, my - 6, 19, 13, '#f7ecc0'); rect(mx - 3, my - 9, 5, 4, '#ece0ad'); rect(mx + 2, my + 2, 4, 4, '#ece0ad'); rect(mx - 5, my + 4, 3, 3, '#ece0ad');
  const cc = lc('#f6d8b8', '#7a3a3c', p);
  for (let i = 0; i < 6; i++) { const x = ((i * 97 + t * .006 * (1 + p * 2)) % (w + 90)) - 45, y = hz * (.22 + (i * .13) % .5); ctx.globalAlpha = .38; rect(x, y, 42, 4, cc); rect(x + 8, y - 3, 24, 3, cc); rect(x - 8, y + 4, 60, 3, cc); ctx.globalAlpha = 1; }
  const g = ctx.createRadialGradient(w * .5, hz, 4, w * .5, hz, w * .6); g.addColorStop(0, `rgba(${hor.join(',')},.45)`); g.addColorStop(1, `rgba(${hor.join(',')},0)`); ctx.fillStyle = g; ctx.fillRect(0, hz - h * .4, w, h * .45);
  // zwei Ebenen ferner Hochhäuser mit Fensterlicht
  const far = lc('#2b3b66', '#3a1830', p), near = lc('#18223e', '#240d1c', p);
  for (let n = 0; n < Math.ceil(w / 15); n++) { const hh = 14 + hash(n, 11) * 34; rect(n * 15 - 3, hz - hh, 14, hh, far); }
  for (let n = 0; n < Math.ceil(w / 19); n++) {
    const hh = 12 + hash(n, 12) * 40, x = n * 19 + 4; rect(x, hz - hh + 4, 17, hh, near);
    for (let wy = hz - hh + 9; wy < hz - 2; wy += 6) for (let wx = x + 3; wx < x + 15; wx += 5) if (hash(n * 9 + wx, wy, 4) < FR.lit * .8) rect(wx, wy, 2, 2, hash(wx, wy, 6) < .1 ? '#ff7a5a' : '#f0c870');
  }
}
function drawSoil(size) {
  const left = iso(0, size - 1), right = iso(size - 1, 0), bottom = iso(size - 1, size - 1), T = 17;
  disc(bottom.x, bottom.y + T + 14, size * 20, size * 5, 'rgba(0,0,0,.38)');
  poly([[left.x - 23, left.y], [bottom.x, bottom.y + 11], [bottom.x, bottom.y + 11 + T], [left.x - 23, left.y + T]], '#7b5238');
  poly([[bottom.x, bottom.y + 11], [right.x + 23, right.y], [right.x + 23, right.y + T], [bottom.x, bottom.y + 11 + T]], '#5a3a28');
  for (const [off, a] of [[7, .28], [12, .22]]) {
    line([[left.x - 23, left.y + off], [bottom.x, bottom.y + 11 + off]], '#2a1a10', a); line([[bottom.x, bottom.y + 11 + off], [right.x + 23, right.y + off]], '#1a0f08', a);
  }
  poly([[left.x - 23, left.y], [bottom.x, bottom.y + 11], [bottom.x, bottom.y + 15], [left.x - 23, left.y + 4]], '#5e9a46');
  poly([[bottom.x, bottom.y + 11], [right.x + 23, right.y], [right.x + 23, right.y + 4], [bottom.x, bottom.y + 15]], '#437a37');
  for (let i = 0; i < size * 3; i++) { const t = hash(i, 5), u = hash(i, 6); const x = left.x - 23 + (bottom.x - left.x + 23) * t, y = left.y + (bottom.y - left.y + 11) * t + 7 + u * 8; rect(x, y, 2, 1, '#4a3022'); }
}

/* ---------- Boden ---------- */
const isRoad = (a, b) => a % 8 === 3 || b % 8 === 4;
function groundTile(q, a, b, time) {
  const rA = a % 8 === 3, rB = b % 8 === 4;
  if (rA || rB) {
    tile(q.x, q.y, (a + b) % 2 ? '#3a404a' : '#363c46');
    const dash = '#dccb86';
    if (rB && !rA) { rect(q.x - 5, q.y - 2, 3, 1, dash); rect(q.x - 2, q.y - 1, 3, 1, dash); rect(q.x + 1, q.y, 3, 1, dash); rect(q.x + 4, q.y + 1, 2, 1, dash); }
    else if (rA && !rB) { rect(q.x + 3, q.y - 2, 3, 1, dash); rect(q.x, q.y - 1, 3, 1, dash); rect(q.x - 3, q.y, 3, 1, dash); rect(q.x - 6, q.y + 1, 3, 1, dash); }
    else { ctx.globalAlpha = .55; for (let k = -2; k <= 2; k++) rect(q.x + k * 3 - 1, q.y + k - 1, 2, 1, '#e8e2d2'); ctx.globalAlpha = 1; }
    return;
  }
  if (isRoad(a + 1, b) || isRoad(a - 1, b) || isRoad(a, b + 1) || isRoad(a, b - 1)) {
    tile(q.x, q.y, (a + b) % 2 ? '#a8a794' : '#a09f8d');
    line([[q.x - 22, q.y], [q.x, q.y - 10], [q.x + 22, q.y]], '#c3c2ae', .7);
    if (hash(a, b, 2) < .5) rect(q.x + (hash(a, b, 3) * 14 - 7), q.y + (hash(a, b, 4) * 6 - 3), 1, 1, '#8a8978');
    return;
  }
  tile(q.x, q.y, (a + b) % 2 ? '#5f9447' : '#578b43');
  for (let k = 0; k < 6; k++) { const hx = hash(a * 7 + k, b, 8), hy = hash(a, b * 5 + k, 9); const x = q.x - 14 + hx * 28, y = q.y - 5 + hy * 10; if (Math.abs(x - q.x) / 22 + Math.abs(y - q.y) / 10 > .85) continue; rect(x, y, 1, 1, k % 2 ? '#79b457' : '#46793a'); }
  if (hash(a, b, 10) < .07) { rect(q.x - 6 + hash(a, b, 11) * 10, q.y - 2, 1, 1, '#f0d56a'); rect(q.x + 3, q.y + 1, 1, 1, '#ee8aa0'); }
}
let decorCache = { key: '', list: [] };
function decorFor(size) {
  const sites = citySites(), key = size + ':' + sites.length;
  if (decorCache.key === key) return decorCache.list;
  const occ = new Set([...products.map(p => p.a + ':' + p.b), ...sites.map(s => s.a + ':' + s.b)]), list = [];
  for (let a = 0; a < size; a++) for (let b = 0; b < size; b++) {
    if (isRoad(a, b) || occ.has(a + ':' + b)) continue;
    const k = hash(a, b, 21);
    if (k < .26) list.push({ a, b, t: 'tree', s: hash(a, b, 22) < .5 ? 1 : 0 }); else if (k < .4) list.push({ a, b, t: 'bush', s: hash(a, b, 23) }); else if (k < .44) list.push({ a, b, t: 'bench' });
  }
  decorCache = { key, list }; return list;
}

/* ---------- Gebäude der Nachbarschaft ---------- */
function district(a, b, time) {
  const q = iso(a, b), upg = state.upgrades, seed = a * 31 + b;
  const height = 9 + ((a * 7 + b * 13) % 18) + Math.min(18, upg * .35), k = hash(a, b, 1), P = PAL[CITY[Math.floor(hash(a, b, 2) * CITY.length)]];
  if ((a + b) % 5 === 0 && upg > 2) {
    const swing = motionReduced ? 0 : Math.sin(time * .0008 + a) * 8;
    rect(q.x - 10, q.y - 44, 2, 45, '#b9a85a'); rect(q.x - 17, q.y - 45, 38, 2, '#d1bf6c'); rect(q.x + 10 + swing, q.y - 43, 1, 14, '#8c9460'); rect(q.x + 7 + swing, q.y - 29, 7, 4, '#e8cf74');
    B(q.x, q.y, 12, 11, Math.round(height * .5), P, true, { seed }); return;
  }
  if (k < .3) B(q.x, q.y, 11, 12, Math.round(height), P, true, { seed, roof: true });
  else if (k < .55) { gable(q.x, q.y, 10, 11, Math.round(8 + height * .35), 6, P, ROOF[ROOFK[Math.floor(hash(a, b, 3) * ROOFK.length)]]); if (!motionReduced) { const sy = (time * .007 + a * 11 + b * 3) % 23; ctx.globalAlpha = .35 * (1 - sy / 23); rect(q.x + 4 - sy * .2, q.y - 24 - sy, 3, 3, '#c9d0d6'); ctx.globalAlpha = 1; } }
  else if (k < .75) {
    B(q.x, q.y, 12, 11, 9, P, false, { seed });
    const aw = ['#d5483a', '#3f78c4', '#e9c24a', '#5aa86a'][Math.floor(hash(a, b, 4) * 4)];
    for (let i = 0; i < 4; i++) { const t0 = i / 4, t1 = (i + 1) / 4; poly([[q.x - 12 + 12 * t0, q.y - 5.5 - 5.5 * 0 + 12 * t0 * .5 * 0 - 3 + (12 * t0) * .46], [q.x - 12 + 12 * t1, q.y - 5.5 - 3 + (12 * t1) * .46], [q.x - 12 + 12 * t1, q.y - 1 + (12 * t1) * .46 - 5], [q.x - 12 + 12 * t0, q.y - 1 + (12 * t0) * .46 - 5]], i % 2 ? '#f2eee0' : aw); }
    rect(q.x - 8, q.y - 4, 5, 3, '#ffdc90'); rect(q.x + 2, q.y - 5, 3, 5, '#4a3426');
  } else B(q.x, q.y, 10, 11, Math.round(height * 1.4 + 6), PAL[CITY[Math.floor(hash(a, b, 5) * CITY.length)]], true, { seed, roof: true });
}

/* ---------- Die zwölf Aufstiegsketten ---------- */
const clockHand = (cx, cy, ang, len, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ang) * len, cy - Math.cos(ang) * len); ctx.stroke(); };
window.home = function (x, y, l) {
  if (l < 1) { B(x, y, 13, 14, 28, PAL.cream, true, { seed: 1, roof: true }); rect(x - 3, y - 5, 4, 6, '#4a3426'); rect(x - 11, y - 18, 5, 1, '#8a6246'); rect(x - 11, y - 11, 5, 1, '#8a6246'); }
  else if (l === 1) { B(x, y, 13, 14, 42, PAL.mint, true, { seed: 2 }); rect(x - 5, y - 56, 10, 3, '#3f9a58'); rect(x - 3, y - 59, 6, 3, '#58b46a'); rect(x - 3, y - 6, 5, 7, '#2b3a44'); rect(x - 2, y - 5, 3, 5, '#7fd0e8'); }
  else if (l === 2) { const cols = [[PAL.cream, ROOF.red], [PAL.rose, ROOF.slate], [PAL.sand, ROOF.brown]]; for (let n = -1; n <= 1; n++) gable(x + n * 10, y + n * 4.5, 7, 9, 14, 7, cols[n + 1][0], cols[n + 1][1]); }
  else {
    const w = 14 + Math.min(l, 7);
    if (l === 3) { gable(x, y, 13, 14, 15, 10, PAL.cream, ROOF.red); rect(x + 5, y - 38, 3, 8, '#7a4a3a'); rect(x + 4, y - 39, 5, 1, '#a96a52'); B(x + 20, y + 6, 7, 8, 11, PAL.concrete, false, { seed: 3 }); rect(x + 16, y - 2, 8, 6, '#59606c'); for (let i = 0; i < 6; i++) rect(x - 28 + i * 3, y + 9 - i * 1.4, 2, 4, '#f4f0e4'); tree(x - 34, y + 8); }
    else if (l === 4) {
      B(x, y, w, 15, 24, PAL.white, true, { seed: 4 }); B(x, y - 24, w + 2, 16, 2, PAL.concrete, false, { noShadow: true }); for (let i = 0; i < 4; i++) rect(x - w + 3 + i * 6, y - 24 - 4 - i * 2.6, 2, 18, '#f4efe2');
      poly([[x + 24, y + 1], [x + 42, y - 5], [x + 56, y + 2], [x + 38, y + 10]], '#e8e2d2'); poly([[x + 27, y + 1], [x + 42, y - 3], [x + 52, y + 2], [x + 38, y + 7]], '#38a6cf'); rect(x + 33, y, 4, 1, '#9fe0f2'); tree(x - 38, y + 8); tree(x + 54, y - 10, 1);
    } else {
      if (l >= 6) { const r = 34 + Math.min(10, l); poly([[x, y - r * .5 - 2], [x + r * 1.75, y + 6], [x, y + r * .5 + 14], [x - r * 1.75, y + 6]], '#2d86ae'); poly([[x, y - r * .5 + 6], [x + r * 1.45, y + 6], [x, y + r * .5 + 6], [x - r * 1.45, y + 6]], '#e8d9a0'); poly([[x, y - r * .5 + 12], [x + r * 1.2, y + 6], [x, y + r * .5 + 1], [x - r * 1.2, y + 6]], '#7fb35a'); line([[x - r * 1.75, y + 6], [x, y + r * .5 + 14], [x + r * 1.75, y + 6]], '#9fe0f2', .6); }
      B(x, y, w, 15, 26, PAL.white, true, { seed: 5 }); B(x, y - 26, w + 2, 16, 2, PAL.gold, false, { noShadow: true });
      gable(x - 26, y + 7, 9, 10, 15, 7, PAL.cream, ROOF.teal); gable(x + 28, y - 6, 9, 10, 15, 7, PAL.cream, ROOF.teal);
      disc(x + 8, y + 18, 11, 5, '#d8d2c0'); disc(x + 8, y + 17, 9, 4, '#58bfe0'); rect(x + 7, y + 8, 1, 8, '#bfeaf6'); rect(x + 5, y + 10, 1, 4, '#bfeaf6'); rect(x + 10, y + 10, 1, 4, '#bfeaf6');
      tree(x - 44, y + 6); tree(x + 50, y - 12); tree(x - 20, y + 20, 1);
      if (l >= 6) { rect(x + 40, y + 18, 11, 3, '#e8e2d2'); rect(x + 46, y + 12, 1, 6, '#c9ced4'); rect(x + 47, y + 12, 4, 4, '#f4f0e4'); }
    }
  }
};
function jet(x, y) {
  isoBox(x + 4, y + 3, 24, 5, 5, { l: '#f2f0e8', r: '#c9c6bb', t: '#ffffff' });
  isoBox(x + 1, y + 6, 4, 26, 1, { l: '#3f78c4', r: '#2c5a96', t: '#5a92d6' }, { noShadow: true });
  isoBox(x - 17, y - 2, 4, 6, 9, { l: '#3f78c4', r: '#2c5a96', t: '#5a92d6' }, { noShadow: true });
  rect(x + 24, y - 1, 3, 1, '#4f8aa6');
}
const drawRaw = function (p, x, y, l) {
  if (p.id === 'house') { window.home(x, y, l); return; }
  if (!l) return;
  const t = FR.t, blink = t % 1000 < 500;
  switch (p.id) {
    case 'tower': {
      const h = 24 + Math.min(l, 7) * 8; B(x, y, 12 + Math.min(l, 4), 15, h, PAL.glass, true, { seed: 7 });
      if (l >= 3) { const top = y - h - 7 + 5; B(x, top, 9, 11, 14, PAL.slate, true, { noShadow: true, seed: 8 }); rect(x, top - 14 - 5 - 14, 1, 14, '#cfd5db'); rect(x, top - 14 - 5 - 15, 1, 1, blink ? '#ff5a4a' : '#7b2b25'); }
      else { rect(x, y - h - 15 - 11, 1, 11, '#cfd5db'); rect(x, y - h - 15 - 12, 1, 1, blink ? '#ff5a4a' : '#7b2b25'); }
      if (l >= 4) B(x + 21, y + 6, 9, 10, Math.round(h * .62), PAL.concrete, true, { seed: 9, roof: true });
      rect(x - 3, y - 6, 5, 7, '#232b38'); rect(x - 2, y - 5, 3, 5, '#7fd0e8'); break;
    }
    case 'car': {
      floorPad(x, y + 2, '#3a404a', '#4c5260', .9); rect(x - 9, y - 1, 1, 1, '#e8e2d2'); rect(x + 9, y + 3, 1, 1, '#e8e2d2');
      if (l >= 5) jet(x, y); else {
        const cols = ['#a65a3a', '#3f78c4', '#e9c24a', '#d5483a'], col = cols[Math.min(l, 4) - 1];
        car(x - 6, y + 5, 'a', col, Math.min(l, 4) - 1, true);
        if (l >= 3) { rect(x - 17, y - 3, 6, 1, '#1b1f2a'); rect(x - 17, y - 5, 1, 3, '#1b1f2a'); }
      }
      break;
    }
    case 'phone': {
      const h = 18 + Math.min(l, 5) * 5, w = 13; B(x, y, w, 13, h, PAL.dark, false, { seed: 10 });
      const q = (tt, yy) => [x + w * tt, y - h - 6.5 * tt + yy];
      poly([q(.12, 4), q(.88, 4), [x + w * .88, y - 6.5 * .88 - 5], [x + w * .12, y - 6.5 * .12 - 5]], '#0c1422');
      for (let i = 0; i < 5; i++) { const tt = .2 + i * .14, bh = 3 + (Math.sin(t / 300 + i * 1.7) + 1) * (h - 20) / 2.4; const bx = x + w * tt, by = y - 6.5 * tt - 6; rect(bx, by - bh, 3, bh, i % 2 ? '#d5e952' : '#7fd0e8'); }
      rect(x - 8, y - h - 20, 1, 8, '#cfd5db'); disc(x - 8, y - h - 22 + 1, 6, 2, '#e8e2d2'); rect(x - 9, y - h - 22, 3, 3, '#cfd5db');
      if (l >= 3) { rect(x + 22, y - 50, 2, 50, '#8d959e'); if (!motionReduced) for (let i = 0; i < 3; i++) { const k = ((t / 900) + i / 3) % 1; ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#d5e952'; ctx.beginPath(); ctx.arc(x + 23, y - 52, 4 + k * 14, -2.6, -.5); ctx.stroke(); ctx.globalAlpha = 1; } rect(x + 22, y - 52, 2, 2, blink ? '#ff5a4a' : '#7b2b25'); }
      break;
    }
    case 'chair': {
      const h = 11 + Math.min(l, 3) * 5; B(x, y, 14, 12, h, PAL.sand, false, { seed: 11 });
      const aw = ['#d5483a', '#3f78c4'][l % 2];
      for (let i = 0; i < 6; i++) { const t0 = i / 6, t1 = (i + 1) / 6; poly([[x - 14 + 14 * t0, y - 6 - h + 7 + 14 * t0 * .46 + 4], [x - 14 + 14 * t1, y - 6 - h + 7 + 14 * t1 * .46 + 4], [x - 14 + 14 * t1, y - h + 14 * t1 * .46 + 3 + 7], [x - 14 + 14 * t0, y - h + 14 * t0 * .46 + 3 + 7]], i % 2 ? '#f2eee0' : aw); }
      rect(x - 10, y - 8, 7, 4, '#ffdc90'); rect(x + 2, y - 8, 3, 7, '#4a3426');
      isoBox(x - 4, y + 12, 8, 4, 4, { l: '#c9665a', r: '#9a463c', t: '#e08a7c' }, { noLine: true }); rect(x - 12, y + 6, 3, 5, '#4f9a4c'); rect(x - 12, y + 10, 3, 2, '#8a6246');
      if (l > 1) B(x, y - h - 1, 11, 9, 8, PAL.cream, true, { noShadow: true, seed: 12 });
      break;
    }
    case 'watch': {
      const h = 34 + Math.min(l, 4) * 6; B(x, y, 9, 9, h, PAL.sand, false, { seed: 13 });
      poly([[x - 10, y - 4.5 - h], [x, y - 9 - h], [x + 10, y - 4.5 - h], [x, y - h + 2]], '#8a4a36'); poly([[x - 10, y - 4.5 - h], [x, y - h + 2], [x, y - h - 18], [x, y - h - 18]], '#a85e44'); poly([[x, y - h + 2], [x + 10, y - 4.5 - h], [x, y - h - 18]], '#6e3a2a'); poly([[x - 10, y - 4.5 - h], [x, y - h + 2], [x, y - h - 18]], '#a85e44');
      ctx.save(); ctx.translate(Math.round(x - 4.5), Math.round(y - h * .62 + 2)); ctx.transform(1, .5, 0, 1, 0, 0);
      ctx.fillStyle = '#f4efe2'; ctx.beginPath(); ctx.arc(0, 0, 4.4, 0, 7); ctx.fill(); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1; ctx.stroke();
      const ang = t / 1000 * .5; clockHand(0, 0, ang, 3.4, '#1a1a1a'); clockHand(0, 0, ang * 12, 2.2, '#b33a2a'); ctx.restore();
      rect(x + 4, y - 5, 3, 5, '#4a3426'); rect(x - 10, y - 2, 5, 3, '#7a5a3e');
      break;
    }
    case 'heart': {
      const h = 16 + Math.min(l, 4) * 3; B(x, y, 13, 11, h, PAL.rose, true, { seed: 14 });
      const hx = Math.round(x), hy = Math.round(y - h - 24), pulse = motionReduced ? 1 : .75 + .25 * Math.sin(t / 260);
      ctx.globalAlpha = .22 * pulse; disc(hx, hy + 4, 14, 11, '#ff6b8a'); ctx.globalAlpha = 1;
      for (const [dx, dy, ww, hh] of [[-6, -4, 5, 3], [1, -4, 5, 3], [-7, -1, 14, 4], [-5, 3, 10, 2], [-3, 5, 6, 2], [-1, 7, 2, 1]]) rect(hx + dx, hy + dy, ww, hh, pulse > .9 ? '#ff7a96' : '#e8506f');
      rect(hx - 5, hy - 3, 2, 1, '#ffd0da'); for (let i = 0; i < Math.min(5, 2 + l); i++) { const px = x - 24 + i * 11, py = y + 10 + (i % 2) * 4; rect(px, py - 5, 2, 2, '#e8c9a0'); rect(px - 1, py - 3, 4, 4, ['#d5483a', '#3f78c4', '#e9c24a', '#5aa86a', '#9a5ac4'][i]); }
      break;
    }
    case 'billboard': {
      rect(x - 16, y - 34, 3, 35, '#59606c'); rect(x + 14, y - 34, 3, 35, '#59606c'); disc(x, y + 2, 20, 5, 'rgba(8,10,24,.25)');
      rect(x - 24, y - 56, 49, 27, '#161b26'); rect(x - 22, y - 54, 45, 23, ['#f0d35a', '#d5e952', '#7fd0e8', '#ff9a6a'][Math.floor(t / 1500) % 4]);
      const words = ['GENUG?', 'MEHR!', 'JETZT!', 'LIKE'], wd = words[(Math.floor(t / 1500) + l) % 4];
      ctx.fillStyle = '#17200e'; ctx.font = '10px Pixel, monospace'; ctx.fillText(wd, Math.round(x - 20), Math.round(y - 38));
      for (let i = 0; i < 4; i++) rect(x - 20 + i * 12, y - 60, 6, 3, '#e8e2d2'), (i % 2 || blink) && (ctx.globalAlpha = .12, ctx.fillStyle = '#fff6c0', ctx.beginPath(), ctx.moveTo(x - 20 + i * 12 + 3, y - 57), ctx.lineTo(x - 28 + i * 12, y - 36), ctx.lineTo(x - 12 + i * 12, y - 36), ctx.fill(), ctx.globalAlpha = 1);
      break;
    }
    case 'pool': {
      floorPad(x, y, '#d6cdb0', '#b8ae90', .95);
      poly([[x - 16, y - 1], [x + 3, y - 10], [x + 20, y - 2], [x + 1, y + 7]], '#f4f0e4'); poly([[x - 13, y - 1], [x + 3, y - 8], [x + 17, y - 2], [x + 1, y + 5]], '#2f9ccb');
      const sh = motionReduced ? 0 : Math.floor(t / 300) % 6; rect(x - 6 + sh * 2, y - 3 + sh * .3, 3, 1, '#9fe0f2'); rect(x + 3 - sh, y, 3, 1, '#7fd0e8');
      rect(x + 14, y + 2, 5, 2, '#e8e2d2'); rect(x + 14, y + 1, 2, 1, '#d5483a'); rect(x - 16, y - 8, 1, 10, '#8a6246'); poly([[x - 21, y - 8], [x - 16, y - 13], [x - 11, y - 8]], '#d5483a'); poly([[x - 16, y - 13], [x - 14, y - 8], [x - 11, y - 8]], '#f2eee0');
      if (l > 1) B(x - 20, y - 6, 7, 7, 10, PAL.mint, false, { seed: 15 });
      if (l > 2) B(x - 24, y - 12, 13, 12, 30, PAL.white, true, { seed: 16, roof: true });
      break;
    }
    case 'trophy': {
      B(x, y, 12, 12, 12, PAL.white, false, { seed: 17 }); for (let i = 0; i < 4; i++) rect(x - 10 + i * 2.6, y - 11 + i * 1.2, 2, 9, '#f4efe2');
      poly([[x - 14, y - 12.5], [x, y - 17], [x + 13, y - 12.5], [x, y - 8]], '#cdd2d8');
      const gx = Math.round(x), gy = Math.round(y - 31); rect(gx - 5, gy - 9, 11, 8, '#e9c24a'); rect(gx - 4, gy - 1, 9, 3, '#e9c24a'); rect(gx - 1, gy + 2, 3, 5, '#c9a032'); rect(gx - 4, gy + 7, 9, 3, '#e9c24a'); rect(gx - 8, gy - 8, 3, 5, '#c9a032'); rect(gx + 6, gy - 8, 3, 5, '#c9a032'); rect(gx - 4, gy - 8, 2, 6, '#fff0a0');
      if (blink) { rect(gx + 7, gy - 12, 1, 3, '#fff6c0'); rect(gx + 6, gy - 11, 3, 1, '#fff6c0'); }
      break;
    }
    case 'spotlight': {
      isoBox(x + 2, y + 4, 22, 18, 3, { l: '#6b5a48', r: '#4a3e32', t: '#8c7860' }); rect(x - 22, y - 36, 3, 34, '#59606c'); rect(x + 20, y - 36, 3, 34, '#59606c'); rect(x - 22, y - 37, 45, 3, '#8d959e'); rect(x - 12, y - 17, 17, 14, '#1c1f2a');
      const sw = motionReduced ? 0 : Math.sin(t / 700) * 10;
      for (const [bx, col] of [[-14, 'rgba(255,230,140,.16)'], [14, 'rgba(255,150,170,.16)']]) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + bx, y - 34); ctx.lineTo(x + bx - 16 + sw, y + 6); ctx.lineTo(x + bx + 14 + sw, y + 6); ctx.fill(); rect(x + bx - 2, y - 36, 5, 3, '#fff6c0'); }
      for (let i = 0; i < 14; i++) rect(x - 22 + (i % 7) * 6 + (i > 6 ? 3 : 0), y + 12 + (i > 6 ? 5 : 0) - (i % 7) * 2.5, 2, 2, ['#d5483a', '#3f78c4', '#e9c24a', '#5aa86a'][i % 4]);
      break;
    }
    case 'crown': {
      const h = 24 + Math.min(l, 5) * 4; B(x, y, 15, 14, h, PAL.sand, true, { seed: 18 }); B(x, y - h, 17, 15, 3, PAL.gold, false, { noShadow: true });
      const cx = Math.round(x), cy = Math.round(y - h - 7); rect(cx - 10, cy - 8, 20, 6, '#e9c24a'); for (const dx of [-10, -3, 4, 10]) { rect(cx + dx - 1, cy - 14, 3, 7, '#e9c24a'); rect(cx + dx, cy - 15, 1, 1, '#fff0a0'); }
      rect(cx - 8, cy - 6, 3, 2, '#d5483a'); rect(cx - 1, cy - 6, 3, 2, '#3f78c4'); rect(cx + 6, cy - 6, 3, 2, '#5aa86a'); rect(cx - 10, cy - 8, 20, 1, '#fff0a0');
      rect(x + 18, y - 40, 1, 40, '#cfd5db'); poly([[x + 19, y - 40], [x + 29, y - 36 + (motionReduced ? 0 : Math.round(Math.sin(t / 400) * 1.5))], [x + 19, y - 32]], '#d5483a');
      break;
    }
  }
};

window.drawObject = function (p, x, y, l) {
  const sc = { car: l >= 5 ? 1.3 : 1.8, chair: 1.3, trophy: 1.35, heart: 1.15, watch: 1.1, spotlight: 1.1 }[p.id] || 1;
  if (sc === 1) { drawRaw(p, x, y, l); return; }
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y); drawRaw(p, x, y, l); ctx.restore();
};

/* ---------- Menschen, Werbetafeln, Kartenzoom ---------- */
const SHIRT = ['#e0583c', '#3f78c4', '#e9c24a', '#5aa86a', '#9a5ac4', '#e8e2d2'];
window.drawLife = function (time, size) {
  const p = pressure(), t = motionReduced ? 0 : time;
  for (let n = 0; n < 2 + Math.floor(state.upgrades * .6) && n < 22; n++) {
    const travel = (t * .000012 * (1 + p) + n * .071) % 1, off = n % 4 < 2 ? .62 : -.62, q = n % 2 ? iso(travel * (size - 1), 4 + off) : iso(3 + off, travel * (size - 1));
    const x = Math.round(q.x), y = Math.round(q.y), stride = motionReduced ? 0 : Math.floor(t / 180 + n) % 2;
    disc(x, y + 5, 3, 1.5, 'rgba(8,10,24,.3)'); rect(x - 1, y - 8, 3, 3, '#e8c9a0'); rect(x - 1, y - 9, 3, 1, n % 3 ? '#3a2a20' : '#c9a45a'); rect(x - 2, y - 5, 4, 4, SHIRT[n % SHIRT.length]); rect(x - 2, y - 1, 1, 2 + stride, '#1c2230'); rect(x, y - 1, 1, 3 - stride, '#1c2230');
  }
  if (state.upgrades > 4) for (let n = 0; n < Math.min(4, Math.floor(state.upgrades / 5)); n++) {
    const q = iso(1 + n * 2, 1), bob = motionReduced ? 0 : Math.round(Math.sin(time * .001 + n) * 2);
    rect(q.x - 9, q.y - 44 + bob, 20, 9, '#161b26'); rect(q.x - 8, q.y - 43 + bob, 18, 7, '#243148'); rect(q.x - 6 + (Math.floor(t / 350 + n) % 9), q.y - 41 + bob, 3, 3, '#ffd98a'); rect(q.x, q.y - 35 + bob, 1, 6, '#59606c');
  }
};
window.mapZoom = function () { const size = landSize(), K = 3 / pixelRatio; return K * Math.max(.18, Math.min(1, 8.6 / size, 1.25 * (canvas.height / K - 14) / (size * 20 + 50)) * userZoom); };

/* ---------- Hauptzeichnung ---------- */
window.drawWorld = function (time = 0) {
  const size = landSize(), w = canvas.width, h = canvas.height;
  ctx.imageSmoothingEnabled = false;
  const p = pressure(), d = darkness();
  FR.p = p; FR.d = d; FR.t = time; FR.lit = .3 + .64 * p;
  origin = { x: Math.round(w / 2 + cam.x), y: Math.round((h - size * 20) / 2 + 23 + cam.y) };
  drawSky(w, h, p, time);
  ctx.save(); const zoom = mapZoom(); ctx.translate(w / 2, h / 2); ctx.scale(zoom, zoom); ctx.translate(-w / 2, -h / 2);
  drawSoil(size);
  for (let total = 0; total <= 2 * (size - 1); total++) for (let a = 0; a < size; a++) {
    const b = total - a; if (b < 0 || b >= size) continue;
    const q = iso(a, b), screen = projectMap(q); if (screen.x < -40 || screen.x > w + 40 || screen.y < -75 || screen.y > h + 40) continue;
    const born = constructions.get('ring' + Math.max(a, b)); ctx.globalAlpha = born !== undefined && !motionReduced ? Math.min(1, (time - born) / 1200) : 1;
    groundTile(q, a, b, time);
  }
  ctx.globalAlpha = 1;
  if (state.errorSeen) drawCountryRoad(time);
  const items = [], vis = q => { const s = projectMap(q); return s.x > -60 && s.x < w + 60 && s.y > -80 && s.y < h + 100; };
  for (const s of citySites()) { const q = iso(s.a, s.b); if (vis(q)) items.push([s.a + s.b + .02, () => district(s.a, s.b, time)]); }
  for (const dc of decorFor(size)) { const q = iso(dc.a, dc.b); if (!vis(q)) continue; items.push([dc.a + dc.b + .01, dc.t === 'tree' ? () => tree(q.x, q.y + 2, dc.s) : dc.t === 'bush' ? () => bush(q.x, q.y + 2, dc.s) : () => bench(q.x, q.y)]); }
  for (let r = 0; 3 + r * 8 < size || 4 + r * 8 < size; r++) for (let i = 1; i < size; i += 3) {
    if (3 + r * 8 < size) { const q = iso(3.55 + r * 8, i + .5); if (vis(q)) items.push([3.55 + r * 8 + i + .5, () => lamp(q.x, q.y)]); }
    if (4 + r * 8 < size) { const q = iso(i + .5, 4.55 + r * 8); if (vis(q)) items.push([4.55 + r * 8 + i + .5, () => lamp(q.x, q.y)]); }
  }
  for (const prod of products.filter(x => level(x) || x.id === 'house')) {
    items.push([prod.a + prod.b + .5, () => {
      const q = iso(prod.a, prod.b), started = constructions.get(prod.id), age = started === undefined ? 10 : (time - started) / 1000, rise = motionReduced ? 1 : Math.min(1, Math.max(.08, age / 1.7));
      ctx.save(); ctx.translate(q.x, q.y); ctx.scale(1, rise); ctx.translate(-q.x, -q.y); window.drawObject(prod, q.x, q.y, level(prod)); ctx.restore();
      if (age < 2.5 && !motionReduced) drawConstruction(q.x, q.y, age);
    }]);
  }
  const speed = time * (.000018 + p * .000035), per = 1 + Math.floor(p * 3.2) + Math.floor(size / 12);
  for (let n = 0; n < per; n++) {
    const col = CAR[(n * 3) % CAR.length], col2 = CAR[(n * 5 + 2) % CAR.length], f = (speed + n * .21) % 1, g = (speed * .9 + n * .27 + .13) % 1;
    const q1 = iso(3.2, f * (size - 1)), q2 = iso(2.8, (1 - g) * (size - 1)), q3 = iso(f * (size - 1), 4.2), q4 = iso((1 - g) * (size - 1), 3.8);
    items.push([3.2 + f * (size - 1), () => car(q1.x, q1.y, 'b', col, 0, true)], [2.8 + (1 - g) * (size - 1), () => car(q2.x, q2.y, 'b', col2, 0, false)], [4.2 + f * (size - 1), () => car(q3.x, q3.y, 'a', col2, 0, true)], [3.8 + (1 - g) * (size - 1), () => car(q4.x, q4.y, 'a', col, 0, false)]);
  }
  const pl = iso(3.7, 4); items.push([7.7, () => { const x = Math.round(pl.x), y = Math.round(pl.y); disc(x + 1, y + 5, 4, 2, 'rgba(8,10,24,.3)'); rect(x - 2, y - 11, 5, 5, '#e8c9a0'); rect(x - 2, y - 12, 5, 2, '#3a2a20'); rect(x - 3, y - 6, 6, 7, '#e0583c'); rect(x - 3, y + 1, 2, 4, '#1c2230'); rect(x + 1, y + 1, 2, 4, '#1c2230'); }]);
  items.sort((a, b) => a[0] - b[0]);
  for (const it of items) it[1]();
  drawLife(time, size);
  if (state.clicks && p > .4 && !motionReduced) { for (let n = 0; n < Math.floor(p * 9); n++) { const y = (n * 29 + Math.floor(time / 220)) % h; rect((n * 67 + Math.floor(time / 170)) % w, y, 3, 1, '#ffd98a44'); } }
  ctx.restore();
  if (d > .1) { ctx.fillStyle = `rgba(14,5,22,${d * .3})`; ctx.fillRect(0, 0, w, h); }
  const vg = ctx.createRadialGradient(w / 2, h * .55, h * .35, w / 2, h * .55, Math.max(w, h) * .75); vg.addColorStop(0, 'rgba(6,8,20,0)'); vg.addColorStop(1, 'rgba(6,8,20,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  positionPlots();
};

/* ---------- Ansicht des Spielstands (kein Download, kein Versand) ---------- */
window.snapshotCity = function () {
  const target = document.getElementById('snapshot'); if (!target) return;
  const sv = { cam: { ...cam }, z: userZoom, w: canvas.width, h: canvas.height, pr: pixelRatio };
  cam = { x: 0, y: 0 }; userZoom = 1; pixelRatio = 3; canvas.width = 640; canvas.height = 360;
  try { window.drawWorld(animationTime); target.width = 640; target.height = 360; target.getContext('2d').drawImage(canvas, 0, 0); } catch {}
  cam = sv.cam; userZoom = sv.z; pixelRatio = sv.pr; canvas.width = sv.w; canvas.height = sv.h;
};
})();
