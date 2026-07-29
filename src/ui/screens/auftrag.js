/**
 * Akt 0 — Der Auftrag.
 *
 * Der Vorspann vor der Aktleiste, und die einzige Flaeche der Demo, auf der
 * nichts laeuft. Der Besucher liest eine Ansage und trifft eine Entscheidung.
 * Es gibt genau zwei Knoepfe und keinen Weg daran vorbei: die erste Handlung
 * auf dieser Seite ist eine Wahl, kein Zusehen.
 */
(function (HR) {
  'use strict';

  function wahlkarte(wert, beschriftung, hinweis) {
    var e = HR.render.esc;
    return '<div class="wahl__karte">' +
      HR.render.knopf('wahl', beschriftung, { wert: wert, klasse: 'knopf--haupt wahl__knopf' }) +
      '<p class="wahl__hinweis">' + e(hinweis) + '</p></div>';
  }

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.akt0;
    var h = [];

    h.push('<h1 id="akt-0-titel" tabindex="-1">' + e(s.titel) + '</h1>');

    h.push('<blockquote class="auftrag">');
    h.push('<p class="auftrag__text">' + e(s.ansage) + '</p>');
    h.push('<footer class="auftrag__rolle">' + e(s.rolle) + '</footer>');
    h.push('</blockquote>');

    // Die beiden Wege sind eine Wahl, keine zwei Knoepfe nebeneinander:
    // die Frage steht als Legende ueber der Gruppe, die sie beschriftet.
    h.push(HR.a11y.gruppe(e(s.frage),
      '<div class="wahl">' +
      wahlkarte('heute', s.heute, s.heuteHinweis) +
      wahlkarte('agent', s.agent, s.agentHinweis) +
      '</div>',
      { legendeKlasse: 'auftrag__frage' }));

    return h.join('');
  }

  /**
   * Die Wahl fuehrt nach Akt 1 und startet dort denselben Lauf, den auch der
   * Knopf im Akt ausloest. Welche Seite vorn steht, entscheidet der Zustand.
   */
  function waehlen(wert) {
    HR.store.senden({ typ: 'wahl', wert: wert });
    if (HR.screens[1] && HR.screens[1].starten) HR.screens[1].starten();
  }

  HR.render.auf('wahl', waehlen);

  HR.render.bildschirm(0, { zeichnen: zeichnen, waehlen: waehlen });
})(window.HR = window.HR || {});
