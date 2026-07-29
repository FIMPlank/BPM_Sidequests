/* Freiheitsgrade: der Handlungsraum als endliche, zaehlbare Menge. */
(function (HR) {
  'use strict';

  var schwelle = {
    id: 'F-1', text_de: 'Buchungen über 200 € pro Nacht brauchen eine Freigabe',
    kind: 'threshold', target: 'hotel_buchen',
    predicate: {
      type: 'wenn_dann',
      wenn: { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 200 },
      dann: { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern', mit_ergebnis: 'erteilt' }
    },
    source: 'user', enforcement: 'runtime'
  };

  var verbot = {
    id: 'F-2', text_de: 'Niemals selbst freigeben',
    kind: 'absence', target: 'selbst_freigeben',
    predicate: { type: 'kein_aufruf', tool: 'selbst_freigeben' },
    source: 'user', enforcement: 'runtime'
  };

  describe('Freiheitsgrade', function () {
    it('spannt einen Raum aus 40 Zellen auf', function () {
      expect(HR.freedom.zellen.length).toBe(40);
    });
    it('deckt jedes Werkzeug mit mindestens einer Zelle ab', function () {
      HR.tools.namen.forEach(function (name) {
        var da = HR.freedom.zellen.some(function (z) { return z.tool === name; });
        expect(da).toBeTruthy();
      });
    });
    it('bildet das Kreuzprodukt der Bins von hotel_buchen', function () {
      var n = HR.freedom.zellen.filter(function (z) { return z.tool === 'hotel_buchen'; }).length;
      expect(n).toBe(15);
    });
    it('laesst ohne Regeln alles zu', function () {
      expect(HR.freedom.freiheitsgrade([]).prozent).toBe(100);
    });
    it('engt der Raum sich mit den Systemregeln bereits ein', function () {
      expect(HR.freedom.freiheitsgrade(HR.compiler.systemRegeln()).prozent).toBe(90);
    });
    it('nimmt die Schwellenwert-Regel genau sechs Zellen heraus', function () {
      var ohne = HR.freedom.freiheitsgrade([]).erlaubt;
      var mit = HR.freedom.freiheitsgrade([schwelle]).erlaubt;
      expect(ohne - mit).toBe(6);
    });
    it('nimmt ein Verbot alle Zellen seines Werkzeugs heraus', function () {
      expect(HR.freedom.freiheitsgrade([verbot]).erlaubt).toBe(36);
    });
    it('wirkt monoton: jede weitere Regel verkleinert den Raum hoechstens', function () {
      var a = HR.freedom.freiheitsgrade([schwelle]).erlaubt;
      var b = HR.freedom.freiheitsgrade([schwelle, verbot]).erlaubt;
      expect(b).toBeLessThan(a + 1);
    });
    it('zaehlt auch nachgelagerte Regeln als Einschraenkung des Raums', function () {
      var posthoc = JSON.parse(JSON.stringify(schwelle));
      posthoc.enforcement = 'posthoc';
      expect(HR.freedom.freiheitsgrade([posthoc]).erlaubt).toBe(HR.freedom.freiheitsgrade([schwelle]).erlaubt);
    });
    it('liefert Anteil und Prozent konsistent', function () {
      var f = HR.freedom.freiheitsgrade([schwelle]);
      expect(f.prozent).toBe(Math.round(f.anteil * 100));
      expect(f.gesamt).toBe(40);
    });
  });
})(window.HR = window.HR || {});
