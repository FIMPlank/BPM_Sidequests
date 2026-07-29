/**
 * Die verschmolzene Flaeche.
 *
 * Bis Akt 3 stehen die beiden Paradigmen als zwei Panels nebeneinander, mit
 * einer Naht in der Mitte. Das ist die Erzaehlung „entweder — oder“, und sie
 * ist falsch. In Akt 4 gibt es nur noch **eine** Flaeche: der Handlungsraum
 * bleibt, und die imperative Kette formt sich in ihm neu — als harte Schranken
 * quer zum Weg, jede mit genau einem Durchlass. Die Spur des Agenten laeuft
 * frei zwischen den Schranken und muss durch sie hindurch.
 *
 * Das ist das Bild, wegen dem es diese Ueberarbeitung gibt.
 */
(function (HR) {
  'use strict';

  var MX = 150;
  var DURCHLASS = 26;      // halbe Breite des Durchlasses
  var RAND = 18;

  /**
   * Aus einer Zuordnung werden Schranken: jede Regel, die als imperativer
   * Kontrollpunkt gesetzt ist, wird zu einer Schranke vor ihrem Werkzeug.
   * @returns {Array<{regelId:string, tool:string, y:number}>}
   */
  function schranken(regeln) {
    var anker = HR.komponenten.handlungsraum.ANKER;
    var out = [];
    (regeln || []).forEach(function (r) {
      if (!r || !anker[r.target]) return;
      out.push({ regelId: r.id, tool: r.target, y: anker[r.target].y - 14 });
    });
    return out.sort(function (a, b) { return a.y - b.y; });
  }

  /** Eine Schranke: Wand links, Durchlass, Wand rechts, zwei Pfosten. */
  function schrankeMarkup(s, i) {
    var e = HR.render.esc;
    var y = s.y;
    var linksEnde = MX - DURCHLASS;
    var rechtsAnfang = MX + DURCHLASS;
    var h = ['<g class="schranke" data-schranke="' + e(s.regelId) + '" style="--schranke-i:' + i + '">'];
    h.push('<line class="schranke__wand" x1="' + RAND + '" y1="' + y + '" x2="' + linksEnde + '" y2="' + y + '"/>');
    h.push('<line class="schranke__wand" x1="' + rechtsAnfang + '" y1="' + y + '" x2="' + (300 - RAND) + '" y2="' + y + '"/>');
    // Die beiden Pfosten stehen senkrecht: der Durchlass ist eine Tuer, kein Loch.
    h.push('<line class="schranke__pfosten" x1="' + linksEnde + '" y1="' + (y - 9) + '" x2="' + linksEnde + '" y2="' + (y + 9) + '"/>');
    h.push('<line class="schranke__pfosten" x1="' + rechtsAnfang + '" y1="' + (y - 9) + '" x2="' + rechtsAnfang + '" y2="' + (y + 9) + '"/>');
    h.push('<text class="schranke__marke" x="' + RAND + '" y="' + (y - 6) + '">' + e(s.regelId) + '</text>');
    h.push('</g>');
    return h.join('');
  }

  /**
   * @param {{regeln:Array, trajektorie:Array, kontrollpunkte:Array, verschmilzt:boolean}} opt
   * @returns {string} SVG-Markup — eine Flaeche, keine Naht
   */
  function zeichnen(opt) {
    opt = opt || {};
    var basis = HR.komponenten.handlungsraum.zeichnen({
      regeln: opt.regeln || [],
      trajektorie: opt.trajektorie || [],
      bisSchritt: null
    });

    var marken = schranken(opt.kontrollpunkte).map(schrankeMarkup).join('');
    var klassen = 'fusion' + (opt.verschmilzt ? ' ist-verschmilzt' : '');

    // Die Schranken kommen ueber das Feld, aber unter nichts anderes: sie sind
    // Teil derselben Zeichnung, kein Aufkleber darauf.
    var mitSchranken = basis.replace('</svg>', '<g class="schranken">' + marken + '</g></svg>');
    return '<div class="' + klassen + '">' + mitSchranken + '</div>';
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.fusion = { zeichnen: zeichnen, schranken: schranken };
})(window.HR = window.HR || {});
