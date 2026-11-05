'use strict';
/* REICHT / V7 — Zusammenbruch-Engine
   Legt sich über script.js (gleiche globale Variablen) und inszeniert:
   Glitch, Bildschirm-Beben, Fake-Fenster, Chaos-Sound, die Zeit-Phase («Nimm dir Zeit.»),
   den Kollaps und die Outro-Atmosphäre. Alles respektiert «FX AUS» (motionReduced). */
(() => {
const R = Math.random, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[Math.floor(R() * a.length)];
const reduce = () => motionReduced;
const Z = () => state.zeit || (state.zeit = { on: false, ignored: 0, shown: 0, pauses: 0 });

const scene = $('#scene'), world = $('#world');
const MAX_IGNORED = 10;

/* ---------- DOM-Ebenen ---------- */
const layer = document.createElement('div'); layer.id = 'fx-layer';
const fxCanvas = document.createElement('canvas'); fxCanvas.id = 'fx-canvas';
const big = document.createElement('div'); big.id = 'fx-big'; big.setAttribute('aria-hidden', 'true');
layer.append(fxCanvas, big); scene.append(layer);
const fxc = fxCanvas.getContext('2d');
const vignette = document.createElement('div'); vignette.id = 'fx-vignette'; vignette.setAttribute('aria-hidden', 'true'); document.body.append(vignette);
const black = document.createElement('div'); black.id = 'fx-black'; black.setAttribute('aria-hidden', 'true');
const blackText = document.createElement('p'); black.append(blackText); document.body.append(black);
const live = document.createElement('div'); live.className = 'sr-only'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); document.body.append(live);

function sizeLayer() {
  const w = scene.clientWidth, h = scene.clientHeight;
  if (fxCanvas.width !== w || fxCanvas.height !== h) { fxCanvas.width = w; fxCanvas.height = h; }
}
new ResizeObserver(sizeLayer).observe(scene); sizeLayer();

/* ---------- Chaos-Wert ---------- */
let collapsing = false, sinceResume = 0;
function chaos() {
  if (state.finished) return 0;
  if (collapsing) return 1;
  return Math.max(smooth(.38, .97, pressure()), Z().on ? 1 : 0);
}
const stageOf = c => c < .12 ? 0 : c < .4 ? 1 : c < .68 ? 2 : c < .9 ? 3 : 4;

/* ---------- Partikel & Wörter ---------- */
const parts = [], words = [];
const SPAM = ['MEHR', '+1', 'FOLLOW', 'KAUF', 'LIKE', 'CHF', '!!', 'SOFORT', 'SCHNELLER', 'NOCH EINS', 'ZIEL+', '100%', 'VERGLEICH', 'LEISTUNG'];
function playerPos() {
  const q = projectMap(iso(3.7, 4));
  return { x: q.x / canvas.width * scene.clientWidth, y: (q.y - 6) / canvas.height * scene.clientHeight };
}
function burst(x, y, n, colors, speed = 1, up = true) {
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, s = (40 + R() * 150) * speed;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (up ? 60 : 0), g: 260, life: 0, max: .5 + R() * .7, size: 2 + Math.floor(R() * 3) * 1, c: pick(colors) });
  }
  if (parts.length > 400) parts.splice(0, parts.length - 400);
}
const WARM = ['#d5e952', '#e8f88c', '#bdd96b', '#ffffff'];
const COLD = ['#858c76', '#6c7b5a', '#ee684b', '#4a2a22'];

/* ---------- Audio-Helfer (eigener Ausgang, unabhängig vom Musik-Pegel) ---------- */
let out = null, padNodes = null;
const canSound = () => typeof audio !== 'undefined' && audio && soundWanted && soundRunning && audio.state === 'running' && !document.hidden;
function ensureOut() {
  if (!canSound()) return null;
  if (!out || out.ctx !== audio) { const g = audio.createGain(); g.gain.value = volume * .5; g.connect(compressor); out = g; out.ctx = audio; }
  out.gain.setTargetAtTime(volume * .5, audio.currentTime, .05);
  return out;
}
function tone(f, delay, len, gain, type = 'sine', to = null) {
  const o = ensureOut(); if (!o) return;
  const t = audio.currentTime + delay, osc = audio.createOscillator(), g = audio.createGain();
  osc.type = type; osc.frequency.setValueAtTime(f, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + len);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + len);
  osc.connect(g).connect(o); osc.start(t); osc.stop(t + len + .03);
}
const errSound = () => { if (!canSound()) return; tone(220, 0, .08, .12, 'square'); tone(147, .08, .14, .12, 'square'); };
const pingSound = () => { if (!canSound()) return; tone(1320, 0, .06, .07, 'square'); tone(1760, .07, .08, .06, 'square'); };
const bellSound = (k = 0) => { if (!canSound()) return; const base = [523.25, 440, 392, 349.23][k % 4]; tone(base, 0, 2.2, .16, 'sine'); tone(base * 1.5, .06, 2.6, .09, 'sine'); tone(base / 2, 0, 3, .12, 'sine'); };
function tapeStop() { if (!canSound()) return; tone(330, 0, 1.5, .22, 'sawtooth', 24); tone(660, 0, 1.2, .1, 'square', 40); }
function padOn(on) {
  if (!audio) return;
  if (on && !padNodes && canSound()) {
    const o = ensureOut(); const g = audio.createGain(); g.gain.value = 0; g.connect(o);
    const lfo = audio.createOscillator(), lg = audio.createGain(); lfo.frequency.value = .12; lg.gain.value = .03; lfo.connect(lg).connect(g.gain); lfo.start();
    const oscs = [130.81, 196, 246.94, 392].map((f, i) => { const s = audio.createOscillator(), sg = audio.createGain(); s.type = 'sine'; s.frequency.value = f; sg.gain.value = [.5, .35, .25, .12][i]; s.connect(sg).connect(g); s.start(); return s; });
    padNodes = { g, oscs, lfo };
    g.gain.setTargetAtTime(.13, audio.currentTime, 2.5);
  } else if (!on && padNodes) {
    const n = padNodes; padNodes = null;
    n.g.gain.setTargetAtTime(0, audio.currentTime, .6);
    setTimeout(() => { try { n.oscs.forEach(o => o.stop()); n.lfo.stop(); } catch {} }, 3500);
  }
}

/* ---------- Fake-Fenster ---------- */
const wins = new Set();
const ERR = [
  ['ERROR_404', 'FREIZEIT nicht gefunden.', 'Zuletzt gesehen: vor 3 Upgrades.'],
  ['SCHLAF.exe', 'Keine Antwort.', 'Das Programm wird nicht mehr ausgeführt.'],
  ['SPEICHER VOLL', 'Kein Platz für Freunde, Hobbys, Pausen.', 'Bitte etwas löschen. Aber nicht das Ziel.'],
  ['TASK-MANAGER', 'LEISTUNG: 100 % AUSLASTUNG', 'SELBST: 0 %. Prozess beendet.'],
  ['KALENDER', '0 freie Termine.', 'Nächste Pause: nicht eingeplant.'],
  ['VERPASST', '3 Anrufe: Mama', '«Hast du mal Zeit?»'],
  ['AKKU 3 %', 'Du läufst auf Reserve.', 'Ladegerät nicht gefunden.'],
  ['ERROR_408', 'ZEITÜBERSCHREITUNG', 'Deine Zeit für dich ist abgelaufen.'],
  ['WARNUNG', 'Zufriedenheit nicht erreichbar.', 'Das Ziel wurde verschoben.'],
  ['FEHLER 500', 'ATEM nicht verfügbar.', 'Bitte später erneut versuchen.'],
  ['VERGLEICH.dll', 'Andere sind weiter.', '(Quelle: erfunden.)'],
  ['ERROR_429', 'ZU VIELE ANFRAGEN AN DICH.', 'Erwartungen: unbegrenzt.'],
  ['NACHRICHT', 'Freunde: «Lange nichts gehört.»', 'Antwort ausstehend seit 12 Tagen.'],
  ['GESUNDHEIT', 'Schultern: verspannt.', 'Wasser: nicht getrunken. Fenster: nie geöffnet.']
];
const TIME = [
  ['NIMM DIR ZEIT.', 'Du musst gerade nichts leisten.'],
  ['ATME.', 'Einmal tief. Der Rest wartet.'],
  ['DU BIST MEHR', 'als deine Zahlen.'],
  ['PAUSE.', 'Sie braucht keine Begründung.'],
  ['ES REICHT.', 'Wirklich.'],
  ['BITTE.', 'Hör kurz auf.'],
  ['NIMM DIR ZEIT.', 'Jetzt.'],
  ['DEIN ZIEL WARTET.', 'Es läuft nicht weg.'],
  ['NICHT ALLES HEUTE.', 'Auch dein Ziel braucht Pausen.'],
  ['GENUG.', 'Du darfst aufhören.']
];
const BIG = ['', 'NIMM DIR ZEIT.', 'NIMM DIR ZEIT.', 'ATME.', 'NIMM DIR ZEIT. NIMM DIR ZEIT.', 'GENUG.', 'NIMM DIR ZEIT. NIMM DIR ZEIT. NIMM DIR ZEIT.', 'ES REICHT.', 'NIMM DIR ZEIT.'];
let zIndex = 20, errPool = [];

function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function closeWin(w, countIgnored) {
  if (!wins.has(w.el)) return; wins.delete(w.el);
  clearTimeout(w.timer); w.el.classList.add('dying'); setTimeout(() => w.el.remove(), 160);
  if (countIgnored && Z().on && w.kind === 'time' && !collapsing) { Z().ignored++; persist(); afterIgnore(); }
}
const CRASH = [
  ['KALENDER', 'Termin verpasst: 14:00 Besprechung.', 'Nächster Termin: jetzt.'],
  ['VERPASST', 'Verpasster Anruf: Mama', '«Hast du mal Zeit?»'],
  ['NACHRICHT', 'Freunde: «Lange nichts gehört.»', 'Antwort ausstehend seit 12 Tagen.'],
  ['KALENDER', 'Termin verpasst: Zahnarzt.', 'Zum dritten Mal verschoben.'],
  ['VERPASST', '5 Anrufe in Abwesenheit', 'Niemand erreicht dich mehr.'],
  ['AKKU 3 %', 'Du läufst auf Reserve.', 'Ladegerät nicht gefunden.'],
  ['KALENDER', '0 freie Termine.', 'Nächste Pause: nicht eingeplant.'],
  ['SPEICHER VOLL', 'Kein Platz für Freunde, Hobbys, Pausen.', 'Bitte etwas löschen. Aber nicht das Ziel.'],
  ['VERPASST', 'Verpasster Anruf: Freund', 'Keine Nachricht hinterlassen.'],
  ['TASK-MANAGER', 'LEISTUNG: 100 % AUSLASTUNG', 'SELBST: 0 %. Prozess beendet.'],
  ['ERROR_408', 'ZEITÜBERSCHREITUNG', 'Deine Zeit für dich ist abgelaufen.'],
  ['GESUNDHEIT', 'Schultern: verspannt.', 'Wasser: nicht getrunken.']
];
let crashOn = false, crashT = 0, crashSpawn = 0, crashIdx = 0;
function spawnWin(kind, forced) {
  const W = layer.clientWidth, H = layer.clientHeight; if (W < 200 || H < 140) return;
  const c = chaos(), z = Z();
  const e = el('div', 'fx-win ' + kind);
  e.setAttribute('role', 'alertdialog');
  let title, head, sub, btns;
  if (kind === 'time') {
    const entry = TIME[Math.min(z.on ? z.shown : Math.floor(R() * 2), TIME.length - 1)]; z.shown++;
    title = 'ZEIT.exe'; head = entry[0]; sub = entry[1]; btns = ['Ja, jetzt ↗', 'Später'];
  } else {
    if (!errPool.length) errPool = ERR.slice().sort(() => R() - .5);
    const entry = forced || errPool.pop(); title = entry[0]; head = entry[1]; sub = entry[2]; btns = ['OK', 'Ignorieren'];
  }
  const bar = el('div', 'fx-win-bar'); bar.append(el('span', '', title), el('i', '', kind === 'time' ? '·' : '×'));
  const body = el('div', 'fx-win-body'); body.append(el('b', 'fx-icon', kind === 'time' ? '◌' : '!'));
  const txt = el('div', 'fx-win-text'); txt.append(el('strong', '', head), el('small', '', sub)); body.append(txt);
  const acts = el('div', 'fx-win-actions'); const b1 = el('button', '', btns[0]), b2 = el('button', '', btns[1]); acts.append(b1, b2);
  e.append(bar, body, acts); layer.append(e);
  const w = { el: e, kind, timer: 0 };
  const ew = e.offsetWidth, eh = e.offsetHeight;
  let x, y;
  if (kind === 'time') { x = (W - ew) / 2 + (R() - .5) * W * .25; y = (H - eh) / 2 + (R() - .5) * H * .3; }
  else { x = R() * (W - ew); y = 38 + R() * Math.max(10, H - eh - 80); }
  e.style.left = Math.round(clamp(x, 6, W - ew - 6)) + 'px'; e.style.top = Math.round(clamp(y, 34, H - eh - 40)) + 'px'; e.style.zIndex = (kind === 'time' ? 5000 : 0) + (++zIndex);
  if (kind === 'time') e.style.setProperty('--zs', 1 + Math.min(.35, z.ignored * .045));
  wins.add(e);
  const act = (primary) => {
    if (kind === 'time') {
      if (primary) { closeWin(w, false); softExit(); } else closeWin(w, true);
    } else {
      closeWin(w, false); errSound();
      if (R() < c * .9 && !Z().on && !crashOn) { spawnWin('err'); if (R() < c - .45) setTimeout(() => spawnWin('err'), 120); }
    }
  };
  b1.addEventListener('click', ev => { ev.stopPropagation(); act(true); });
  b2.addEventListener('click', ev => { ev.stopPropagation(); act(false); });
  e.addEventListener('pointerdown', ev => ev.stopPropagation());
  w.timer = setTimeout(() => closeWin(w, true), kind === 'time' ? 9500 : lerp(11000, 5500, c));
  const cap = crashOn ? 12 : 4 + Math.floor(c * 9);
  if (wins.size > cap) { const first = [...wins].find(x => x.classList.contains('err')); if (first) { first.remove(); wins.delete(first); } }
  if (kind === 'time') { bellSound(z.shown); live.textContent = head + ' ' + sub; } else { (c > .75 ? errSound : pingSound)(); }
  if (!reduce()) shake(kind === 'time' ? 2 : 5 + c * 4);
}
function clearWins() { for (const e of wins) e.remove(); wins.clear(); layer.querySelectorAll('.fx-win').forEach(n => n.remove()); }

/* ---------- Zeit-Phase ---------- */
function startTime() {
  const z = Z(); if (z.on || state.finished || collapsing) return;
  z.on = true; z.ignored = 0; z.shown = 0; winTimer = .4;
  document.body.classList.add('zeit'); document.body.style.setProperty('--z', 0);
  clearWins();
  addFeed('NIMM DIR ZEIT.', 'Das System meldet sich mit etwas anderem als Erwartungen.', 'SYSTEM', 'milestone');
  padOn(true); persist();
}
function afterIgnore() {
  const z = Z(); document.body.style.setProperty('--z', clamp(z.ignored / MAX_IGNORED));
  big.textContent = BIG[Math.min(z.ignored, BIG.length - 1)]; big.className = 'on s' + Math.min(z.ignored, 8);
  winTimer = Math.max(.5, lerp(7, .8, z.ignored / MAX_IGNORED));
  if (z.ignored >= MAX_IGNORED) collapse();
  else if (!wins.size) spawnWin('time');
}
function softExit() { clearWins(); padOn(false); beginCountry(); }

/* ---------- Kollaps → Outro ---------- */
let timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
function collapse() {
  if (collapsing || state.finished) return;
  collapsing = true; document.body.classList.add('collapsing');
  for (const e of wins) e.classList.add('dying'); later(clearWins, 200);
  big.className = ''; big.textContent = '';
  tapeStop(); padOn(false);
  const fast = reduce();
  later(() => { black.classList.add('on'); blackText.textContent = ''; }, fast ? 100 : 1500);
  later(() => { blackText.textContent = 'STOPP.'; blackText.className = 'in'; }, fast ? 500 : 2200);
  later(() => { blackText.className = ''; }, fast ? 1100 : 3600);
  later(() => { blackText.textContent = 'ATME.'; blackText.className = 'in slow'; }, fast ? 1300 : 4300);
  later(() => { collapsing = false; document.body.classList.remove('collapsing'); beginCountry(); black.classList.add('fade-out'); blackText.className = ''; }, fast ? 2400 : 7000);
  later(() => { black.classList.remove('on', 'fade-out'); blackText.textContent = ''; }, fast ? 3200 : 10500);
}

/* ---------- Bewegungseffekte ---------- */
let shakeAmp = 0, winTimer = 2, wordTimer = 0, scrambleTimer = 3, flashCool = 0, pingTimer = 0;
function shake(a) { shakeAmp = Math.max(shakeAmp, a); }
function scramble(elm) {
  if (!elm || elm.dataset.scr) return; const orig = elm.textContent; if (orig.length < 3) return;
  elm.dataset.scr = '1'; const chars = '█▓▒░#%&?!0123456789/\\<>_';
  let n = 0; const iv = setInterval(() => {
    n++; if (n > 4 || state.finished) { clearInterval(iv); if (elm.textContent !== orig && elm.dataset.scr) elm.textContent = orig; delete elm.dataset.scr; return; }
    elm.textContent = [...orig].map(ch => ch !== ' ' && R() < .3 ? pick([...chars]) : ch).join('');
  }, 70);
}

/* Chromatische Verschiebung über zwei Zwischenpuffer */
let tmp, cr, cb;
function aberration(px) {
  const w = canvas.width, h = canvas.height;
  if (!tmp || tmp.width !== w || tmp.height !== h) { tmp = document.createElement('canvas'); cr = document.createElement('canvas'); cb = document.createElement('canvas'); [tmp, cr, cb].forEach(c => { c.width = w; c.height = h; }); }
  const t = tmp.getContext('2d'), r = cr.getContext('2d'), b = cb.getContext('2d');
  t.drawImage(canvas, 0, 0);
  for (const [cx, col] of [[r, '#ff0000'], [b, '#0000ff']]) { cx.globalCompositeOperation = 'source-over'; cx.drawImage(tmp, 0, 0); cx.globalCompositeOperation = 'multiply'; cx.fillStyle = col; cx.fillRect(0, 0, w, h); }
  ctx.globalAlpha = .55; ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(cr, -px, 0); ctx.drawImage(cb, px, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}

/* ---------- Haupt-API ---------- */
let lastTitle = 0, sceneW = 0;
const FX = {
  duck: 1,
  /* Pro Animations-Frame (auch ausserhalb der Stadt) */
  frame(dt) {
    const retreat = !$('#retreat').hidden;
    if (retreat) { outroFrame(dt); }
    const c = chaos(), st = stageOf(c);
    document.body.dataset.stage = st;
    document.body.style.setProperty('--c', c.toFixed(3));
    vignette.style.setProperty('--beat', Math.max(.55, 1.5 - c * .95).toFixed(2) + 's');
    // Dauer-Duck der Musik in der Zeit-Phase
    const z = Z();
    this.duck = state.finished ? 1 : collapsing ? 0 : z.on ? Math.max(.14, 1 - z.ignored * .11) : 1;
    if (state.finished) { parts.length = 0; fxc.clearRect(0, 0, fxCanvas.width, fxCanvas.height); return; }
    const paused = failureOpen || goalModalOpen() || collapsing, calm = reduce();
    // Beben (nur mit Effekten)
    const amp = calm ? 0 : (c > .5 ? (c - .5) * 5 : 0) + shakeAmp; shakeAmp *= Math.pow(.001, dt);
    scene.style.setProperty('--sx', (R() - .5) * amp + 'px'); scene.style.setProperty('--sy', (R() - .5) * amp * .8 + 'px');

    // Crash-Aufbau: verpasste Termine und Anrufe, immer schneller, dann der Absturz
    if (crashOn && !paused && !document.hidden) {
      crashT += dt; crashSpawn -= dt;
      if (crashSpawn <= 0) { spawnWin('err', CRASH[crashIdx++ % CRASH.length]); crashSpawn = lerp(1.5, .3, clamp(crashT / 8)); }
      if (!calm) shakeAmp = Math.max(shakeAmp, crashT * .5);
      if (crashT >= 9) { crashOn = false; document.body.classList.remove('crashing'); FX.slam(); }
    }
    // Fenster-Spawn
    if (!crashOn && !paused && !document.hidden && st >= 2) {
      winTimer -= dt;
      if (winTimer <= 0) {
        if (z.on) { if (wins.size < 3 + Math.min(4, z.ignored)) spawnWin('time'); winTimer = Math.max(.6, lerp(7, .8, z.ignored / MAX_IGNORED)) * (.8 + R() * .5); }
        else {
          const timeChance = smooth(.62, 1, c) * .38;
          const hasTime = [...wins].some(e => e.classList.contains('time'));
          spawnWin(!hasTime && R() < timeChance ? 'time' : 'err');
          winTimer = lerp(8.5, calm ? 3 : .9, smooth(.5, 1, c)) * (.7 + R() * .6);
        }
      }
    }
    // Spam-Wörter
    if (!paused && !calm && c > .45) {
      wordTimer -= dt;
      if (wordTimer <= 0) {
        wordTimer = lerp(1.6, .06, smooth(.45, 1, c)) * (.6 + R() * .8);
        const big = R() < c * .25;
        words.push({ x: R() * fxCanvas.width, y: fxCanvas.height + 10, vy: -(30 + R() * 90) * (1 + c), vx: (R() - .5) * 40, text: pick(SPAM), size: big ? 30 + Math.floor(R() * 30) : 10 + Math.floor(R() * 10), c: pick(['#d5e952', '#ee684b', '#d8e7bc', '#ffffff']), life: 0, max: 2.5 + R() * 2.5, rot: (R() - .5) * .5 });
        if (words.length > 60) words.shift();
      }
    }
    // Text-Korruption im HUD
    if (!paused && !calm && st >= 3) {
      scrambleTimer -= dt;
      if (scrambleTimer <= 0) { scrambleTimer = lerp(2.4, .35, c) * (.5 + R()); scramble(pick([$('#mission-title'), $('#pace'), $('#command'), $('#scene-caption'), $('#chapter'), $('#possessions')])); }
    }
    // Tab-Titel
    lastTitle -= dt;
    if (lastTitle <= 0) {
      lastTitle = 1.2;
      document.title = z.on ? (z.ignored > 3 ? 'Nimm dir Zeit.' : 'ZEIT.exe antwortet') : st >= 4 ? '(99+) ERROR_429' : st >= 3 ? '(' + Math.floor(20 + c * 80) + ') Neue Erwartungen' : st >= 2 ? '(' + Math.floor(R() * 9 + 1) + ') REICHT.' : 'REICHT. / Deine Welt';
    }
    // Zeichnen
    fxc.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    if (calm) { parts.length = 0; words.length = 0; return; }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life += dt; if (p.life > p.max) { parts.splice(i, 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      fxc.globalAlpha = 1 - p.life / p.max; fxc.fillStyle = p.c; fxc.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    fxc.globalAlpha = 1; fxc.textBaseline = 'middle';
    for (let i = words.length - 1; i >= 0; i--) {
      const wd = words[i]; wd.life += dt; if (wd.life > wd.max || wd.y < -60) { words.splice(i, 1); continue; }
      wd.x += wd.vx * dt; wd.y += wd.vy * dt;
      fxc.save(); fxc.translate(Math.round(wd.x), Math.round(wd.y)); fxc.rotate(wd.rot + (R() - .5) * c * .1);
      fxc.globalAlpha = Math.min(1, (wd.max - wd.life) * 1.2) * (.25 + c * .55); fxc.fillStyle = wd.c; fxc.font = wd.size + 'px Pixel, monospace';
      fxc.fillText(wd.text, 0, 0); fxc.restore();
    }
    fxc.globalAlpha = 1;
  },

  /* Nach dem Zeichnen der Stadt: direkt auf das Pixel-Canvas */
  post() {
    if (reduce() || state.finished) return;
    const c = chaos(); if (c < .3) return;
    const w = canvas.width, h = canvas.height;
    if (c > .5 && R() < .05 * c) { ctx.fillStyle = `rgba(238,104,75,${.05 + c * .12})`; ctx.fillRect(0, 0, w, h); }
    // Zeilenversatz
    const bands = R() < (c - .28) * .55 ? 1 + Math.floor(R() * c * 5) : 0;
    for (let i = 0; i < bands; i++) {
      const y = Math.floor(R() * h), hh = 2 + Math.floor(R() * (6 + c * 28)), dx = Math.round((R() - .5) * (10 + c * 70));
      ctx.drawImage(canvas, 0, y, w, Math.min(hh, h - y), dx, y, w, Math.min(hh, h - y));
    }
    // Farbblöcke & kaputte Kacheln
    if (c > .55 && R() < c * .3) {
      for (let k = 0, n = 1 + Math.floor(c * 3); k < n; k++) {
        ctx.fillStyle = pick(['#d5e952', '#ee684b', '#0b0f0c', '#ffffff55', '#66bbff55', '#3a0d0d']);
        ctx.fillRect(Math.round(R() * w), Math.round(R() * h), 6 + Math.round(R() * 60 * c), 2 + Math.round(R() * 10));
      }
    }
    if (c > .68 && R() < .5) {
      const q = { x: R() * w, y: R() * h }, col = pick(['#ee684b', '#d5e952', '#101211', '#8b9852']);
      poly([[q.x, q.y - 10], [q.x + 22, q.y], [q.x, q.y + 10], [q.x - 22, q.y]], col);
    }
    // Scan-Balken
    if (c > .6) { const y = (animationTime * .22) % (h + 40) - 20; ctx.fillStyle = 'rgba(213,233,82,.08)'; ctx.fillRect(0, y, w, 6); }
    // Rauschen
    for (let i = 0, n = Math.floor(c * 40); i < n; i++) { ctx.fillStyle = R() < .5 ? '#d5e952' : '#ee684b'; ctx.fillRect(Math.round(R() * w), Math.round(R() * h), 1 + Math.round(R() * 2), 1); }
    // Aberration
    if (c > .6) aberration(Math.round(1 + c * 3 * (R() < .25 ? 2.2 : 1)));
    // Seltener Einzelbild-Blitz (max. 1 pro 3 s)
    flashCool -= 1 / 60;
    if (c > .88 && flashCool <= 0 && R() < .01) { flashCool = 3; ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over'; }
  },

  /* Tick der Spielzeit (nur im aktiven Spiel) */
  tick(dt) {
    const z = Z();
    if (state.idle >= 8 && !z._idleCounted) { z._idleCounted = true; z.pauses = (z.pauses || 0) + 1; }
    if (state.idle < 2) z._idleCounted = false;
    if (state.returns > 0 && !z.on && pressure() >= .84) { sinceResume += dt; if (sinceResume > 30 && state.clicks) startTime(); } else if (pressure() < .84) sinceResume = 0;
  },

  click() {
    $('#balance').classList.remove('bump'); $('#followers').classList.remove('bump'); void $('#balance').offsetWidth;
    $('#balance').classList.add('bump'); $('#followers').classList.add('bump');
    if (reduce()) return;
    const c = chaos(), p = playerPos();
    burst(p.x, p.y, Math.round(lerp(14, 4, c)), c > .6 ? COLD : WARM, .9 + c * .4);
    if (c > .5) shake(2 + c * 3);
  },
  buy() {
    if (reduce()) return;
    const c = chaos(), p = playerPos();
    burst(p.x, p.y, Math.round(lerp(60, 10, c)), c > .55 ? COLD : WARM, 1.3);
    shake(3 + (1 - c) * 4);
    // Die Belohnung wird leerer: der Jubel-Blitz verschwindet mit dem Chaos.
    if (c < .5) { scene.classList.remove('cheer'); void scene.offsetWidth; scene.classList.add('cheer'); }
  },
  music(t, n, p) {
    const c = chaos(); if (c < .45 || !audio) return;
    const root = 130.81;
    if (R() < (c - .4) * .3) voice(root * 2 ** (R() * 2) * (c > .8 ? 2 : 1), t, .05, .03 + c * .04, 'square');
    if (c > .62 && n % 4 === 3 && R() < c * .6) hat(t, .05 * c);
    if (c > .6 && (n === 0 || n === 3 || n === 8)) {
      const k = audio.createOscillator(), g = audio.createGain(); k.type = 'sine'; k.frequency.setValueAtTime(72, t); k.frequency.exponentialRampToValueAtTime(34, t + .12);
      g.gain.setValueAtTime(.2 + c * .12, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16); k.connect(g).connect(master); k.start(t); k.stop(t + .2);
    }
    if (c > .8 && n === 0) {
      const o = audio.createOscillator(), g = audio.createGain(), len = 60 / tempo() * 4; o.type = 'sawtooth';
      o.frequency.setValueAtTime(380, t); o.frequency.linearRampToValueAtTime(920, t + len * .5); o.frequency.linearRampToValueAtTime(380, t + len);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.035, t + .05); g.gain.linearRampToValueAtTime(0, t + len); o.connect(g).connect(master); o.start(t); o.stop(t + len + .02);
    }
    if (c > .88 && R() < .18) { const f = root * 2 ** (pick([0, 1, 6, 7, 13]) / 12) * 2, step = 60 / tempo() / 8; for (let i = 0; i < 3; i++) voice(f, t + i * step, .03, .05, 'square'); }
  },

  beginCrash() {
    if (crashOn || collapsing || state.finished) return;
    crashOn = true; document.body.classList.add('crashing'); crashT = 0; crashSpawn = .2; crashIdx = 0; clearWins(); big.className = '';
    live.textContent = 'Termine verpasst, Anrufe verpasst. Das System wird überlastet.';
  },
  slam() {
    document.body.classList.add('system-failed'); setTimeout(() => document.body.classList.remove('system-failed'), 1800);
    this.beforeOverload(); later(() => startTime(), 1900);
  },
  beforeOverload() {
    const z = Z(), mins = Math.floor(state.seconds / 60), s = Math.floor(state.seconds % 60);
    const e = $('#error-stats');
    if (e) e.textContent = `${mins} MIN ${String(s).padStart(2, '0')} S AKTIV / ${num(state.clicks)} AKTIONEN / PAUSEN: ${z.pauses || 0}`;
    clearWins(); big.textContent = 'ERROR_429'; big.className = 'on s5'; setTimeout(() => { if (!Z().ignored) { big.className = ''; big.textContent = ''; } }, 2200); shake(14); errSound(); setTimeout(errSound, 220);
  },
  startTime,
  collapse,
  reset(keepReturn) {
    timers.forEach(clearTimeout); timers = []; collapsing = false; crashOn = false; document.body.classList.remove('crashing'); sinceResume = 0;
    clearWins(); parts.length = 0; words.length = 0; padOn(false);
    const z = Z(); z.on = false; z.ignored = 0; z.shown = 0; if (!keepReturn) z.pauses = 0;
    big.className = ''; big.textContent = '';
    document.body.classList.remove('zeit', 'collapsing'); document.body.style.setProperty('--z', 0);
    black.classList.remove('on', 'fade-out'); blackText.textContent = ''; document.title = 'REICHT. / Deine Welt';
    winTimer = 3; outroT0 = 0;
  },
  goalLine() {
    const g = state.goal; if (!g) return '';
    return g.reached ? 'Du hast dein Hauptziel erreicht. Nimm dir Zeit, es zu spüren.' : 'Dein Hauptziel ist noch nicht erreicht. Das ist in Ordnung. Je länger du dir Zeit nimmst, desto näher rückt es. Arbeite daran, aber nicht auf Kosten von dir.';
  },
  enterOutro() { clearWins(); padOn(false); big.className = ''; document.body.classList.remove('zeit'); document.title = 'Dein Weg. Deine Zeit.'; },
  arrive() {
    outroT0 = performance.now();
    const gn = $('#goal-note'); if (gn) gn.textContent = this.goalLine();
    document.title = 'Nimm dir Zeit. — REICHT.';
    live.textContent = 'Dein Weg. Deine Zeit. Nimm dir Zeit für dich.';
  }
};
window.FX = FX;

/* ---------- Outro: Glühwürmchen, Staub, Atem, Uhr ---------- */
const outro = document.createElement('canvas'); outro.id = 'fx-outro'; outro.setAttribute('aria-hidden', 'true');
const rays = el('div', 'rays'); rays.setAttribute('aria-hidden', 'true');
const retreat = $('#retreat'); retreat.insertBefore(rays, $('#outro')); retreat.insertBefore(outro, $('#outro'));
const oc = outro.getContext('2d');
const flies = Array.from({ length: 46 }, (_, i) => ({ x: R(), y: .45 + R() * .5, ph: R() * 6.28, sp: .05 + R() * .12, s: 2 + Math.floor(R() * 2) }));
let outroT0 = 0, outroTime = 0;
function outroFrame(dt) {
  const w = retreat.clientWidth, h = retreat.clientHeight;
  if (outro.width !== Math.round(w / 3) || outro.height !== Math.round(h / 3)) { outro.width = Math.round(w / 3); outro.height = Math.round(h / 3); }
  outroTime += dt; const W = outro.width, H = outro.height;
  oc.clearRect(0, 0, W, H);
  const arrived = outroT0 > 0, k = arrived ? clamp((performance.now() - outroT0) / 4000) : (journey ? clamp(journey.progress * 1.4 - .3) : 1);
  if (reduce()) { /* statisch */ }
  for (const f of flies) {
    const t = outroTime * (reduce() ? 0 : 1);
    const x = ((f.x + Math.sin(t * f.sp * 3 + f.ph) * .03) % 1) * W, y = (f.y + Math.cos(t * f.sp * 2.2 + f.ph) * .04) * H;
    const a = (.35 + .65 * (.5 + .5 * Math.sin(t * .9 + f.ph))) * k;
    oc.fillStyle = `rgba(243,236,160,${a * .18})`; oc.fillRect(Math.round(x) - 3, Math.round(y) - 3, 7, 7);
    oc.fillStyle = `rgba(255,248,190,${a})`; oc.fillRect(Math.round(x), Math.round(y), f.s, f.s);
  }
}

/* Initialzustand nach Neuladen */
(function init() {
  const z = Z();
  if (z.on && !state.finished) { document.body.classList.add('zeit'); document.body.style.setProperty('--z', clamp(z.ignored / MAX_IGNORED)); padOn(true); }
  window.addEventListener('pageshow', () => { black.classList.remove('on'); });
})();
})();
