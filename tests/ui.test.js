/* Zustandsspeicher, Renderhilfe und die Darstellung der Bildschirme. */
(function (HR) {
  'use strict';

  function anfang() { return HR.store.anfang(); }
  function red(z, a) { return HR.store.reduzieren(z, a); }

  describe('Zustandsspeicher', function () {
    it('startet auf Bildschirm 1 mit den drei Systemregeln', function () {
      var z = anfang();
      expect(z.screen).toBe(1);
      expect(z.regeln.length).toBe(3);
    });
    it('wechselt den Bildschirm', function () {
      expect(red(anfang(), { typ: 'screen', n: 3 }).screen).toBe(3);
    });
    it('laesst den Ausgangszustand unveraendert', function () {
      var z = anfang();
      red(z, { typ: 'screen', n: 3 });
      expect(z.screen).toBe(1);
    });
    it('zaehlt bei einer Stoerung eine Prozessvariante hoch', function () {
      var z = red(anfang(), { typ: 'fsm_ereignis', ereignis: 'beleg_fehlt' });
      expect(z.fsm.varianten).toBe(2);
      expect(z.fsm.gestoppt).toBeTruthy();
    });
    it('behaelt die Variantenzahl ueber einen Neustart hinweg', function () {
      var z = red(anfang(), { typ: 'fsm_ereignis', ereignis: 'beleg_fehlt' });
      z = red(z, { typ: 'fsm_neustart' });
      expect(z.fsm.varianten).toBe(2);
      expect(z.fsm.gestoppt).toBeFalsy();
    });
    it('haengt jeden Lauf an die Historie', function () {
      var e = HR.agent.mock.laufSynchron(HR.agent.anfrage({ constraints: HR.compiler.systemRegeln() }));
      var z = red(anfang(), { typ: 'lauf_fertig', ergebnis: e, kontext: { regeln: HR.compiler.systemRegeln() } });
      expect(z.historie.length).toBe(1);
      expect(z.historie[0].regeln).toBe(3);
      expect(z.historie[0].verstoesse).toBe(0);
    });
    it('uebernimmt einen Regelentwurf nur, wenn einer vorliegt', function () {
      var z = red(anfang(), { typ: 'regel_uebernehmen' });
      expect(z.regeln.length).toBe(3);
      var c = HR.compiler.uebersetzen('Buchungen über 200 € pro Nacht brauchen eine Freigabe').constraint;
      z = red(anfang(), { typ: 'entwurf', constraint: c });
      z = red(z, { typ: 'regel_uebernehmen' });
      expect(z.regeln.length).toBe(4);
      expect(z.entwurf).toBe(null);
    });
    it('entfernt eine Regel nach Kennung', function () {
      var z = red(anfang(), { typ: 'regel_entfernen', id: 'S-2' });
      expect(z.regeln.length).toBe(2);
    });
    it('schaltet die Durchsetzungsart um', function () {
      expect(red(anfang(), { typ: 'enforcement', wert: 'posthoc' }).enforcement).toBe('posthoc');
    });
    it('setzt alles zurueck', function () {
      var z = red(anfang(), { typ: 'screen', n: 4 });
      expect(red(z, { typ: 'reset' }).screen).toBe(1);
    });
  });

  describe('Renderhilfe', function () {
    it('maskiert spitze Klammern und Anfuehrungszeichen', function () {
      expect(HR.render.esc('<a href="x">')).toBe('&lt;a href=&quot;x&quot;&gt;');
    });
    it('laesst leere Attribute weg', function () {
      expect(HR.render.attr('data-wert', null)).toBe('');
    });
    it('baut einen Knopf mit Aktion und Wert', function () {
      var k = HR.render.knopf('stoerung', 'Test', { wert: 'beleg_fehlt' });
      expect(k).toContain('data-aktion="stoerung"');
      expect(k).toContain('data-wert="beleg_fehlt"');
    });
    it('markiert deaktivierte Knoepfe', function () {
      expect(HR.render.knopf('a', 'b', { deaktiviert: true })).toContain('disabled');
    });
  });

  describe('Imperatives Diagramm', function () {
    it('zeichnet sechs Knoten', function () {
      var svg = HR.komponenten.fsmDiagramm.zeichnen(HR.imperative.neu());
      expect(svg.split('class="fsm__knoten').length - 1).toBe(6);
    });
    it('markiert erledigte Knoten', function () {
      var a = HR.imperative.neu();
      HR.imperative.senden(a, 'antrag_stellen');
      expect(HR.komponenten.fsmDiagramm.zeichnen(a)).toContain('ist-erledigt');
    });
    it('faerbt den aktuellen Knoten bei einer Stoerung als Verstoss', function () {
      var a = HR.imperative.neu();
      HR.imperative.senden(a, 'beleg_fehlt');
      var svg = HR.komponenten.fsmDiagramm.zeichnen(a);
      expect(svg).toContain('ist-verstoss');
      expect(svg).toContain('fsm__stopp');
    });
  });

  describe('Handlungsraum', function () {
    var sys = HR.compiler.systemRegeln();
    var schwelle = HR.compiler.uebersetzen('Buchungen über 200 € pro Nacht brauchen eine Freigabe').constraint;

    function radius(svg) {
      var m = /raum__band raum__band--0" cx="150" cy="215" rx="([0-9.]+)"/.exec(svg);
      return m ? parseFloat(m[1]) : null;
    }

    it('zeichnet acht Ankerpunkte', function () {
      var svg = HR.komponenten.handlungsraum.zeichnen({ regeln: [], trajektorie: [] });
      expect(svg.split('raum__anker').length - 1).toBe(8);
    });
    it('zieht sich mit jeder weiteren Regel zusammen', function () {
      var weit = radius(HR.komponenten.handlungsraum.zeichnen({ regeln: sys, trajektorie: [] }));
      var eng = radius(HR.komponenten.handlungsraum.zeichnen({ regeln: sys.concat([schwelle]), trajektorie: [] }));
      expect(eng).toBeLessThan(weit);
    });
    it('zeigt den aufgegebenen Raum als Schraffur', function () {
      expect(HR.komponenten.handlungsraum.zeichnen({ regeln: sys, trajektorie: [] })).toContain('raum__verloren');
    });
    it('zeichnet die Spur bis zum aktuellen Schritt', function () {
      var e = HR.agent.mock.laufSynchron(HR.agent.anfrage({ constraints: sys }));
      var svg = HR.komponenten.handlungsraum.zeichnen({ regeln: sys, trajektorie: e.trajectory, bisSchritt: 2 });
      expect(svg.split('spur__segment').length - 1).toBe(2);
    });
    it('markiert einen abgewiesenen Aufruf mit einem Kreuz', function () {
      var e = HR.agent.mock.laufSynchron(HR.agent.anfrage({
        disturbances: ['hotel_ausgebucht', 'genehmiger_urlaub'],
        constraints: sys.concat([schwelle]),
        enforcement: 'runtime'
      }));
      var svg = HR.komponenten.handlungsraum.zeichnen({ regeln: sys.concat([schwelle]), trajektorie: e.trajectory });
      expect(svg).toContain('spur__abweisung');
      expect(svg).toContain('ist-blockiert');
    });
  });

  describe('Screen 1 — Der Clash', function () {
    function html(z) { return HR.screens[1].zeichnen(z); }

    it('zeigt beide Beschriftungen als einzige Versalien der Seite', function () {
      var h = html(anfang());
      expect(h).toContain('IMPERATIV');
      expect(h).toContain('DEKLARATIV');
    });
    it('zeigt die drei Systemregeln als Saetze', function () {
      expect(html(anfang()).split('class="regelsatz"').length - 1).toBe(3);
    });
    it('sperrt die Stoerungen, solange nicht gestartet wurde', function () {
      expect(html(anfang())).toContain('data-aktion="stoerung" data-wert="reise_verlaengert" disabled');
    });
    it('gibt die Stoerungen nach dem Start frei', function () {
      var z = red(anfang(), { typ: 'gestartet' });
      expect(html(z)).toContain('data-aktion="stoerung" data-wert="reise_verlaengert"');
      expect(html(z).indexOf('data-wert="reise_verlaengert" disabled')).toBe(-1);
    });
    it('zeigt die Badge erst, wenn der Automat stehen bleibt', function () {
      expect(html(anfang()).indexOf('badge--verstoss')).toBe(-1);
      var z = red(anfang(), { typ: 'fsm_ereignis', ereignis: 'hotel_storniert' });
      expect(html(z)).toContain('badge--verstoss');
    });
    it('zeigt den Variantenzaehler', function () {
      expect(html(anfang())).toContain('Modellierte Varianten');
    });
    it('bietet den Weiterweg erst nach einer Stoerung an', function () {
      expect(html(anfang()).indexOf('uebergang')).toBe(-1);
      var z = red(anfang(), { typ: 'stoerung', id: 'beleg_fehlt' });
      expect(html(z)).toContain('uebergang');
    });
    it('nennt vor der ersten Stoerung, dass es keinen Unterschied gibt', function () {
      var e = HR.agent.mock.laufSynchron(HR.agent.anfrage({ constraints: HR.compiler.systemRegeln() }));
      var z = red(red(anfang(), { typ: 'lauf_fertig', ergebnis: e, kontext: {} }), { typ: 'gestartet' });
      expect(html(z)).toContain('Jetzt kommt die Realität dazwischen');
    });
  });
})(window.HR = window.HR || {});
