/**
 * Kleine Helfer fuer Bedienbarkeit ohne Maus und ohne Bildschirm.
 *
 * Drei Aufgaben, die sonst in jedem Bildschirm einzeln stuenden:
 * - Nach einem Aktwechsel den Fokus auf die Ueberschrift des neuen Akts setzen.
 * - Nach dem Neuzeichnen den Fokus wieder dorthin setzen, wo er vorher stand.
 *   Die Huelle ersetzt bei jeder Zustandsaenderung das gesamte Markup des Akts;
 *   ohne diese Merkhilfe faellt die Tastaturbedienung nach jedem Klick an den
 *   Anfang der Seite zurueck.
 * - Erkennen, ob gerade in ein Feld getippt wird — der Vortragsmodus darf dann
 *   keine Taste an sich ziehen.
 */
(function (HR) {
  'use strict';

  var FELDER = { INPUT: true, TEXTAREA: true, SELECT: true };
  var FELDROLLEN = { textbox: true, searchbox: true, combobox: true, spinbutton: true };

  /**
   * Wird hier gerade Text eingegeben?
   * @param {Element} el
   * @returns {boolean}
   */
  function istEingabe(el) {
    if (!el || !el.tagName) return false;
    if (FELDER[el.tagName] === true) return true;
    if (el.isContentEditable) return true;
    var rolle = el.getAttribute ? el.getAttribute('role') : null;
    return !!(rolle && FELDROLLEN[rolle] === true);
  }

  /** Steht der Fokus nirgends mehr? Nach einem Neuzeichnen ist das der Normalfall. */
  function fokusVerloren() {
    var el = document.activeElement;
    return !el || el === document.body || el === document.documentElement;
  }

  function fokussieren(el) {
    if (!el || !el.focus) return false;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    return document.activeElement === el;
  }

  /**
   * Fokus auf die Ueberschrift des Akts. Sie traegt tabindex="-1" und bleibt
   * damit aus der Tabreihenfolge heraus. Der Bildlauf gehoert der Huelle.
   * @param {Element} wurzel Abschnitt des Akts
   * @returns {Element|null} die Ueberschrift, falls es eine gab
   */
  function zurUeberschrift(wurzel) {
    if (!wurzel || !wurzel.querySelector) return null;
    var h = wurzel.querySelector('h1');
    if (!h) return null;
    if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
    fokussieren(h);
    return h;
  }

  /**
   * Merkt sich den Fokus als Beschreibung, nicht als Knoten — der Knoten selbst
   * ueberlebt das Neuzeichnen nicht.
   * @returns {{auswahl:string}|null}
   */
  function fokusMerken(wurzel) {
    var el = document.activeElement;
    if (!el || !wurzel || !wurzel.contains) return null;
    if (!wurzel.contains(el) || el === wurzel) return null;
    if (el.id) return { auswahl: '#' + el.id };
    var aktion = el.getAttribute ? el.getAttribute('data-aktion') : null;
    if (!aktion) return null;
    var wert = el.getAttribute('data-wert');
    return {
      auswahl: '[data-aktion="' + aktion + '"]' +
        (wert === null || wert === undefined ? '' : '[data-wert="' + wert + '"]')
    };
  }

  /** Stellt einen gemerkten Fokus wieder her, sofern das Element wieder da ist. */
  function fokusHerstellen(wurzel, marke) {
    if (!marke || !marke.auswahl || !wurzel || !wurzel.querySelector) return false;
    var el;
    try { el = wurzel.querySelector(marke.auswahl); } catch (e) { return false; }
    if (!el || el.disabled) return false;
    return fokussieren(el);
  }

  /**
   * Zusammengehoerige Bedienelemente als Gruppe. Das fieldset traegt keine
   * eigene Optik: es ist Semantik, kein Rahmen.
   * @param {string} legende bereits maskiertes Markup der Beschriftung
   * @param {string} inhalt bereits maskiertes Markup der Gruppe
   * @param {{klasse?:string, legendeKlasse?:string}} [opt]
   * @returns {string} HTML
   */
  function gruppe(legende, inhalt, opt) {
    opt = opt || {};
    return '<fieldset class="gruppe' + (opt.klasse ? ' ' + opt.klasse : '') + '">' +
      '<legend class="gruppe__legende' + (opt.legendeKlasse ? ' ' + opt.legendeKlasse : '') + '">' +
      legende + '</legend>' + inhalt + '</fieldset>';
  }

  /** Fuellt Platzhalter der Form {name} aus einer Textvorlage. */
  function fuellen(vorlage, werte) {
    return String(vorlage || '').replace(/\{(\w+)\}/g, function (ganz, name) {
      return Object.prototype.hasOwnProperty.call(werte || {}, name) ? String(werte[name]) : ganz;
    });
  }

  HR.a11y = {
    istEingabe: istEingabe,
    fokusVerloren: fokusVerloren,
    zurUeberschrift: zurUeberschrift,
    fokusMerken: fokusMerken,
    fokusHerstellen: fokusHerstellen,
    gruppe: gruppe,
    fuellen: fuellen
  };
})(window.HR = window.HR || {});
