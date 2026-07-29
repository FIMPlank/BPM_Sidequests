/**
 * Der Live-Pfad, gefahren gegen eine oertliche Attrappe.
 * In keinem Test wird ein Netzwerkaufruf gemacht oder ein Modell befragt.
 */
(function (HR) {
  'use strict';

  /** Antwort, wie sie die Edge Function liefert: teils unvollstaendig, teils fremd. */
  var ANTWORT = {
    trajectory: [
      { i: 0, t: 0, actor: 'agent', action: 'werkzeug_aufruf', tool: 'reiseantrag_stellen',
        input: { ziel: 'Hamburg', von: '2026-03-02', bis: '2026-03-04' },
        output: { status: 'gestellt', antrag_id: 'RA-2481' } },
      { i: 1, t: 1400, actor: 'agent', tool: 'genehmigung_anfordern',
        input: { begruendung: 'Projekttermin beim Kunden' },
        output: { status: 'ausstehend', grund: 'genehmiger_abwesend' } },
      { i: 2, t: 2600, actor: 'agent', tool: 'hotel_buchen',
        input: { name: 'Stadthotel Zentrum', preis_pro_nacht: 260, naechte: 2 },
        output: { status: 'abgelehnt', regel: 'U-1' },
        guardrail: { rule_id: 'L-ab12x', blocked: true, reason: 'threshold:genehmigung_anfordern' } },
      { i: 3, t: 3900, actor: 'agent', tool: 'genehmigung_anfordern',
        input: { begruendung: 'Vertretungsregelung', genehmiger: 'vertretung' },
        output: { status: 'erteilt', genehmiger: 'vertretung' } },
      { i: 4, t: 5200, actor: 'agent', tool: 'hotel_buchen',
        input: { name: 'Stadthotel Zentrum', preis_pro_nacht: 260, naechte: 2 },
        output: { status: 'gebucht', buchung_id: 'HB-1', gesamt: 520 } },
      { i: 5, t: 6100, actor: 'agent', tool: 'beleg_pruefen',
        input: { beleg_id: 'BEL-HB-1' }, output: { status: 'geprueft' } },
      { i: 6, t: 7000, actor: 'agent', tool: 'abrechnung_einreichen',
        input: { betrag: 520, belege: ['BEL-HB-1'] }, output: { status: 'eingereicht', betrag: 520 } },
      { i: 7, t: 7800, actor: 'agent', tool: 'erstattung_ausloesen',
        input: { betrag: 520 }, output: { status: 'erstattet', betrag: 520 } }
    ],
    result: { goal_reached: true, betrag: 520 },
    usage: { input_tokens: 1840, output_tokens: 512 },
    violations: [],
    unbekanntes_feld: 'wird ignoriert'
  };

  var REGELANTWORT = {
    ok: true,
    constraint: {
      id: 'L-ab12x', text_de: 'Buchungen über 200 € pro Nacht brauchen eine Freigabe',
      kind: 'threshold', target: 'hotel_buchen',
      predicate: {
        type: 'wenn_dann',
        wenn: { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 200 },
        dann: { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern', mit_ergebnis: 'erteilt' }
      },
      source: 'user', enforcement: 'runtime'
    }
  };

  var gesehen = [];
  function attrappe(antwort) {
    return function (koerper) {
      gesehen.push(koerper);
      return Promise.resolve(antwort);
    };
  }

  function mitAttrappe(antwort, fn) {
    var echt = HR.agent.live.transport;
    gesehen = [];
    HR.agent.live.transport = attrappe(antwort);
    try { fn(); } finally { HR.agent.live.transport = echt; }
  }

  function anfrage() {
    return HR.agent.anfrage({
      disturbances: ['hotel_ausgebucht', 'genehmiger_urlaub'],
      constraints: HR.compiler.systemRegeln(),
      enforcement: 'runtime'
    });
  }

  var geprueft = HR.agent.live.antwortPruefen(ANTWORT);

  describe('Live-Runner — Vertrag', function () {
    it('nennt seinen Modus', function () { expect(HR.agent.live.modus).toBe('live'); });
    it('setzt den Endpunkt aus der Konfiguration zusammen', function () {
      expect(HR.agent.live.endpunkt().indexOf('/functions/v1/agent-run')).toBeGreaterThan(-1);
    });
    it('prueft die Anfrage vor dem Absenden', function () {
      expect(HR.agent.anfragePruefen({ disturbances: [] })).toBe('regeln_fehlen');
    });
    it('schickt Aufgabe, Stoerungen, Regeln und Durchsetzung mit', function () {
      mitAttrappe(ANTWORT, function () { HR.agent.live.run(anfrage()); });
      expect(gesehen[0].aufgabe).toBe('lauf');
      expect(gesehen[0].disturbances.length).toBe(2);
      expect(gesehen[0].constraints.length).toBe(3);
      expect(gesehen[0].enforcement).toBe('runtime');
    });
    it('lehnt eine Antwort ohne Trajektorie ab', function () {
      expect(function () { HR.agent.live.antwortPruefen({ result: { goal_reached: true } }); }).toThrow();
    });
    it('lehnt eine Fehlerantwort ab', function () {
      expect(function () { HR.agent.live.antwortPruefen({ fehler: 'modell_antwortet_nicht:429' }); }).toThrow();
    });
    it('ergaenzt fehlende Felder eines Schritts', function () {
      expect(geprueft.trajectory[1].action).toBe('werkzeug_aufruf');
      expect(geprueft.trajectory[1].guardrail).toBe(null);
    });
    it('uebernimmt Ergebnis und Nutzung', function () {
      expect(geprueft.result.goal_reached).toBeTruthy();
      expect(geprueft.result.betrag).toBe(520);
      expect(geprueft.usage.input_tokens).toBe(1840);
    });
    it('haelt sich an dieselbe Schrittform wie der skriptierte Agent', function () {
      var mock = HR.agent.mock.laufSynchron(HR.agent.anfrage({ constraints: HR.compiler.systemRegeln() }));
      expect(Object.keys(geprueft.trajectory[0]).sort().join(',')).toBe(Object.keys(mock.trajectory[0]).sort().join(','));
    });
  });

  describe('Live-Antwort treibt alle vier Bildschirme', function () {
    var regeln = HR.compiler.systemRegeln().concat([REGELANTWORT.constraint]);
    var z = HR.store.reduzieren(HR.store.anfang(), {
      typ: 'lauf_fertig', ergebnis: geprueft,
      kontext: { regeln: regeln, screen: 3, enforcement: 'runtime',
        stoerungen: ['hotel_ausgebucht', 'genehmiger_urlaub'], mitNutzerregel: true }
    });
    z = HR.store.reduzieren(z, { typ: 'spur_schritt', i: geprueft.trajectory.length - 1 });

    it('Screen 1 zeichnet die Spur der Live-Antwort', function () {
      var h = HR.screens[1].zeichnen(z);
      expect(h).toContain('spur__segment');
      expect(h).toContain('spur__abweisung');
    });
    it('Screen 2 zeigt den Ablauf bis zur Erstattung', function () {
      var z2 = HR.store.reduzieren(z, { typ: 'lauf_fertig', ergebnis: geprueft,
        kontext: { regeln: regeln, screen: 2 } });
      expect(HR.screens[2].zeichnen(z2)).toContain('erstattung_ausloesen');
    });
    it('Screen 3 zeigt die Anzeigen zum Live-Lauf', function () {
      var h = HR.screens[3].zeichnen(z);
      expect(h).toContain('Verstöße im letzten Lauf');
      expect(h).toContain(REGELANTWORT.constraint.text_de);
    });
    it('Screen 4 baut die Audit-Tabelle mit der Live-Regel', function () {
      var h = HR.screens[4].zeichnen(z);
      expect(h).toContain('logzeile ist-geblockt');
      expect(h).toContain('L-ab12x');
    });
    it('Screen 4 exportiert die Live-Trajektorie vollstaendig', function () {
      var wieder = JSON.parse(HR.screens[4].alsJson(z));
      expect(wieder.trajektorie.length).toBe(8);
      expect(wieder.durchsetzung).toBe('runtime');
    });
  });

  describe('Live-Compiler', function () {
    it('liefert eine Regel, die das Modell akzeptiert', function () {
      expect(HR.constraints.constraintGueltig(REGELANTWORT.constraint)).toBeTruthy();
    });
    it('weist eine Regel ausserhalb der geschlossenen Union zurueck', function () {
      var kaputt = JSON.parse(JSON.stringify(REGELANTWORT.constraint));
      kaputt.predicate = { type: 'javascript', code: 'return true' };
      expect(HR.constraints.constraintGueltig(kaputt)).toBeFalsy();
    });
    it('schickt die Aufgabe regel mit dem Text mit', function () {
      mitAttrappe(REGELANTWORT, function () { HR.agent.live.regelUebersetzen('Keine Selbstfreigabe'); });
      expect(gesehen[0].aufgabe).toBe('regel');
      expect(gesehen[0].text).toBe('Keine Selbstfreigabe');
    });
  });
})(window.HR = window.HR || {});
