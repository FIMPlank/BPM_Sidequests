/**
 * Anonyme Auswertung — freiwillig, aus, bis jemand zustimmt.
 *
 * Regeln, die nicht verhandelbar sind:
 * - Vor der Zustimmung wird nichts geschrieben. Gar nichts.
 * - Die Sitzungskennung entsteht im Speicher und stirbt mit dem Reload.
 *   Keine Speicher-APIs, keine IP, kein User-Agent, kein Fingerprint, keine Cookies.
 * - Geschrieben wird ausschliesslich in das Supabase-Projekt des Betreibers und
 *   nur im gehosteten Live-Modus. Im Demo-Modus verlaesst nichts den Browser.
 * - Im Vortragsmodus wird grundsaetzlich nicht geschrieben.
 */
(function (HR) {
  'use strict';

  function konfiguriert() {
    var s = HR.config.supabase;
    return !!(s && s.url && s.anonKey);
  }

  function darfSchreiben(z) {
    return !!(z && z.consent) && !HR.config.vortrag &&
      HR.config.modus === 'live' && konfiguriert();
  }

  /** Einziger Netzwerkweg des Projekts. In Tests ersetzbar. */
  function versand(tabelle, datensatz) {
    var s = HR.config.supabase;
    return fetch(s.url + '/rest/v1/' + tabelle, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: s.anonKey,
        Authorization: 'Bearer ' + s.anonKey,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(datensatz)
    });
  }

  function schreiben(tabelle, datensatz) {
    var z = HR.store.holen();
    if (!darfSchreiben(z)) return false;
    try {
      HR.logging.transport(tabelle, datensatz);
    } catch (e) {
      return false;   // Auswertung ist Beiwerk; sie darf die Demo nie stoeren.
    }
    return true;
  }

  /** Welche Regel jemand zuerst formuliert — das ist die interessante Frage. */
  function regelEingabe(text, ergebnis, screen) {
    return schreiben('constraint_submissions', {
      text_de: String(text || '').slice(0, 400),
      compiled_kind: ergebnis && ergebnis.ok ? ergebnis.constraint.kind : null,
      compiled_ok: !!(ergebnis && ergebnis.ok),
      reject_reason: ergebnis && !ergebnis.ok ? ergebnis.code : null,
      session_hash: HR.sessionHash,
      screen: screen || 'screen3'
    });
  }

  function laufEreignis(ergebnis, z) {
    return schreiben('run_events', {
      session_hash: HR.sessionHash,
      rules_count: z.regeln.length,
      violations_count: HR.checker.zaehleVerstoesse(ergebnis.violations),
      enforcement: z.enforcement,
      goal_reached: ergebnis.result.goal_reached,
      disturbances: (z.laufKontext && z.laufKontext.stoerungen) || []
    });
  }

  /** Die eine unaufdringliche Zeile am Fuss von Screen 3. */
  function zustimmungsmarkup(z) {
    var e = HR.render.esc;
    var s = HR.copy.screen3;
    if (HR.config.vortrag) return '';
    if (z.consent) {
      return '<p class="zustimmung" role="status">' + e(s.consentDanke) + '</p>';
    }
    return '<p class="zustimmung">' + e(s.consentText) + ' ' +
      HR.render.knopf('zustimmen', s.consentButton, { klasse: 'knopf--still knopf--klein' }) +
      ' <span class="zustimmung__zusatz">' + e(s.consentZusatz) + '</span></p>';
  }

  HR.logging = {
    darfSchreiben: darfSchreiben,
    konfiguriert: konfiguriert,
    transport: versand,          // in Tests ersetzbar
    schreiben: schreiben,
    regelEingabe: regelEingabe,
    laufEreignis: laufEreignis,
    zustimmungsmarkup: zustimmungsmarkup
  };

  if (HR.render && HR.render.auf) {
    HR.render.auf('zustimmen', function () { HR.store.senden({ typ: 'consent' }); });
  }
})(window.HR = window.HR || {});
