/**
 * Leitplanke zur Laufzeit: Durchsetzung an der Werkzeuggrenze.
 * Der Aufruf wird geprueft, bevor er ausgefuehrt wird. Wird er abgelehnt,
 * geht die Ablehnung als Werkzeugergebnis zurueck an den Agenten — er muss neu planen.
 *
 * Nicht jede Regelart ist zur Laufzeit entscheidbar: `response` und `existence`
 * sprechen ueber die Zukunft eines Laufs und koennen erst im Nachgang geprueft
 * werden. Sie passieren die Leitplanke und werden vom Checker bewertet.
 */
(function (HR) {
  'use strict';

  var ZUR_LAUFZEIT_ENTSCHEIDBAR = ['threshold', 'precedence', 'absence'];

  function anwendbar(c) {
    return c.enforcement === 'runtime' && ZUR_LAUFZEIT_ENTSCHEIDBAR.indexOf(c.kind) !== -1;
  }

  /**
   * @param {{tool:string, input:Object}} aufruf
   * @param {Array} vorher   bisherige Schritte des Laufs
   * @param {Array} constraints
   * @returns {{erlaubt:boolean, regel_id:string|null, grund:Object|null}}
   */
  function pruefeAufruf(aufruf, vorher, constraints) {
    vorher = vorher || [];
    for (var i = 0; i < (constraints || []).length; i++) {
      var c = constraints[i];
      if (!anwendbar(c) || c.target !== aufruf.tool) continue;

      if (c.kind === 'absence') {
        return {
          erlaubt: false,
          regel_id: c.id,
          grund: { kind: 'absence', target: c.target, feld: null, tatsaechlich: null }
        };
      }

      var kontext = {
        aufruf: aufruf,
        vorher: vorher,
        nachher: [],
        alle: vorher.concat([aufruf])
      };
      var r = HR.constraints.auswerten(c.predicate, kontext);
      if (r.nicht_anwendbar) continue;
      if (!r.wert) {
        return {
          erlaubt: false,
          regel_id: c.id,
          grund: { kind: c.kind, target: c.target, feld: r.feld, tatsaechlich: r.tatsaechlich }
        };
      }
    }
    return { erlaubt: true, regel_id: null, grund: null };
  }

  HR.guardrail = {
    ZUR_LAUFZEIT_ENTSCHEIDBAR: ZUR_LAUFZEIT_ENTSCHEIDBAR,
    anwendbar: anwendbar,
    pruefeAufruf: pruefeAufruf
  };
})(window.HR = window.HR || {});
