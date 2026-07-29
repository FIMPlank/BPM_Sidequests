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

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.fsmDiagramm = { zeichnen: zeichnen, BREITE: BREITE, HOEHE: HOEHE };
})(window.HR = window.HR || {});
