/** Zustandsspeicher: ein Reducer, ein Abonnement. Mehr braucht die Seite nicht. */
(function (HR) {
  'use strict';

  function anfang() {
    return {
      screen: 1,
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
      hinweis: null
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
      case 'screen':
        n = kopie(z); n.screen = a.n; n.hinweis = null; return n;

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
