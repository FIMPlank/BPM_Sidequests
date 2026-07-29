/**
 * Schaetzung von Kontextlaenge und Kosten je Lauf.
 * Naeherung: 1 Token entspricht rund 4 Zeichen deutschem Fliesstext.
 * Die Zahl ist eine Groessenordnung, keine Abrechnung — so wird sie auch beschriftet.
 */
(function (HR) {
  'use strict';

  var ZEICHEN_JE_TOKEN = 4;

  /** Grundlast: Systemprompt plus Werkzeugschemata, aus den Werkzeugen selbst gerechnet. */
  var SYSTEMPROMPT_ZEICHEN = 900;

  function werkzeugZeichen() {
    var n = 0;
    HR.tools.liste.forEach(function (t) {
      n += t.name.length + t.beschreibung.length;
      t.parameter.forEach(function (p) { n += p.name.length + p.typ.length + 12; });
    });
    return n;
  }

  function tokensAus(zeichen) {
    return Math.ceil(zeichen / ZEICHEN_JE_TOKEN);
  }

  /** Der Regelblock so, wie er in den Systemprompt kompiliert wird. */
  function regelblock(constraints) {
    return (constraints || []).map(function (c) {
      return c.id + ' [' + c.kind + '/' + c.target + '] ' + c.text_de +
        ' :: ' + praedikatText(c.predicate);
    }).join('\n');
  }

  function praedikatText(p) {
    if (!p) return '';
    switch (p.type) {
      case 'feld_vergleich': return p.feld + ' ' + p.op + ' ' + p.wert;
      case 'vorheriger_aufruf': return 'vorher ' + p.tool + (p.mit_ergebnis ? '=' + p.mit_ergebnis : '');
      case 'folgender_aufruf': return 'danach ' + p.tool + (p.mit_ergebnis ? '=' + p.mit_ergebnis : '');
      case 'kein_aufruf': return 'nie ' + p.tool;
      case 'und': return p.teile.map(praedikatText).join(' und ');
      case 'wenn_dann': return 'wenn ' + praedikatText(p.wenn) + ' dann ' + praedikatText(p.dann);
      default: return '';
    }
  }

  var BASIS_TOKEN = null;
  function basisTokens() {
    if (BASIS_TOKEN === null) BASIS_TOKEN = tokensAus(SYSTEMPROMPT_ZEICHEN + werkzeugZeichen());
    return BASIS_TOKEN;
  }

  /**
   * @param {Array} constraints
   * @returns {{basis:number, regeln:number, gesamt:number, cent:number}}
   */
  function schaetzen(constraints) {
    var basis = basisTokens();
    var regelTokens = tokensAus(regelblock(constraints).length);
    var gesamt = basis + regelTokens;
    var cent = (gesamt / 1000) * HR.config.centsPerKiloToken;
    return { basis: basis, regeln: regelTokens, gesamt: gesamt, cent: cent };
  }

  function centText(cent) {
    return cent.toFixed(3).replace('.', ',');
  }

  HR.tokens = {
    ZEICHEN_JE_TOKEN: ZEICHEN_JE_TOKEN,
    basisTokens: basisTokens,
    regelblock: regelblock,
    praedikatText: praedikatText,
    schaetzen: schaetzen,
    centText: centText
  };
})(window.HR = window.HR || {});
