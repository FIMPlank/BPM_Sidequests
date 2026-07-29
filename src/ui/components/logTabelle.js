/**
 * Die Trajektorie als Log. Zwei Ansichten aus derselben Quelle:
 * `kurz` fuer die Bildschirme 2 und 3, `voll` fuer den Audit.
 * Das Log ist ein Log — deshalb durchgehend Mono mit Tabellenziffern.
 */
(function (HR) {
  'use strict';

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

  /** Kompakte Liste eines Laufs. */
  function kurz(traj) {
    var e = HR.render.esc;
    return '<ol class="ablauf">' + (traj || []).map(function (s) {
      return '<li class="ablauf__zeile' + (s.guardrail && s.guardrail.blocked ? ' ist-geblockt' : '') + '">' +
        '<span class="ablauf__nr mono">' + (s.i + 1) + '</span>' +
        '<span class="ablauf__tool mono">' + e(s.tool) + '</span>' +
        '<span class="ablauf__input mono">' + e(kurzInput(s.input)) + '</span>' +
        '<span class="ablauf__ergebnis mono">' + e(s.output && s.output.status) + '</span></li>';
    }).join('') + '</ol>';
  }

  /**
   * Welche Regeln waren fuer diesen Schritt einschlaegig, und wie fielen sie aus?
   * Ausgewertet wird gegen die tatsaechliche Vorgeschichte des Laufs.
   */
  function checksFuerSchritt(schritt, traj, constraints) {
    var out = [];
    if (!schritt.tool) return out;
    (constraints || []).forEach(function (c) {
      if (c.target !== schritt.tool) return;
      if (schritt.guardrail && schritt.guardrail.blocked) {
        out.push({
          id: c.id,
          status: schritt.guardrail.rule_id === c.id ? 'verletzt' : 'nicht_anwendbar',
          feld: schritt.guardrail.reason,
          tatsaechlich: null,
          leitplanke: true
        });
        return;
      }
      var i = traj.indexOf(schritt);
      var r = HR.constraints.auswerten(c.predicate, {
        aufruf: schritt,
        vorher: traj.slice(0, i),
        nachher: traj.slice(i + 1),
        alle: traj
      });
      out.push({
        id: c.id,
        status: r.nicht_anwendbar ? 'nicht_anwendbar' : (r.wert ? 'erfuellt' : 'verletzt'),
        feld: r.feld,
        tatsaechlich: r.tatsaechlich
      });
    });
    return out;
  }

  /**
   * Welcher Architekturentscheidung ist dieser Schritt zuzurechnen?
   *
   * Das ist die Frage, die eine Innenrevision stellt: nicht nur „wurde
   * geprueft“, sondern „wo wurde geprueft“. Sie laesst sich am Schritt
   * selbst beantworten — der Kontrollpunkt steht als eigener Schritt im
   * Protokoll, die Leitplanke hinterlaesst einen Vermerk am Aufruf, und was
   * beides nicht hat, ist erst hinterher aufgefallen oder gar nicht geregelt.
   *
   * @returns {string|null} Schluessel aus HR.platzierung.PLATZIERUNGEN
   */
  function platzierungFuerSchritt(schritt, checks) {
    if (!schritt) return null;
    if (schritt.tool === 'kontrollpunkt') return 'imperativ';
    if (schritt.guardrail) return 'leitplanke';
    var betroffen = (checks || []).filter(function (c) { return c.status !== 'nicht_anwendbar'; });
    return betroffen.length ? 'nachgang' : null;
  }

  function platzierungText(schluessel) {
    if (!schluessel) return HR.copy.screen4.fehlt;
    return HR.copy.akt4.orte[schluessel];
  }

  /** Vollstaendige Audit-Tabelle mit aufklappbarem Beleg. */
  function voll(traj, constraints, offen) {
    var e = HR.render.esc;
    var s = HR.copy.screen4;
    var h = ['<div class="logtabelle__rahmen"><table class="logtabelle"><thead><tr>'];
    s.spalten.forEach(function (n) { h.push('<th scope="col">' + e(n) + '</th>'); });
    h.push('</tr></thead><tbody>');

    (traj || []).forEach(function (schritt) {
      var checks = checksFuerSchritt(schritt, traj, constraints);
      var geblockt = !!(schritt.guardrail && schritt.guardrail.blocked);
      var aufklappbar = checks.length > 0;
      var istOffen = !!(offen && offen[schritt.i]);

      h.push('<tr class="logzeile' + (geblockt ? ' ist-geblockt' : '') + '"' +
        (aufklappbar ? ' data-aktion="zeile" data-wert="' + schritt.i + '" tabindex="0"' +
          ' aria-expanded="' + (istOffen ? 'true' : 'false') + '"' : '') + '>');
      h.push('<td class="mono">' + (schritt.i + 1) + '</td>');
      h.push('<td class="mono">' + e(HR.copy.zeit(schritt.t)) + '</td>');
      h.push('<td>' + e(s.akteur[schritt.actor] || schritt.actor) + '</td>');
      h.push('<td>' + e(geblockt ? s.geblockt : (s.aktion[schritt.action] || schritt.action)) + '</td>');
      h.push('<td class="mono">' + e(schritt.tool) + '</td>');
      h.push('<td class="mono logtabelle__input">' + e(kurzInput(schritt.input)) + '</td>');
      var ort = platzierungFuerSchritt(schritt, checks);
      h.push('<td class="logtabelle__ort' + (ort ? ' ist-' + ort : '') + '">' +
        e(platzierungText(ort)) + '</td>');
      h.push('<td class="mono">' + (checks.length
        ? checks.map(function (c) {
            return '<span class="check check--' + c.status + '">' + e(c.id) + ' ' +
              e(HR.copy.status[c.status]) + '</span>';
          }).join(' ')
        : '<span class="check check--leer">' + e(s.keinCheck) + '</span>') + '</td>');
      h.push('<td class="mono">' + e(schritt.output && schritt.output.status) + '</td>');
      h.push('</tr>');

      if (istOffen) {
        var belege = checks.filter(function (c) { return c.status === 'verletzt'; });
        if (!belege.length) belege = checks;
        h.push('<tr class="logzeile__beleg"><td colspan="' + s.spalten.length + '">');
        h.push('<ul class="beleg">' + belege.map(function (c) {
          return '<li class="mono">' + e(c.id) + ' — ' + e(HR.copy.status[c.status]) +
            ': ' + e(c.feld === null || c.feld === undefined ? '' : c.feld) +
            ' = ' + e(c.tatsaechlich === null || c.tatsaechlich === undefined ? '—' : c.tatsaechlich) +
            '</li>';
        }).join('') + '</ul>');
        h.push('</td></tr>');
      }
    });

    h.push('</tbody></table></div>');
    return h.join('');
  }

  HR.komponenten = HR.komponenten || {};
  HR.komponenten.logTabelle = {
    kurz: kurz,
    voll: voll,
    kurzInput: kurzInput,
    checksFuerSchritt: checksFuerSchritt,
    platzierungFuerSchritt: platzierungFuerSchritt,
    platzierungText: platzierungText
  };
})(window.HR = window.HR || {});
