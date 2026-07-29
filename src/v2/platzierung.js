/**
 * Wo soll eine Regel greifen?
 *
 * Dieselbe Regel, derselbe Fall, dieselben Stoerungen — drei Orte:
 *
 *   imperativ    Ein harter Kontrollpunkt vor der Aktion. Ein Mensch gibt frei.
 *                Sicher, aber es kostet eine Prozessvariante und eine Wartezeit.
 *   leitplanke   Die Werkzeuggrenze weist den Aufruf ab, der Agent plant um.
 *                Kein Mensch wartet, der Weg wird laenger, das Ziel bleibt.
 *   nachgang     Niemand haelt etwas auf. Der Checker findet es hinterher —
 *                da ist das Geld schon weg.
 *
 * Rein und ohne DOM. Der skriptierte Agent unter `src/agent/` bleibt
 * unangetastet; der Kontrollpunkt wird der fertigen Trajektorie vorangestellt.
 */
(function (HR) {
  'use strict';

  var PLATZIERUNGEN = ['imperativ', 'leitplanke', 'nachgang'];

  /** Die Stoerungen aus Akt 2. Nur mit denselben Stoerungen ist der Vergleich einer. */
  var STOERUNGEN = ['hotel_ausgebucht', 'genehmiger_urlaub'];

  /** Sachbearbeitung je menschlicher Freigabe, in Cent. */
  var CENT_JE_FREIGABE = 350;

  /** Die Durchsetzungsart, die der Ort verlangt. */
  function durchsetzung(ort) {
    return ort === 'nachgang' ? 'posthoc' : 'runtime';
  }

  /**
   * Der Kontrollpunkt: ein Schritt, den kein Agent erzeugt, sondern die
   * Organisation. Er steht vor dem ersten Aufruf des geregelten Werkzeugs.
   */
  function kontrollpunkt(regel) {
    return {
      i: 0,
      t: 0,
      actor: 'system',
      action: 'freigabe',
      tool: 'kontrollpunkt',
      input: { regel: regel.id, werkzeug: regel.target },
      output: { status: 'freigegeben' },
      guardrail: { rule_id: regel.id, blocked: false, reason: 'kontrollpunkt' }
    };
  }

  /** Setzt den Kontrollpunkt ein und nummeriert die Schritte neu. */
  function mitKontrollpunkt(trajektorie, regel) {
    var stelle = -1;
    for (var i = 0; i < trajektorie.length; i++) {
      if (trajektorie[i].tool === regel.target) { stelle = i; break; }
    }
    if (stelle === -1) stelle = 0;
    var neu = trajektorie.slice(0, stelle)
      .concat([kontrollpunkt(regel)])
      .concat(trajektorie.slice(stelle));
    return neu.map(function (s, k) {
      var kopie = {};
      for (var f in s) if (Object.prototype.hasOwnProperty.call(s, f)) kopie[f] = s[f];
      kopie.i = k;
      kopie.t = k * 400 + 120;
      return kopie;
    });
  }

  /**
   * Was bleibt an Risiko uebrig? Was nicht verhindert wurde, ist passiert:
   * dann steht der ausgezahlte Betrag im Feuer. Wurde es verhindert, null.
   */
  function restrisiko(ergebnis) {
    var verstoesse = HR.checker.zaehleVerstoesse(ergebnis.violations);
    if (!verstoesse) return { verstoesse: 0, betrag: 0 };
    return { verstoesse: verstoesse, betrag: ergebnis.result.betrag || 0 };
  }

  /**
   * Ein Lauf an einem Ort.
   * @param {string} ort
   * @param {{regel:Object, regeln:Array, stoerungen?:string[]}} anfrage
   * @returns {{ort:string, ergebnis:Object, trajektorie:Array, zeit:Object,
   *            centGesamt:number, centKontext:number, restrisiko:Object}}
   */
  function lauf(ort, anfrage) {
    var regeln = anfrage.regeln || [];
    var stoerungen = anfrage.stoerungen || STOERUNGEN;
    var ergebnis = HR.agent.mock.laufSynchron(HR.agent.anfrage({
      disturbances: stoerungen,
      constraints: regeln,
      enforcement: durchsetzung(ort)
    }));

    var trajektorie = ergebnis.trajectory;
    if (ort === 'imperativ' && anfrage.regel) {
      trajektorie = mitKontrollpunkt(trajektorie, anfrage.regel);
    }

    var zeit = HR.latency.durchlaufzeit(trajektorie);
    var kontext = HR.tokens.schaetzen(regeln).cent;

    return {
      ort: ort,
      ergebnis: {
        trajectory: trajektorie,
        result: ergebnis.result,
        usage: ergebnis.usage,
        violations: ergebnis.violations
      },
      trajektorie: trajektorie,
      zeit: zeit,
      centKontext: kontext,
      centGesamt: kontext + zeit.freigaben * CENT_JE_FREIGABE,
      restrisiko: restrisiko(ergebnis)
    };
  }

  /** Alle drei Orte, in fester Reihenfolge. */
  function alle(anfrage) {
    return PLATZIERUNGEN.map(function (ort) { return lauf(ort, anfrage); });
  }

  /** Kennung einer Trajektorie — zwei gleiche Kennungen sind derselbe Weg. */
  function kennung(trajektorie) {
    return (trajektorie || []).map(function (s) {
      return s.tool + ':' + ((s.guardrail && s.guardrail.blocked) ? 'abgelehnt' : (s.output && s.output.status));
    }).join(' > ');
  }

  HR.platzierung = {
    PLATZIERUNGEN: PLATZIERUNGEN,
    STOERUNGEN: STOERUNGEN,
    CENT_JE_FREIGABE: CENT_JE_FREIGABE,
    durchsetzung: durchsetzung,
    kontrollpunkt: kontrollpunkt,
    mitKontrollpunkt: mitKontrollpunkt,
    restrisiko: restrisiko,
    lauf: lauf,
    alle: alle,
    kennung: kennung
  };
})(window.HR = window.HR || {});
