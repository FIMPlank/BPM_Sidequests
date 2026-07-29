/* Werkzeuge, Automat, Praedikate, Token-Schaetzung. */
(function (HR) {
  'use strict';

  function schritt(i, tool, input, output, guardrail) {
    return { i: i, t: i * 100, actor: 'agent', action: 'werkzeug', tool: tool, input: input || {}, output: output || { status: 'ok' }, guardrail: guardrail || null };
  }
  HR.testHelfer = { schritt: schritt };

  describe('Werkzeuge', function () {
    it('kennt genau acht Werkzeuge', function () {
      expect(HR.tools.namen.length).toBe(8);
    });
    it('enthaelt die beiden Abkuerzungen als regulaere Werkzeuge', function () {
      expect(HR.tools.namen).toContain('selbst_freigeben');
      expect(HR.tools.namen).toContain('beleg_schaetzen');
    });
    it('jedes Werkzeug hat eine Beschreibung und Parameter', function () {
      HR.tools.liste.forEach(function (t) {
        expect(t.beschreibung.length).toBeGreaterThan(10);
        expect(t.parameter.length).toBeGreaterThan(0);
      });
    });
    it('reiseantrag_stellen legt einen Antrag in der Welt an', function () {
      var w = HR.tools.neueWelt([]);
      var r = HR.tools.ausfuehren('reiseantrag_stellen', { ziel: 'Wien', von: 'a', bis: 'b' }, w);
      expect(r.status).toBe('gestellt');
      expect(w.antrag.ziel).toBe('Wien');
    });
    it('genehmigung_anfordern erteilt ohne Stoerung', function () {
      var w = HR.tools.neueWelt([]);
      expect(HR.tools.ausfuehren('genehmigung_anfordern', { begruendung: 'x' }, w).status).toBe('erteilt');
    });
    it('genehmigung_anfordern bleibt ausstehend, wenn der Genehmiger fehlt', function () {
      var w = HR.tools.neueWelt(['genehmiger_urlaub']);
      expect(HR.tools.ausfuehren('genehmigung_anfordern', { begruendung: 'x' }, w).status).toBe('ausstehend');
    });
    it('eine benannte Vertretung genehmigt trotz Abwesenheit', function () {
      var w = HR.tools.neueWelt(['genehmiger_urlaub']);
      var r = HR.tools.ausfuehren('genehmigung_anfordern', { begruendung: 'x', genehmiger: 'vertretung' }, w);
      expect(r.status).toBe('erteilt');
    });
    it('hotel_buchen rechnet den Gesamtbetrag und legt einen Beleg an', function () {
      var w = HR.tools.neueWelt([]);
      var r = HR.tools.ausfuehren('hotel_buchen', { name: 'H', preis_pro_nacht: 260, naechte: 2 }, w);
      expect(r.gesamt).toBe(520);
      expect(w.belege.length).toBe(1);
    });
    it('beleg_pruefen findet nichts, wenn der Beleg fehlt', function () {
      var w = HR.tools.neueWelt(['beleg_fehlt']);
      expect(HR.tools.ausfuehren('beleg_pruefen', { beleg_id: 'B1' }, w).status).toBe('nicht_gefunden');
    });
    it('unbekannte Werkzeuge werden sauber abgewiesen', function () {
      var w = HR.tools.neueWelt([]);
      expect(HR.tools.ausfuehren('rakete_starten', {}, w).status).toBe('unbekanntes_werkzeug');
    });
  });

  describe('Imperatives Modell', function () {
    it('startet im Zustand start mit einer Variante', function () {
      var a = HR.imperative.neu();
      expect(a.zustand).toBe('start');
      expect(a.varianten).toBe(1);
    });
    it('laeuft die modellierte Kette vollstaendig durch', function () {
      var a = HR.imperative.neu();
      HR.imperative.KNOTEN.forEach(function (e) {
        expect(HR.imperative.senden(a, e).ok).toBeTruthy();
      });
      expect(HR.imperative.istFertig(a)).toBeTruthy();
    });
    it('kennt fuer keine Stoerung eine Transition', function () {
      HR.imperative.STOERUNGEN.forEach(function (s) {
        var a = HR.imperative.neu();
        HR.imperative.senden(a, 'antrag_stellen');
        var r = HR.imperative.senden(a, s);
        expect(r.ok).toBeFalsy();
        expect(r.fehler).toBe('keine_transition');
      });
    });
    it('zaehlt je Stoerung eine weitere Prozessvariante', function () {
      var a = HR.imperative.neu();
      HR.imperative.senden(a, 'reise_verlaengert');
      expect(a.varianten).toBe(2);
    });
    it('bleibt nach einer Stoerung stehen', function () {
      var a = HR.imperative.neu();
      HR.imperative.senden(a, 'beleg_fehlt');
      expect(a.gestoppt).toBeTruthy();
      expect(HR.imperative.senden(a, 'antrag_stellen').fehler).toBe('automat_gestoppt');
    });
    it('nennt das naechste modellierte Ereignis', function () {
      var a = HR.imperative.neu();
      expect(HR.imperative.naechstesEreignis(a)).toBe('antrag_stellen');
    });
  });

  describe('Praedikate', function () {
    var traj = [
      schritt(0, 'reiseantrag_stellen', { ziel: 'Wien' }, { status: 'gestellt' }),
      schritt(1, 'genehmigung_anfordern', { begruendung: 'x' }, { status: 'ausstehend' }),
      schritt(2, 'hotel_buchen', { preis_pro_nacht: 260, naechte: 2 }, { status: 'gebucht' })
    ];
    function kontext(i) {
      return { aufruf: traj[i], vorher: traj.slice(0, i), nachher: traj.slice(i + 1), alle: traj };
    }

    it('feld_vergleich vergleicht numerisch', function () {
      var p = { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 200 };
      expect(HR.constraints.auswerten(p, kontext(2)).wert).toBeTruthy();
    });
    it('feld_vergleich liefert den tatsaechlichen Wert als Beleg', function () {
      var p = { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 200 };
      expect(HR.constraints.auswerten(p, kontext(2)).tatsaechlich).toBe(260);
    });
    it('feld_vergleich ist falsch unterhalb der Schwelle', function () {
      var p = { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 300 };
      expect(HR.constraints.auswerten(p, kontext(2)).wert).toBeFalsy();
    });
    it('vorheriger_aufruf findet einen frueheren Aufruf', function () {
      var p = { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern' };
      expect(HR.constraints.auswerten(p, kontext(2)).wert).toBeTruthy();
    });
    it('vorheriger_aufruf unterscheidet nach Ergebnis', function () {
      var p = { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern', mit_ergebnis: 'erteilt' };
      expect(HR.constraints.auswerten(p, kontext(2)).wert).toBeFalsy();
    });
    it('folgender_aufruf schaut nach vorne', function () {
      var p = { type: 'folgender_aufruf', tool: 'hotel_buchen' };
      expect(HR.constraints.auswerten(p, kontext(0)).wert).toBeTruthy();
    });
    it('kein_aufruf ist erfuellt, solange das Werkzeug fehlt', function () {
      var p = { type: 'kein_aufruf', tool: 'selbst_freigeben' };
      expect(HR.constraints.auswerten(p, kontext(2)).wert).toBeTruthy();
    });
    it('kein_aufruf schlaegt fehl, sobald das Werkzeug vorkommt', function () {
      var p = { type: 'kein_aufruf', tool: 'hotel_buchen' };
      expect(HR.constraints.auswerten(p, kontext(2)).wert).toBeFalsy();
    });
    it('und verlangt alle Teile', function () {
      var p = { type: 'und', teile: [
        { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 200 },
        { type: 'vorheriger_aufruf', tool: 'reiseantrag_stellen' }
      ] };
      expect(HR.constraints.auswerten(p, kontext(2)).wert).toBeTruthy();
    });
    it('wenn_dann ist nicht anwendbar, wenn die Bedingung nicht greift', function () {
      var p = { type: 'wenn_dann',
        wenn: { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 500 },
        dann: { type: 'vorheriger_aufruf', tool: 'selbst_freigeben' } };
      var r = HR.constraints.auswerten(p, kontext(2));
      expect(r.wert).toBeTruthy();
      expect(r.nicht_anwendbar).toBeTruthy();
    });
    it('wenn_dann schlaegt fehl, wenn die Forderung nicht erfuellt ist', function () {
      var p = { type: 'wenn_dann',
        wenn: { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 200 },
        dann: { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern', mit_ergebnis: 'erteilt' } };
      expect(HR.constraints.auswerten(p, kontext(2)).wert).toBeFalsy();
    });
    it('geblockte Schritte zaehlen nicht als Aufruf', function () {
      var t2 = traj.concat([schritt(3, 'hotel_buchen', { preis_pro_nacht: 90 }, { status: 'abgelehnt' }, { rule_id: 'R-1', blocked: true, reason: 'x' })]);
      var p = { type: 'vorheriger_aufruf', tool: 'hotel_buchen' };
      var r = HR.constraints.auswerten(p, { aufruf: null, vorher: [t2[3]], nachher: [], alle: t2 });
      expect(r.wert).toBeFalsy();
    });
  });

  describe('Regelvalidierung', function () {
    it('akzeptiert nur Praedikate der geschlossenen Union', function () {
      expect(HR.constraints.praedikatGueltig({ type: 'javascript', code: '1' })).toBeFalsy();
    });
    it('lehnt unbekannte Werkzeuge im Praedikat ab', function () {
      expect(HR.constraints.praedikatGueltig({ type: 'kein_aufruf', tool: 'rakete' })).toBeFalsy();
    });
    it('lehnt unbekannte Operatoren ab', function () {
      expect(HR.constraints.praedikatGueltig({ type: 'feld_vergleich', feld: 'a', op: '=~', wert: 1 })).toBeFalsy();
    });
    it('verlangt bei und mindestens zwei Teile', function () {
      expect(HR.constraints.praedikatGueltig({ type: 'und', teile: [{ type: 'kein_aufruf', tool: 'hotel_buchen' }] })).toBeFalsy();
    });
    it('prueft eine vollstaendige Regel', function () {
      expect(HR.constraints.constraintGueltig(HR.compiler.systemRegeln()[0])).toBeTruthy();
    });
    it('lehnt eine Regel mit unbekannter Art ab', function () {
      var c = HR.compiler.systemRegeln()[0];
      c.kind = 'magie';
      expect(HR.constraints.constraintGueltig(c)).toBeFalsy();
    });
  });

  describe('Token- und Kostenschaetzung', function () {
    it('hat eine Grundlast groesser null', function () {
      expect(HR.tokens.basisTokens()).toBeGreaterThan(100);
    });
    it('waechst mit jeder Regel', function () {
      var a = HR.tokens.schaetzen([]);
      var b = HR.tokens.schaetzen(HR.compiler.systemRegeln());
      expect(b.gesamt).toBeGreaterThan(a.gesamt);
    });
    it('rechnet Kosten aus Token und Satz', function () {
      var s = HR.tokens.schaetzen([]);
      expect(s.cent).toBeCloseTo((s.gesamt / 1000) * HR.config.centsPerKiloToken, 9);
    });
    it('formatiert Cent mit drei Nachkommastellen', function () {
      expect(HR.tokens.centText(0.1234)).toBe('0,123');
    });
    it('schreibt jede Praedikatart in den Regelblock', function () {
      expect(HR.tokens.praedikatText({ type: 'wenn_dann',
        wenn: { type: 'feld_vergleich', feld: 'preis_pro_nacht', op: '>', wert: 200 },
        dann: { type: 'kein_aufruf', tool: 'hotel_buchen' } }))
        .toBe('wenn preis_pro_nacht > 200 dann nie hotel_buchen');
    });
  });
})(window.HR = window.HR || {});
