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

  describe('Screen 2 — Der Preis der Autonomie', function () {
    function html(z) { return HR.screens[2].zeichnen(z); }
    function nachLauf() {
      var sys = HR.compiler.systemRegeln();
      var e = HR.agent.mock.laufSynchron(HR.agent.anfrage({
        disturbances: HR.screens[2].STOERUNGEN, constraints: sys, enforcement: 'runtime'
      }));
      return red(anfang(), { typ: 'lauf_fertig', ergebnis: e,
        kontext: { regeln: sys, screen: 2, vergleichsbasis: true } });
    }

    it('wirft beide Stoerungen zusammen ein', function () {
      expect(HR.screens[2].STOERUNGEN.length).toBe(2);
      expect(html(anfang())).toContain('Genehmiger im Urlaub');
    });
    it('zeigt vor dem Lauf weder Ergebnis noch Frage', function () {
      expect(html(anfang()).indexOf('frage__text')).toBe(-1);
    });
    it('meldet nach dem Lauf das erreichte Ziel', function () {
      expect(html(nachLauf())).toContain('Ziel erreicht');
    });
    it('zeigt den Ablauf inklusive Selbstfreigabe', function () {
      expect(html(nachLauf())).toContain('selbst_freigeben');
    });
    it('meldet ehrlich null Verstoesse', function () {
      var h = html(nachLauf());
      expect(h).toContain('pruefpanel__wert mono">0<');
      expect(h).toContain('Alle hinterlegten Regeln wurden eingehalten');
    });
    it('warnt an keiner Stelle vor dem Agenten', function () {
      var h = html(nachLauf()).toLowerCase();
      expect(h.indexOf('achtung')).toBe(-1);
      expect(h.indexOf('warnung')).toBe(-1);
      expect(h.indexOf('vorsicht')).toBe(-1);
    });
    it('stellt danach die eine Frage', function () {
      expect(html(nachLauf())).toContain('Sind Sie damit einverstanden?');
    });
    it('bietet Ja und Nein an', function () {
      var h = html(nachLauf());
      expect(h).toContain('data-aktion="preis-antwort" data-wert="ja"');
      expect(h).toContain('data-aktion="preis-antwort" data-wert="nein"');
    });
    it('antwortet auf Ja mit dem Verweis auf die Innenrevision', function () {
      var z = red(nachLauf(), { typ: 'antwort2', wert: 'ja' });
      expect(html(z)).toContain('Innenrevision');
    });
    it('zeigt den erstatteten Betrag', function () {
      expect(html(nachLauf())).toContain('520,00 €');
    });
  });


  describe('Screen 3 — Sie modellieren', function () {
    function html(z) { return HR.screens[3].zeichnen(z); }
    var satz = 'Buchungen über 200 € pro Nacht brauchen eine Freigabe';
    function mitEntwurf() {
      return red(anfang(), { typ: 'entwurf', constraint: HR.compiler.uebersetzen(satz).constraint });
    }

    it('zeigt alle fuenf Anzeigen', function () {
      var h = html(anfang());
      ['Regeln', 'Kontext-Token je Lauf', 'Kosten je Lauf', 'Freiheitsgrade', 'Verstöße im letzten Lauf']
        .forEach(function (n) { expect(h).toContain(n); });
    });
    it('zeigt Kosten mit drei Nachkommastellen', function () {
      expect(/instrument__wert mono[^>]*>\d+,\d{3}/.test(html(anfang()))).toBeTruthy();
    });
    it('zeigt vor dem ersten Lauf keinen Verstosswert', function () {
      expect(html(anfang())).toContain('>—<');
    });
    it('bietet das Eingabefeld mit Beispiel an', function () {
      var h = html(anfang());
      expect(h).toContain('id="regel-eingabe"');
      expect(h).toContain('data-enter="regel-pruefen"');
    });
    it('liest den Entwurf lesbar zurueck', function () {
      var h = html(mitEntwurf());
      expect(h).toContain('Erkannt');
      expect(h).toContain('Schwellenwert-Regel');
      expect(h).toContain('preis_pro_nacht &gt; 200');
    });
    it('bietet Uebernehmen und Verwerfen an', function () {
      var h = html(mitEntwurf());
      expect(h).toContain('data-aktion="regel-uebernehmen"');
      expect(h).toContain('data-aktion="regel-verwerfen"');
    });
    it('nennt bei Ablehnung den Grund und ein Beispiel', function () {
      var z = red(anfang(), { typ: 'entwurf', fehler: { code: 'kein_werkzeug' } });
      var h = html(z);
      expect(h).toContain('Kein Vorgang erkannt');
      expect(h).toContain('So funktioniert es');
    });
    it('fuehrt die uebernommene Regel in der Liste', function () {
      var z = red(mitEntwurf(), { typ: 'regel_uebernehmen' });
      var h = html(z);
      expect(h).toContain(satz);
      expect(h).toContain('data-aktion="regel-entfernen"');
    });
    it('zieht mit der neuen Regel die Freiheitsgrade herunter', function () {
      var ohne = HR.freedom.freiheitsgrade(anfang().regeln).prozent;
      var mit = HR.freedom.freiheitsgrade(red(mitEntwurf(), { typ: 'regel_uebernehmen' }).regeln).prozent;
      expect(mit).toBeLessThan(ohne);
    });
    it('markiert den aktiven Durchsetzungspunkt', function () {
      expect(html(anfang())).toContain('data-wert="runtime" aria-pressed="true"');
      var z = red(anfang(), { typ: 'enforcement', wert: 'posthoc' });
      expect(html(z)).toContain('data-wert="posthoc" aria-pressed="true"');
    });
    it('erklaert beide Durchsetzungspunkte unterschiedlich', function () {
      expect(html(anfang())).toContain('an der Werkzeuggrenze hart geprüft');
      expect(html(red(anfang(), { typ: 'enforcement', wert: 'posthoc' }))).toContain('läuft frei');
    });
    it('stellt die Frage nach dem Ort der Kontrolle', function () {
      expect(html(anfang())).toContain('Autonomie vorne — Kontrolle hinten?');
    });
    it('zeigt statt des Plots einen Hinweis, solange kein Lauf vorliegt', function () {
      expect(html(anfang())).toContain('Führen Sie einen Lauf aus');
    });
    it('zeichnet je Lauf einen Punkt je Reihe', function () {
      var svg = HR.komponenten.plot.zeichnen([
        { regeln: 3, verstoesse: 1, cent: 0.18 },
        { regeln: 4, verstoesse: 0, cent: 0.2 }
      ]);
      expect(svg.split('plot__punkt').length - 1).toBe(4);
      expect(svg).toContain('ist-verstoesse');
      expect(svg).toContain('ist-kosten');
    });
    it('beschriftet die guenstige Stelle nicht', function () {
      var svg = HR.komponenten.plot.zeichnen([{ regeln: 4, verstoesse: 0, cent: 0.2 }]);
      expect(svg.toLowerCase().indexOf('sweet')).toBe(-1);
      expect(svg.toLowerCase().indexOf('optimum')).toBe(-1);
    });
  });


  describe('Screen 4 — Der Audit', function () {
    var sys = HR.compiler.systemRegeln();
    var schwelle = HR.compiler.uebersetzen('Buchungen über 200 € pro Nacht brauchen eine Freigabe', { id: 'U-9' }).constraint;
    var stoer = ['hotel_ausgebucht', 'genehmiger_urlaub'];

    function lauf(regeln, art) {
      return HR.agent.mock.laufSynchron(HR.agent.anfrage({
        disturbances: stoer, constraints: regeln, enforcement: art || 'runtime'
      }));
    }
    function zustandMitLaeufen() {
      var a = lauf(sys);
      var b = lauf(sys.concat([schwelle]));
      var z = red(anfang(), { typ: 'lauf_fertig', ergebnis: a,
        kontext: { regeln: sys, screen: 2, stoerungen: stoer, vergleichsbasis: true } });
      z = red(z, { typ: 'lauf_fertig', ergebnis: b,
        kontext: { regeln: sys.concat([schwelle]), screen: 3, stoerungen: stoer, enforcement: 'runtime', mitNutzerregel: true } });
      return z;
    }
    function html(z) { return HR.screens[4].zeichnen(z); }

    it('stellt die Auditfrage', function () {
      expect(html(anfang())).toContain('Könnten Sie das im Audit belegen?');
    });
    it('zeigt alle acht Spalten', function () {
      var h = html(zustandMitLaeufen());
      HR.copy.screen4.spalten.forEach(function (n) { expect(h).toContain(n); });
    });
    it('zeigt je Schritt eine Zeile', function () {
      var z = zustandMitLaeufen();
      var h = html(z);
      expect(h.split('class="logzeile').length - 1).toBe(z.lauf.trajectory.length);
    });
    it('nennt in der Constraint-Spalte die geprueften Regeln', function () {
      expect(html(zustandMitLaeufen())).toContain('U-9');
    });
    it('markiert den abgelehnten Aufruf', function () {
      expect(html(zustandMitLaeufen())).toContain('logzeile ist-geblockt');
    });
    it('klappt den Beleg einer Zeile auf', function () {
      var z = zustandMitLaeufen();
      expect(html(z).indexOf('logzeile__beleg')).toBe(-1);
      z = red(z, { typ: 'zeile_umschalten', i: 2 });
      expect(html(z)).toContain('logzeile__beleg');
    });
    it('exportiert JSON, das sich wieder einlesen laesst', function () {
      var z = zustandMitLaeufen();
      var wieder = JSON.parse(HR.screens[4].alsJson(z));
      expect(wieder.trajektorie.length).toBe(z.lauf.trajectory.length);
      expect(wieder.trajektorie[0].tool).toBe(z.lauf.trajectory[0].tool);
      expect(wieder.regeln.length).toBe(4);
      expect(wieder.ergebnis.goal_reached).toBeTruthy();
    });
    it('nimmt keine Sitzungskennung in den Export', function () {
      expect(HR.screens[4].alsJson(zustandMitLaeufen()).indexOf(HR.sessionHash)).toBe(-1);
    });
    it('exportiert CSV mit Kopfzeile und je Schritt einer Zeile', function () {
      var z = zustandMitLaeufen();
      var zeilen = HR.screens[4].alsCsv(z).split(/\r\n/);
      expect(zeilen.length).toBe(z.lauf.trajectory.length + 1);
      expect(zeilen[0]).toContain('Constraint-Check');
    });
    it('maskiert Anfuehrungszeichen im CSV', function () {
      expect(HR.screens[4].alsCsv(zustandMitLaeufen()).indexOf('"""')).toBe(-1);
    });
    it('verlangt fuer den Vergleich beide Laeufe', function () {
      expect(html(anfang())).toContain('Für den Vergleich braucht es');
    });
    it('richtet die Laeufe nach Schritten aus', function () {
      var z = zustandMitLaeufen();
      var zeilen = HR.screens[4].diffZeilen(z.laufOhneRegel, z.laufMitRegel);
      expect(zeilen.length).toBe(Math.max(z.laufOhneRegel.trajectory.length, z.laufMitRegel.trajectory.length));
    });
    it('hebt genau die abweichenden Schritte hervor', function () {
      var z = zustandMitLaeufen();
      var zeilen = HR.screens[4].diffZeilen(z.laufOhneRegel, z.laufMitRegel);
      expect(zeilen[0].anders).toBeFalsy();
      expect(zeilen[1].anders).toBeFalsy();
      expect(zeilen[2].anders).toBeTruthy();
      expect(zeilen.filter(function (r) { return r.anders; }).length).toBeGreaterThan(0);
    });
    it('zeigt die fuenf Selbstcheck-Fragen', function () {
      expect(html(anfang()).split('<li>').length - 1).toBe(5);
    });
  });

})(window.HR = window.HR || {});
