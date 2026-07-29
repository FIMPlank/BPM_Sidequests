/** Einstieg: Modus setzen, Ereignisse delegieren, auf Zustandsaenderungen zeichnen. */
(function (HR) {
  'use strict';

  function modusText() {
    if (HR.config.vortrag) return HR.copy.seite.modusVortrag;
    return HR.config.modus === 'live' ? HR.copy.seite.modusLive : HR.copy.seite.modusMock;
  }

  function klick(auswahl) {
    var knopf = document.querySelector(auswahl);
    if (knopf && !knopf.disabled) { knopf.click(); return true; }
    return false;
  }

  /**
   * Die Zifferntasten bedeuten in jedem Akt das, was dort zur Wahl steht:
   * in Akt 1 die drei Stoerungen, in Akt 4 die drei Orte der Regel.
   * @returns {boolean} ob die Taste hier eine Bedeutung hatte
   */
  function ziffer(n, akt) {
    if (akt === 1) {
      var id = HR.imperative.STOERUNGEN[n - 1];
      if (!id) return false;
      // Waehlen und laufen lassen: im Vortrag soll eine Taste einen Schritt tun.
      var gewaehlt = klick('[data-aktion="stoerung-waehlen"][data-wert="' + id + '"]');
      return gewaehlt && klick('[data-aktion="prozess-starten"]');
    }
    if (akt === 4) {
      var ort = HR.platzierung.PLATZIERUNGEN[n - 1];
      if (!ort) return false;
      return klick('[data-aktion="platzierung"][data-wert="' + ort + '"]');
    }
    return false;
  }

  function tastatur(ev) {
    if (!HR.config.vortrag) return;
    // Wer in Akt 3 eine Regel tippt, wechselt nicht den Akt: solange ein Feld
    // den Fokus hat, gehoert jede Taste dem Feld. Auch Modifikatoren bleiben aus
    // dem Weg — Strg-R und Alt-Pfeil gehoeren dem Browser.
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (HR.a11y.istEingabe(ev.target) || HR.a11y.istEingabe(document.activeElement)) return;
    var z = HR.store.holen();
    if (ev.key === 'ArrowRight') HR.store.senden({ typ: 'akt', n: Math.min(HR.store.AKT_MAX, z.akt + 1) });
    else if (ev.key === 'ArrowLeft') HR.store.senden({ typ: 'akt', n: Math.max(HR.store.AKT_MIN, z.akt - 1) });
    else if (ev.key === 'r') HR.store.senden({ typ: 'reset' });
    else if (ev.key >= '1' && ev.key <= '3') {
      if (!ziffer(Number(ev.key), z.akt)) return;
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
