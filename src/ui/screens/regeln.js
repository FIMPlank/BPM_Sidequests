/**
 * Screen 3 — Sie modellieren jetzt deklarativ.
 * Freier deutscher Satz hinein, geprueft und lesbar zurueck, dann derselbe Lauf
 * noch einmal. Das Wort "deklarativ" faellt in der Bedienung nicht.
 */
(function (HR) {
  'use strict';

  var EINGABE_ID = 'regel-eingabe';
  var HILFE_ID = 'regel-hilfe';
  var FEHLER_ID = 'regel-fehler';

  function entwurfKarte(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    if (z.entwurfFehler) {
      // Eine abgewiesene Regel ist ein Fehler am Feld, keine Beilaeufigkeit:
      // role="alert" meldet sie sofort, aria-errormessage haengt sie ans Feld.
      return '<div class="entwurf entwurf--fehler" id="' + FEHLER_ID + '" role="alert">' +
        '<p class="entwurf__text">' + e(s.ablehnung[z.entwurfFehler.code] || s.ablehnung.nicht_darstellbar) + '</p>' +
        '<p class="entwurf__beispiel">' + e(s.ablehnungBeispiel) + '</p></div>';
    }
    if (!z.entwurf) return '';
    return '<div class="entwurf" role="status">' +
      '<p class="entwurf__text"><span class="entwurf__label">' + e(s.erkannt) + '</span> ' +
      '<span class="mono">' + e(HR.copy.regelLesbar(z.entwurf)) + '</span></p>' +
      '<div class="entwurf__knoepfe">' +
      HR.render.knopf('regel-uebernehmen', s.uebernehmen, { klasse: 'knopf--haupt' }) +
      HR.render.knopf('regel-verwerfen', s.verwerfen) +
      '</div></div>';
  }

  function regelliste(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    var eigene = z.regeln.filter(function (r) { return r.source === 'user'; });
    var h = ['<h2 class="abschnitt__titel">' + e(s.regelnTitel) + '</h2>'];
    h.push('<ol class="regelsaetze">');
    z.regeln.forEach(function (r) {
      h.push('<li class="regelsatz' + (r.source === 'user' ? ' regelsatz--eigen' : '') + '">' +
        '<span class="regelsatz__id mono">' + e(r.id) + '</span>' +
        '<span class="regelsatz__text">' + e(r.text_de) +
        '<span class="regelsatz__form mono">' + e(HR.copy.regelLesbar(r)) + '</span></span>' +
        (r.source === 'user'
          ? HR.render.knopf('regel-entfernen', s.entfernen, { wert: r.id, klasse: 'knopf--still knopf--klein' })
          : '') +
        '</li>');
    });
    h.push('</ol>');
    if (!eigene.length) h.push('<p class="hinweis">' + e(s.keineRegeln) + '</p>');
    return h.join('');
  }

  // Der Schalter fuer den Ort der Durchsetzung ist nach Akt 4 gewandert.
  // Hier wird die Regel geschrieben; wo sie greift, ist eine eigene Frage.

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    var h = [];

    h.push('<h1 id="akt-3-titel" tabindex="-1">' + e(s.titel) + '</h1>');
    h.push('<p class="lead">' + e(s.lead) + '</p>');

    h.push(HR.komponenten.zaehler.zeichnen(z));

    h.push('<div class="editor">');
    h.push('<label class="editor__label" for="' + EINGABE_ID + '">' + e(s.eingabeLabel) + '</label>');
    // Der Platzhalter verschwindet beim Tippen; die Hilfe bleibt stehen und
    // haengt ueber aria-describedby am Feld.
    h.push('<p class="hinweis editor__hilfe" id="' + HILFE_ID + '">' + e(HR.copy.a11y.regelHilfe) + '</p>');
    h.push('<div class="editor__zeile">');
    h.push('<input class="editor__feld" type="text" id="' + EINGABE_ID + '" name="regel" ' +
      'data-enter="regel-pruefen" autocomplete="off" aria-describedby="' + HILFE_ID + '"' +
      (z.entwurfFehler ? ' aria-invalid="true" aria-errormessage="' + FEHLER_ID + '"' : '') +
      ' placeholder="' + e(s.platzhalter) + '">');
    h.push(HR.render.knopf('regel-pruefen', s.pruefen));
    h.push('</div>');
    h.push(entwurfKarte(z));
    h.push('</div>');

    h.push('<div class="regelspalten">');
    h.push('<div class="regelspalte">' + regelliste(z) + '</div>');
    h.push('<div class="regelspalte">');
    h.push('<h2 class="abschnitt__titel">' + e(HR.copy.screen1.raumTitel) + '</h2>');
    h.push(HR.komponenten.handlungsraum.zeichnen({
      regeln: z.regeln,
      trajektorie: z.lauf ? z.lauf.trajectory : [],
      bisSchritt: null   // Screen 3 animiert nicht: die ganze Spur steht sofort da
    }));
    h.push('</div></div>');

    h.push('<div class="steuerung">');
    h.push(HR.render.knopf('regeln-ausfuehren', s.erneutAusfuehren, { klasse: 'knopf--haupt', deaktiviert: z.laeuft }));
    if (z.lauf && z.laufKontext && z.laufKontext.screen === 3) {
      h.push(HR.render.knopf('screen', HR.copy.screen4.titel, { wert: 4 }));
    }
    h.push('</div>');

    if (z.lauf && z.laufKontext && z.laufKontext.screen === 3) {
      h.push('<h2 class="abschnitt__titel">' + e(HR.copy.screen2.ablaufTitel) + '</h2>');
      h.push(HR.komponenten.logTabelle.kurz(z.lauf.trajectory));
    }

    // Der Plot steht jetzt in Akt 4: er sammelt ueber die ganze Sitzung.

    h.push(HR.logging.zustimmungsmarkup(z));
    return h.join('');
  }

  // — Aktionen ————————————————————————————————————————————————

  function uebernehmenOderAblehnen(text, ergebnis) {
    if (ergebnis.ok) {
      HR.store.senden({ typ: 'entwurf', constraint: ergebnis.constraint });
    } else {
      HR.store.senden({ typ: 'entwurf', fehler: { code: ergebnis.code, slots: ergebnis.slots } });
    }
    HR.logging.regelEingabe(text, ergebnis);
  }

  /**
   * Im Demo-Modus uebersetzt die Heuristik, im Live-Modus das Modell gegen
   * dasselbe geschlossene Schema. Faellt der Live-Weg aus, greift die Heuristik.
   */
  function pruefen() {
    var feld = document.getElementById(EINGABE_ID);
    if (!feld) return;
    var text = feld.value;
    var oertlich = function () {
      return HR.compiler.uebersetzen(text, { enforcement: HR.store.holen().enforcement });
    };
    if (HR.config.modus === 'live' && HR.agent.live) {
      HR.agent.live.regelUebersetzen(text).then(function (r) {
        uebernehmenOderAblehnen(text, r && r.ok ? r : oertlich());
      }, function () {
        uebernehmenOderAblehnen(text, oertlich());
      });
      return;
    }
    uebernehmenOderAblehnen(text, oertlich());
  }

  function ausfuehren() {
    var z = HR.store.holen();
    var eigene = z.regeln.filter(function (r) { return r.source === 'user'; });
    HR.store.senden({ typ: 'lauf_start' });
    HR.agent.aktiver().run(HR.agent.anfrage({
      disturbances: HR.screens[2].STOERUNGEN,
      constraints: z.regeln,
      enforcement: z.enforcement
    })).then(function (ergebnis) {
      HR.store.senden({
        typ: 'lauf_fertig', ergebnis: ergebnis,
        kontext: {
          regeln: z.regeln, screen: 3, enforcement: z.enforcement,
          stoerungen: HR.screens[2].STOERUNGEN,
          mitNutzerregel: eigene.length > 0
        }
      });
      HR.logging.laufEreignis(ergebnis, z);
    });
  }

  HR.render.auf('regel-pruefen', pruefen);
  HR.render.auf('regel-uebernehmen', function () { HR.store.senden({ typ: 'regel_uebernehmen' }); });
  HR.render.auf('regel-verwerfen', function () { HR.store.senden({ typ: 'entwurf' }); });
  HR.render.auf('regel-entfernen', function (id) { HR.store.senden({ typ: 'regel_entfernen', id: id }); });
  HR.render.auf('regeln-ausfuehren', ausfuehren);

  HR.render.bildschirm(3, {
    zeichnen: zeichnen,
    EINGABE_ID: EINGABE_ID,
    HILFE_ID: HILFE_ID,
    FEHLER_ID: FEHLER_ID
  });
})(window.HR = window.HR || {});
