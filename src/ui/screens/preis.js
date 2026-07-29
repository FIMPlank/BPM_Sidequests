/**
 * Screen 2 — Der Preis der Autonomie.
 * Der Agent erreicht das Ziel und der Checker meldet ehrlich null Verstoesse.
 * Es gibt hier bewusst keine Warnung, keinen Hinweis, keinen Tooltip:
 * das Unbehagen soll aus der Sache kommen, nicht aus der Beschriftung.
 */
(function (HR) {
  'use strict';

  var STOERUNGEN = ['hotel_ausgebucht', 'genehmiger_urlaub'];

  function istEigenerLauf(z) {
    return z.lauf && z.laufKontext && z.laufKontext.screen === 2;
  }

  function ablauf(traj) {
    var e = HR.render.esc;
    return '<ol class="ablauf">' + traj.map(function (s) {
      var kurz = kurzInput(s.input);
      return '<li class="ablauf__zeile' + (s.guardrail && s.guardrail.blocked ? ' ist-geblockt' : '') + '">' +
        '<span class="ablauf__nr mono">' + (s.i + 1) + '</span>' +
        '<span class="ablauf__tool mono">' + e(s.tool) + '</span>' +
        '<span class="ablauf__input mono">' + e(kurz) + '</span>' +
        '<span class="ablauf__ergebnis mono">' + e(s.output && s.output.status) + '</span></li>';
    }).join('') + '</ol>';
  }

  function kurzInput(input) {
    var teile = [];
    for (var k in input) {
      if (!Object.prototype.hasOwnProperty.call(input, k)) continue;
      var v = input[k];
      if (Array.isArray(v)) v = '[' + v.length + ']';
      if (typeof v === 'string' && v.length > 22) v = v.slice(0, 21) + '…';
      teile.push(k + '=' + v);
    }
    return teile.join(' ');
  }

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen2;
    var h = [];

    h.push('<h1 id="screen-2-titel">' + e(s.titel) + '</h1>');
    h.push('<p class="lead">' + e(s.lead) + '</p>');

    h.push('<p class="steuerung__titel">' + e(s.stoerungTitel) + '</p>');
    h.push('<ul class="chips">');
    STOERUNGEN.forEach(function (id) {
      h.push('<li class="chip">' + e(s.stoerungen[id]) + '</li>');
    });
    h.push('</ul>');

    h.push('<div class="steuerung">');
    h.push(HR.render.knopf('preis-laufen', istEigenerLauf(z) ? s.erneut : s.laufen,
      { klasse: 'knopf--haupt', deaktiviert: z.laeuft }));
    h.push('</div>');

    if (!istEigenerLauf(z)) return h.join('');

    var lauf = z.lauf;
    var verstoesse = HR.checker.zaehleVerstoesse(lauf.violations);

    h.push('<div class="ergebnis">');
    h.push('<p class="badge badge--gut" role="status">' + e(s.zielErreicht) + '</p>');
    h.push('<p class="ergebnis__betrag"><span class="ergebnis__label">' + e(s.betragLabel) +
      '</span> <span class="mono">' + e(HR.copy.euro(lauf.result.betrag)) + '</span></p>');
    h.push('</div>');

    h.push('<h2 class="abschnitt__titel">' + e(s.ablaufTitel) + '</h2>');
    h.push(ablauf(lauf.trajectory));

    h.push('<div class="pruefpanel">');
    h.push('<p class="pruefpanel__label">' + e(s.pruefungTitel) + '</p>');
    h.push('<p class="pruefpanel__wert mono">' + verstoesse + '</p>');
    h.push('<p class="pruefpanel__text">' + e(s.pruefungOk) + '</p>');
    h.push('</div>');

    h.push('<div class="frage">');
    h.push('<p class="frage__text">' + e(s.frage) + '</p>');
    h.push('<div class="frage__knoepfe">');
    h.push(HR.render.knopf('preis-antwort', s.ja, { wert: 'ja' }));
    h.push(HR.render.knopf('preis-antwort', s.nein, { wert: 'nein' }));
    h.push('</div></div>');

    if (z.antwort2 === 'ja') {
      h.push('<div class="uebergang"><p>' + e(s.antwortJa) + '</p>' +
        HR.render.knopf('screen', s.weiter, { wert: 3, klasse: 'knopf--haupt' }) + '</div>');
    }
    return h.join('');
  }

  function laufen() {
    HR.store.senden({ typ: 'lauf_start' });
    HR.agent.aktiver().run(HR.agent.anfrage({
      disturbances: STOERUNGEN,
      constraints: HR.store.holen().regeln,
      enforcement: HR.store.holen().enforcement
    })).then(function (ergebnis) {
      HR.store.senden({
        typ: 'lauf_fertig',
        ergebnis: ergebnis,
        kontext: {
          regeln: HR.store.holen().regeln,
          screen: 2,
          stoerungen: STOERUNGEN,
          vergleichsbasis: true      // das ist Lauf A fuer den Vergleich auf Screen 4
        }
      });
    });
  }

  HR.render.auf('preis-laufen', laufen);
  HR.render.auf('preis-antwort', function (wert) {
    HR.store.senden({ typ: 'antwort2', wert: wert });
    if (wert === 'nein') HR.store.senden({ typ: 'screen', n: 3 });
  });

  HR.render.bildschirm(2, { zeichnen: zeichnen, STOERUNGEN: STOERUNGEN });
})(window.HR = window.HR || {});
