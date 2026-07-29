/**
 * Das imperative Prozessmodell: ein endlicher Automat mit expliziter
 * Uebergangstabelle. Er kann genau das, was modelliert wurde — und sonst nichts.
 * Genau darin besteht die Aussage der linken Seite.
 *
 * @typedef {Object} Automat
 * @property {string} zustand
 * @property {Array<{ereignis:string, von:string, nach:string}>} verlauf
 * @property {number} varianten      Zahl der noetigen Prozessvarianten
 * @property {boolean} gestoppt
 * @property {string|null} fehler
 */
(function (HR) {
  'use strict';

  /** Knoten der BPMN-artigen Kette, in Reihenfolge. */
  var KNOTEN = [
    'antrag_stellen',
    'genehmigung_erhalten',
    'reise_durchfuehren',
    'belege_sammeln',
    'abrechnung_einreichen',
    'erstattung_erhalten'
  ];

  var ZUSTAENDE = [
    'start',
    'antrag_gestellt',
    'genehmigt',
    'reise_durchgefuehrt',
    'belege_gesammelt',
    'abrechnung_eingereicht',
    'erstattet'
  ];

  /** Explizite Uebergangstabelle. Was hier nicht steht, existiert nicht. */
  var UEBERGAENGE = {
    start:                  { antrag_stellen: 'antrag_gestellt' },
    antrag_gestellt:        { genehmigung_erhalten: 'genehmigt' },
    genehmigt:              { reise_durchfuehren: 'reise_durchgefuehrt' },
    reise_durchgefuehrt:    { belege_sammeln: 'belege_gesammelt' },
    belege_gesammelt:       { abrechnung_einreichen: 'abrechnung_eingereicht' },
    abrechnung_eingereicht: { erstattung_erhalten: 'erstattet' },
    erstattet:              {}
  };

  /** Stoerungen aus der Realitaet. Fuer keine davon gibt es eine Transition. */
  var STOERUNGEN = ['reise_verlaengert', 'beleg_fehlt', 'hotel_storniert'];

  /** @returns {Automat} */
  function neu() {
    return { zustand: 'start', verlauf: [], varianten: 1, gestoppt: false, fehler: null };
  }

  /**
   * Sendet ein Ereignis an den Automaten.
   * @returns {{ok:boolean, zustand:string, fehler:string|null}}
   */
  function senden(automat, ereignis) {
    if (automat.gestoppt) {
      return { ok: false, zustand: automat.zustand, fehler: 'automat_gestoppt' };
    }
    var moeglich = UEBERGAENGE[automat.zustand] || {};
    var nach = moeglich[ereignis];
    if (!nach) {
      automat.gestoppt = true;
      automat.fehler = 'keine_transition';
      automat.varianten += 1;
      return { ok: false, zustand: automat.zustand, fehler: 'keine_transition' };
    }
    automat.verlauf.push({ ereignis: ereignis, von: automat.zustand, nach: nach });
    automat.zustand = nach;
    return { ok: true, zustand: nach, fehler: null };
  }

  /** Naechstes regulaeres Ereignis im Modell, oder null am Ende. */
  function naechstesEreignis(automat) {
    var moeglich = UEBERGAENGE[automat.zustand] || {};
    var keys = Object.keys(moeglich);
    return keys.length ? keys[0] : null;
  }

  /** Index des Knotens, auf dem der Automat gerade steht (fuer die Darstellung). */
  function knotenIndex(automat) {
    return automat.verlauf.length;
  }

  function istFertig(automat) {
    return automat.zustand === 'erstattet';
  }

  HR.imperative = {
    KNOTEN: KNOTEN,
    ZUSTAENDE: ZUSTAENDE,
    UEBERGAENGE: UEBERGAENGE,
    STOERUNGEN: STOERUNGEN,
    neu: neu,
    senden: senden,
    naechstesEreignis: naechstesEreignis,
    knotenIndex: knotenIndex,
    istFertig: istFertig
  };
})(window.HR = window.HR || {});
