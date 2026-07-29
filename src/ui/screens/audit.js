/**
 * Screen 4 — Der Audit.
 * Die Trajektorie des Laufs, den der Besucher gerade selbst erzeugt hat,
 * mit Belegen, Exporten und dem Vergleich zweier Laeufe.
 */
(function (HR) {
  'use strict';

  function regelnDesLaufs(z) {
    return (z.laufKontext && z.laufKontext.regeln) || z.regeln;
  }

  /** Exportformat. Bewusst ohne Sitzungskennung — es gehoert dem Besucher. */
  function alsJson(z) {
    var lauf = z.lauf;
    if (!lauf) return '{}';
    return JSON.stringify({
      szenario: HR.agent.SZENARIO_ID,
      stoerungen: (z.laufKontext && z.laufKontext.stoerungen) || [],
      durchsetzung: (z.laufKontext && z.laufKontext.enforcement) || z.enforcement,
      regeln: regelnDesLaufs(z),
      trajektorie: lauf.trajectory,
      ergebnis: lauf.result,
      nutzung: lauf.usage,
      pruefung: lauf.violations
    }, null, 2);
  }

  function csvFeld(v) {
    var s = (v === null || v === undefined) ? '' : String(v);
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function alsCsv(z) {
    var lauf = z.lauf;
    if (!lauf) return '';
    var regeln = regelnDesLaufs(z);
    var zeilen = [HR.copy.screen4.spalten.map(csvFeld).join(';')];
    lauf.trajectory.forEach(function (s) {
      var checks = HR.komponenten.logTabelle.checksFuerSchritt(s, lauf.trajectory, regeln)
        .map(function (c) { return c.id + '=' + c.status; }).join(' ');
      zeilen.push([
        s.i + 1,
        HR.copy.zeit(s.t),
        s.actor,
        (s.guardrail && s.guardrail.blocked) ? 'abgelehnt' : s.action,
        s.tool,
        HR.komponenten.logTabelle.kurzInput(s.input),
        checks,
        s.output && s.output.status
      ].map(csvFeld).join(';'));
    });
    return zeilen.join('\r\n');
  }

  function herunterladen(text, dateiname, typ) {
    try {
      var blob = new Blob([text], { type: typ + ';charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = dateiname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) { /* Export ist Beiwerk und darf die Seite nie stoeren. */ }
  }

  /** Zwei Laeufe, nach Schritt ausgerichtet. */
  function diffZeilen(a, b) {
    var laenge = Math.max(a ? a.trajectory.length : 0, b ? b.trajectory.length : 0);
    var out = [];
    for (var i = 0; i < laenge; i++) {
      var sa = a && a.trajectory[i] ? a.trajectory[i] : null;
      var sb = b && b.trajectory[i] ? b.trajectory[i] : null;
      out.push({
        i: i,
        a: sa,
        b: sb,
        anders: kennung(sa) !== kennung(sb)
      });
    }
    return out;
  }

  function kennung(s) {
    if (!s) return '';
    return s.tool + '|' + JSON.stringify(s.input) + '|' +
      ((s.guardrail && s.guardrail.blocked) ? 'blockiert' : (s.output && s.output.status));
  }

  function zelle(s) {
    var e = HR.render.esc;
    if (!s) return '<span class="diff__leer">' + e(HR.copy.screen4.fehlt) + '</span>';
    return '<span class="mono">' + e(s.tool) + '</span> <span class="mono diff__status">' +
      e((s.guardrail && s.guardrail.blocked) ? HR.copy.screen4.geblockt : (s.output && s.output.status)) +
      '</span>';
  }

  function diffTabelle(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen4;
    if (!z.laufOhneRegel || !z.laufMitRegel) {
      return '<p class="hinweis">' + e(s.diffLeer) + '</p>';
    }
    var zeilen = diffZeilen(z.laufOhneRegel, z.laufMitRegel);
    var h = ['<div class="logtabelle__rahmen"><table class="logtabelle logtabelle--diff"><thead><tr>'];
    h.push('<th scope="col">#</th><th scope="col">' + e(s.laufA) + '</th><th scope="col">' + e(s.laufB) + '</th></tr></thead><tbody>');
    zeilen.forEach(function (r) {
      h.push('<tr class="' + (r.anders ? 'ist-anders' : '') + '">' +
        '<td class="mono">' + (r.i + 1) + '</td>' +
        '<td>' + zelle(r.a) + '</td>' +
        '<td>' + zelle(r.b) + '</td></tr>');
    });
    h.push('</tbody></table></div>');
    return h.join('');
  }

  function zeichnen(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen4;
    var h = [];

    h.push('<h1 id="screen-4-titel">' + e(s.titel) + '</h1>');
    h.push('<p class="frage__text">' + e(s.frage) + '</p>');

    if (!z.lauf) {
      h.push('<p class="hinweis">' + e(HR.copy.screen3.plotLeer) + '</p>');
    } else {
      h.push(HR.komponenten.logTabelle.voll(z.lauf.trajectory, regelnDesLaufs(z), z.offeneZeilen));
      h.push('<div class="steuerung">');
      h.push(HR.render.knopf('export-json', s.jsonExport));
      h.push(HR.render.knopf('export-csv', s.csvExport));
      h.push('</div>');
    }

    h.push('<h2 class="abschnitt__titel">' + e(s.diffTitel) + '</h2>');
    h.push(diffTabelle(z));

    h.push('<section class="selbstcheck">');
    h.push('<h2 class="selbstcheck__titel">' + e(s.selbstcheckTitel) + '</h2>');
    h.push('<ol class="selbstcheck__liste">');
    s.selbstcheck.forEach(function (f) { h.push('<li>' + e(f) + '</li>'); });
    h.push('</ol>');
    h.push('<div class="uebergang"><p><strong>' + e(s.ctaTitel) + '</strong> ' + e(s.ctaText) + '</p>' +
      '<a class="knopf knopf--haupt" href="mailto:">' + e(s.ctaButton) + '</a></div>');
    h.push('</section>');

    return h.join('');
  }

  HR.render.auf('zeile', function (i) {
    HR.store.senden({ typ: 'zeile_umschalten', i: Number(i) });
  });
  HR.render.auf('export-json', function () {
    herunterladen(alsJson(HR.store.holen()), 'handlungsraum-lauf.json', 'application/json');
  });
  HR.render.auf('export-csv', function () {
    herunterladen(alsCsv(HR.store.holen()), 'handlungsraum-lauf.csv', 'text/csv');
  });

  HR.render.bildschirm(4, {
    zeichnen: zeichnen,
    alsJson: alsJson,
    alsCsv: alsCsv,
    diffZeilen: diffZeilen
  });
})(window.HR = window.HR || {});
