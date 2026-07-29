/**
 * Nachgelagerte Pruefung einer abgeschlossenen Trajektorie.
 * Liefert je Regel Status und Beleg. Der Beleg ist Pflicht — Screen 4 haengt daran.
 *
 * @typedef {Object} CheckResult
 * @property {string} constraint_id
 * @property {'erfuellt'|'verletzt'|'nicht_anwendbar'} status
 * @property {{step_index:number|null, field:string|null, actual_value:*}} evidence
 */
(function (HR) {
  'use strict';

  function aufrufe(trajektorie) {
    var out = [];
    for (var i = 0; i < trajektorie.length; i++) {
      var s = trajektorie[i];
      if (s.tool && !(s.guardrail && s.guardrail.blocked)) out.push(s);
    }
    return out;
  }

  function kontextFuer(trajektorie, index) {
    return {
      aufruf: trajektorie[index],
      vorher: trajektorie.slice(0, index),
      nachher: trajektorie.slice(index + 1),
      alle: trajektorie
    };
  }

  function beleg(stepIndex, feld, wert) {
    return {
      step_index: (stepIndex === undefined || stepIndex === null) ? null : stepIndex,
      field: feld === undefined ? null : feld,
      actual_value: wert === undefined ? null : wert
    };
  }

  function ergebnis(c, status, evidence) {
    return {
      constraint_id: c.id,
      kind: c.kind,
      target: c.target,
      status: status,
      evidence: evidence
    };
  }

  /**
   * @param {Array} trajektorie
   * @param {Array} constraints
   * @returns {CheckResult[]}
   */
  function pruefen(trajektorie, constraints) {
    trajektorie = trajektorie || [];
    var offene = aufrufe(trajektorie);
    var out = [];

    for (var k = 0; k < (constraints || []).length; k++) {
      var c = constraints[k];

      if (c.kind === 'absence') {
        var treffer = null;
        for (var a = 0; a < offene.length; a++) {
          if (offene[a].tool === c.target) { treffer = offene[a]; break; }
        }
        out.push(treffer
          ? ergebnis(c, 'verletzt', beleg(treffer.i, c.target, treffer.tool))
          : ergebnis(c, 'erfuellt', beleg(null, c.target, null)));
        continue;
      }

      if (c.kind === 'existence') {
        var gefunden = null;
        for (var e = 0; e < offene.length; e++) {
          if (HR.constraints.trifftAufruf(offene[e], c.target, c.predicate && c.predicate.mit_ergebnis)) {
            gefunden = offene[e]; break;
          }
        }
        out.push(gefunden
          ? ergebnis(c, 'erfuellt', beleg(gefunden.i, c.target, gefunden.output && gefunden.output.status))
          : ergebnis(c, 'verletzt', beleg(null, c.target, null)));
        continue;
      }

      // response | precedence | threshold: gelten je Aufruf des Zielwerkzeugs
      var angewendet = false;
      var verletzung = null;
      for (var i = 0; i < trajektorie.length && !verletzung; i++) {
        var s = trajektorie[i];
        if (!s.tool || s.tool !== c.target) continue;
        if (s.guardrail && s.guardrail.blocked) continue;
        var r = HR.constraints.auswerten(c.predicate, kontextFuer(trajektorie, i));
        if (r.nicht_anwendbar) continue;
        angewendet = true;
        if (!r.wert) verletzung = ergebnis(c, 'verletzt', beleg(s.i, r.feld, r.tatsaechlich));
      }

      if (verletzung) out.push(verletzung);
      else if (angewendet) out.push(ergebnis(c, 'erfuellt', beleg(null, c.target, null)));
      else out.push(ergebnis(c, 'nicht_anwendbar', beleg(null, c.target, null)));
    }
    return out;
  }

  function zaehleVerstoesse(ergebnisse) {
    var n = 0;
    for (var i = 0; i < (ergebnisse || []).length; i++) {
      if (ergebnisse[i].status === 'verletzt') n++;
    }
    return n;
  }

  HR.checker = { pruefen: pruefen, zaehleVerstoesse: zaehleVerstoesse, aufrufe: aufrufe };
})(window.HR = window.HR || {});
