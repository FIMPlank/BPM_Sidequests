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

  // — Teil 2: die Kombination ————————————————————————————————

  /** Die drei Regeln der Kombination: die eigene plus zwei uebliche. */
  var ZUSATZSAETZE = {
    zahlung: 'Erstattungen über 1.000 € brauchen eine Freigabe',
    beleg: 'Keine Abrechnung ohne geprüften Beleg'
  };

  function kombiRegeln(z) {
    var wahl = regelDesBesuchers(z);
    return {
      eigen: wahl.regel,
      zahlung: HR.compiler.uebersetzen(ZUSATZSAETZE.zahlung, { id: 'K-1' }).constraint,
      beleg: HR.compiler.uebersetzen(ZUSATZSAETZE.beleg, { id: 'K-2' }).constraint
    };
  }

  function zuordnungszeile(z, platz, regel) {
    var e = HR.render.esc;
    var s = HR.copy.akt4;
    var gesetzt = z.zuordnung[platz];
    var h = ['<tr class="zuordnung__zeile' + (gesetzt ? ' ist-gesetzt' : '') + '">'];
    h.push('<th scope="row" class="zuordnung__regel">' +
      '<span class="zuordnung__name">' + e(s.regelnamen[platz]) + '</span>' +
      '<span class="zuordnung__text">' + e(regel.text_de) + '</span></th>');
    HR.platzierung.PLATZIERUNGEN.forEach(function (ort) {
      h.push('<td class="zuordnung__zelle">' +
        HR.render.knopf('zuordnung', s.orte[ort], {
          wert: platz + ':' + ort,
          klasse: 'knopf--klein',
          gedrueckt: gesetzt === ort
        }) + '</td>');
    });
    h.push('</tr>');
    return h.join('');
  }

  /** Das Ergebnis in der Sprache des Papiers — auch wenn es keins zum Vorzeigen ist. */
  function musterkarte(z) {
    var e = HR.render.esc;
    var s = HR.copy.akt4;
    var treffer = HR.muster.bestimmen(z.zuordnung);
    if (!treffer) return '<p class="hinweis">' + e(s.offen) + '</p>';

    var m = HR.copy.muster[treffer.schluessel];
    var h = ['<div class="muster' + (treffer.entartet ? ' ist-entartet' : '') + '" role="status">'];
    if (treffer.entartet && m.entartet) {
      h.push('<p class="muster__satz">' + e(m.entartet) + '</p>');
      h.push('<p class="muster__name">' + e(m.name) + '</p>');
    } else {
      h.push('<p class="muster__satz">' +
        e(HR.copy.muster.satz.replace('{muster}', m.name)) + '</p>');
    }
    h.push('<p class="muster__beschreibung">' + e(m.beschreibung) + '</p>');
    h.push('<p class="muster__einsatz">' + e(m.einsatz) + '</p>');
    h.push('</div>');
    return h.join('');
  }

  function kombination(z) {
    var e = HR.render.esc;
    var s = HR.copy.akt4;
    var regeln = kombiRegeln(z);
    var h = [];

    h.push('<h2 class="abschnitt__titel">' + e(s.kombiTitel) + '</h2>');
    h.push('<p class="hinweis">' + e(s.kombiLead) + '</p>');

    h.push('<div class="logtabelle__rahmen"><table class="zuordnung"><thead><tr>');
    h.push('<th scope="col">' + e(s.spalteRegel) + '</th>');
    HR.platzierung.PLATZIERUNGEN.forEach(function (ort) {
      h.push('<th scope="col">' + e(s.orte[ort]) + '</th>');
    });
    h.push('</tr></thead><tbody>');
    HR.muster.REGELPLAETZE.forEach(function (platz) {
      h.push(zuordnungszeile(z, platz, regeln[platz]));
    });
    h.push('</tbody></table></div>');

    h.push(musterkarte(z));

    if (HR.muster.vollstaendig(z.zuordnung)) {
      h.push('<div class="steuerung">' +
        HR.render.knopf('zuordnung-zuruecksetzen', s.zuruecksetzen, { klasse: 'knopf--still' }) +
        '</div>');
    }
    return h.join('');
  }

  // — Die verschmolzene Flaeche ————————————————————————————————

  /**
   * Einmal je Sitzung. Danach steht die Flaeche verschmolzen da und wird
   * nicht bei jedem Neuzeichnen erneut zusammengeschoben.
   */
  var verschmolzen = false;

  /** Welche Regeln stehen als harter Kontrollpunkt im Raum? */
  function kontrollpunkte(z) {
    var regeln = kombiRegeln(z);
    var out = [];
    HR.muster.REGELPLAETZE.forEach(function (platz) {
      if (z.zuordnung[platz] === 'imperativ') out.push(regeln[platz]);
    });
    // Solange nichts zugewiesen ist, zeigt Teil 1 seine eigene Wahl.
    if (!out.length && z.platzierung === 'imperativ') out.push(regeln.eigen);
    return out;
  }

  function flaeche(z) {
    var e = HR.render.esc;
    var s = HR.copy.akt4;
    var gewaehlt = null;
    laeufe(z).forEach(function (l) { if (l.ort === z.platzierung) gewaehlt = l; });
    var bewegung = HR.render.bewegungErlaubt();

    var h = ['<div class="flaeche">'];
    h.push('<h2 class="abschnitt__titel">' + e(s.flaecheTitel) + '</h2>');
    h.push(HR.komponenten.fusion.zeichnen({
      regeln: z.regeln,
      trajektorie: gewaehlt ? gewaehlt.trajektorie : [],
      kontrollpunkte: kontrollpunkte(z),
      verschmilzt: bewegung && !verschmolzen
    }));
    h.push('<p class="flaeche__hinweis">' +
      e(bewegung ? s.flaecheHinweis : HR.copy.a11y.verschmolzen) + '</p>');
    h.push('</div>');
    return h.join('');
  }

  /** Nach dem Zeichnen: die Verschmelzung laeuft genau einmal, rund 900 ms. */
  function nach(el) {
    if (verschmolzen) return;
    if (!HR.render.bewegungErlaubt()) { verschmolzen = true; return; }
    var knoten = el.querySelector ? el.querySelector('.fusion.ist-verschmilzt') : null;
    if (!knoten) return;
    window.setTimeout(function () {
      verschmolzen = true;
      if (knoten.classList) knoten.classList.remove('ist-verschmilzt');
    }, 900);
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

    h.push(kombination(z));

    h.push(flaeche(z));

    // Der Plot sammelt ueber die ganze Sitzung: jeder Lauf aus jedem Akt
    // setzt hier einen Punkt. Erst dadurch wird die Form sichtbar.
    h.push('<h2 class="abschnitt__titel">' + e(HR.copy.screen3.plotTitel) + '</h2>');
    h.push('<p class="hinweis">' + e(s.plotHinweis) + '</p>');
    h.push('<div class="plot-panel">' + HR.komponenten.plot.zeichnen(z.historie) + '</div>');

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
  HR.render.auf('zuordnung', function (wert) {
    var teile = String(wert).split(':');
    HR.store.senden({ typ: 'zuordnung', regel: teile[0], ort: teile[1] });
  });
  HR.render.auf('zuordnung-zuruecksetzen', function () {
    HR.store.senden({ typ: 'zuordnung_zuruecksetzen' });
  });

  HR.render.bildschirm(4, {
    zeichnen: zeichnen,
    nach: nach,
    kontrollpunkte: kontrollpunkte,
    laeufe: laeufe,
    regelDesBesuchers: regelDesBesuchers,
    regelnFuerLauf: regelnFuerLauf,
    kombiRegeln: kombiRegeln,
    waehlen: waehlen,
    BEISPIELSATZ: BEISPIELSATZ,
    ZUSATZSAETZE: ZUSATZSAETZE
  });
})(window.HR = window.HR || {});
