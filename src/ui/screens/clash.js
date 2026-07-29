/** Screen 1 — Der Clash. Ein Prozess, zwei Paradigmen, eine Naht in der Mitte. */
(function (HR) {
  'use strict';

  var c = null; // Texte werden erst zur Laufzeit gelesen

  function txt() { c = HR.copy.screen1; return c; }

  function regelsaetze(regeln) {
    var e = HR.render.esc;
    return '<ol class="regelsaetze">' + regeln.map(function (r) {
      return '<li class="regelsatz"><span class="regelsatz__id mono">' + e(r.id) + '</span>' +
        '<span class="regelsatz__text">' + e(r.text_de) + '</span></li>';
    }).join('') + '</ol>';
  }

  function statuszeile(z) {
    var s = txt();
    if (z.laeuft) return '';
    if (z.stoerungGeworfen) return s.agentOk;
    if (z.gestartet && z.lauf) return s.beideFertig + ' ' + s.langweilig;
    return '';
  }

  /**
   * Die Wahl aus Akt 0 entscheidet, welche Seite vorn steht. Die andere wird
   * nicht entfernt, nur zurueckgenommen — der Vergleich ist der ganze Akt.
   */
  function istGewaehlt(z, seite) {
    return (z.wahl === 'heute' && seite === 'imperativ') ||
           (z.wahl === 'agent' && seite === 'deklarativ');
  }

  function seitenklasse(z, seite) {
    if (!z.wahl) return '';
    return istGewaehlt(z, seite) ? ' ist-gewaehlt' : ' ist-zurueckgenommen';
  }

  function seitenmarke(z, seite) {
    if (!z.wahl) return '';
    var a = HR.copy.akt0;
    return '<p class="panel__wahlmarke">' +
      HR.render.esc(istGewaehlt(z, seite) ? a.seiteAktiv : a.seitePassiv) + '</p>';
  }

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = txt();
    var systemRegeln = z.regeln.filter(function (r) { return r.source === 'system'; });
    var h = [];

    h.push('<h1 id="akt-1-titel" tabindex="-1">' + e(s.titel) + '</h1>');
    h.push('<p class="lead">' + e(s.lead) + '</p>');
    if (z.wahl) {
      h.push('<p class="statuszeile" role="status">' +
        e(z.wahl === 'heute' ? HR.copy.akt0.gewaehltHeute : HR.copy.akt0.gewaehltAgent) + '</p>');
    }

    h.push('<div class="clash">');

    // Die Beschriftung steht sichtbar im Panel; sie ist zugleich sein Name.
    h.push('<section class="panel panel--imperativ' + seitenklasse(z, 'imperativ') +
      '" aria-labelledby="panel-imperativ-label">');
    h.push(seitenmarke(z, 'imperativ'));
    h.push('<p class="panel__label" id="panel-imperativ-label">' + e(HR.copy.label.imperativ) + '</p>');
    h.push(HR.komponenten.fsmDiagramm.zeichnen(z.fsm));
    if (z.fsm.gestoppt) {
      h.push('<p class="badge badge--verstoss" role="status">' + e(s.fsmBadge) + '</p>');
    }
    // Die eine Zahl, um die es in Akt 1 geht. Sie ist die groesste der Flaeche.
    // Die Zahl allein sagt nichts: angesagt wird sie zusammen mit ihrer Beschriftung.
    h.push('<div class="grosszahl" role="status">');
    h.push('<span class="grosszahl__wert mono">' + z.fsm.varianten + '</span>');
    h.push('<span class="grosszahl__name">' + e(s.variantenLabel) + '</span>');
    h.push('</div>');
    h.push('</section>');

    h.push('<section class="panel panel--deklarativ' + seitenklasse(z, 'deklarativ') +
      '" aria-labelledby="panel-deklarativ-label">');
    h.push(seitenmarke(z, 'deklarativ'));
    h.push('<p class="panel__label" id="panel-deklarativ-label">' + e(HR.copy.label.deklarativ) + '</p>');
    h.push(regelsaetze(systemRegeln));
    h.push('<div class="raum-panel"><h2 class="raum-panel__titel">' + e(s.raumTitel) + '</h2>');
    h.push(HR.komponenten.handlungsraum.zeichnen({
      regeln: z.regeln,
      trajektorie: z.lauf ? z.lauf.trajectory : [],
      bisSchritt: z.spurSchritt
    }));
    h.push('<p class="raum-panel__hinweis">' + e(s.raumHinweis) + '</p></div>');
    h.push('</section>');

    h.push('</div>');

    // Erst die Stoerung waehlen, dann laufen lassen. Die Reihenfolge ist der
    // Punkt des Akts: der Besucher setzt die Bedingung, er sieht ihr nicht zu.
    h.push('<div class="steuerung steuerung--wahl">');
    var knoepfe = HR.imperative.STOERUNGEN.map(function (id) {
      return HR.render.knopf('stoerung-waehlen', s.stoerungen[id], {
        wert: id,
        gedrueckt: z.stoerungWahl === id,
        deaktiviert: z.laeuft
      });
    }).join('');
    h.push(HR.a11y.gruppe(e(s.stoerungWaehlen),
      '<div class="steuerung__gruppe">' + knoepfe + '</div>',
      { legendeKlasse: 'steuerung__titel' }));
    h.push('</div>');

    h.push('<div class="steuerung">');
    h.push(HR.render.knopf('prozess-starten',
      z.stoerungWahl ? s.startenMitStoerung : (z.gestartet ? s.erneut : s.starten),
      { klasse: 'knopf--haupt', deaktiviert: z.laeuft }));
    h.push('<span class="steuerung__erklaerung">' +
      e(z.stoerungWahl ? s.laufMitWahl : s.laufOhneWahl) + '</span>');
    h.push('</div>');

    h.push('<p class="statuszeile" role="status">' + e(statuszeile(z)) + '</p>');
    if (!HR.render.bewegungErlaubt()) {
      h.push('<p class="hinweis">' + e(HR.copy.a11y.reduziert) + '</p>');
    }

    if (z.stoerungGeworfen) {
      h.push('<div class="uebergang"><p>' + e(s.weiterAngebot) + '</p>' +
        HR.render.knopf('screen', HR.copy.seite.weiter, { wert: 2, klasse: 'knopf--haupt' }) + '</div>');
    }
    return h.join('');
  }

  // — Ablaufsteuerung —————————————————————————————————————————

  function abfolge(schritte) {
    var i = 0;
    function weiter() {
      if (i >= schritte.length) return;
      var ms = schritte[i++]() || 0;
      window.setTimeout(weiter, HR.render.bewegungErlaubt() ? ms : 0);
    }
    weiter();
  }

  function laufen(stoerungen) {
    return HR.agent.aktiver().run(HR.agent.anfrage({
      disturbances: stoerungen,
      constraints: HR.store.holen().regeln,
      enforcement: HR.store.holen().enforcement
    }));
  }

  function prozessStarten() {
    var takt = HR.config.stepDelayMs;
    HR.store.senden({ typ: 'fsm_reset' });
    HR.store.senden({ typ: 'lauf_start' });
    laufen([]).then(function (ergebnis) {
      HR.store.senden({ typ: 'lauf_fertig', ergebnis: ergebnis, kontext: { regeln: HR.store.holen().regeln, screen: 1 } });
      HR.store.senden({ typ: 'gestartet' });
      var schritte = [];
      for (var i = 0; i < ergebnis.trajectory.length; i++) {
        (function (k) {
          schritte.push(function () {
            var ev = HR.imperative.naechstesEreignis(HR.store.holen().fsm);
            if (ev) HR.store.senden({ typ: 'fsm_ereignis', ereignis: ev });
            HR.store.senden({ typ: 'spur_schritt', i: k });
            return takt;
          });
        })(i);
      }
      abfolge(schritte);
    });
  }

  function stoerungEinwerfen(id) {
    var takt = HR.config.stepDelayMs;
    HR.store.senden({ typ: 'fsm_neustart' });
    HR.store.senden({ typ: 'lauf_start' });
    laufen([id]).then(function (ergebnis) {
      HR.store.senden({ typ: 'lauf_fertig', ergebnis: ergebnis, kontext: { regeln: HR.store.holen().regeln } });
      HR.store.senden({ typ: 'stoerung', id: id });
      var schritte = [];
      // Der Prozess laeuft an, dann kommt die Realitaet dazwischen.
      for (var k = 0; k < 3; k++) {
        schritte.push(function () {
          var ev = HR.imperative.naechstesEreignis(HR.store.holen().fsm);
          if (ev) HR.store.senden({ typ: 'fsm_ereignis', ereignis: ev });
          return takt;
        });
      }
      schritte.push(function () {
        HR.store.senden({ typ: 'fsm_ereignis', ereignis: id });  // links: harter Stopp
        return 120;
      });
      for (var i = 0; i < ergebnis.trajectory.length; i++) {
        (function (n) {
          schritte.push(function () { HR.store.senden({ typ: 'spur_schritt', i: n }); return takt; });
        })(i);
      }
      abfolge(schritte);
    });
  }

  /** Der eine Startknopf. Was er tut, hat der Besucher vorher festgelegt. */
  function laufAusloesen() {
    var wahl = HR.store.holen().stoerungWahl;
    if (wahl) stoerungEinwerfen(wahl);
    else prozessStarten();
  }

  HR.render.auf('prozess-starten', laufAusloesen);
  HR.render.auf('stoerung-waehlen', function (wert) {
    HR.store.senden({ typ: 'stoerung_waehlen', id: wert });
  });

  HR.render.bildschirm(1, {
    zeichnen: zeichnen,
    starten: prozessStarten,        // Akt 0 loest den Grundlauf aus
    ausloesen: laufAusloesen,
    istGewaehlt: istGewaehlt
  });
})(window.HR = window.HR || {});
