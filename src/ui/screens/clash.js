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

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = txt();
    var systemRegeln = z.regeln.filter(function (r) { return r.source === 'system'; });
    var h = [];

    h.push('<h1 id="screen-1-titel">' + e(s.titel) + '</h1>');
    h.push('<p class="lead">' + e(s.lead) + '</p>');

    h.push('<div class="clash">');

    h.push('<section class="panel panel--imperativ" aria-label="' + e(HR.copy.label.imperativ) + '">');
    h.push('<p class="panel__label">' + e(HR.copy.label.imperativ) + '</p>');
    h.push(HR.komponenten.fsmDiagramm.zeichnen(z.fsm));
    if (z.fsm.gestoppt) {
      h.push('<p class="badge badge--verstoss" role="status">' + e(s.fsmBadge) + '</p>');
    }
    h.push('<p class="zaehler-zeile"><span class="zaehler-zeile__name">' + e(s.variantenLabel) +
      '</span><span class="zaehler-zeile__wert mono" aria-live="polite">' + z.fsm.varianten + '</span></p>');
    h.push('</section>');

    h.push('<section class="panel panel--deklarativ" aria-label="' + e(HR.copy.label.deklarativ) + '">');
    h.push('<p class="panel__label">' + e(HR.copy.label.deklarativ) + '</p>');
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

    h.push('<div class="steuerung">');
    h.push(HR.render.knopf('prozess-starten', z.gestartet ? s.erneut : s.starten,
      { klasse: 'knopf--haupt', deaktiviert: z.laeuft }));
    h.push('<div class="steuerung__gruppe"><span class="steuerung__titel">' + e(s.stoerungTitel) + '</span>');
    HR.imperative.STOERUNGEN.forEach(function (id) {
      h.push(HR.render.knopf('stoerung', s.stoerungen[id], { wert: id, deaktiviert: z.laeuft || !z.gestartet }));
    });
    h.push('</div>');
    h.push('</div>');

    h.push('<p class="statuszeile" role="status">' + e(statuszeile(z)) + '</p>');

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
      HR.store.senden({ typ: 'lauf_fertig', ergebnis: ergebnis, kontext: { vergleichsbasis: true, regeln: HR.store.holen().regeln } });
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

  HR.render.auf('prozess-starten', prozessStarten);
  HR.render.auf('stoerung', function (wert) { stoerungEinwerfen(wert); });

  HR.render.bildschirm(1, { zeichnen: zeichnen });
})(window.HR = window.HR || {});
