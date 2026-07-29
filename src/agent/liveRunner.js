/**
 * Live-Agent: derselbe Vertrag wie der skriptierte Agent, nur laeuft die Schleife
 * in der Edge Function. Der API-Schluessel erreicht den Browser nie.
 *
 * Der Live-Modus setzt eine gehostete Seite voraus. Von `file://` aus hat die
 * Seite den Ursprung `null`; Supabase weist den Preflight dann ab. Das ist
 * erwartet und dokumentiert, kein Fehler.
 */
(function (HR) {
  'use strict';

  function endpunkt() {
    var s = HR.config.supabase;
    return (s.url || '') + (s.functionPath || '/functions/v1/agent-run');
  }

  /** Einziger Netzwerkweg des Live-Modus. In Tests ersetzbar. */
  function transport(koerper) {
    var s = HR.config.supabase;
    return fetch(endpunkt(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: s.anonKey,
        Authorization: 'Bearer ' + s.anonKey
      },
      body: JSON.stringify(koerper)
    }).then(function (a) {
      if (!a.ok) throw new Error('antwort_' + a.status);
      return a.json();
    });
  }

  /** Die Antwort ist fremd, bis sie geprueft ist. */
  function antwortPruefen(a) {
    if (!a || typeof a !== 'object') throw new Error('antwort_leer');
    if (a.fehler) throw new Error(String(a.fehler));
    if (!Array.isArray(a.trajectory)) throw new Error('antwort_ohne_trajektorie');
    if (!a.result || typeof a.result.goal_reached !== 'boolean') throw new Error('antwort_ohne_ergebnis');
    var t = a.trajectory.map(function (s, i) {
      return {
        i: typeof s.i === 'number' ? s.i : i,
        t: typeof s.t === 'number' ? s.t : i * 400,
        actor: s.actor || 'agent',
        action: s.action || 'werkzeug_aufruf',
        tool: s.tool || null,
        input: s.input || {},
        output: s.output || {},
        guardrail: s.guardrail || null
      };
    });
    return {
      trajectory: t,
      result: { goal_reached: !!a.result.goal_reached, betrag: Number(a.result.betrag) || 0 },
      usage: {
        input_tokens: (a.usage && a.usage.input_tokens) || 0,
        output_tokens: (a.usage && a.usage.output_tokens) || 0
      },
      violations: Array.isArray(a.violations) ? a.violations : []
    };
  }

  HR.agent = HR.agent || {};
  HR.agent.live = {
    modus: 'live',
    transport: transport,
    endpunkt: endpunkt,
    antwortPruefen: antwortPruefen,

    /** @param {RunAnfrage} anfrage @returns {Promise<RunErgebnis>} */
    run: function (anfrage) {
      var fehler = HR.agent.anfragePruefen(anfrage);
      if (fehler) return Promise.reject(new Error(fehler));
      var koerper = {
        aufgabe: 'lauf',
        scenario_id: anfrage.scenario_id,
        disturbances: anfrage.disturbances,
        constraints: anfrage.constraints,
        enforcement: anfrage.enforcement,
        session_id: anfrage.session_id
      };
      return HR.agent.live.transport(koerper).then(antwortPruefen);
    },

    /**
     * Regel aus freiem Text — im Live-Modus uebernimmt das Modell die Uebersetzung,
     * gebunden an dasselbe geschlossene Schema. Was zurueckkommt, wird lokal validiert.
     * @returns {Promise<{ok:boolean, constraint?:Constraint, code?:string}>}
     */
    regelUebersetzen: function (text) {
      return HR.agent.live.transport({ aufgabe: 'regel', text: text }).then(function (a) {
        if (!a || !a.ok || !a.constraint) {
          return { ok: false, code: (a && a.code) || 'keine_regelform', slots: {} };
        }
        if (!HR.constraints.constraintGueltig(a.constraint)) {
          return { ok: false, code: 'nicht_darstellbar', slots: {} };
        }
        return { ok: true, constraint: a.constraint };
      });
    }
  };
})(window.HR = window.HR || {});
