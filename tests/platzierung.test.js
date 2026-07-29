/* Akt 4, Teil 1 — derselbe Fall an drei Orten. */
(function (HR) {
  'use strict';

  var SATZ = 'Buchungen über 200 € pro Nacht brauchen eine Freigabe';

  function aufbau() {
    var regel = HR.compiler.uebersetzen(SATZ, { id: 'U-1' }).constraint;
    return {
      regel: regel,
      regeln: HR.compiler.systemRegeln().concat([regel]),
      stoerungen: HR.platzierung.STOERUNGEN
    };
  }

  describe('Platzierung einer Regel', function () {
    var a = aufbau();
    var alle = HR.platzierung.alle(a);
    function nach(ort) {
      var t = null;
      alle.forEach(function (l) { if (l.ort === ort) t = l; });
      return t;
    }

    it('kennt genau drei Orte', function () {
      expect(HR.platzierung.PLATZIERUNGEN.length).toBe(3);
      expect(alle.length).toBe(3);
      expect(alle.map(function (l) { return l.ort; }).join(',')).toBe('imperativ,leitplanke,nachgang');
    });

    it('gibt allen drei Laeufen denselben Fall und dieselben Stoerungen', function () {
      expect(HR.platzierung.STOERUNGEN.join(',')).toBe('hotel_ausgebucht,genehmiger_urlaub');
    });

    it('erzeugt drei messbar verschiedene Trajektorien', function () {
      var k = alle.map(function (l) { return HR.platzierung.kennung(l.trajektorie); });
      expect(k[0]).toBeTruthy();
      expect(k[0] === k[1]).toBeFalsy();
      expect(k[1] === k[2]).toBeFalsy();
      expect(k[0] === k[2]).toBeFalsy();
    });

    it('setzt beim Kontrollpunkt einen Freigabeschritt in den Lauf', function () {
      var imp = nach('imperativ');
      var freigaben = imp.trajektorie.filter(function (s) { return s.tool === 'kontrollpunkt'; });
      expect(freigaben.length).toBe(1);
      expect(freigaben[0].actor).toBe('system');
      expect(freigaben[0].action).toBe('freigabe');
    });

    it('stellt den Kontrollpunkt vor den geregelten Aufruf', function () {
      var t = HR.platzierung.mitKontrollpunkt([
        { i: 0, tool: 'reiseantrag_stellen', output: {}, guardrail: null },
        { i: 1, tool: 'hotel_buchen', output: {}, guardrail: null }
      ], { id: 'U-1', target: 'hotel_buchen' });
      expect(t.length).toBe(3);
      expect(t[1].tool).toBe('kontrollpunkt');
      expect(t[2].tool).toBe('hotel_buchen');
      expect(t.map(function (s) { return s.i; }).join(',')).toBe('0,1,2');
    });

    it('macht den Kontrollpunkt zum langsamsten der drei Orte', function () {
      expect(nach('imperativ').zeit.minuten).toBeGreaterThan(nach('leitplanke').zeit.minuten);
      expect(nach('imperativ').zeit.minuten).toBeGreaterThan(nach('nachgang').zeit.minuten);
    });

    it('macht den Kontrollpunkt zum teuersten der drei Orte', function () {
      expect(nach('imperativ').centGesamt).toBeGreaterThan(nach('leitplanke').centGesamt);
      expect(nach('imperativ').centGesamt).toBeGreaterThan(nach('nachgang').centGesamt);
    });

    it('laesst die Leitplanke den Aufruf abweisen und den Agenten umplanen', function () {
      var abgewiesen = nach('leitplanke').trajektorie.filter(function (s) {
        return s.guardrail && s.guardrail.blocked;
      });
      expect(abgewiesen.length).toBeGreaterThan(0);
      expect(abgewiesen[0].tool).toBe('hotel_buchen');
    });

    it('haelt im Nachgang niemanden auf', function () {
      var abgewiesen = nach('nachgang').trajektorie.filter(function (s) {
        return s.guardrail && s.guardrail.blocked;
      });
      expect(abgewiesen.length).toBe(0);
    });

    it('laesst nur im Nachgang Geld offen stehen', function () {
      expect(nach('nachgang').restrisiko.betrag).toBeGreaterThan(0);
      expect(nach('nachgang').restrisiko.verstoesse).toBeGreaterThan(0);
      expect(nach('leitplanke').restrisiko.betrag).toBe(0);
      expect(nach('imperativ').restrisiko.betrag).toBe(0);
    });

    it('waehlt je Ort die passende Durchsetzungsart', function () {
      expect(HR.platzierung.durchsetzung('imperativ')).toBe('runtime');
      expect(HR.platzierung.durchsetzung('leitplanke')).toBe('runtime');
      expect(HR.platzierung.durchsetzung('nachgang')).toBe('posthoc');
    });

    it('nennt fuer jeden Ort Durchlaufzeit, Kosten und Restrisiko', function () {
      alle.forEach(function (l) {
        expect(typeof l.zeit.minuten).toBe('number');
        expect(typeof l.centGesamt).toBe('number');
        expect(typeof l.restrisiko.betrag).toBe('number');
      });
    });

    it('bleibt bei gleicher Eingabe bei gleichem Ergebnis', function () {
      var nochmal = HR.platzierung.alle(aufbau());
      expect(HR.platzierung.kennung(nochmal[0].trajektorie))
        .toBe(HR.platzierung.kennung(alle[0].trajektorie));
    });

    it('laesst den skriptierten Agenten unberuehrt', function () {
      var roh = HR.agent.mock.laufSynchron(HR.agent.anfrage({
        disturbances: HR.platzierung.STOERUNGEN, constraints: a.regeln, enforcement: 'runtime'
      }));
      // Der Kontrollpunkt kommt obendrauf, nicht aus dem Agenten.
      expect(nach('leitplanke').trajektorie.length).toBe(roh.trajectory.length);
      expect(nach('imperativ').trajektorie.length).toBe(roh.trajectory.length + 1);
    });
  });

  describe('Akt 4 — Die Architektur', function () {
    function anfang() { return HR.store.anfang(); }
    function red(z, x) { return HR.store.reduzieren(z, x); }
    function html(z) { return HR.screens[4].zeichnen(z); }

    it('stellt die Frage nach dem Ort', function () {
      expect(html(anfang())).toContain('Wo soll diese Regel greifen?');
    });
    it('bietet alle drei Orte an', function () {
      var h = html(anfang());
      ['Imperativer Kontrollpunkt', 'Leitplanke zur Laufzeit', 'Prüfung im Nachgang']
        .forEach(function (n) { expect(h).toContain(n); });
      expect(h.split('data-aktion="platzierung"').length - 1).toBe(3);
    });
    it('zeigt je Ort alle drei Masse', function () {
      var h = html(anfang());
      expect(h.split('Durchlaufzeit').length - 1).toBe(3);
      expect(h.split('Kosten je Lauf').length - 1).toBe(3);
      expect(h.split('Restrisiko').length - 1).toBe(3);
    });
    it('greift ohne eigene Regel auf die Beispielregel zurueck', function () {
      var h = html(anfang());
      expect(h).toContain('Solange gilt die Beispielregel');
      expect(HR.screens[4].regelDesBesuchers(anfang()).eigen).toBeFalsy();
    });
    it('nimmt die eigene Regel, sobald es eine gibt', function () {
      var c = HR.compiler.uebersetzen(SATZ, { id: 'U-7' }).constraint;
      var z = red(red(anfang(), { typ: 'entwurf', constraint: c }), { typ: 'regel_uebernehmen' });
      var wahl = HR.screens[4].regelDesBesuchers(z);
      expect(wahl.eigen).toBeTruthy();
      expect(wahl.regel.id).toBe('U-7');
      expect(html(z).indexOf('Solange gilt die Beispielregel')).toBe(-1);
    });
    it('merkt sich den gewaehlten Ort und markiert ihn', function () {
      var z = red(anfang(), { typ: 'platzierung', wert: 'leitplanke' });
      expect(z.platzierung).toBe('leitplanke');
      expect(html(z)).toContain('ort ist-gewaehlt');
      expect(html(z)).toContain('data-wert="leitplanke" aria-pressed="true"');
    });
    it('weist einen unbekannten Ort ab', function () {
      expect(red(anfang(), { typ: 'platzierung', wert: 'irgendwo' }).platzierung).toBe(null);
    });
    it('zeigt den Ablauf erst, wenn ein Ort gewaehlt ist', function () {
      expect(html(anfang()).indexOf('Was in diesem Lauf passiert ist')).toBe(-1);
      var z = red(anfang(), { typ: 'platzierung', wert: 'imperativ' });
      expect(html(z)).toContain('Was in diesem Lauf passiert ist');
      expect(html(z)).toContain('kontrollpunkt');
    });
  });
})(window.HR = window.HR || {});
