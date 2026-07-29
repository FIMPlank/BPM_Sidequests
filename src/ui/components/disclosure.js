/**
 * Der Aufklapper.
 *
 * Nichts wird entfernt, es steht nur nicht alles zugleich da. Dafuer reicht
 * natives <details>/<summary>: mit Tastatur bedienbar, mit Screenreader
 * angekuendigt, ohne eine einzige ARIA-Angabe und ohne eine Zeile JavaScript.
 * Ein eigenes Widget waere hier nur eine schlechtere Kopie davon.
 */
(function (HR) {
  'use strict';

  /**
   * @param {{inhalt:string, titel?:string, offen?:boolean, klasse?:string, name?:string}} opt
   * @returns {string} HTML
   */
  function zeichnen(opt) {
    opt = opt || {};
    var e = HR.render.esc;
    var titel = opt.titel || HR.copy.interaktion.aufklapper.technisch;
    return '<details class="aufklapper' + (opt.klasse ? ' ' + opt.klasse : '') + '"' +
      (opt.offen ? ' open' : '') +
      HR.render.attr('data-aufklapper', opt.name) + '>' +
      '<summary class="aufklapper__kopf">' + e(titel) + '</summary>' +
      '<div class="aufklapper__inhalt">' + (opt.inhalt || '') + '</div>' +
      '</details>';
  }

  /**
   * Der haeufigste Fall: technische Zahlen hinter „Technische Details anzeigen“.
   * @param {string} inhalt @param {Object} [opt] @returns {string} HTML
   */
  function technisch(inhalt, opt) {
    opt = opt || {};
    return zeichnen({
      inhalt: inhalt,
      titel: opt.titel,
      name: opt.name,
      offen: opt.offen,
      klasse: 'aufklapper--technisch' + (opt.klasse ? ' ' + opt.klasse : '')
    });
  }

  /**
   * Saetze als Absaetze. Leere Eintraege fallen weg, damit die Aufrufer
   * unbesorgt bedingte Saetze in die Liste schreiben koennen.
   * @param {Array<string>} saetze @returns {string} HTML
   */
  function absaetze(saetze) {
    var e = HR.render.esc;
    return (saetze || []).filter(function (s) { return !!s; })
      .map(function (s) { return '<p class="aufklapper__satz">' + e(s) + '</p>'; })
      .join('');
  }

  /**
   * Eine Zeichnung in Worten. Das ist mehr als ein aria-label: wer den Weg
   * beschrieben haben will, statt ihn zu sehen, bekommt hier echten Text.
   * @param {string} titel @param {Array<string>} saetze @param {string} [name]
   * @returns {string} HTML
   */
  function textfassung(titel, saetze, name) {
    return zeichnen({
      titel: titel,
      inhalt: absaetze(saetze),
      klasse: 'aufklapper--text',
      name: name
    });
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.disclosure = {
    zeichnen: zeichnen,
    technisch: technisch,
    absaetze: absaetze,
    textfassung: textfassung
  };
})(window.HR = window.HR || {});
