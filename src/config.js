/**
 * Zentrale Konfiguration. Keine Geheimnisse in dieser Datei.
 * Der Anthropic-Key liegt ausschliesslich in den Supabase-Secrets.
 */
(function (HR) {
  'use strict';

  var params = (function () {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      return { get: function () { return null; } };
    }
  })();

  var modus = params.get('modus');

  HR.config = {
    /** 'mock' | 'live' — live funktioniert nur auf einem gehosteten Origin. */
    modus: modus === 'live' ? 'live' : 'mock',
    /** Vortragsmodus: Tastatursteuerung, groessere Typo, kein Logging. */
    vortrag: modus === 'vortrag',

    /**
     * Direkteinstieg fuer den Vortrag: `?akt=3` startet in Akt 3.
     * `?screen=N` bleibt als Alias der ersten Fassung gueltig; der Audit war
     * dort Bildschirm 4 und ist jetzt Akt 5.
     */
    startAkt: (function () {
      var a = params.get('akt');
      if (a !== null && a !== '') {
        var na = Number(a);
        if (na >= 0 && na <= 5) return Math.round(na);
      }
      var s = Number(params.get('screen'));
      var alias = { 1: 1, 2: 2, 3: 3, 4: 5 };
      return alias[s] || 0;
    })(),

    /** Supabase-Projekt des Betreibers. Vor Live-Betrieb hier eintragen. */
    supabase: {
      url: '',            // z. B. https://xxxxxxxx.supabase.co
      anonKey: '',        // anon/publishable key, insert-only per RLS
      functionPath: '/functions/v1/agent-run'
    },

    /**
     * Preis je 1000 Input-Token in Euro-Cent.
     * Default entspricht der Groessenordnung eines kleinen Modells (3 USD / 1M Token).
     */
    centsPerKiloToken: 0.3,

    /** Schrittdauer der Animation in ms (Screen 1). */
    stepDelayMs: 450,

    /** Harte Obergrenze fuer Tool-Aufruf-Iterationen, spiegelt die Edge Function. */
    maxIterationen: 12,

    /** Logging ist opt-in und standardmaessig aus. */
    loggingDefault: false
  };

  /** Zufaellige Session-Kennung, nur im Speicher, stirbt beim Reload. */
  HR.sessionHash = (function () {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
      var b = new Uint8Array(16);
      window.crypto.getRandomValues(b);
      return Array.prototype.map.call(b, function (x) {
        return ('0' + x.toString(16)).slice(-2);
      }).join('');
    } catch (e) {
      return 'ohne-krypto-' + Date.now().toString(36);
    }
  })();
})(window.HR = window.HR || {});
