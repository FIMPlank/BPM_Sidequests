/**
 * Hilfe, Startseite, Zuruecksetzen — in jedem Akt an derselben Stelle.
 *
 * Drei Bedienelemente, die nie verschwinden. Die Hilfe ist ein Aufklapper und
 * kein Dialog: sie nimmt der Seite nichts weg und gibt sie auch nicht gefangen.
 * Das Zuruecksetzen fragt nicht nach. Der Zustand liegt nur im Speicher, ein
 * Neuladen der Seite tut ohnehin dasselbe — eine Rueckfrage waere eine Huerde
 * ohne Gegenwert.
 */
(function (HR) {
  'use strict';

  /** Der Inhalt haengt an keinem Zustand. Einmal gebaut, bleibt er stehen. */
  var gebaut = false;

  function markup() {
    var e = HR.render.esc;
    var n = HR.copy.interaktion.nav;
    var h = ['<div class="globalnav" role="group" aria-label="' + e(n.bereich) + '">'];

    h.push(HR.komponenten.disclosure.zeichnen({
      titel: n.hilfe,
      klasse: 'aufklapper--hilfe',
      name: 'hilfe',
      inhalt: HR.komponenten.disclosure.absaetze(n.hilfeAbsaetze)
    }));

    h.push(HR.render.knopf('nav-startseite', n.startseite, { klasse: 'knopf--still knopf--klein' }));
    h.push(HR.render.knopf('nav-zuruecksetzen', n.zuruecksetzen, { klasse: 'knopf--still knopf--klein' }));
    h.push('</div>');
    return h.join('');
  }

  /**
   * Haengt die Leiste einmal in den Kopf. Sie kennt keinen Zustand, also wird
   * sie auch nicht bei jedem Neuzeichnen ueberschrieben — ein aufgeklappter
   * Hilfetext bliebe sonst nicht offen.
   * @param {Document} [wurzel]
   */
  function einhaengen(wurzel) {
    if (gebaut) return;
    var ziel = (wurzel || document).getElementById('globalnav');
    if (!ziel) return;
    ziel.innerHTML = markup();
    gebaut = true;
  }

  HR.render.auf('nav-startseite', function () {
    HR.store.senden({ typ: 'akt', n: 0 });
  });

  // Ohne Rueckfrage: die vorhandene Vollruecknahme des Speichers, dieselbe,
  // die im Vortragsmodus auf der Taste r liegt.
  HR.render.auf('nav-zuruecksetzen', function () {
    HR.store.senden({ typ: 'reset' });
  });

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.globalNav = {
    markup: markup,
    einhaengen: einhaengen,
    /** Nur fuer Tests: die Leiste noch einmal bauen lassen. */
    zuruecksetzen: function () { gebaut = false; }
  };
})(window.HR = window.HR || {});
