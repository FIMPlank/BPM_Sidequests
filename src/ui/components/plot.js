/**
 * Kleiner handgezeichneter Plot: x gleich Zahl der Regeln, y zwei Reihen
 * (Verstoesse und Kosten). Je Lauf ein Punkt. Die guenstige Stelle wird nicht
 * beschriftet — sie soll als Form sichtbar werden, nicht als Behauptung.
 */
(function (HR) {
  'use strict';

  var B = 320, H = 190;
  var L = 34, R = 34, O = 14, U = 30;

  /** Deterministisches Zittern, damit die Achsen von Hand gezogen wirken. */
  function zitter(i) { return ((i * 37) % 7) / 7 - 0.5; }

  function achse(x1, y1, x2, y2, seed) {
    var mx = (x1 + x2) / 2 + zitter(seed) * 1.6;
    var my = (y1 + y2) / 2 + zitter(seed + 3) * 1.6;
    return '<path class="plot__achse" d="M ' + x1 + ' ' + y1 + ' Q ' + mx.toFixed(1) + ' ' +
      my.toFixed(1) + ' ' + x2 + ' ' + y2 + '"/>';
  }

  function reihe(punkte, klasse) {
    if (!punkte.length) return '';
    var d = 'M ' + punkte[0][0].toFixed(1) + ' ' + punkte[0][1].toFixed(1);
    for (var i = 1; i < punkte.length; i++) {
      var vx = punkte[i - 1][0], vy = punkte[i - 1][1];
      var nx = punkte[i][0], ny = punkte[i][1];
      var cx = (vx + nx) / 2 + zitter(i) * 3;
      var cy = (vy + ny) / 2 + zitter(i + 5) * 3;
      d += ' Q ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + nx.toFixed(1) + ' ' + ny.toFixed(1);
    }
    var out = '<path class="plot__reihe ' + klasse + '" d="' + d + '"/>';
    punkte.forEach(function (p) {
      out += '<circle class="plot__punkt ' + klasse + '" cx="' + p[0].toFixed(1) +
        '" cy="' + p[1].toFixed(1) + '" r="3"/>';
    });
    return out;
  }

  /**
   * @param {Array<{regeln:number, verstoesse:number, cent:number}>} historie
   * @returns {string} SVG oder Hinweis
   */
  function zeichnen(historie) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    if (!historie || !historie.length) {
      return '<p class="plot__leer">' + e(s.plotLeer) + '</p>';
    }

    var maxR = 1, maxV = 1, maxC = 0.001;
    historie.forEach(function (p) {
      maxR = Math.max(maxR, p.regeln);
      maxV = Math.max(maxV, p.verstoesse);
      maxC = Math.max(maxC, p.cent);
    });

    function x(r) { return L + (r / maxR) * (B - L - R); }
    function yv(v) { return H - U - (v / maxV) * (H - U - O); }
    function yc(c) { return H - U - (c / maxC) * (H - U - O); }

    var pV = historie.map(function (p) { return [x(p.regeln), yv(p.verstoesse)]; });
    var pC = historie.map(function (p) { return [x(p.regeln), yc(p.cent)]; });

    var s2 = [];
    s2.push('<svg class="plot" viewBox="0 0 ' + B + ' ' + H + '" role="img" aria-label="' +
      e(s.plotTitel) + '" focusable="false">');
    s2.push(achse(L, H - U, B - R, H - U, 1));
    s2.push(achse(L, O, L, H - U, 2));
    s2.push(reihe(pC, 'ist-kosten'));
    s2.push(reihe(pV, 'ist-verstoesse'));
    s2.push('<text class="plot__marke" x="' + L + '" y="' + (H - 10) + '">0</text>');
    s2.push('<text class="plot__marke" x="' + (B - R) + '" y="' + (H - 10) + '" text-anchor="end">' +
      maxR + ' ' + e(s.plotX) + '</text>');
    s2.push('</svg>');

    s2.push('<p class="plot__legende">' +
      '<span class="plot__key ist-verstoesse">' + e(s.plotVerstoesse) + '</span>' +
      '<span class="plot__key ist-kosten">' + e(s.plotKosten) + '</span></p>');
    return s2.join('');
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.plot = { zeichnen: zeichnen };
})(window.HR = window.HR || {});
