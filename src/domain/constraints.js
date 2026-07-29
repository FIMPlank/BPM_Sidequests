/**
 * Regelmodell: geschlossene Praedikat-Union, Validierung, Auswertung.
 * Es gibt kein eval, kein new Function und keinen generierten Code.
 * Was der Compiler nicht in diese Union abbilden kann, wird abgelehnt.
 *
 * @typedef {Object} Constraint
 * @property {string} id
 * @property {string} text_de              exakt der eingegebene Text
 * @property {'response'|'precedence'|'absence'|'threshold'|'existence'} kind
 * @property {string} target               Werkzeugname
 * @property {Predicate} predicate
 * @property {'system'|'user'} source
 * @property {'posthoc'|'runtime'} enforcement
 *
 * @typedef {Object} Predicate
 * @property {'feld_vergleich'|'vorheriger_aufruf'|'folgender_aufruf'|'kein_aufruf'|'und'|'wenn_dann'} type
 */
(function (HR) {
  'use strict';

  var PRAEDIKAT_ARTEN = [
    'feld_vergleich',     // Feld des Aufruf-Inputs gegen einen Wert
    'vorheriger_aufruf',  // es gab vorher einen Aufruf von tool (optional mit Ergebnis)
    'folgender_aufruf',   // es folgt spaeter ein Aufruf von tool
    'kein_aufruf',        // tool kommt in der gesamten Trajektorie nicht vor
    'und',               // Konjunktion
    'wenn_dann'          // Implikation: wenn <Bedingung>, dann <Forderung>
  ];

  var ARTEN = ['response', 'precedence', 'absence', 'threshold', 'existence'];
  var OPERATOREN = ['>', '>=', '<', '<=', '==', '!='];

  function istObjekt(v) { return v && typeof v === 'object'; }

  /** Strenge Validierung. Alles ausserhalb der Union ist ungueltig. */
  function praedikatGueltig(p) {
    if (!istObjekt(p) || PRAEDIKAT_ARTEN.indexOf(p.type) === -1) return false;
    switch (p.type) {
      case 'feld_vergleich':
        return typeof p.feld === 'string' && p.feld.length > 0 &&
          OPERATOREN.indexOf(p.op) !== -1 &&
          (typeof p.wert === 'number' || typeof p.wert === 'string');
      case 'vorheriger_aufruf':
      case 'folgender_aufruf':
        return typeof p.tool === 'string' && HR.tools.namen.indexOf(p.tool) !== -1 &&
          (p.mit_ergebnis === undefined || typeof p.mit_ergebnis === 'string');
      case 'kein_aufruf':
        return typeof p.tool === 'string' && HR.tools.namen.indexOf(p.tool) !== -1;
      case 'und':
        if (!Array.isArray(p.teile) || p.teile.length < 2) return false;
        return p.teile.every(praedikatGueltig);
      case 'wenn_dann':
        return praedikatGueltig(p.wenn) && praedikatGueltig(p.dann);
      default:
        return false;
    }
  }

  function constraintGueltig(c) {
    return istObjekt(c) &&
      typeof c.id === 'string' && c.id.length > 0 &&
      typeof c.text_de === 'string' &&
      ARTEN.indexOf(c.kind) !== -1 &&
      HR.tools.namen.indexOf(c.target) !== -1 &&
      (c.source === 'system' || c.source === 'user') &&
      (c.enforcement === 'posthoc' || c.enforcement === 'runtime') &&
      praedikatGueltig(c.predicate);
  }

  function vergleiche(links, op, rechts) {
    var a = links, b = rechts;
    if (typeof b === 'number') {
      a = HR.tools.zahl(a);
    }
    switch (op) {
      case '>':  return a > b;
      case '>=': return a >= b;
      case '<':  return a < b;
      case '<=': return a <= b;
      case '==': return a === b;
      case '!=': return a !== b;
      default:   return false;
    }
  }

  function trifftAufruf(schritt, tool, mitErgebnis) {
    if (!schritt || schritt.tool !== tool) return false;
    if (schritt.guardrail && schritt.guardrail.blocked) return false;
    if (mitErgebnis === undefined) return true;
    return !!(schritt.output && schritt.output.status === mitErgebnis);
  }

  /**
   * Wertet ein Praedikat aus.
   * @param {Predicate} p
   * @param {{aufruf:Object, vorher:Array, nachher:Array, alle:Array}} kontext
   * @returns {{wert:boolean, feld?:string, tatsaechlich?:*}}
   */
  function auswerten(p, kontext) {
    var i, r;
    switch (p.type) {
      case 'feld_vergleich': {
        var input = (kontext.aufruf && kontext.aufruf.input) || {};
        var tat = input[p.feld];
        return { wert: vergleiche(tat, p.op, p.wert), feld: p.feld, tatsaechlich: tat };
      }
      case 'vorheriger_aufruf': {
        var v = kontext.vorher || [];
        for (i = 0; i < v.length; i++) {
          if (trifftAufruf(v[i], p.tool, p.mit_ergebnis)) {
            return { wert: true, feld: p.tool, tatsaechlich: v[i].output && v[i].output.status };
          }
        }
        return { wert: false, feld: p.tool, tatsaechlich: null };
      }
      case 'folgender_aufruf': {
        var n = kontext.nachher || [];
        for (i = 0; i < n.length; i++) {
          if (trifftAufruf(n[i], p.tool, p.mit_ergebnis)) {
            return { wert: true, feld: p.tool, tatsaechlich: n[i].output && n[i].output.status };
          }
        }
        return { wert: false, feld: p.tool, tatsaechlich: null };
      }
      case 'kein_aufruf': {
        var alle = kontext.alle || [];
        for (i = 0; i < alle.length; i++) {
          if (trifftAufruf(alle[i], p.tool, undefined)) {
            return { wert: false, feld: p.tool, tatsaechlich: alle[i].i };
          }
        }
        return { wert: true, feld: p.tool, tatsaechlich: null };
      }
      case 'und': {
        for (i = 0; i < p.teile.length; i++) {
          r = auswerten(p.teile[i], kontext);
          if (!r.wert) return r;
        }
        return { wert: true };
      }
      case 'wenn_dann': {
        var bed = auswerten(p.wenn, kontext);
        if (!bed.wert) return { wert: true, nicht_anwendbar: true, feld: bed.feld, tatsaechlich: bed.tatsaechlich };
        r = auswerten(p.dann, kontext);
        return { wert: r.wert, feld: r.feld, tatsaechlich: r.tatsaechlich, bedingung: bed };
      }
      default:
        return { wert: false };
    }
  }

  /** Strukturierte Zusammenfassung fuer die Darstellung. Kein Text hier. */
  function zusammenfassung(c) {
    var s = { kind: c.kind, target: c.target, bedingung: null, forderung: null };
    var p = c.predicate;
    if (p.type === 'wenn_dann') {
      s.bedingung = p.wenn;
      s.forderung = p.dann;
    } else {
      s.forderung = p;
    }
    return s;
  }

  var laufendeNummer = 0;
  function neueId(praefix) {
    laufendeNummer += 1;
    return (praefix || 'R') + '-' + laufendeNummer;
  }

  HR.constraints = {
    PRAEDIKAT_ARTEN: PRAEDIKAT_ARTEN,
    ARTEN: ARTEN,
    OPERATOREN: OPERATOREN,
    praedikatGueltig: praedikatGueltig,
    constraintGueltig: constraintGueltig,
    auswerten: auswerten,
    vergleiche: vergleiche,
    trifftAufruf: trifftAufruf,
    zusammenfassung: zusammenfassung,
    neueId: neueId
  };
})(window.HR = window.HR || {});
