/* Durchlaufzeit: Schritte plus feste Wartezeit je menschlicher Freigabe. */
(function (HR) {
  'use strict';

  function schritt(felder) {
    var s = { i: 0, t: 0, actor: 'agent', action: 'werkzeug_aufruf', tool: null, input: {}, output: {}, guardrail: null };
    for (var k in (felder || {})) s[k] = felder[k];
    return s;
  }

  describe('Durchlaufzeit', function () {
    it('rechnet einen leeren Lauf auf null', function () {
      var d = HR.latency.durchlaufzeit([]);
      expect(d.schritte).toBe(0);
      expect(d.freigaben).toBe(0);
      expect(d.minuten).toBe(0);
    });
    it('rechnet je Schritt eine feste Zeit', function () {
      var d = HR.latency.durchlaufzeit([schritt({ tool: 'hotel_buchen' }), schritt({ tool: 'beleg_pruefen' })]);
      expect(d.schritte).toBe(2);
      expect(d.minuten).toBe(2 * HR.latency.MINUTEN_JE_SCHRITT);
    });
    it('schlaegt je menschlicher Freigabe eine feste Wartezeit auf', function () {
      var ohne = HR.latency.durchlaufzeit([schritt({ tool: 'hotel_buchen' })]);
      var mit = HR.latency.durchlaufzeit([schritt({ tool: 'genehmigung_anfordern' })]);
      expect(mit.freigaben).toBe(1);
      expect(mit.minuten - ohne.minuten).toBe(HR.latency.MINUTEN_JE_FREIGABE);
    });
    it('zaehlt einen ausdruecklichen Kontrollpunkt als Freigabe', function () {
      var d = HR.latency.durchlaufzeit([schritt({ action: 'freigabe', tool: 'kontrollpunkt' })]);
      expect(d.freigaben).toBe(1);
    });
    it('zaehlt einen abgewiesenen Aufruf nicht als Freigabe', function () {
      var d = HR.latency.durchlaufzeit([
        schritt({ tool: 'genehmigung_anfordern', guardrail: { rule_id: 'U-1', blocked: true, reason: 'regel' } })
      ]);
      expect(d.freigaben).toBe(0);
      expect(d.minuten).toBe(HR.latency.MINUTEN_JE_SCHRITT);
    });
    it('macht Wartezeit teurer als Rechenzeit', function () {
      expect(HR.latency.MINUTEN_JE_FREIGABE).toBeGreaterThan(HR.latency.MINUTEN_JE_SCHRITT * 20);
    });
    it('laesst beide Saetze von aussen setzen', function () {
      var d = HR.latency.durchlaufzeit(
        [schritt({ tool: 'genehmigung_anfordern' })],
        { minutenJeSchritt: 1, minutenJeFreigabe: 10 });
      expect(d.minuten).toBe(11);
    });
    it('waechst streng mit der Zahl der Freigaben', function () {
      var eine = HR.latency.durchlaufzeit([schritt({ tool: 'genehmigung_anfordern' })]).minuten;
      var zwei = HR.latency.durchlaufzeit([
        schritt({ tool: 'genehmigung_anfordern' }), schritt({ tool: 'genehmigung_anfordern' })
      ]).minuten;
      expect(zwei).toBeGreaterThan(eine);
    });
    it('schreibt Minuten, Stunden und Tage lesbar', function () {
      expect(HR.latency.text(0)).toBe('0 min');
      expect(HR.latency.text(45)).toBe('45 min');
      expect(HR.latency.text(60)).toBe('1 h');
      expect(HR.latency.text(135)).toBe('2 h 15 min');
      expect(HR.latency.text(1440)).toBe('1 d');
      expect(HR.latency.text(1560)).toBe('1 d 2 h');
    });
    it('bleibt rein: gleiche Trajektorie, gleiche Zahl', function () {
      var t = [schritt({ tool: 'genehmigung_anfordern' }), schritt({ tool: 'hotel_buchen' })];
      expect(HR.latency.durchlaufzeit(t).minuten).toBe(HR.latency.durchlaufzeit(t).minuten);
      expect(t.length).toBe(2);   // die Trajektorie wurde nicht angefasst
    });
    it('rechnet einen echten Lauf des skriptierten Agenten durch', function () {
      var e = HR.agent.mock.laufSynchron(HR.agent.anfrage({
        disturbances: ['hotel_ausgebucht', 'genehmiger_urlaub'],
        constraints: HR.compiler.systemRegeln(),
        enforcement: 'runtime'
      }));
      var d = HR.latency.durchlaufzeit(e.trajectory);
      expect(d.schritte).toBe(e.trajectory.length);
      expect(d.freigaben).toBeGreaterThan(0);
      expect(d.minuten).toBeGreaterThan(HR.latency.MINUTEN_JE_FREIGABE);
    });
  });
})(window.HR = window.HR || {});
