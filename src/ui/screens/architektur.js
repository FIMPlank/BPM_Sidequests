/**
 * Akt 4 — Die Architektur.
 *
 * Hier wird der Kern des Whitepapers sichtbar. Bis hierher las die Demo sich
 * wie „starr verliert, autonom gewinnt“. Das ist nicht die These. Die These
 * ist, dass imperative Kontrollpunkte *innerhalb* eines deklarativen
 * Handlungsraums stehen — und dass der Ort der Regel darueber entscheidet,
 * was sie kostet und was sie uebrig laesst.
 *
 * Drei Orte, derselbe Fall, dieselben Stoerungen, drei verschiedene Wege.
 */
(function (HR) {
  'use strict';

  var BEISPIELSATZ = 'Buchungen über 200 € pro Nacht brauchen eine Freigabe';

  /**
   * Die Regel, um die es geht: die letzte eigene des Besuchers, sonst die
   * Beispielregel. Ohne eine Regel haette der Akt keine Frage.
   */
  function regelDesBesuchers(z) {
    var eigene = z.regeln.filter(function (r) { return r.source === 'user'; });
    if (eigene.length) return { regel: eigene[eigene.length - 1], eigen: true };
    var uebersetzt = HR.compiler.uebersetzen(BEISPIELSATZ, { id: 'B-1' });
    return { regel: uebersetzt.constraint, eigen: false };
  }

  /** Die Regelmenge eines Laufs: alles Hinterlegte, notfalls plus die Beispielregel. */
  function regelnFuerLauf(z, wahl) {
    if (wahl.eigen) return z.regeln;
    return z.regeln.concat([wahl.regel]);
  }

  function laeufe(z) {
    var wahl = regelDesBesuchers(z);
    return HR.platzierung.alle({
      regel: wahl.regel,
      regeln: regelnFuerLauf(z, wahl),
      stoerungen: HR.platzierung.STOERUNGEN
    });
  }

  // — Darstellung ————————————————————————————————————————————

  function mass(name, wert, zusatz) {
    var e = HR.render.esc;
    return '<div class="mass">' +
      '<dt class="mass__name">' + e(name) + '</dt>' +
      '<dd class="mass__wert mono">' + e(wert) +
      (zusatz ? '<span class="mass__zusatz">' + e(zusatz) + '</span>' : '') +
      '</dd></div>';
  }

  function risikotext(r) {
    var s = HR.copy.akt4;
    if (!r.betrag) return { wert: HR.copy.euro(0), zusatz: s.risikoKeins };
    return { wert: HR.copy.euro(r.betrag), zusatz: s.risikoOffen };
  }

  function ortkarte(z, lauf) {
    var e = HR.render.esc;
    var s = HR.copy.akt4;
    var gewaehlt = z.platzierung === lauf.ort;
    var r = risikotext(lauf.restrisiko);
    var h = [];

    h.push('<section class="ort' + (gewaehlt ? ' ist-gewaehlt' : '') +
      '" aria-label="' + e(s.orte[lauf.ort]) + '">');
    if (gewaehlt) h.push('<p class="ort__marke">' + e(s.gewaehlt) + '</p>');
    h.push('<h3 class="ort__titel">' + e(s.orte[lauf.ort]) + '</h3>');
    h.push('<p class="ort__hinweis">' + e(s.ortHinweis[lauf.ort]) + '</p>');

    h.push('<dl class="masse">');
    h.push(mass(s.masse.zeit, HR.latency.text(lauf.zeit.minuten),
      lauf.zeit.schritte + ' Schritte'));
    h.push(mass(s.masse.kosten, HR.copy.euro(lauf.centGesamt / 100),
      s.kontextanteil + ' ' + HR.tokens.centText(lauf.centKontext) + ' ' + HR.copy.screen3.einheitCent));
    h.push(mass(s.masse.risiko, r.wert, r.zusatz));
    h.push('</dl>');

    h.push('<div class="ort__fuss">');
    h.push(HR.render.knopf('platzierung', s.waehlen, {
      wert: lauf.ort,
      klasse: gewaehlt ? 'knopf--haupt' : '',
      gedrueckt: gewaehlt
    }));
    h.push('</div>');
    h.push('</section>');
    return h.join('');
  }

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.akt4;
    var wahl = regelDesBesuchers(z);
    var alle = laeufe(z);
    var h = [];

    h.push('<h1 id="akt-4-titel">' + e(s.titel) + '</h1>');

    h.push('<div class="regelkarte">');
    h.push('<p class="regelkarte__label">' + e(s.regelLabel) + '</p>');
    h.push('<p class="regelkarte__text">' + e(wahl.regel.text_de) + '</p>');
    h.push('<p class="regelkarte__form mono">' + e(HR.copy.regelLesbar(wahl.regel)) + '</p>');
    if (!wahl.eigen) h.push('<p class="hinweis">' + e(s.ersatzregel) + '</p>');
    h.push('</div>');

    h.push('<h2 class="abschnitt__titel">' + e(s.frage) + '</h2>');
    h.push('<p class="hinweis">' + e(s.gleicheLage) + '</p>');

    h.push('<div class="orte">');
    alle.forEach(function (lauf) { h.push(ortkarte(z, lauf)); });
    h.push('</div>');

    var gewaehlt = null;
    alle.forEach(function (l) { if (l.ort === z.platzierung) gewaehlt = l; });
    if (gewaehlt) {
      h.push('<h2 class="abschnitt__titel">' + e(s.ablaufTitel) + '</h2>');
      h.push(HR.komponenten.logTabelle.kurz(gewaehlt.trajektorie));
    }

    h.push('<div class="steuerung">');
    h.push(HR.render.knopf('akt', HR.copy.screen4.titel, { wert: 5 }));
    h.push('</div>');

    return h.join('');
  }

  // — Aktionen ————————————————————————————————————————————————

  /**
   * Die Wahl eines Orts ist ein Lauf. Er wandert in die Historie, damit der
   * Plot in Akt 4 und das Protokoll in Akt 5 ihn kennen.
   */
  function waehlen(ort) {
    var z = HR.store.holen();
    var wahl = regelDesBesuchers(z);
    var ergebnis = HR.platzierung.lauf(ort, {
      regel: wahl.regel,
      regeln: regelnFuerLauf(z, wahl),
      stoerungen: HR.platzierung.STOERUNGEN
    });
    HR.store.senden({ typ: 'platzierung', wert: ort });
    HR.store.senden({
      typ: 'lauf_fertig',
      ergebnis: ergebnis.ergebnis,
      kontext: {
        regeln: regelnFuerLauf(z, wahl),
        screen: 4,
        akt: 4,
        platzierung: ort,
        enforcement: HR.platzierung.durchsetzung(ort),
        stoerungen: HR.platzierung.STOERUNGEN,
        mitNutzerregel: true
      }
    });
  }

  HR.render.auf('platzierung', waehlen);

  HR.render.bildschirm(4, {
    zeichnen: zeichnen,
    laeufe: laeufe,
    regelDesBesuchers: regelDesBesuchers,
    regelnFuerLauf: regelnFuerLauf,
    waehlen: waehlen,
    BEISPIELSATZ: BEISPIELSATZ
  });
})(window.HR = window.HR || {});
