/* Akt 4, Teil 2 — jede Belegung bekommt einen Namen. */
(function (HR) {
  'use strict';

  function z(eigen, zahlung, beleg) {
    return { eigen: eigen, zahlung: zahlung, beleg: beleg };
  }
  var I = 'imperativ', L = 'leitplanke', N = 'nachgang';

  describe('Architekturmuster', function () {
    it('kennt drei Regelplaetze und vier Muster', function () {
      expect(HR.muster.REGELPLAETZE.length).toBe(3);
      expect(HR.muster.SCHLUESSEL.length).toBe(4);
    });

    it('nennt nichts, solange nicht alle drei zugewiesen sind', function () {
      expect(HR.muster.bestimmen(HR.muster.leereZuordnung())).toBe(null);
      expect(HR.muster.bestimmen(z(I, L, null))).toBe(null);
      expect(HR.muster.vollstaendig(z(I, L, N))).toBeTruthy();
    });

    it('bildet **jede** der 27 Belegungen auf ein benanntes Muster ab', function () {
      var belegungen = HR.muster.alleBelegungen();
      expect(belegungen.length).toBe(27);
      belegungen.forEach(function (b) {
        var t = HR.muster.bestimmen(b);
        expect(t).toBeTruthy();
        expect(HR.muster.SCHLUESSEL.indexOf(t.schluessel)).toBeGreaterThan(-1);
        // Zu jedem Schluessel gibt es Name, Beschreibung und Einsatzfall.
        var m = HR.copy.muster[t.schluessel];
        expect(typeof m.name).toBe('string');
        expect(typeof m.beschreibung).toBe('string');
        expect(typeof m.einsatz).toBe('string');
      });
    });

    it('haengt nur an den Anzahlen, nicht an der Reihenfolge', function () {
      var a = HR.muster.bestimmen(z(I, L, N)).schluessel;
      expect(HR.muster.bestimmen(z(L, N, I)).schluessel).toBe(a);
      expect(HR.muster.bestimmen(z(N, I, L)).schluessel).toBe(a);
    });

    it('nennt alles-imperativ beim Namen', function () {
      var t = HR.muster.bestimmen(z(I, I, I));
      expect(t.schluessel).toBe('m1');
      expect(t.entartet).toBeTruthy();
      expect(HR.copy.muster.m1.entartet)
        .toBe('Sie haben den alten Prozess nachgebaut — mit Zusatzkosten für die KI.');
    });

    it('nennt alles-nachgelagert beim Namen', function () {
      var t = HR.muster.bestimmen(z(N, N, N));
      expect(t.schluessel).toBe('m4');
      expect(t.entartet).toBeTruthy();
      expect(HR.copy.muster.m4.entartet).toBe('Sie prüfen nur noch, was schon passiert ist.');
    });

    it('erklaert alles-Leitplanke zu Muster 3', function () {
      var t = HR.muster.bestimmen(z(L, L, L));
      expect(t.schluessel).toBe('m3');
      expect(t.entartet).toBeFalsy();
    });

    it('erklaert Kontrollpunkt plus Leitplanke zur These des Papiers', function () {
      expect(HR.muster.bestimmen(z(I, L, N)).schluessel).toBe('m2');
      expect(HR.muster.bestimmen(z(I, L, L)).schluessel).toBe('m2');
      expect(HR.muster.bestimmen(z(I, I, L)).schluessel).toBe('m2');
      expect(HR.copy.muster.m2.name).toContain('Deklarative Ziele, imperative Kontrollpunkte');
    });

    it('entscheidet ohne Kontrollpunkt nach dem Schwerpunkt', function () {
      expect(HR.muster.bestimmen(z(L, L, N)).schluessel).toBe('m3');
      expect(HR.muster.bestimmen(z(L, N, N)).schluessel).toBe('m4');
    });

    it('entscheidet ohne Leitplanke nach dem Schwerpunkt', function () {
      expect(HR.muster.bestimmen(z(I, I, N)).schluessel).toBe('m1');
      expect(HR.muster.bestimmen(z(I, N, N)).schluessel).toBe('m4');
    });

    it('deckt mit den zehn Anzahlkombinationen alle vier Muster ab', function () {
      var gesehen = {};
      HR.muster.alleBelegungen().forEach(function (b) {
        gesehen[HR.muster.bestimmen(b).schluessel] = true;
      });
      expect(Object.keys(gesehen).sort().join(',')).toBe('m1,m2,m3,m4');
    });

    it('zaehlt die Orte richtig', function () {
      var c = HR.muster.zaehlen(z(I, I, N));
      expect(c.imperativ).toBe(2);
      expect(c.leitplanke).toBe(0);
      expect(c.nachgang).toBe(1);
    });
  });

  describe('Kombination in Akt 4', function () {
    function anfang() { return HR.store.anfang(); }
    function red(s, a) { return HR.store.reduzieren(s, a); }
    function html(s) { return HR.screens[4].zeichnen(s); }

    it('stellt die drei Regeln mit ihren drei Orten auf', function () {
      var h = html(anfang());
      expect(h).toContain('Drei Regeln, drei Orte');
      expect(h).toContain('Erstattungen über 1.000 €');
      expect(h).toContain('Belegpflicht');
      expect(h.split('data-aktion="zuordnung"').length - 1).toBe(9);
    });

    it('uebersetzt die beiden Zusatzregeln ueber denselben Weg wie eigene', function () {
      var r = HR.screens[4].kombiRegeln(anfang());
      expect(r.zahlung.kind).toBe('threshold');
      expect(r.zahlung.target).toBe('erstattung_ausloesen');
      expect(r.beleg.kind).toBe('precedence');
      expect(r.beleg.target).toBe('abrechnung_einreichen');
    });

    it('nennt kein Muster, solange etwas offen ist', function () {
      var h = html(red(anfang(), { typ: 'zuordnung', regel: 'eigen', ort: 'imperativ' }));
      expect(h).toContain('Noch nicht zugewiesen');
      expect(h.indexOf('muster__satz')).toBe(-1);
    });

    it('benennt das Ergebnis, sobald alle drei stehen', function () {
      var s = anfang();
      s = red(s, { typ: 'zuordnung', regel: 'eigen', ort: 'imperativ' });
      s = red(s, { typ: 'zuordnung', regel: 'zahlung', ort: 'leitplanke' });
      s = red(s, { typ: 'zuordnung', regel: 'beleg', ort: 'nachgang' });
      var h = html(s);
      expect(h).toContain('Sie haben gerade Muster 2 — Deklarative Ziele, imperative Kontrollpunkte gebaut.');
      expect(h).toContain('data-wert="eigen:imperativ" aria-pressed="true"');
    });

    it('sagt beim Randfall, was der Besucher wirklich gebaut hat', function () {
      var s = anfang();
      HR.muster.REGELPLAETZE.forEach(function (p) {
        s = red(s, { typ: 'zuordnung', regel: p, ort: 'imperativ' });
      });
      expect(html(s)).toContain('Sie haben den alten Prozess nachgebaut');
      expect(html(s)).toContain('muster ist-entartet');

      var t = anfang();
      HR.muster.REGELPLAETZE.forEach(function (p) {
        t = red(t, { typ: 'zuordnung', regel: p, ort: 'nachgang' });
      });
      expect(html(t)).toContain('Sie prüfen nur noch, was schon passiert ist.');
    });

    it('weist unbekannte Regeln und Orte ab', function () {
      var s = anfang();
      expect(red(s, { typ: 'zuordnung', regel: 'unfug', ort: 'imperativ' })).toBe(s);
      expect(red(s, { typ: 'zuordnung', regel: 'eigen', ort: 'irgendwo' })).toBe(s);
    });

    it('setzt die Zuordnung wieder zurueck', function () {
      var s = red(anfang(), { typ: 'zuordnung', regel: 'eigen', ort: 'imperativ' });
      expect(red(s, { typ: 'zuordnung_zuruecksetzen' }).zuordnung.eigen).toBe(null);
    });
  });
})(window.HR = window.HR || {});
