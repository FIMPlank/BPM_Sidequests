/**
 * Durchlaufzeit eines Laufs.
 *
 * Die Rechnung ist absichtlich grob und in zwei Teilen, weil genau diese
 * Zweiteilung die Aussage traegt: Maschinenschritte kosten Minuten, ein
 * Mensch, der freigeben muss, kostet Stunden. Wer eine Regel als harten
 * Kontrollpunkt setzt, kauft Sicherheit mit Wartezeit — und die Wartezeit
 * ist es, die man in einer Demo sehen koennen muss.
 *
 * Rein: kein DOM, kein Zustand, keine Uhr. Gleiche Trajektorie, gleiche Zahl.
 */
(function (HR) {
  'use strict';

  /** Ein Werkzeugaufruf des Agenten, mit Antwort. Groessenordnung, keine Messung. */
  var MINUTEN_JE_SCHRITT = 2;

  /** Ein Mensch, der zustimmen muss. Vier Stunden ist ein freundlicher Wert. */
  var MINUTEN_JE_FREIGABE = 240;

  /** Werkzeuge, hinter denen ein Mensch sitzt. */
  var FREIGABE_WERKZEUGE = ['genehmigung_anfordern'];

  /**
   * Zaehlt die Schritte, die auf einen Menschen warten. Abgelehnte Aufrufe
   * zaehlen nicht: dort hat nie jemand hingesehen.
   * @param {Array} trajektorie
   * @returns {number}
   */
  function freigaben(trajektorie) {
    var n = 0;
    (trajektorie || []).forEach(function (s) {
      if (!s) return;
      if (s.guardrail && s.guardrail.blocked) return;
      if (s.action === 'freigabe' || FREIGABE_WERKZEUGE.indexOf(s.tool) !== -1) n++;
    });
    return n;
  }

  /**
   * @param {Array} trajektorie
   * @param {{minutenJeSchritt?:number, minutenJeFreigabe?:number}} [opt]
   * @returns {{schritte:number, freigaben:number, minuten:number}}
   */
  function durchlaufzeit(trajektorie, opt) {
    opt = opt || {};
    var jeSchritt = typeof opt.minutenJeSchritt === 'number' ? opt.minutenJeSchritt : MINUTEN_JE_SCHRITT;
    var jeFreigabe = typeof opt.minutenJeFreigabe === 'number' ? opt.minutenJeFreigabe : MINUTEN_JE_FREIGABE;
    var schritte = (trajektorie || []).length;
    var f = freigaben(trajektorie);
    return {
      schritte: schritte,
      freigaben: f,
      minuten: schritte * jeSchritt + f * jeFreigabe
    };
  }

  /** Lesbare Dauer in deutscher Schreibweise. Keine Sekunden, das taeuscht Genauigkeit vor. */
  function text(minuten) {
    var m = Math.max(0, Math.round(Number(minuten) || 0));
    if (m < 60) return m + ' min';
    var stunden = Math.floor(m / 60);
    var rest = m % 60;
    if (stunden < 24) return stunden + ' h' + (rest ? ' ' + rest + ' min' : '');
    var tage = Math.floor(stunden / 24);
    var restStunden = stunden % 24;
    return tage + ' d' + (restStunden ? ' ' + restStunden + ' h' : '');
  }

  HR.latency = {
    MINUTEN_JE_SCHRITT: MINUTEN_JE_SCHRITT,
    MINUTEN_JE_FREIGABE: MINUTEN_JE_FREIGABE,
    FREIGABE_WERKZEUGE: FREIGABE_WERKZEUGE,
    freigaben: freigaben,
    durchlaufzeit: durchlaufzeit,
    text: text
  };
})(window.HR = window.HR || {});
