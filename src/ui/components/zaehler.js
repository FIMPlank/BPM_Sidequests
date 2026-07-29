/**
 * Die Anzeigen zu Akt 3.
 *
 * Fuenf gleich grosse Zahlen nebeneinander sind ein Armaturenbrett, und ein
 * Armaturenbrett hat keine Aussage. Eine Zahl fuehrt: die Zahl der Verstoesse
 * im letzten Lauf. Sie ist das, was eine Regel bewirkt hat. Die anderen vier
 * bleiben lesbar, aber in einer ruhigen Zeile darunter.
 */
(function (HR) {
  'use strict';

  /** @returns {{wert:string, warn:boolean}} */
  function verstoesse(z) {
    if (!z.lauf) return { wert: HR.copy.screen4.fehlt, warn: false };
    var n = String(HR.checker.zaehleVerstoesse(z.lauf.violations));
    return { wert: n, warn: n !== '0' };
  }

  /** Die vier Nebenwerte, in einer Zeile, ohne Wettbewerb um Aufmerksamkeit. */
  function nebenwerte(z) {
    var s = HR.copy.screen3.zaehler;
    var schaetzung = HR.tokens.schaetzen(z.regeln);
    var freiheit = HR.freedom.freiheitsgrade(z.regeln);
    return [
      { name: s.regeln, wert: String(z.regeln.length), einheit: '' },
      { name: s.tokens, wert: String(schaetzung.gesamt), einheit: '' },
      { name: s.kosten, wert: HR.tokens.centText(schaetzung.cent), einheit: HR.copy.screen3.einheitCent },
      { name: s.freiheit, wert: String(freiheit.prozent), einheit: '%' }
    ];
  }

  /**
   * @param {Object} z Zustand
   * @returns {string} HTML
   */
  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3.zaehler;
    var v = verstoesse(z);
    var h = [];

    h.push('<div class="anzeigen">');
    h.push('<div class="grosszahl' + (v.warn ? ' ist-warn' : '') + '">');
    h.push('<span class="grosszahl__wert mono" aria-live="polite">' + e(v.wert) + '</span>');
    h.push('<span class="grosszahl__name">' + e(s.verstoesse) + '</span>');
    h.push('</div>');

    h.push('<dl class="nebenwerte">');
    nebenwerte(z).forEach(function (c) {
      h.push('<div class="nebenwert">' +
        '<dt class="nebenwert__name">' + e(c.name) + '</dt>' +
        '<dd class="nebenwert__wert mono">' + e(c.wert) +
        (c.einheit ? '<span class="nebenwert__einheit">' + e(c.einheit) + '</span>' : '') +
        '</dd></div>');
    });
    h.push('</dl>');
    h.push('</div>');

    return h.join('');
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.zaehler = { zeichnen: zeichnen, nebenwerte: nebenwerte };
})(window.HR = window.HR || {});
