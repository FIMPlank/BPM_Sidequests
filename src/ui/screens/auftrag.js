/**
 * Akt 0 — Der Auftrag.
 * Der Vorspann vor der Aktleiste. Hier faellt die erste Entscheidung des
 * Besuchers; der Inhalt kommt in V2-03, das Geruest steht schon.
 */
(function (HR) {
  'use strict';

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.akt0;
    var h = [];
    h.push('<h1 id="akt-0-titel">' + e(s.titel) + '</h1>');
    h.push('<div class="steuerung">');
    h.push(HR.render.knopf('akt', HR.copy.seite.weiter, { wert: 1, klasse: 'knopf--haupt' }));
    h.push('</div>');
    return h.join('');
  }

  HR.render.bildschirm(0, { zeichnen: zeichnen });
})(window.HR = window.HR || {});
