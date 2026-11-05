'use strict';
const KEY='genug-v3';
try { if(sessionStorage.getItem(KEY)) document.querySelector('#resume-note').hidden=false; } catch {}
function launch(sound){try{const lf=document.querySelector('#low-fx');if(lf)sessionStorage.setItem('genug-motion',lf.checked?'reduce':'full');sessionStorage.setItem('genug-sound',sound?'on':'off');sessionStorage.setItem('genug-goal',document.querySelector('[name="first-goal"]:checked').value);}catch{}location.href='spielen.html';}
document.querySelector('#launch-sound').addEventListener('click',()=>launch(true));
document.querySelector('#launch-quiet').addEventListener('click',()=>launch(false));
document.querySelector('#new-round').addEventListener('click',()=>{try{sessionStorage.removeItem(KEY);}catch{}document.querySelector('#resume-note').hidden=true;});

/* Abgeschlossen: Wer das Ende erreicht hat, startet nicht noch einmal. */
try {
  if (new URLSearchParams(location.search).has('neu')) { ['genug-v3','genug-done','genug-boot'].forEach(k => sessionStorage.removeItem(k)); history.replaceState(null, '', location.pathname); }
  if (sessionStorage.getItem('genug-done')) {
    document.querySelectorAll('.goal-start,.fx-note,.launch-row,#resume-note,.start-message,.how-to,.ticker').forEach(e => e.remove());
    const d = document.createElement('section'); d.className = 'start-message done-message';
    d.innerHTML = '<span class="micro">DIESE RUNDE IST ABGESCHLOSSEN.</span><h2>DU HAST DIR ZEIT GENOMMEN.</h2><p>Das reicht. Das Spiel beginnt nicht von vorn. Wenn du magst, lies, was dahintersteckt, oder sprich mit jemandem, dem du vertraust.</p><h3 class="back-q">WILLST DU ZURÜCK IN DIE STADT?</h3><p><button id="back-to-city" class="primary-button">JA, ZURÜCK IN DIE STADT ↗</button></p><p><button id="new-game" class="secondary-button">NEUES SPIEL STARTEN ↺</button></p><p><a href="idee.html">HINTER DEM SPIEL ↗</a> &nbsp; <a href="achtsam.html">ERFOLG &amp; SELBSTFÜRSORGE ↗</a></p>';
    const ts = document.querySelector('.title-screen'); if (ts) ts.after(d); else document.querySelector('main').append(d);
    d.querySelector('#new-game').addEventListener('click', () => { try { ['genug-v3', 'genug-done', 'genug-return-city'].forEach(k => sessionStorage.removeItem(k)); } catch {} location.reload(); });
    d.querySelector('#back-to-city').addEventListener('click', () => { try { sessionStorage.setItem('genug-return-city', 'yes'); } catch {} location.href = 'spielen.html'; });
    const h = document.querySelector('.title-screen h1'); if (h) h.innerHTML = 'ES HAT<br><em data-t="GEREICHT.">GEREICHT.</em>';
    const p = document.querySelector('.title-screen p'); if (p) p.innerHTML = 'Du bist am Ende angekommen.<br>Nimm dir Zeit.';
  }
} catch {}
