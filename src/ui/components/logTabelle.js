/**
 * Die Trajektorie als Log. Zwei Ansichten aus derselben Quelle:
 * `kurz` fuer die Bildschirme 2 und 3, `voll` fuer den Audit.
 * Das Log ist ein Log — deshalb durchgehend Mono mit Tabellenziffern.
 */
(function (HR) {
  'use strict';

  function kurzInput(input) {
    var teile = [];
    for (var k in input) {
      if (!Object.prototype.hasOwnProperty.call(input, k)) continue;
      var v = input[k];
      if (Array.isArray(v)) v = '[' + v.length + ']';
      if (typeof v === 'string' && v.length > 22) v = v.slice(0, 21) + '…';
      teile.push(k + '=' + v);
    }
    return teile.join(' ');
  }

  /** Kompakte Liste eines Laufs. */
  function kurz(traj) {
    var e = HR.render.esc;
    return '<ol class="ablauf">' + (traj || []).map(function (s) {
      return '<li class="ablauf__zeile' + (s.guardrail && s.guardrail.blocked ? ' ist-geblockt' : '') + '">' +
        '<span class="ablauf__nr mono">' + (s.i + 1) + '</span>' +
        '<span class="ablauf__tool mono">' + e(s.tool) + '</span>' +
        '<span class="ablauf__input mono">' + e(kurzInput(s.input)) + '</span>' +
        '<span class="ablauf__ergebnis mono">' + e(s.output && s.output.status) + '</span></li>';
    }).join('') + '</ol>';
  }

  /** Welche Regeln wurden fuer diesen Schritt ausgewertet? */
  function checkFuerSchritt(schritt, ergebnisse) {
    var out = [];
    (ergebnisse || []).forEach(function (r) {
      if (r.evidence && r.evidence.step_index === schritt.i) {
        out.push({ id: r.constraint_id, status: r.status, evidence: r.evidence });
      }
    });
    if (schritt.guardrail && schritt.guardrail.rule_id) {
      out.push({
        id: schritt.guardrail.rule_id,
        status: schritt.guardrail.blocked ? 'verletzt' : 'erfuellt',
        evidence: { step_index: schritt.i, field: schritt.guardrail.reason, actual_value: null },
        leitplanke: true
      });
    }
    return out;
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.logTabelle = {
    kurz: kurz,
    kurzInput: kurzInput,
    checkFuerSchritt: checkFuerSchritt
  };
})(window.HR = window.HR || {});
