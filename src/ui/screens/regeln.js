/**
 * Screen 3 — Sie modellieren jetzt deklarativ.
 * Freier deutscher Satz hinein, geprueft und lesbar zurueck, dann derselbe Lauf
 * noch einmal. Das Wort "deklarativ" faellt in der Bedienung nicht.
 *
 * Der Akt lief bisher als eine einzige Flaeche: fuenf Zaehler, ein Editor, zwei
 * Spalten und die Steuerung, alles zugleich. Jetzt laeuft er in fuenf Schritten
 * — schreiben, pruefen, ausfuehren, ansehen, und erst ganz zuletzt und nur auf
 * Wunsch die Zahlen. Weggenommen wird dabei nichts: was nicht drankommt, steht
 * an seiner Stelle mit einem Satz dazu, was es aufgehen laesst.
 */
(function (HR) {
  'use strict';

  var EINGABE_ID = 'regel-eingabe';
  var SCHRITTE = 5;

  function eigeneRegeln(z) {
    return z.regeln.filter(function (r) { return r.source === 'user'; });
  }

  /** Ob in diesem Akt schon ein Lauf gefahren wurde. */
  function gelaufen(z) {
    return !!(z.lauf && z.laufKontext && z.laufKontext.screen === 3);
  }

  /**
   * Wie weit ist der Besucher? Der Zustand weiss es bereits — es braucht dafuer
   * keinen zweiten Speicher neben dem Store.
   * @returns {number} 1 bis 4; Schritt 5 ist der Aufklapper und steht immer bereit
   */
  function stufe(z) {
    if (gelaufen(z)) return 4;
    if (eigeneRegeln(z).length) return 3;
    if (z.entwurf || z.entwurfFehler) return 2;
    return 1;
  }

  /** Die Leiste ueber dem Akt: fuenf Schritte, einer davon der aktuelle. */
  function stufenleiste(z) {
    var e = HR.render.esc;
    var s = HR.copy.interaktion.stufen;
    var jetzt = stufe(z);
    var h = ['<div class="stufen">'];
    h.push('<p class="stufen__titel">' + e(s.titel) + '</p>');
    h.push('<ol class="stufen__liste">');
    s.namen.forEach(function (name, i) {
      var nr = i + 1;
      var klasse = nr < jetzt ? ' ist-erledigt' : (nr === jetzt ? ' ist-aktuell' : ' ist-offen');
      h.push('<li class="stufe' + klasse + '"' +
        (nr === jetzt ? ' aria-current="step"' : '') + '>' +
        '<span class="stufe__nr mono">' + nr + '</span>' +
        '<span class="stufe__name">' + e(name) + '</span></li>');
    });
    h.push('</ol></div>');
    return h.join('');
  }

  /**
   * Ein Schritt als eigener Block. Ist er noch nicht dran, steht statt des
   * Inhalts ein Satz, der sagt, was ihn aufgehen laesst.
   */
  function schritt(nr, jetzt, lead, inhalt) {
    var e = HR.render.esc;
    var s = HR.copy.interaktion.stufen;
    var offen = nr > jetzt;
    var h = ['<section class="schrittblock' + (offen ? ' ist-offen' : '') +
      (nr === jetzt ? ' ist-aktuell' : '') + '" data-schritt="' + nr + '">'];
    h.push('<h2 class="schrittblock__titel">' + e(HR.copy.interaktion.schrittTitel(nr)) + '</h2>');
    if (offen) {
      h.push('<p class="schrittblock__wartet hinweis">' + e(s.wartet[nr] || '') + '</p>');
    } else {
      if (lead) h.push('<p class="schrittblock__lead hinweis">' + e(lead) + '</p>');
      h.push(inhalt);
    }
    h.push('</section>');
    return h.join('');
  }

  function entwurfKarte(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    if (z.entwurfFehler) {
      return '<div class="entwurf entwurf--fehler" role="status">' +
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
    var eigene = eigeneRegeln(z);
    var h = ['<h3 class="abschnitt__titel">' + e(s.regelnTitel) + '</h3>'];
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

  // — Die fuenf Schritte ————————————————————————————————————————

  /** Schritt 1: der Satz. Er steht immer da — auch spaeter noch, fuer die naechste Regel. */
  function schrittEingabe(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    var h = ['<div class="editor">'];
    h.push('<label class="editor__label" for="' + EINGABE_ID + '">' + e(s.eingabeLabel) + '</label>');
    h.push('<div class="editor__zeile">');
    h.push('<input class="editor__feld" type="text" id="' + EINGABE_ID + '" name="regel" ' +
      'data-enter="regel-pruefen" autocomplete="off" placeholder="' + e(s.platzhalter) + '">');
    h.push(HR.render.knopf('regel-pruefen', s.pruefen));
    h.push('</div></div>');
    return h.join('');
  }

  /**
   * Schritt 2: die Auslegung. Liegt kein Entwurf mehr vor, weil er uebernommen
   * wurde, steht hier die zuletzt bestaetigte Lesart — der Schritt bleibt
   * belegt und faellt nicht ersatzlos weg.
   */
  function schrittPruefen(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    if (z.entwurf || z.entwurfFehler) return entwurfKarte(z);
    var eigene = eigeneRegeln(z);
    if (!eigene.length) return '';
    var r = eigene[eigene.length - 1];
    return '<div class="entwurf ist-uebernommen">' +
      '<p class="entwurf__text"><span class="entwurf__label">' + e(s.erkannt) + '</span> ' +
      '<span class="mono">' + e(HR.copy.regelLesbar(r)) + '</span></p></div>';
  }

  /** Schritt 3: die hinterlegten Regeln, der Raum dazu und der eine Knopf. */
  function schrittAusfuehren(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    var h = ['<div class="regelspalten">'];
    h.push('<div class="regelspalte">' + regelliste(z) + '</div>');
    h.push('<div class="regelspalte">');
    h.push('<h3 class="abschnitt__titel">' + e(HR.copy.screen1.raumTitel) + '</h3>');
    h.push(HR.komponenten.handlungsraum.zeichnen({
      regeln: z.regeln,
      trajektorie: z.lauf ? z.lauf.trajectory : [],
      bisSchritt: null   // Screen 3 animiert nicht: die ganze Spur steht sofort da
    }));
    h.push(HR.komponenten.handlungsraum.textFassung({
      regeln: z.regeln,
      trajektorie: z.lauf ? z.lauf.trajectory : [],
      bisSchritt: null
    }));
    h.push('</div></div>');

    h.push('<div class="steuerung">');
    h.push(HR.render.knopf('regeln-ausfuehren', s.erneutAusfuehren,
      { klasse: 'knopf--haupt', deaktiviert: z.laeuft }));
    h.push('</div>');
    return h.join('');
  }

  /** Schritt 4: was der Lauf getan hat, und der Weg weiter. */
  function schrittErgebnis(z) {
    var e = HR.render.esc;
    var h = ['<h3 class="abschnitt__titel">' + e(HR.copy.screen2.ablaufTitel) + '</h3>'];
    h.push(HR.komponenten.logTabelle.kurz(z.lauf ? z.lauf.trajectory : []));
    h.push('<div class="steuerung">' +
      HR.render.knopf('screen', HR.copy.screen4.titel, { wert: 4 }) + '</div>');
    return h.join('');
  }

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    var jetzt = stufe(z);
    var h = [];

    h.push('<h1 id="akt-3-titel">' + e(s.titel) + '</h1>');
    h.push('<p class="lead">' + e(s.lead) + '</p>');

    h.push(stufenleiste(z));

    var st = HR.copy.interaktion.stufen;
    h.push(schritt(1, jetzt, st.schrittEingabe, schrittEingabe(z)));
    h.push(schritt(2, jetzt, null, schrittPruefen(z)));
    h.push(schritt(3, jetzt, st.schrittAusfuehren, schrittAusfuehren(z)));
    h.push(schritt(4, jetzt, st.schrittErgebnis, gelaufen(z) ? schrittErgebnis(z) : ''));

    // Schritt 5 steht immer bereit, aber eingeklappt: die fuenf Zahlen sind
    // ein Armaturenbrett, und ein Armaturenbrett will niemand ungefragt sehen.
    h.push('<section class="schrittblock schrittblock--technik" data-schritt="5">');
    h.push('<h2 class="schrittblock__titel">' + e(HR.copy.interaktion.schrittTitel(5)) + '</h2>');
    h.push(HR.komponenten.disclosure.technisch(
      '<p class="hinweis">' + e(st.schrittTechnik) + '</p>' +
      HR.komponenten.zaehler.zeichnen(z),
      { name: 'akt3-zahlen' }
    ));
    h.push('</section>');

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
    stufe: stufe,
    stufenleiste: stufenleiste,
    EINGABE_ID: EINGABE_ID,
    SCHRITTE: SCHRITTE
  });
})(window.HR = window.HR || {});
