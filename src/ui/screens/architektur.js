/**
 * Akt 4 — Die Architektur.
 * Hier wird der Kern des Whitepapers sichtbar: nicht imperativ *oder*
 * deklarativ, sondern imperative Kontrollpunkte innerhalb eines
 * deklarativen Handlungsraums. Platzierung kommt in V2-07, die
 * Kombination in V2-08, die verschmolzene Flaeche in V2-09.
 */
(function (HR) {
  'use strict';

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.akt4;
    var h = [];
    h.push('<h1 id="akt-4-titel">' + e(s.titel) + '</h1>');
    h.push('<div class="steuerung">');
    h.push(HR.render.knopf('akt', HR.copy.seite.weiter, { wert: 5 }));
    h.push('</div>');
    return h.join('');
  }

  HR.render.bildschirm(4, { zeichnen: zeichnen });
})(window.HR = window.HR || {});
