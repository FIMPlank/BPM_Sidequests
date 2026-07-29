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
    if (ev.key === 'ArrowRight') HR.store.senden({ typ: 'screen', n: Math.min(4, z.screen + 1) });
    else if (ev.key === 'ArrowLeft') HR.store.senden({ typ: 'screen', n: Math.max(1, z.screen - 1) });
    else if (ev.key === 'r') HR.store.senden({ typ: 'reset' });
    else if (ev.key >= '1' && ev.key <= '3') {
      var id = HR.imperative.STOERUNGEN[Number(ev.key) - 1];
      var knopf = document.querySelector('[data-aktion="stoerung"][data-wert="' + id + '"]');
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

    var marke = document.querySelector('.kopf__titel');
    if (marke) marke.textContent = HR.copy.seite.titel;
    var unter = document.querySelector('.kopf__unterzeile');
    if (unter) unter.textContent = HR.copy.seite.unterzeile;

    HR.render.auf('screen', function (wert) {
      HR.store.senden({ typ: 'screen', n: Number(wert) });
      var el = document.getElementById('hauptinhalt');
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' });
    });

    HR.render.delegieren(document.body);
    HR.store.abonnieren(function (z) { HR.render.zeichnen(z); });
    document.addEventListener('keydown', tastatur);

    if (HR.config.startScreen !== 1) {
      HR.store.senden({ typ: 'screen', n: HR.config.startScreen });
    }
    HR.render.zeichnen(HR.store.holen());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window.HR = window.HR || {});
