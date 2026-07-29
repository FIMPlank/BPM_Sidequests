/**
 * Regel-Compiler: freier deutscher Text hinein, strukturierte Regel heraus.
 * Der Compiler kann ausschliesslich Mitglieder der geschlossenen Praedikat-Union
 * erzeugen. Was er nicht ausdruecken kann, lehnt er ab und nennt den Grund.
 */
(function (HR) {
  'use strict';

  function normalisieren(text) {
    // 1:1-Ersetzungen, damit Positionen im Originaltext erhalten bleiben.
    return String(text).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 's');
  }

  /** Reihenfolge zaehlt: spezifische Begriffe zuerst, damit sie maskiert werden. */
  var WERKZEUG_MUSTER = [
    ['selbst_freigeben', /selbstfreigabe|selbstgenehmigung|eigenfreigabe|selbst\s?(freigeben|freigegeben|genehmigen|genehmigt)|im alleingang|ohne zweite instanz/g],
    ['beleg_schaetzen', /schatzung|schatzen|geschatzt|pauschal(e|betrag)?/g],
    ['beleg_pruefen', /\bbelege?n?|\bquittung(en)?|\brechnung(en)?/g],
    ['hotel_buchen', /\bhotel(s|buchung(en)?)?|\bubernachtung(en)?|\bbuchung(en)?|\bzimmer/g],
    ['erstattung_ausloesen', /erstattung(en)?|auszahlung(en)?|ruckerstattung/g],
    ['abrechnung_einreichen', /abrechnung(en)?|kostenabrechnung|einreich(en|ung)/g],
    ['reiseantrag_stellen', /reiseantrag(e|en)?|dienstreiseantrag|\bantrag(e|en)?\b/g],
    ['genehmigung_anfordern', /genehmigung(en)?|freigabe(n)?|zustimmung|bewilligung|vier[- ]augen|genehmigen|freigeben/g]
  ];

  var BETRAGS_FELD = { hotel_buchen: 'preis_pro_nacht' };

  function werkzeugeFinden(n) {
    var maske = n.split('');
    var treffer = [];
    WERKZEUG_MUSTER.forEach(function (paar) {
      var tool = paar[0];
      var re = new RegExp(paar[1].source, 'g');
      var m;
      while ((m = re.exec(n)) !== null) {
        var frei = true;
        for (var i = m.index; i < m.index + m[0].length; i++) if (maske[i] === null) frei = false;
        if (!frei) continue;
        for (var j = m.index; j < m.index + m[0].length; j++) maske[j] = null;
        treffer.push({ tool: tool, pos: m.index });
        if (m[0].length === 0) re.lastIndex++;
      }
    });
    treffer.sort(function (a, b) { return a.pos - b.pos; });
    var gesehen = {}, out = [];
    treffer.forEach(function (t) {
      if (!gesehen[t.tool]) { gesehen[t.tool] = true; out.push(t.tool); }
    });
    return out;
  }

  function betragFinden(n) {
    var re = /(uber|mehr als|hoher als|grosser als|ab|mindestens|maximal|hochstens|bis zu)\s*(\d{1,3}(?:[.\s]\d{3})*(?:[,.]\d{1,2})?)\s*(?:€|eur|euro)?/;
    var m = re.exec(n);
    if (!m) {
      var re2 = /(\d{1,3}(?:[.\s]\d{3})*(?:[,.]\d{1,2})?)\s*(?:€|eur|euro)/;
      var m2 = re2.exec(n);
      if (!m2) return null;
      return { op: '>', wert: zahlAus(m2[1]) };
    }
    var wort = m[1];
    var op = '>';
    if (wort === 'ab' || wort === 'mindestens') op = '>=';
    if (wort === 'maximal' || wort === 'hochstens' || wort === 'bis zu') op = '<=';
    return { op: op, wert: zahlAus(m[2]), grenzwort: wort };
  }

  function zahlAus(s) {
    var t = String(s).replace(/[.\s](?=\d{3}\b)/g, '').replace(',', '.');
    var n = parseFloat(t);
    return isFinite(n) ? n : null;
  }

  function hatFreigabeforderung(n) {
    return /freigabe|genehmigung|zustimmung|bewilligung|vier[- ]augen|genehmigen|freigeben|genehmigt/.test(n);
  }

  function hatNegation(n) {
    return /\bnie\b|niemals|\bkein(e|en|er|em)?\b|nicht (erlaubt|zulassig|gestattet)|verboten|untersagt|unzulassig|darf nicht|durfen nicht/.test(n);
  }

  function ablehnen(code, slots) {
    return { ok: false, code: code, slots: slots || {} };
  }

  /**
   * @param {string} text
   * @param {{enforcement?:string, source?:string, id?:string}} [optionen]
   * @returns {{ok:true, constraint:Constraint}|{ok:false, code:string, slots:Object}}
   */
  function uebersetzen(text, optionen) {
    optionen = optionen || {};
    var roh = String(text || '').trim();
    if (roh.length < 4) return ablehnen('zu_kurz');

    var n = normalisieren(roh);
    var tools = werkzeugeFinden(n);
    if (!tools.length) return ablehnen('kein_werkzeug');

    var betrag = betragFinden(n);
    var freigabe = hatFreigabeforderung(n);
    var negation = hatNegation(n);
    var ohne = /\bohne\b/.test(n);
    var folgt = /folg(t|en|e)|danach|anschliessend|im anschluss/.test(n);

    var ziel = tools[0];
    var zweitwerkzeug = tools.length > 1 ? tools[1] : null;
    var kind = null, praedikat = null;

    // 1) "Keine Erstattung ohne eingereichte Abrechnung" — Vorbedingung
    if (ohne && zweitwerkzeug) {
      kind = 'precedence';
      praedikat = { type: 'vorheriger_aufruf', tool: zweitwerkzeug };

    // 2) Schwellenwert-Regel
    } else if (betrag && betrag.wert !== null) {
      var feld = BETRAGS_FELD[ziel] || 'betrag';
      var bedingung = { type: 'feld_vergleich', feld: feld, op: betrag.op, wert: betrag.wert };
      var forderung = (freigabe || !negation)
        ? { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern', mit_ergebnis: 'erteilt' }
        : { type: 'kein_aufruf', tool: ziel };
      kind = 'threshold';
      praedikat = { type: 'wenn_dann', wenn: bedingung, dann: forderung };

    // 3) Verbot
    } else if (negation) {
      kind = 'absence';
      praedikat = { type: 'kein_aufruf', tool: ziel };

    // 4) "Auf X muss Y folgen"
    } else if (folgt && zweitwerkzeug) {
      kind = 'response';
      praedikat = { type: 'folgender_aufruf', tool: zweitwerkzeug };

    // 5) "X nur mit Freigabe"
    } else if (freigabe && ziel !== 'genehmigung_anfordern') {
      kind = 'precedence';
      praedikat = { type: 'vorheriger_aufruf', tool: 'genehmigung_anfordern', mit_ergebnis: 'erteilt' };

    // 6) "Nach jeder Reise muessen Belege gesammelt werden"
    } else if (/muss|mussen|immer|stets|jede[rmn]?\b/.test(n)) {
      kind = 'existence';
      praedikat = { type: 'vorheriger_aufruf', tool: ziel };

    } else {
      return ablehnen('keine_regelform', { werkzeug: ziel });
    }

    var constraint = {
      id: optionen.id || HR.constraints.neueId('R'),
      text_de: roh,
      kind: kind,
      target: ziel,
      predicate: praedikat,
      source: optionen.source || 'user',
      enforcement: optionen.enforcement || 'runtime'
    };

    if (!HR.constraints.constraintGueltig(constraint)) {
      return ablehnen('nicht_darstellbar', { werkzeug: ziel });
    }
    return { ok: true, constraint: constraint };
  }

  /** Die drei Regeln, die auf Screen 1 als deklarative Sicht gezeigt werden. */
  function systemRegeln() {
    return [
      {
        id: 'S-1',
        text_de: 'Auf einen Reiseantrag muss eine Genehmigung folgen.',
        kind: 'response', target: 'reiseantrag_stellen',
        predicate: { type: 'folgender_aufruf', tool: 'genehmigung_anfordern' },
        source: 'system', enforcement: 'runtime'
      },
      {
        id: 'S-2',
        text_de: 'Keine Erstattung ohne eingereichte Abrechnung.',
        kind: 'precedence', target: 'erstattung_ausloesen',
        predicate: { type: 'vorheriger_aufruf', tool: 'abrechnung_einreichen' },
        source: 'system', enforcement: 'runtime'
      },
      {
        id: 'S-3',
        text_de: 'Nach jeder Reise muessen Belege gesammelt werden.',
        kind: 'existence', target: 'beleg_pruefen',
        predicate: { type: 'vorheriger_aufruf', tool: 'beleg_pruefen' },
        source: 'system', enforcement: 'runtime'
      }
    ];
  }

  HR.compiler = {
    normalisieren: normalisieren,
    werkzeugeFinden: werkzeugeFinden,
    betragFinden: betragFinden,
    uebersetzen: uebersetzen,
    systemRegeln: systemRegeln
  };
})(window.HR = window.HR || {});
