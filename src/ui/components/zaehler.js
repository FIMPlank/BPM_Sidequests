/**
 * Die fuenf Anzeigen. Sie sind Instrumente, keine Dekoration:
 * Mono, Tabellenziffern, feste Breite — damit beim Aktualisieren nichts springt.
 */
(function (HR) {
  'use strict';

  /**
   * @param {Object} z Zustand
   * @returns {string} HTML
   */
  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3.zaehler;
    var schaetzung = HR.tokens.schaetzen(z.regeln);
    var freiheit = HR.freedom.freiheitsgrade(z.regeln);
    var verstoesse = z.lauf ? String(HR.checker.zaehleVerstoesse(z.lauf.violations)) : HR.copy.screen4.fehlt;

    var zellen = [
      { name: s.regeln, wert: String(z.regeln.length), einheit: '' },
      { name: s.tokens, wert: String(schaetzung.gesamt), einheit: '' },
      { name: s.kosten, wert: HR.tokens.centText(schaetzung.cent), einheit: HR.copy.screen3.einheitCent },
      { name: s.freiheit, wert: String(freiheit.prozent), einheit: '%' },
      { name: s.verstoesse, wert: verstoesse, einheit: '', warn: verstoesse !== '0' && verstoesse !== HR.copy.screen4.fehlt }
    ];

    return '<dl class="instrumente">' + zellen.map(function (c) {
      return '<div class="instrument' + (c.warn ? ' ist-warn' : '') + '">' +
        '<dt class="instrument__name">' + e(c.name) + '</dt>' +
        '<dd class="instrument__wert mono" aria-live="polite">' + e(c.wert) +
        (c.einheit ? '<span class="instrument__einheit">' + e(c.einheit) + '</span>' : '') +
        '</dd></div>';
    }).join('') + '</dl>';
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.zaehler = { zeichnen: zeichnen };
})(window.HR = window.HR || {});
