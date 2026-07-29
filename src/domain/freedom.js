/**
 * Freiheitsgrade.
 *
 * FORMEL (muss einem Reviewer standhalten):
 *   Der erreichbare Handlungsraum A ist endlich und diskret definiert als
 *       A = Vereinigung ueber alle Werkzeuge t von ( Kreuzprodukt der Argument-Bins von t ).
 *   Jedes Argument eines Werkzeugs wird in fachlich sinnvolle Klassen (Bins)
 *   zerlegt; jede Klasse wird durch einen Repraesentanten vertreten. |A| = 40.
 *
 *       Freiheitsgrade = | { a aus A : keine Regel verbietet a } | / |A|
 *
 *   Ausgewertet wird gegen die leere Vorgeschichte, also gegen einen Agenten,
 *   der genau jetzt genau diese eine Aktion waehlen wollte. Das ist die
 *   konservative Lesart: Vorbedingungs-Regeln (precedence) schliessen eine
 *   Aktion so lange aus, wie ihre Vorbedingung nicht hergestellt ist.
 *   Die Kennzahl misst damit die unmittelbar sanktionierte Auswahl, nicht die
 *   ueber einen ganzen Lauf hinweg erreichbaren Endzustaende.
 *
 *   Beide Durchsetzungsarten zaehlen gleich: eine Regel schraenkt den
 *   sanktionierten Raum ein, unabhaengig davon, wo sie geprueft wird.
 */
(function (HR) {
  'use strict';

  /** Argument-Bins je Werkzeug, mit Repraesentant je Klasse. */
  var BINS = {
    reiseantrag_stellen: {
      ziel: ['Nuernberg', 'Hamburg', 'Wien'],
      von: ['2026-03-02'], bis: ['2026-03-04']
    },
    genehmigung_anfordern: {
      genehmiger: ['linienvorgesetzter', 'vertretung', 'bereichsleitung'],
      begruendung: ['Projekttermin']
    },
    hotel_buchen: {
      preis_pro_nacht: [75, 125, 175, 250, 400],
      naechte: [1, 4, 7],
      name: ['Hotel']
    },
    beleg_pruefen: { beleg_id: ['BEL-HB-1', 'BEL-HB-2', 'SCH-1'] },
    beleg_schaetzen: { betrag: [25, 75, 150, 400], begruendung: ['Beleg fehlt'] },
    abrechnung_einreichen: { betrag: [200, 600, 1200, 2500], belege: [[]] },
    selbst_freigeben: { betrag: [200, 600, 1200, 2500], begruendung: ['Frist'] },
    erstattung_ausloesen: { betrag: [200, 600, 1200, 2500] }
  };

  /** Erzeugt alle Zellen des Handlungsraums. */
  function raum() {
    var zellen = [];
    HR.tools.namen.forEach(function (tool) {
      var bins = BINS[tool] || {};
      var felder = Object.keys(bins);
      var teil = [{}];
      felder.forEach(function (f) {
        var naechste = [];
        teil.forEach(function (basis) {
          bins[f].forEach(function (wert) {
            var kopie = {};
            for (var k in basis) if (Object.prototype.hasOwnProperty.call(basis, k)) kopie[k] = basis[k];
            kopie[f] = wert;
            naechste.push(kopie);
          });
        });
        teil = naechste;
      });
      teil.forEach(function (input) { zellen.push({ tool: tool, input: input }); });
    });
    return zellen;
  }

  var ZELLEN = raum();

  function alsLaufzeit(constraints) {
    return (constraints || []).map(function (c) {
      if (c.enforcement === 'runtime') return c;
      var kopie = {};
      for (var k in c) if (Object.prototype.hasOwnProperty.call(c, k)) kopie[k] = c[k];
      kopie.enforcement = 'runtime';
      return kopie;
    });
  }

  /**
   * @param {Array} constraints
   * @returns {{gesamt:number, erlaubt:number, anteil:number, prozent:number}}
   */
  function freiheitsgrade(constraints) {
    var regeln = alsLaufzeit(constraints);
    var erlaubt = 0;
    for (var i = 0; i < ZELLEN.length; i++) {
      if (HR.guardrail.pruefeAufruf(ZELLEN[i], [], regeln).erlaubt) erlaubt++;
    }
    return {
      gesamt: ZELLEN.length,
      erlaubt: erlaubt,
      anteil: ZELLEN.length ? erlaubt / ZELLEN.length : 1,
      prozent: ZELLEN.length ? Math.round((erlaubt / ZELLEN.length) * 100) : 100
    };
  }

  HR.freedom = { BINS: BINS, zellen: ZELLEN, raum: raum, freiheitsgrade: freiheitsgrade };
})(window.HR = window.HR || {});
