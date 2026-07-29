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
  describe('Die verschmolzene Flaeche', function () {
    function anfang() { return HR.store.anfang(); }
    function red(s, a) { return HR.store.reduzieren(s, a); }
    function html(s) { return HR.screens[4].zeichnen(s); }

    it('zeichnet eine einzige Flaeche, keine zwei Panels', function () {
      var h = html(anfang());
      expect(h.split('class="fusion').length - 1).toBe(1);
      expect(h.split('<svg class="raum').length - 1).toBe(1);
    });

    it('laesst in Akt 4 keine Naht stehen', function () {
      var h = html(anfang());
      expect(h.indexOf('class="clash"')).toBe(-1);
      expect(h.indexOf('panel--imperativ')).toBe(-1);
      expect(h.indexOf('panel--deklarativ')).toBe(-1);
    });

    it('setzt die imperative Kette als Schranken in den Raum', function () {
      var s = anfang();
      s = red(s, { typ: 'zuordnung', regel: 'eigen', ort: 'imperativ' });
      s = red(s, { typ: 'zuordnung', regel: 'zahlung', ort: 'imperativ' });
      s = red(s, { typ: 'zuordnung', regel: 'beleg', ort: 'leitplanke' });
      var h = html(s);
      expect(h.split('class="schranke"').length - 1).toBe(2);
      expect(h).toContain('schranke__wand');
      expect(h).toContain('schranke__pfosten');
    });

    it('laesst je Schranke genau einen Durchlass', function () {
      var markup = HR.komponenten.fusion.zeichnen({
        regeln: HR.compiler.systemRegeln(),
        trajektorie: [],
        kontrollpunkte: [{ id: 'U-1', target: 'hotel_buchen' }]
      });
      // Zwei Wandstuecke links und rechts, dazwischen die beiden Pfosten.
      expect(markup.split('schranke__wand').length - 1).toBe(2);
      expect(markup.split('schranke__pfosten').length - 1).toBe(2);
    });

    it('setzt jede Schranke auf die Hoehe ihres Werkzeugs', function () {
      var anker = HR.komponenten.handlungsraum.ANKER;
      var s = HR.komponenten.fusion.schranken([{ id: 'U-1', target: 'erstattung_ausloesen' }]);
      expect(s.length).toBe(1);
      expect(s[0].y).toBe(anker.erstattung_ausloesen.y - 14);
    });

    it('ordnet mehrere Schranken von oben nach unten', function () {
      var s = HR.komponenten.fusion.schranken([
        { id: 'A', target: 'erstattung_ausloesen' },
        { id: 'B', target: 'reiseantrag_stellen' }
      ]);
      expect(s[0].id === undefined ? s[0].regelId : s[0].regelId).toBe('B');
      expect(s[1].regelId).toBe('A');
    });

    it('uebergeht Regeln ohne Platz im Raum', function () {
      expect(HR.komponenten.fusion.schranken([{ id: 'X', target: 'gibt_es_nicht' }]).length).toBe(0);
      expect(HR.komponenten.fusion.schranken(null).length).toBe(0);
    });

    it('laesst die Spur des Agenten durch die Schranken laufen', function () {
      var s = red(anfang(), { typ: 'platzierung', wert: 'imperativ' });
      var h = html(s);
      expect(h).toContain('class="schranke"');
      expect(h).toContain('spur__segment');
    });

    it('bietet bei reduzierter Bewegung eine Bildunterschrift an', function () {
      expect(HR.copy.a11y.verschmolzen).toContain('in einer Fläche');
      expect(typeof HR.screens[4].nach).toBe('function');
    });

    it('markiert die Verschmelzung nur, wenn sie laufen soll', function () {
      var mit = HR.komponenten.fusion.zeichnen({ regeln: [], trajektorie: [], kontrollpunkte: [], verschmilzt: true });
      var ohne = HR.komponenten.fusion.zeichnen({ regeln: [], trajektorie: [], kontrollpunkte: [], verschmilzt: false });
      expect(mit).toContain('fusion ist-verschmilzt');
      expect(ohne.indexOf('ist-verschmilzt')).toBe(-1);
    });
  });

  describe('Der Plot in Akt 4', function () {
    function anfang() { return HR.store.anfang(); }
    function red(s, a) { return HR.store.reduzieren(s, a); }
    function html(s) { return HR.screens[4].zeichnen(s); }

    var sys = HR.compiler.systemRegeln();
    function lauf(regeln) {
      return HR.agent.mock.laufSynchron(HR.agent.anfrage({
        disturbances: ['hotel_ausgebucht', 'genehmiger_urlaub'],
        constraints: regeln, enforcement: 'runtime'
      }));
    }

    it('steht in Akt 4 und nicht mehr in Akt 3', function () {
      expect(html(anfang())).toContain('plot-panel');
      expect(HR.screens[3].zeichnen(anfang()).indexOf('plot-panel')).toBe(-1);
    });

    it('sammelt ueber die ganze Sitzung, nicht je Akt', function () {
      var s = anfang();
      // ein Lauf aus Akt 1, einer aus Akt 2, einer aus Akt 3, einer aus Akt 4
      [1, 2, 3, 4].forEach(function (akt) {
        s = red(s, { typ: 'lauf_fertig', ergebnis: lauf(sys), kontext: { regeln: sys, screen: akt } });
      });
      expect(s.historie.length).toBe(4);
      var h = html(s);
      // je Lauf ein Punkt in jeder der beiden Reihen
      expect(h.split('plot__punkt').length - 1).toBe(8);
    });

    it('zeigt ohne Lauf den Hinweis statt eines leeren Plots', function () {
      expect(html(anfang())).toContain('Führen Sie einen Lauf aus');
    });

    it('sagt an, dass der Plot aus allen Akten kommt', function () {
      expect(html(anfang())).toContain('aus allen Akten');
    });

    it('traegt Regeln gegen Verstoesse und Kosten ab', function () {
      var s = red(anfang(), { typ: 'lauf_fertig', ergebnis: lauf(sys), kontext: { regeln: sys } });
      var h = html(s);
      expect(h).toContain('ist-verstoesse');
      expect(h).toContain('ist-kosten');
      expect(h).toContain('Regeln');
    });

    it('nimmt auch die Laeufe aus der Platzierung auf', function () {
      var s = anfang();
      var wahl = HR.screens[4].regelDesBesuchers(s);
      var e = HR.platzierung.lauf('leitplanke', {
        regel: wahl.regel,
        regeln: HR.screens[4].regelnFuerLauf(s, wahl),
        stoerungen: HR.platzierung.STOERUNGEN
      });
      s = red(s, { typ: 'lauf_fertig', ergebnis: e.ergebnis,
        kontext: { regeln: HR.screens[4].regelnFuerLauf(s, wahl), akt: 4, platzierung: 'leitplanke' } });
      expect(s.historie.length).toBe(1);
      expect(s.historie[0].regeln).toBe(4);
    });
  });

  describe('Akt 5 — Platzierung im Protokoll', function () {
    var sys = HR.compiler.systemRegeln();
    var schwelle = HR.compiler.uebersetzen(SATZ, { id: 'U-9' }).constraint;
    var regeln = sys.concat([schwelle]);

    function anfang() { return HR.store.anfang(); }
    function red(s, a) { return HR.store.reduzieren(s, a); }

    function frei() {
      return HR.agent.mock.laufSynchron(HR.agent.anfrage({
        disturbances: HR.platzierung.STOERUNGEN, constraints: sys, enforcement: 'runtime' }));
    }
    function hybrid(ort) {
      return HR.platzierung.lauf(ort, { regel: schwelle, regeln: regeln,
        stoerungen: HR.platzierung.STOERUNGEN });
    }
    function zustand(ort) {
      var s = red(anfang(), { typ: 'lauf_fertig', ergebnis: frei(),
        kontext: { regeln: sys, screen: 2, stoerungen: HR.platzierung.STOERUNGEN, vergleichsbasis: true } });
      var e = hybrid(ort || 'imperativ');
      return red(s, { typ: 'lauf_fertig', ergebnis: e.ergebnis,
        kontext: { regeln: regeln, screen: 4, akt: 4, platzierung: ort || 'imperativ',
          enforcement: HR.platzierung.durchsetzung(ort || 'imperativ'),
          stoerungen: HR.platzierung.STOERUNGEN, mitNutzerregel: true } });
    }

    it('fuehrt die Spalte Platzierung im Kopf der Tabelle', function () {
      expect(HR.copy.screen4.spalten.length).toBe(9);
      expect(HR.copy.screen4.spalten).toContain('Platzierung');
      expect(HR.screens[5].zeichnen(zustand())).toContain('Platzierung');
    });

    it('rechnet den Kontrollpunkt der imperativen Entscheidung zu', function () {
      var t = HR.komponenten.logTabelle;
      expect(t.platzierungFuerSchritt({ tool: 'kontrollpunkt' }, [])).toBe('imperativ');
    });

    it('rechnet einen Vermerk der Leitplanke der Laufzeit zu', function () {
      var t = HR.komponenten.logTabelle;
      expect(t.platzierungFuerSchritt(
        { tool: 'hotel_buchen', guardrail: { rule_id: 'U-9', blocked: true, reason: 'regel' } }, []))
        .toBe('leitplanke');
    });

    it('rechnet einen erst hinterher geprueften Schritt dem Nachgang zu', function () {
      var t = HR.komponenten.logTabelle;
      expect(t.platzierungFuerSchritt({ tool: 'hotel_buchen', guardrail: null },
        [{ id: 'U-9', status: 'verletzt' }])).toBe('nachgang');
    });

    it('laesst ungeregelte Schritte ohne Zurechnung', function () {
      var t = HR.komponenten.logTabelle;
      expect(t.platzierungFuerSchritt({ tool: 'beleg_pruefen', guardrail: null }, [])).toBe(null);
      expect(t.platzierungText(null)).toBe('—');
    });

    it('zeigt die Zurechnung in der Tabelle an', function () {
      var h = HR.screens[5].zeichnen(zustand('imperativ'));
      expect(h).toContain('logtabelle__ort ist-imperativ');
      expect(h).toContain('Imperativer Kontrollpunkt');
    });

    it('nimmt die Spalte in den CSV-Export auf', function () {
      var zeilen = HR.screens[5].alsCsv(zustand()).split(String.fromCharCode(13) + String.fromCharCode(10));
      expect(zeilen[0]).toContain('Platzierung');
      expect(zeilen[0].split(';').length).toBe(9);
      zeilen.slice(1).forEach(function (r) { expect(r.split(';').length).toBe(9); });
    });

    it('laesst den JSON-Export mit der neuen Spalte hin und zurueck laufen', function () {
      var z = zustand('imperativ');
      var wieder = JSON.parse(HR.screens[5].alsJson(z));
      expect(wieder.trajektorie.length).toBe(z.lauf.trajectory.length);
      expect(wieder.platzierung).toBe('imperativ');
      var mitOrt = wieder.trajektorie.filter(function (s) { return s.platzierung; });
      expect(mitOrt.length).toBeGreaterThan(0);
      var kontrollpunkt = wieder.trajektorie.filter(function (s) { return s.tool === 'kontrollpunkt'; });
      expect(kontrollpunkt.length).toBe(1);
      expect(kontrollpunkt[0].platzierung).toBe('imperativ');
      // Der Ursprungslauf bleibt unangetastet.
      expect(z.lauf.trajectory[0].platzierung).toBe(undefined);
    });

    it('vergleicht den freien Lauf aus Akt 2 gegen die Architektur des Besuchers', function () {
      var z = zustand('imperativ');
      expect(z.laufOhneRegel).toBeTruthy();
      expect(z.laufMitRegel).toBeTruthy();
      var h = HR.screens[5].zeichnen(z);
      expect(h).toContain('Akt 2 — ohne Ihre Regel');
      expect(h).toContain('Ihre Architektur');
    });

    it('hebt genau die abweichenden Schritte hervor', function () {
      var z = zustand('imperativ');
      var zeilen = HR.screens[5].diffZeilen(z.laufOhneRegel, z.laufMitRegel);
      expect(zeilen.length).toBe(Math.max(
        z.laufOhneRegel.trajectory.length, z.laufMitRegel.trajectory.length));
      var anders = zeilen.filter(function (r) { return r.anders; });
      expect(anders.length).toBeGreaterThan(0);
      expect(anders.length).toBeLessThan(zeilen.length + 1);
      // Die ersten beiden Schritte sind in beiden Laeufen dieselben.
      expect(zeilen[0].anders).toBeFalsy();
      expect(zeilen[1].anders).toBeFalsy();
    });
  });

})(window.HR = window.HR || {});
