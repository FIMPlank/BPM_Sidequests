/**
 * Die imperative Seite als technische Zeichnung: ruled rectangles, Haarlinien,
 * rechte Winkel, getickte Schrittnummern. Striktes 8er-Raster.
 */
(function (HR) {
  'use strict';

  var BREITE = 300, HOEHE = 430;
  var X = 52, W = 210, H = 44, ABSTAND = 68, OBEN = 12;

  function knotenY(i) { return OBEN + i * ABSTAND; }

  /**
   * @param {Automat} fsm
   * @returns {string} SVG-Markup
   */
  function zeichnen(fsm) {
    var e = HR.render.esc;
    var erledigt = fsm.verlauf.length;
    var teile = [];

    teile.push('<svg class="fsm" viewBox="0 0 ' + BREITE + ' ' + HOEHE + '" role="img" ' +
      'aria-label="Imperatives Prozessmodell mit sechs Schritten" focusable="false">');

    // Bezugslinie links — Anmutung einer Zeichnung, kein Schmuck.
    teile.push('<line class="fsm__achse" x1="36" y1="' + (knotenY(0) + H / 2) +
      '" x2="36" y2="' + (knotenY(5) + H / 2) + '"/>');

    for (var i = 0; i < HR.imperative.KNOTEN.length; i++) {
      var id = HR.imperative.KNOTEN[i];
      var y = knotenY(i);
      var klasse = 'fsm__knoten';
      if (i < erledigt) klasse += ' ist-erledigt';
      else if (i === erledigt && fsm.gestoppt) klasse += ' ist-verstoss';
      else if (i === erledigt) klasse += ' ist-aktuell';

      if (i < 5) {
        teile.push('<line class="fsm__kante' + (i < erledigt ? ' ist-erledigt' : '') +
          '" x1="157" y1="' + (y + H) + '" x2="157" y2="' + (y + ABSTAND) + '"/>');
      }
      teile.push('<line class="fsm__tick" x1="30" y1="' + (y + H / 2) + '" x2="46" y2="' + (y + H / 2) + '"/>');
      teile.push('<text class="fsm__nr" x="26" y="' + (y + H / 2 + 4) + '" text-anchor="end">' + (i + 1) + '</text>');
      teile.push('<rect class="' + klasse + '" x="' + X + '" y="' + y + '" width="' + W + '" height="' + H + '"/>');
      teile.push('<text class="fsm__text" x="' + (X + 14) + '" y="' + (y + H / 2 + 4) + '">' +
        e(HR.copy.screen1.knoten[id]) + '</text>');
    }

    if (fsm.gestoppt) {
      var yv = knotenY(Math.min(erledigt, 5));
      teile.push('<rect class="fsm__stopp" x="' + (X - 6) + '" y="' + (yv - 6) +
        '" width="' + (W + 12) + '" height="' + (H + 12) + '"/>');
    }

    teile.push('</svg>');
    return teile.join('');
  }

  /**
   * Dieselbe Zeichnung in Worten. Das aria-label am SVG sagt, was das Bild
   * ist; hier steht, was es gerade zeigt — welche Schritte erledigt sind, wo
   * die Kette steht und woran sie haengt.
   * @param {Automat} fsm
   * @returns {string} HTML (Aufklapper)
   */
  function textFassung(fsm) {
    var s = HR.copy.interaktion.fsmText;
    var f = HR.copy.interaktion.fuellen;
    var namen = HR.copy.screen1.knoten;
    var kette = HR.imperative.KNOTEN;
    var erledigt = Math.min(fsm.verlauf.length, kette.length);
    var saetze = [s.grund];

    if (!erledigt) {
      saetze.push(s.nochNichts);
    } else {
      saetze.push(f(s.erledigt, {
        liste: kette.slice(0, erledigt).map(function (id) { return namen[id]; }).join(', ')
      }));
    }

    if (fsm.gestoppt) {
      saetze.push(f(s.gestoppt, { name: namen[kette[Math.min(erledigt, kette.length - 1)]] }));
    } else if (erledigt >= kette.length) {
      saetze.push(s.fertig);
    } else {
      saetze.push(f(s.aktuell, { name: namen[kette[erledigt]] }));
    }

    saetze.push(f(s.varianten, { n: fsm.varianten }));
    return HR.komponenten.disclosure.textfassung(s.titel, saetze, 'fsm');
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.fsmDiagramm = {
    zeichnen: zeichnen, textFassung: textFassung, BREITE: BREITE, HOEHE: HOEHE
  };
})(window.HR = window.HR || {});
