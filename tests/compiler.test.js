/* Regel-Compiler: deutscher Text hinein, geschlossene Struktur heraus. */
(function (HR) {
  'use strict';

  function uebersetze(t) { return HR.compiler.uebersetzen(t); }

  describe('Compiler — Werkzeugerkennung', function () {
    it('erkennt das Hotel hinter dem Wort Buchungen', function () {
      expect(HR.compiler.werkzeugeFinden('buchungen uber 200 €')[0]).toBe('hotel_buchen');
    });
    it('verwechselt Abrechnung nicht mit Rechnung', function () {
      expect(HR.compiler.werkzeugeFinden('abrechnung einreichen')[0]).toBe('abrechnung_einreichen');
    });
    it('erkennt die Selbstfreigabe vor der Genehmigung', function () {
      expect(HR.compiler.werkzeugeFinden('nie selbst freigeben')[0]).toBe('selbst_freigeben');
    });
    it('liefert mehrere Werkzeuge in Textreihenfolge', function () {
      var t = HR.compiler.werkzeugeFinden('keine erstattung ohne eingereichte abrechnung');
      expect(t[0]).toBe('erstattung_ausloesen');
      expect(t[1]).toBe('abrechnung_einreichen');
    });
  });

  describe('Compiler — Betraege', function () {
    it('liest über 200 € als Groesser-Vergleich', function () {
      var b = HR.compiler.betragFinden('uber 200 €');
      expect(b.op).toBe('>');
      expect(b.wert).toBe(200);
    });
    it('liest ab 150 Euro als Groesser-Gleich', function () {
      expect(HR.compiler.betragFinden('ab 150 euro').op).toBe('>=');
    });
    it('liest maximal 150 € als Kleiner-Gleich', function () {
      expect(HR.compiler.betragFinden('maximal 150 €').op).toBe('<=');
    });
    it('versteht Tausenderpunkte und Dezimalkomma', function () {
      expect(HR.compiler.betragFinden('uber 1.200,50 €').wert).toBe(1200.5);
    });
    it('findet keinen Betrag, wo keiner steht', function () {
      expect(HR.compiler.betragFinden('nie selbst freigeben')).toBe(null);
    });
  });

  describe('Compiler — Regelarten', function () {
    it('kompiliert den Leitsatz der Demo zu einer Schwellenwert-Regel', function () {
      var r = uebersetze('Buchungen über 200 € pro Nacht brauchen eine Freigabe');
      expect(r.ok).toBeTruthy();
      expect(r.constraint.kind).toBe('threshold');
      expect(r.constraint.target).toBe('hotel_buchen');
    });
    it('setzt die Bedingung auf den Preis je Nacht', function () {
      var c = uebersetze('Buchungen über 200 € pro Nacht brauchen eine Freigabe').constraint;
      expect(c.predicate.type).toBe('wenn_dann');
      expect(c.predicate.wenn.feld).toBe('preis_pro_nacht');
      expect(c.predicate.wenn.wert).toBe(200);
    });
    it('fordert eine erteilte Genehmigung, keine bloss angefragte', function () {
      var c = uebersetze('Buchungen über 200 € pro Nacht brauchen eine Freigabe').constraint;
      expect(c.predicate.dann.tool).toBe('genehmigung_anfordern');
      expect(c.predicate.dann.mit_ergebnis).toBe('erteilt');
    });
    it('erzeugt eine gueltige Regel im Sinne des Modells', function () {
      var c = uebersetze('Buchungen über 200 € pro Nacht brauchen eine Freigabe').constraint;
      expect(HR.constraints.constraintGueltig(c)).toBeTruthy();
    });
    it('behaelt den eingegebenen Text unveraendert', function () {
      var t = 'Buchungen über 200 € pro Nacht brauchen eine Freigabe';
      expect(uebersetze(t).constraint.text_de).toBe(t);
    });
    it('kompiliert ein Verbot zu absence', function () {
      var r = uebersetze('Niemals selbst freigeben');
      expect(r.constraint.kind).toBe('absence');
      expect(r.constraint.target).toBe('selbst_freigeben');
    });
    it('kompiliert eine Vorbedingung mit ohne zu precedence', function () {
      var r = uebersetze('Keine Erstattung ohne eingereichte Abrechnung');
      expect(r.constraint.kind).toBe('precedence');
      expect(r.constraint.predicate.tool).toBe('abrechnung_einreichen');
    });
    it('kompiliert eine Folgeregel zu response', function () {
      var r = uebersetze('Auf einen Reiseantrag muss eine Genehmigung folgen');
      expect(r.constraint.kind).toBe('response');
      expect(r.constraint.predicate.tool).toBe('genehmigung_anfordern');
    });
    it('kompiliert nur mit Freigabe zu precedence', function () {
      var r = uebersetze('Hotels nur mit Freigabe buchen');
      expect(r.constraint.kind).toBe('precedence');
      expect(r.constraint.target).toBe('hotel_buchen');
    });
    it('kompiliert eine Pflicht zu existence', function () {
      var r = uebersetze('Belege muessen immer geprueft werden');
      expect(r.constraint.kind).toBe('existence');
      expect(r.constraint.target).toBe('beleg_pruefen');
    });
    it('setzt ein Verbot mit Betrag als Schwellenwert ohne Ausweg', function () {
      var r = uebersetze('Zimmer über 300 € pro Nacht sind nicht erlaubt');
      expect(r.constraint.kind).toBe('threshold');
      expect(r.constraint.predicate.dann.type).toBe('kein_aufruf');
    });
  });

  describe('Compiler — Ablehnungen', function () {
    it('lehnt zu kurze Eingaben ab', function () {
      expect(uebersetze('ok').code).toBe('zu_kurz');
    });
    it('lehnt Text ohne erkennbares Werkzeug ab', function () {
      var r = uebersetze('Bitte immer freundlich bleiben und gut zuhoeren');
      expect(r.ok).toBeFalsy();
      expect(r.code).toBe('kein_werkzeug');
    });
    it('lehnt erkennbare Werkzeuge ohne Regelform ab', function () {
      var r = uebersetze('Hotel Wien');
      expect(r.ok).toBeFalsy();
      expect(r.code).toBe('keine_regelform');
    });
    it('nennt bei fehlender Regelform das erkannte Werkzeug', function () {
      expect(uebersetze('Hotel Wien').slots.werkzeug).toBe('hotel_buchen');
    });
  });

  describe('Compiler — Systemregeln', function () {
    it('liefert genau drei Systemregeln', function () {
      expect(HR.compiler.systemRegeln().length).toBe(3);
    });
    it('alle Systemregeln sind gueltig', function () {
      HR.compiler.systemRegeln().forEach(function (c) {
        expect(HR.constraints.constraintGueltig(c)).toBeTruthy();
      });
    });
    it('alle Systemregeln stammen aus dem System', function () {
      HR.compiler.systemRegeln().forEach(function (c) { expect(c.source).toBe('system'); });
    });
    it('deckt die drei Regelarten response, precedence und existence ab', function () {
      var arten = HR.compiler.systemRegeln().map(function (c) { return c.kind; }).join(',');
      expect(arten).toBe('response,precedence,existence');
    });
  });
})(window.HR = window.HR || {});
