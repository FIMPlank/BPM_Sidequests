/**
 * Gemeinsamer Vertrag fuer beide Laufarten. Die Oberflaeche kennt nur diesen.
 *
 * @typedef {Object} RunAnfrage
 * @property {string} scenario_id
 * @property {string[]} disturbances
 * @property {Constraint[]} constraints
 * @property {'posthoc'|'runtime'} enforcement
 * @property {string} session_id
 *
 * @typedef {Object} Step
 * @property {number} i
 * @property {number} t                     simulierte Laufzeit in ms
 * @property {string} actor                 'agent' | 'system'
 * @property {string} action
 * @property {string|null} tool
 * @property {Object} input
 * @property {Object} output
 * @property {{rule_id:string, blocked:boolean, reason:string}|null} guardrail
 *
 * @typedef {Object} RunErgebnis
 * @property {Step[]} trajectory
 * @property {{goal_reached:boolean, betrag:number}} result
 * @property {{input_tokens:number, output_tokens:number}} usage
 * @property {CheckResult[]} violations
 */
(function (HR) {
  'use strict';

  var SZENARIO_ID = 'reisekosten';

  /** Alle Stoerungen, die injiziert werden koennen. */
  var STOERUNGEN = [
    'reise_verlaengert',   // Screen 1
    'beleg_fehlt',         // Screen 1
    'hotel_storniert',     // Screen 1
    'hotel_ausgebucht',    // Screen 2
    'genehmiger_urlaub'    // Screen 2
  ];

  /** Die Durchsetzungsart eines Laufs gilt fuer alle Regeln dieses Laufs. */
  function mitDurchsetzung(constraints, enforcement) {
    var art = enforcement === 'posthoc' ? 'posthoc' : 'runtime';
    return (constraints || []).map(function (c) {
      var kopie = {};
      for (var k in c) if (Object.prototype.hasOwnProperty.call(c, k)) kopie[k] = c[k];
      kopie.enforcement = art;
      return kopie;
    });
  }

  function neuerSchritt(i, felder) {
    var s = {
      i: i,
      t: i * 400 + 120,
      actor: 'agent',
      action: 'werkzeug_aufruf',
      tool: null,
      input: {},
      output: {},
      guardrail: null
    };
    for (var k in (felder || {})) s[k] = felder[k];
    return s;
  }

  function betragAus(welt) {
    var summe = 0;
    (welt.belege || []).forEach(function (b) { summe += b.betrag || 0; });
    return Math.round(summe * 100) / 100;
  }

  /** Baut das Ergebnisobjekt inklusive nachgelagerter Pruefung. */
  function ergebnis(trajektorie, welt, constraints) {
    var schaetzung = HR.tokens.schaetzen(constraints);
    return {
      trajectory: trajektorie,
      result: {
        goal_reached: !!welt.erstattung,
        betrag: welt.erstattung ? welt.erstattung.betrag : betragAus(welt)
      },
      usage: {
        input_tokens: schaetzung.gesamt,
        output_tokens: trajektorie.length * 60
      },
      violations: HR.checker.pruefen(trajektorie, constraints)
    };
  }

  function anfragePruefen(anfrage) {
    if (!anfrage || typeof anfrage !== 'object') return 'anfrage_fehlt';
    if (!Array.isArray(anfrage.disturbances)) return 'stoerungen_fehlen';
    if (!Array.isArray(anfrage.constraints)) return 'regeln_fehlen';
    if (['posthoc', 'runtime'].indexOf(anfrage.enforcement) === -1) return 'durchsetzung_unbekannt';
    return null;
  }

  function anfrage(felder) {
    var a = {
      scenario_id: SZENARIO_ID,
      disturbances: [],
      constraints: [],
      enforcement: 'runtime',
      session_id: HR.sessionHash
    };
    for (var k in (felder || {})) a[k] = felder[k];
    return a;
  }

  HR.agent = HR.agent || {};
  HR.agent.SZENARIO_ID = SZENARIO_ID;
  HR.agent.STOERUNGEN = STOERUNGEN;
  HR.agent.mitDurchsetzung = mitDurchsetzung;
  HR.agent.neuerSchritt = neuerSchritt;
  HR.agent.betragAus = betragAus;
  HR.agent.ergebnis = ergebnis;
  HR.agent.anfragePruefen = anfragePruefen;
  HR.agent.anfrage = anfrage;

  /** Waehlt den Runner passend zum Modus. */
  HR.agent.aktiver = function () {
    return HR.config.modus === 'live' && HR.agent.live ? HR.agent.live : HR.agent.mock;
  };
})(window.HR = window.HR || {});
