/** Zustandsspeicher: ein Reducer, ein Abonnement. Mehr braucht die Seite nicht. */
(function (HR) {
  'use strict';

  /**
   * Akt 0 ist der Vorspann, die Akte 1 bis 5 sind die Leiste. Der Einstieg
   * liegt auf 0: die erste Handlung des Besuchers ist eine Entscheidung.
   */
  var AKT_MIN = 0, AKT_MAX = 5;

  /** `?screen=N` bleibt als Alias gueltig. Der Audit war 4 und ist jetzt Akt 5. */
  var SCREEN_ZU_AKT = { 1: 1, 2: 2, 3: 3, 4: 5 };

  function begrenzen(n) {
    n = Number(n);
    if (!(n >= AKT_MIN && n <= AKT_MAX)) return AKT_MIN;
    return Math.round(n);
  }

  function anfang() {
    return {
      akt: 0,
      fsm: HR.imperative.neu(),
      fsmSchritt: -1,
      gestartet: false,
      stoerungGeworfen: null,
      lauf: null,            // aktuelles Ergebnis
      laufKontext: null,     // {stoerungen, regeln, enforcement, mitNutzerregel}
      spurSchritt: -1,       // Animationsindex der Trajektorie
      laeuft: false,
      regeln: HR.compiler.systemRegeln(),
      enforcement: 'runtime',
      entwurf: null,
      entwurfFehler: null,
      historie: [],          // je Lauf: {regeln, verstoesse, cent}
      antwort2: null,
      laufOhneRegel: null,
      laufMitRegel: null,
      offeneZeilen: {},
      consent: false,
      hinweis: null,
      /** Die Wahl aus Akt 0: 'heute' (imperativ) oder 'agent' (deklarativ). */
      wahl: null,
      /** In Akt 1 gewaehlte, noch nicht eingeworfene Stoerung. */
      stoerungWahl: null,
      /** Der in Akt 4 gewaehlte Ort der Regel. */
      platzierung: null,
      /** Akt 4, Teil 2: je Regel ein Ort. */
      zuordnung: HR.muster.leereZuordnung()
    };
  }

  function kopie(z) {
    var n = {};
    for (var k in z) if (Object.prototype.hasOwnProperty.call(z, k)) n[k] = z[k];
    return n;
  }

  function reduzieren(z, a) {
    var n;
    switch (a.typ) {
      case 'akt':
        n = kopie(z); n.akt = begrenzen(a.n); n.hinweis = null; return n;

      // Die Wahl aus Akt 0 fuehrt in einem Zug nach Akt 1. Beide Seiten laufen
      // dort weiter — die gewaehlte steht vorn, die andere bleibt sichtbar.
      case 'wahl':
        n = kopie(z);
        n.wahl = (a.wert === 'heute' || a.wert === 'agent') ? a.wert : null;
        n.akt = 1;
        n.hinweis = null;
        return n;

      // Alias: die Bildschirmnummern der ersten Fassung zeigen weiter auf ihren Akt.
      case 'screen':
        n = kopie(z); n.akt = begrenzen(SCREEN_ZU_AKT[Number(a.n)]); n.hinweis = null; return n;

      case 'fsm_ereignis': {
        n = kopie(z);
        n.fsm = HR.imperative.neu();
        n.fsm.zustand = z.fsm.zustand;
        n.fsm.verlauf = z.fsm.verlauf.slice();
        n.fsm.varianten = z.fsm.varianten;
        n.fsm.gestoppt = z.fsm.gestoppt;
        n.fsm.fehler = z.fsm.fehler;
        HR.imperative.senden(n.fsm, a.ereignis);
        n.fsmSchritt = n.fsm.verlauf.length - 1;
        return n;
      }

      case 'fsm_reset':
        n = kopie(z); n.fsm = HR.imperative.neu(); n.fsmSchritt = -1; return n;

      // Neustart der Kette, aber die Zahl der noetigen Varianten bleibt stehen:
      // sie ist das Gedaechtnis der Demo.
      case 'fsm_neustart': {
        n = kopie(z);
        n.fsm = HR.imperative.neu();
        n.fsm.varianten = z.fsm.varianten;
        n.fsmSchritt = -1;
        return n;
      }

      case 'lauf_start':
        n = kopie(z); n.laeuft = true; n.spurSchritt = -1; n.hinweis = null; return n;

      case 'lauf_fertig': {
        n = kopie(z);
        n.lauf = a.ergebnis;
        n.laufKontext = a.kontext || null;
        n.laeuft = false;
        n.spurSchritt = -1;
        n.historie = z.historie.concat([{
          regeln: (a.kontext && a.kontext.regeln ? a.kontext.regeln.length : z.regeln.length),
          verstoesse: HR.checker.zaehleVerstoesse(a.ergebnis.violations),
          cent: HR.tokens.schaetzen(a.kontext && a.kontext.regeln ? a.kontext.regeln : z.regeln).cent
        }]);
        if (a.kontext && a.kontext.mitNutzerregel) n.laufMitRegel = a.ergebnis;
        else if (a.kontext && a.kontext.vergleichsbasis) n.laufOhneRegel = a.ergebnis;
        return n;
      }

      case 'spur_schritt':
        n = kopie(z); n.spurSchritt = a.i; return n;

      // Erst waehlen, dann laufen lassen. Die Wahl allein aendert noch nichts
      // am Modell — sie sagt nur, womit der naechste Lauf zu rechnen hat.
      case 'stoerung_waehlen': {
        n = kopie(z);
        n.stoerungWahl = (z.stoerungWahl === a.id) ? null : a.id;
        return n;
      }

      case 'stoerung':
        n = kopie(z); n.stoerungGeworfen = a.id; n.gestartet = true; return n;

      case 'gestartet':
        n = kopie(z); n.gestartet = true; return n;

      case 'entwurf':
        n = kopie(z); n.entwurf = a.constraint || null; n.entwurfFehler = a.fehler || null; return n;

      case 'regel_uebernehmen':
        if (!z.entwurf) return z;
        n = kopie(z);
        n.regeln = z.regeln.concat([z.entwurf]);
        n.entwurf = null; n.entwurfFehler = null;
        return n;

      case 'regel_entfernen':
        n = kopie(z);
        n.regeln = z.regeln.filter(function (c) { return c.id !== a.id; });
        return n;

      case 'enforcement':
        n = kopie(z); n.enforcement = a.wert; return n;

      case 'platzierung':
        n = kopie(z);
        n.platzierung = HR.platzierung.PLATZIERUNGEN.indexOf(a.wert) === -1 ? null : a.wert;
        return n;

      case 'zuordnung': {
        if (HR.muster.REGELPLAETZE.indexOf(a.regel) === -1) return z;
        if (HR.platzierung.PLATZIERUNGEN.indexOf(a.ort) === -1) return z;
        n = kopie(z);
        n.zuordnung = kopie(z.zuordnung);
        n.zuordnung[a.regel] = a.ort;
        return n;
      }

      case 'zuordnung_zuruecksetzen':
        n = kopie(z); n.zuordnung = HR.muster.leereZuordnung(); return n;

      case 'antwort2':
        n = kopie(z); n.antwort2 = a.wert; return n;

      case 'zeile_umschalten': {
        n = kopie(z);
        n.offeneZeilen = kopie(z.offeneZeilen);
        n.offeneZeilen[a.i] = !n.offeneZeilen[a.i];
        return n;
      }

      case 'consent':
        n = kopie(z); n.consent = true; return n;

      case 'hinweis':
        n = kopie(z); n.hinweis = a.text || null; return n;

      case 'reset':
        return anfang();

      default:
        return z;
    }
  }

  var zustand = anfang();
  var hoerer = [];

  HR.store = {
    AKT_MIN: AKT_MIN,
    AKT_MAX: AKT_MAX,
    SCREEN_ZU_AKT: SCREEN_ZU_AKT,
    anfang: anfang,
    reduzieren: reduzieren,
    holen: function () { return zustand; },
    senden: function (aktion) {
      var neu = reduzieren(zustand, aktion);
      if (neu === zustand) return zustand;
      zustand = neu;
      for (var i = 0; i < hoerer.length; i++) hoerer[i](zustand, aktion);
      return zustand;
    },
    abonnieren: function (fn) {
      hoerer.push(fn);
      return function () { hoerer = hoerer.filter(function (f) { return f !== fn; }); };
    }
  };
})(window.HR = window.HR || {});
