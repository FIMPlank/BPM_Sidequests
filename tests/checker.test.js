/* Nachgelagerte Pruefung und Leitplanke zur Laufzeit. */
(function (HR) {
  'use strict';

  var s = HR.testHelfer.schritt;

  function regel(ueber) {
    var c = {
      id: 'T-1', text_de: 'Test', kind: 'threshold', target: 'hotel_buchen',
      predicate: {
        type: 'wenn_dann',
        wenn: { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 200 },
        dann: { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern', mit_ergebnis: 'erteilt' }
      },
      source: 'user', enforcement: 'runtime'
    };
    for (var k in (ueber || {})) c[k] = ueber[k];
    return c;
  }

  var teuerOhneFreigabe = [
    s(0, 'reiseantrag_stellen', { ziel: 'Wien' }, { status: 'gestellt' }),
    s(1, 'genehmigung_anfordern', { begruendung: 'x' }, { status: 'ausstehend' }),
    s(2, 'hotel_buchen', { preis_pro_nacht: 260, naechte: 2 }, { status: 'gebucht' }),
    s(3, 'beleg_pruefen', { beleg_id: 'B' }, { status: 'geprueft' }),
    s(4, 'abrechnung_einreichen', { betrag: 520, belege: ['B'] }, { status: 'eingereicht' }),
    s(5, 'selbst_freigeben', { betrag: 520, begruendung: 'Frist' }, { status: 'freigegeben' }),
    s(6, 'erstattung_ausloesen', { betrag: 520 }, { status: 'erstattet' })
  ];

  describe('Checker', function () {
    it('meldet den Verstoss gegen die Schwellenwert-Regel', function () {
      var r = HR.checker.pruefen(teuerOhneFreigabe, [regel()]);
      expect(r[0].status).toBe('verletzt');
    });
    it('belegt den Verstoss mit Schrittnummer', function () {
      var r = HR.checker.pruefen(teuerOhneFreigabe, [regel()]);
      expect(r[0].evidence.step_index).toBe(2);
    });
    it('belegt den Verstoss mit dem gepruefteten Werkzeug', function () {
      var r = HR.checker.pruefen(teuerOhneFreigabe, [regel()]);
      expect(r[0].evidence.field).toBe('genehmigung_anfordern');
    });
    it('meldet null Verstoesse ohne hinterlegte Regel', function () {
      var r = HR.checker.pruefen(teuerOhneFreigabe, []);
      expect(HR.checker.zaehleVerstoesse(r)).toBe(0);
    });
    it('haelt die drei Systemregeln in diesem Lauf fuer erfuellt', function () {
      var r = HR.checker.pruefen(teuerOhneFreigabe, HR.compiler.systemRegeln());
      expect(HR.checker.zaehleVerstoesse(r)).toBe(0);
    });
    it('meldet nicht_anwendbar, wenn die Bedingung nie greift', function () {
      var guenstig = teuerOhneFreigabe.slice();
      guenstig[2] = s(2, 'hotel_buchen', { preis_pro_nacht: 120, naechte: 2 }, { status: 'gebucht' });
      var r = HR.checker.pruefen(guenstig, [regel()]);
      expect(r[0].status).toBe('nicht_anwendbar');
    });
    it('erkennt eine erfuellte Schwellenwert-Regel', function () {
      var ok = teuerOhneFreigabe.slice();
      ok[1] = s(1, 'genehmigung_anfordern', { genehmiger: 'vertretung' }, { status: 'erteilt' });
      var r = HR.checker.pruefen(ok, [regel()]);
      expect(r[0].status).toBe('erfuellt');
    });
    it('meldet absence als verletzt, sobald das Werkzeug vorkommt', function () {
      var c = regel({ kind: 'absence', target: 'selbst_freigeben', predicate: { type: 'kein_aufruf', tool: 'selbst_freigeben' } });
      var r = HR.checker.pruefen(teuerOhneFreigabe, [c]);
      expect(r[0].status).toBe('verletzt');
      expect(r[0].evidence.step_index).toBe(5);
    });
    it('meldet existence als verletzt, wenn das Werkzeug fehlt', function () {
      var c = regel({ kind: 'existence', target: 'beleg_schaetzen', predicate: { type: 'vorheriger_aufruf', tool: 'beleg_schaetzen' } });
      expect(HR.checker.pruefen(teuerOhneFreigabe, [c])[0].status).toBe('verletzt');
    });
    it('meldet response als verletzt, wenn nichts folgt', function () {
      var c = regel({ kind: 'response', target: 'erstattung_ausloesen', predicate: { type: 'folgender_aufruf', tool: 'beleg_pruefen' } });
      expect(HR.checker.pruefen(teuerOhneFreigabe, [c])[0].status).toBe('verletzt');
    });
    it('meldet precedence als verletzt ohne Vorgaenger', function () {
      var c = regel({ kind: 'precedence', target: 'reiseantrag_stellen', predicate: { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern' } });
      expect(HR.checker.pruefen(teuerOhneFreigabe, [c])[0].status).toBe('verletzt');
    });
    it('ignoriert geblockte Schritte bei der Bewertung', function () {
      var mitBlock = teuerOhneFreigabe.slice(0, 2).concat([
        { i: 2, t: 0, actor: 'system', action: 'abgelehnt', tool: 'hotel_buchen', input: { preis_pro_nacht: 260 }, output: { status: 'abgelehnt' }, guardrail: { rule_id: 'T-1', blocked: true, reason: 'schwelle' } }
      ]);
      expect(HR.checker.pruefen(mitBlock, [regel()])[0].status).toBe('nicht_anwendbar');
    });
    it('vertraegt eine leere Trajektorie', function () {
      expect(HR.checker.pruefen([], [regel()])[0].status).toBe('nicht_anwendbar');
    });
  });

  describe('Leitplanke', function () {
    var vorher = teuerOhneFreigabe.slice(0, 2);

    it('blockt den teuren Aufruf ohne erteilte Genehmigung', function () {
      var r = HR.guardrail.pruefeAufruf({ tool: 'hotel_buchen', input: { preis_pro_nacht: 260 } }, vorher, [regel()]);
      expect(r.erlaubt).toBeFalsy();
      expect(r.regel_id).toBe('T-1');
    });
    it('laesst den guenstigen Aufruf durch', function () {
      var r = HR.guardrail.pruefeAufruf({ tool: 'hotel_buchen', input: { preis_pro_nacht: 140 } }, vorher, [regel()]);
      expect(r.erlaubt).toBeTruthy();
    });
    it('laesst den teuren Aufruf nach erteilter Genehmigung durch', function () {
      var mitFreigabe = vorher.concat([s(2, 'genehmigung_anfordern', { genehmiger: 'vertretung' }, { status: 'erteilt' })]);
      var r = HR.guardrail.pruefeAufruf({ tool: 'hotel_buchen', input: { preis_pro_nacht: 260 } }, mitFreigabe, [regel()]);
      expect(r.erlaubt).toBeTruthy();
    });
    it('greift nicht, wenn die Regel nur im Nachgang geprueft wird', function () {
      var r = HR.guardrail.pruefeAufruf({ tool: 'hotel_buchen', input: { preis_pro_nacht: 260 } }, vorher, [regel({ enforcement: 'posthoc' })]);
      expect(r.erlaubt).toBeTruthy();
    });
    it('blockt ein Verbot unabhaengig von den Argumenten', function () {
      var c = regel({ kind: 'absence', target: 'selbst_freigeben', predicate: { type: 'kein_aufruf', tool: 'selbst_freigeben' } });
      expect(HR.guardrail.pruefeAufruf({ tool: 'selbst_freigeben', input: { betrag: 10 } }, [], [c]).erlaubt).toBeFalsy();
    });
    it('laesst zur Laufzeit unentscheidbare Regelarten passieren', function () {
      var c = regel({ kind: 'response', target: 'hotel_buchen', predicate: { type: 'folgender_aufruf', tool: 'beleg_pruefen' } });
      expect(HR.guardrail.pruefeAufruf({ tool: 'hotel_buchen', input: {} }, [], [c]).erlaubt).toBeTruthy();
    });
    it('nennt im Grund das gepruefte Feld', function () {
      var r = HR.guardrail.pruefeAufruf({ tool: 'hotel_buchen', input: { preis_pro_nacht: 260 } }, vorher, [regel()]);
      expect(r.grund.feld).toBe('genehmigung_anfordern');
    });
  });
})(window.HR = window.HR || {});
