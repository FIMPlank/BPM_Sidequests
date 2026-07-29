/**
 * Der Handlungsraum — das Signaturelement.
 * Kein Bahnendiagramm, sondern ein Feld: weiche Hoehenlinien beschreiben, was
 * erlaubt ist. Jede zusaetzliche Regel zieht das Feld sichtbar zusammen.
 * Die Spur zeigt, welchen Weg der Agent tatsaechlich genommen hat.
 */
(function (HR) {
  'use strict';

  var BREITE = 300, HOEHE = 430;
  var MX = 150, MY = 215;
  var BAENDER = [
    { rx: 132, ry: 198 },
    { rx: 104, ry: 156 },
    { rx: 74, ry: 110 }
  ];

  var ANKER = {
    reiseantrag_stellen:   { x: 74,  y: 64 },
    genehmigung_anfordern: { x: 150, y: 112 },
    hotel_buchen:          { x: 236, y: 166 },
    beleg_pruefen:         { x: 94,  y: 212 },
    beleg_schaetzen:       { x: 54,  y: 262 },
    abrechnung_einreichen: { x: 162, y: 300 },
    selbst_freigeben:      { x: 250, y: 336 },
    erstattung_ausloesen:  { x: 150, y: 390 }
  };

  /** Enge des Feldes: 100 % Freiheit gleich volle Ausdehnung. */
  function faktor(anteil) { return 0.55 + 0.45 * anteil; }

  function ellipse(klasse, rx, ry) {
    return '<ellipse class="' + klasse + '" cx="' + MX + '" cy="' + MY +
      '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '"/>';
  }

  /**
   * @param {{regeln:Array, trajektorie:Array, bisSchritt:number}} opt
   * @returns {string} SVG-Markup
   */
  function zeichnen(opt) {
    var e = HR.render.esc;
    var regeln = opt.regeln || [];
    var traj = opt.trajektorie || [];
    var bis = (opt.bisSchritt === undefined || opt.bisSchritt === null) ? traj.length - 1 : opt.bisSchritt;
    var f = faktor(HR.freedom.freiheitsgrade(regeln).anteil);

    var s = [];
    s.push('<svg class="raum" viewBox="0 0 ' + BREITE + ' ' + HOEHE + '" role="img" ' +
      'aria-label="' + e(HR.copy.screen1.raumHinweis) + '" focusable="false">');

    s.push('<defs><pattern id="raum-schraffur" width="7" height="7" patternUnits="userSpaceOnUse" ' +
      'patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="7"/></pattern></defs>');

    // Der aufgegebene Teil des Raums bleibt sichtbar — als Schraffur darunter.
    s.push(ellipse('raum__verloren', BAENDER[0].rx, BAENDER[0].ry));
    // Das erlaubte Feld deckt die Schraffur ab; es schrumpft mit jeder Regel.
    s.push(ellipse('raum__band raum__band--0', BAENDER[0].rx * f, BAENDER[0].ry * f));
    for (var b = 1; b < BAENDER.length; b++) {
      s.push(ellipse('raum__band raum__band--' + b, BAENDER[b].rx * f, BAENDER[b].ry * f));
    }

    // Ankerpunkte: alle blass, besuchte kraeftig.
    var besucht = {};
    for (var v = 0; v <= bis && v < traj.length; v++) besucht[traj[v].tool] = true;

    Object.keys(ANKER).forEach(function (tool) {
      var a = ANKER[tool];
      s.push('<circle class="raum__anker' + (besucht[tool] ? ' ist-besucht' : '') +
        '" cx="' + a.x + '" cy="' + a.y + '" r="3.5"/>');
      s.push('<text class="raum__marke' + (besucht[tool] ? ' ist-besucht' : '') +
        '" x="' + (a.x + (a.x > MX ? -8 : 8)) + '" y="' + (a.y + 3) +
        '" text-anchor="' + (a.x > MX ? 'end' : 'start') + '">' +
        e(HR.copy.screen1.raumKnoten[tool]) + '</text>');
    });

    // Spur
    var letzter = null;
    for (var i = 0; i <= bis && i < traj.length; i++) {
      var schritt = traj[i];
      var ziel = ANKER[schritt.tool];
      if (!ziel) continue;
      var neu = (i === bis);
      if (!letzter) {
        if (!(schritt.guardrail && schritt.guardrail.blocked)) letzter = ziel;
        continue;
      }
      if (schritt.guardrail && schritt.guardrail.blocked) {
        s.push('<line pathLength="1" class="spur__segment ist-blockiert' + (neu ? ' ist-neu' : '') +
          '" x1="' + letzter.x + '" y1="' + letzter.y + '" x2="' + ziel.x + '" y2="' + ziel.y + '"/>');
        s.push('<g class="spur__abweisung' + (neu ? ' ist-neu' : '') + '">' +
          '<line x1="' + (ziel.x - 6) + '" y1="' + (ziel.y - 6) + '" x2="' + (ziel.x + 6) + '" y2="' + (ziel.y + 6) + '"/>' +
          '<line x1="' + (ziel.x + 6) + '" y1="' + (ziel.y - 6) + '" x2="' + (ziel.x - 6) + '" y2="' + (ziel.y + 6) + '"/></g>');
      } else {
        s.push('<line pathLength="1" class="spur__segment' + (neu ? ' ist-neu' : '') +
          '" x1="' + letzter.x + '" y1="' + letzter.y + '" x2="' + ziel.x + '" y2="' + ziel.y + '"/>');
        letzter = ziel;
      }
    }
    if (letzter && bis >= 0) {
      s.push('<circle class="spur__kopf" cx="' + letzter.x + '" cy="' + letzter.y + '" r="5"/>');
    }

    s.push('</svg>');
    return s.join('');
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.handlungsraum = { zeichnen: zeichnen, ANKER: ANKER, faktor: faktor };
})(window.HR = window.HR || {});
