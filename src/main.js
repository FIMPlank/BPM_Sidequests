/** Einstieg: Modus setzen, Ereignisse delegieren, auf Zustandsaenderungen zeichnen. */
(function (HR) {
  'use strict';

  function modusText() {
    if (HR.config.vortrag) return HR.copy.seite.modusVortrag;
    return HR.config.modus === 'live' ? HR.copy.seite.modusLive : HR.copy.seite.modusMock;
  }

  function tastatur(ev) {
    if (!HR.config.vortrag) return;
    var ziel = ev.target;
    if (ziel && (ziel.tagName === 'INPUT' || ziel.tagName === 'TEXTAREA')) return;
    var z = HR.store.holen();
    if (ev.key === 'ArrowRight') HR.store.senden({ typ: 'akt', n: Math.min(HR.store.AKT_MAX, z.akt + 1) });
    else if (ev.key === 'ArrowLeft') HR.store.senden({ typ: 'akt', n: Math.max(HR.store.AKT_MIN, z.akt - 1) });
    else if (ev.key === 'r') HR.store.senden({ typ: 'reset' });
    else if (ev.key >= '1' && ev.key <= '3') {
      var id = HR.imperative.STOERUNGEN[Number(ev.key) - 1];
      var knopf = document.querySelector('[data-aktion="stoerung-waehlen"][data-wert="' + id + '"]');
      if (knopf && !knopf.disabled) knopf.click();
    } else return;
    ev.preventDefault();
  }

  function start() {
    var wurzel = document.documentElement;
    if (HR.config.vortrag) wurzel.classList.add('vortrag');
    wurzel.classList.add('modus-' + HR.config.modus);

    var pille = document.getElementById('modus-pille');
    if (pille) pille.textContent = modusText();

    if (HR.config.vortrag) {
      var fuss = document.querySelector('.fuss');
      if (fuss) {
        var p = document.createElement('p');
        p.className = 'fuss__vortrag mono';
        p.textContent = HR.copy.seite.vortragHinweis;
        fuss.insertBefore(p, fuss.firstChild);
      }
    }

    var marke = document.querySelector('.kopf__titel');
    if (marke) marke.textContent = HR.copy.seite.titel;

    function wechseln(typ) {
      return function (wert) {
        HR.store.senden({ typ: typ, n: Number(wert) });
        var el = document.getElementById('hauptinhalt');
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' });
      };
    }
    HR.render.auf('akt', wechseln('akt'));
    HR.render.auf('screen', wechseln('screen'));   // Alias der ersten Fassung

    HR.render.delegieren(document.body);
    HR.store.abonnieren(function (z) { HR.render.zeichnen(z); });
    document.addEventListener('keydown', tastatur);

    if (HR.config.startAkt !== 0) {
      HR.store.senden({ typ: 'akt', n: HR.config.startAkt });
    }
    HR.render.zeichnen(HR.store.holen());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window.HR = window.HR || {});
