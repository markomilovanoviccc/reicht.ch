'use strict';
/* REICHT / V7 — gemeinsame Seitenlogik: Wipe-Übergang, Scroll-Reveal. */
(() => {
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { reduced = reduced || sessionStorage.getItem('genug-motion') === 'reduce'; } catch {}
  if (reduced) document.documentElement.classList.add('low-motion');
  const wipe = document.createElement('div'); wipe.className = 'page-wipe'; wipe.setAttribute('aria-hidden', 'true'); document.body.append(wipe);
  if (!reduced && document.referrer && new URL(document.referrer, location.href).origin === location.origin) {
    document.body.classList.add('entering'); setTimeout(() => document.body.classList.remove('entering'), 700);
  }
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('leaving'); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || reduced || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => { location.href = a.href; }, 380);
  });
  const targets = document.querySelectorAll('.instructions article,.idea-grid,.care-section,.care-closing,.care-help,.act,.goal-start,.start-message');
  if (!('IntersectionObserver' in window) || reduced) { targets.forEach(t => t.classList.add('in')); return; }
  targets.forEach(t => { if (!t.classList.contains('act')) t.classList.add('rv'); });
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .15 });
  targets.forEach((t, i) => { t.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(t); });
})();
