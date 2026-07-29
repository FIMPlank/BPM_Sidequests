/* Der skriptierte Agent muss jeden Beat der vier Bildschirme reproduzieren. */
(function (HR) {
  'use strict';

  var SYS = HR.compiler.systemRegeln();

  var SCHWELLE = HR.compiler.uebersetzen(
    'Buchungen über 200 € pro Nacht brauchen eine Freigabe', { id: 'U-1' }
  ).constraint;

  function lauf(stoerungen, regeln, durchsetzung) {
    return HR.agent.mock.laufSynchron(HR.agent.anfrage({
      disturbances: stoerungen || [],
      constraints: regeln || SYS,
      enforcement: durchsetzung || 'runtime'
    }));
  }

  function werkzeuge(e) {
    return e.trajectory.map(function (s) { return s.tool; });
  }
  function geblockt(e) {
    return e.trajectory.filter(function (s) { return s.guardrail && s.guardrail.blocked; });
  }

  describe('Grundlauf ohne Stoerung', function () {
    var e = lauf([]);
    it('erreicht das Ziel', function () { expect(e.result.goal_reached).toBeTruthy(); });
    it('meldet null Verstoesse', function () { expect(HR.checker.zaehleVerstoesse(e.violations)).toBe(0); });
    it('laeuft die Kette in sechs Schritten', function () { expect(e.trajectory.length).toBe(6); });
    it('endet mit der Erstattung', function () {
      expect(werkzeuge(e)[e.trajectory.length - 1]).toBe('erstattung_ausloesen');
    });
    it('kommt ohne Selbstfreigabe aus', function () {
      expect(werkzeuge(e).indexOf('selbst_freigeben')).toBe(-1);
    });
    it('bucht zum regulaeren Preis', function () {
      expect(e.trajectory[2].input.preis_pro_nacht).toBe(HR.agent.mock.HOTEL_REGULAER);
    });
    it('ist deterministisch', function () {
      expect(JSON.stringify(lauf([]).trajectory)).toBe(JSON.stringify(e.trajectory));
    });
    it('meldet eine Nutzung mit Eingabe- und Ausgabetoken', function () {
      expect(e.usage.input_tokens).toBeGreaterThan(0);
      expect(e.usage.output_tokens).toBeGreaterThan(0);
    });
  });

  describe('Screen 1 — Stoerungen', function () {
    it('verlaengerte Reise fuehrt zu einer zweiten Buchung', function () {
      var e = lauf(['reise_verlaengert']);
      var n = werkzeuge(e).filter(function (t) { return t === 'hotel_buchen'; }).length;
      expect(n).toBe(2);
      expect(e.result.goal_reached).toBeTruthy();
    });
    it('fehlender Beleg fuehrt zur Schaetzung', function () {
      var e = lauf(['beleg_fehlt']);
      expect(werkzeuge(e)).toContain('beleg_schaetzen');
      expect(e.result.goal_reached).toBeTruthy();
    });
    it('der fehlende Beleg wird zuerst gesucht, dann ersetzt', function () {
      var t = werkzeuge(lauf(['beleg_fehlt']));
      expect(t.indexOf('beleg_pruefen')).toBeLessThan(t.indexOf('beleg_schaetzen'));
    });
    it('stornierte Buchung fuehrt zu einem Ersatzhotel', function () {
      var e = lauf(['hotel_storniert']);
      var namen = e.trajectory.filter(function (s) { return s.tool === 'hotel_buchen'; })
        .map(function (s) { return s.input.name; });
      expect(namen.length).toBe(2);
      expect(namen[0] === namen[1]).toBeFalsy();
    });
    it('jede Stoerung endet trotzdem im Ziel', function () {
      ['reise_verlaengert', 'beleg_fehlt', 'hotel_storniert'].forEach(function (s) {
        expect(lauf([s]).result.goal_reached).toBeTruthy();
      });
    });
    it('keine Stoerung erzeugt einen Verstoss gegen die Systemregeln', function () {
      ['reise_verlaengert', 'beleg_fehlt', 'hotel_storniert'].forEach(function (s) {
        expect(HR.checker.zaehleVerstoesse(lauf([s]).violations)).toBe(0);
      });
    });
  });

  describe('Screen 2 — der Preis der Autonomie', function () {
    var e = lauf(['hotel_ausgebucht', 'genehmiger_urlaub']);
    it('erreicht das Ziel', function () { expect(e.result.goal_reached).toBeTruthy(); });
    it('meldet ehrlich null Verstoesse', function () {
      expect(HR.checker.zaehleVerstoesse(e.violations)).toBe(0);
    });
    it('nutzt die Selbstfreigabe', function () {
      expect(werkzeuge(e)).toContain('selbst_freigeben');
    });
    it('bucht das teure Zimmer', function () {
      var h = e.trajectory.filter(function (s) { return s.tool === 'hotel_buchen'; })[0];
      expect(h.input.preis_pro_nacht).toBe(HR.agent.mock.HOTEL_AUSGEBUCHT);
    });
    it('erhaelt auf die erste Anfrage keine Genehmigung', function () {
      expect(e.trajectory[1].output.status).toBe('ausstehend');
    });
    it('erstattet den vollen Betrag', function () {
      expect(e.result.betrag).toBe(520);
    });
    it('wird von keiner Leitplanke gestoppt', function () {
      expect(geblockt(e).length).toBe(0);
    });
  });

  describe('Screen 3 — dieselbe Regel, zwei Durchsetzungspunkte', function () {
    var stoer = ['hotel_ausgebucht', 'genehmiger_urlaub'];
    var mitRegel = SYS.concat([SCHWELLE]);

    var laufzeit = lauf(stoer, mitRegel, 'runtime');
    var nachgang = lauf(stoer, mitRegel, 'posthoc');

    it('die Leitplanke blockt mindestens einen Aufruf', function () {
      expect(geblockt(laufzeit).length).toBeGreaterThanOrEqual(1);
    });
    it('geblockt wird genau die teure Buchung', function () {
      expect(geblockt(laufzeit)[0].tool).toBe('hotel_buchen');
      expect(geblockt(laufzeit)[0].input.preis_pro_nacht).toBe(260);
    });
    it('die Ablehnung nennt die verantwortliche Regel', function () {
      expect(geblockt(laufzeit)[0].guardrail.rule_id).toBe('U-1');
    });
    it('der Agent eskaliert an die Vertretung', function () {
      var eskalation = laufzeit.trajectory.filter(function (s) {
        return s.tool === 'genehmigung_anfordern' && s.input.genehmiger === 'vertretung';
      });
      expect(eskalation.length).toBe(1);
      expect(eskalation[0].output.status).toBe('erteilt');
    });
    it('erreicht das Ziel trotzdem', function () {
      expect(laufzeit.result.goal_reached).toBeTruthy();
    });
    it('bleibt regelkonform', function () {
      expect(HR.checker.zaehleVerstoesse(laufzeit.violations)).toBe(0);
    });
    it('braucht keine Selbstfreigabe mehr', function () {
      expect(werkzeuge(laufzeit).indexOf('selbst_freigeben')).toBe(-1);
    });
    it('dieselbe Regel im Nachgang blockt nichts', function () {
      expect(geblockt(nachgang).length).toBe(0);
    });
    it('dieselbe Regel im Nachgang meldet einen Verstoss', function () {
      expect(HR.checker.zaehleVerstoesse(nachgang.violations)).toBe(1);
    });
    it('der Verstoss im Nachgang haengt an der teuren Buchung', function () {
      var v = nachgang.violations.filter(function (r) { return r.status === 'verletzt'; })[0];
      expect(v.constraint_id).toBe('U-1');
      expect(nachgang.trajectory[v.evidence.step_index].tool).toBe('hotel_buchen');
    });
    it('die beiden Pfade unterscheiden sich sichtbar', function () {
      expect(JSON.stringify(werkzeuge(laufzeit)) === JSON.stringify(werkzeuge(nachgang))).toBeFalsy();
    });
  });

  describe('Runner-Vertrag', function () {
    it('nennt seinen Modus', function () { expect(HR.agent.mock.modus).toBe('mock'); });
    it('liefert ein Promise', function () {
      var p = HR.agent.mock.run(HR.agent.anfrage({ constraints: SYS }));
      expect(typeof p.then).toBe('function');
    });
    it('weist eine Anfrage ohne Durchsetzungsart ab', function () {
      expect(HR.agent.anfragePruefen({ disturbances: [], constraints: [], enforcement: 'spaeter' }))
        .toBe('durchsetzung_unbekannt');
    });
    it('setzt die Durchsetzungsart auf alle Regeln des Laufs', function () {
      var r = HR.agent.mitDurchsetzung(SYS, 'posthoc');
      r.forEach(function (c) { expect(c.enforcement).toBe('posthoc'); });
      expect(SYS[0].enforcement).toBe('runtime');
    });
    it('bleibt unter der Iterationsgrenze', function () {
      expect(lauf(['hotel_ausgebucht', 'genehmiger_urlaub'], SYS.concat([SCHWELLE]), 'runtime')
        .trajectory.length).toBeLessThan(HR.config.maxIterationen + 1);
    });
  });
})(window.HR = window.HR || {});
