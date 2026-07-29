/**
 * Die Zustimmungsschranke. Der wichtigste Test der Datei ist der erste:
 * ohne Zustimmung wird nichts geschrieben.
 */
(function (HR) {
  'use strict';

  var geschrieben = [];

  /** Ersetzt den Netzwerkweg und den Zustand fuer die Dauer eines Aufrufs. */
  function mitZustand(felder, fn) {
    var echterTransport = HR.logging.transport;
    var echtesHolen = HR.store.holen;
    var echterModus = HR.config.modus;
    var echterVortrag = HR.config.vortrag;
    var echteUrl = HR.config.supabase.url;
    var echterKey = HR.config.supabase.anonKey;

    geschrieben = [];
    HR.logging.transport = function (tabelle, satz) { geschrieben.push({ tabelle: tabelle, satz: satz }); };

    var z = HR.store.anfang();
    for (var k in felder.zustand || {}) z[k] = felder.zustand[k];
    HR.store.holen = function () { return z; };
    HR.config.modus = felder.modus || 'mock';
    HR.config.vortrag = !!felder.vortrag;
    HR.config.supabase.url = felder.url === undefined ? 'https://beispiel.supabase.co' : felder.url;
    HR.config.supabase.anonKey = felder.key === undefined ? 'anon-test' : felder.key;

    try { return fn(z); } finally {
      HR.logging.transport = echterTransport;
      HR.store.holen = echtesHolen;
      HR.config.modus = echterModus;
      HR.config.vortrag = echterVortrag;
      HR.config.supabase.url = echteUrl;
      HR.config.supabase.anonKey = echterKey;
    }
  }

  var ergebnisOk = { ok: true, constraint: HR.compiler.uebersetzen('Niemals selbst freigeben').constraint };

  describe('Zustimmung', function () {
    it('schreibt ohne Zustimmung nichts — auch nicht im Live-Modus', function () {
      mitZustand({ modus: 'live', zustand: { consent: false } }, function () {
        HR.logging.regelEingabe('Niemals selbst freigeben', ergebnisOk);
      });
      expect(geschrieben.length).toBe(0);
    });
    it('schreibt auch nach Zustimmung nichts im Demo-Modus', function () {
      mitZustand({ modus: 'mock', zustand: { consent: true } }, function () {
        HR.logging.regelEingabe('Niemals selbst freigeben', ergebnisOk);
      });
      expect(geschrieben.length).toBe(0);
    });
    it('schreibt nichts im Vortragsmodus', function () {
      mitZustand({ modus: 'live', vortrag: true, zustand: { consent: true } }, function () {
        HR.logging.regelEingabe('Niemals selbst freigeben', ergebnisOk);
      });
      expect(geschrieben.length).toBe(0);
    });
    it('schreibt nichts ohne konfiguriertes Projekt', function () {
      mitZustand({ modus: 'live', url: '', zustand: { consent: true } }, function () {
        HR.logging.regelEingabe('Niemals selbst freigeben', ergebnisOk);
      });
      expect(geschrieben.length).toBe(0);
    });
    it('schreibt erst, wenn Zustimmung, Live-Modus und Projekt zusammenkommen', function () {
      mitZustand({ modus: 'live', zustand: { consent: true } }, function () {
        HR.logging.regelEingabe('Niemals selbst freigeben', ergebnisOk);
      });
      expect(geschrieben.length).toBe(1);
      expect(geschrieben[0].tabelle).toBe('constraint_submissions');
    });
    it('schreibt genau die dokumentierten Felder', function () {
      mitZustand({ modus: 'live', zustand: { consent: true } }, function () {
        HR.logging.regelEingabe('Niemals selbst freigeben', ergebnisOk);
      });
      expect(Object.keys(geschrieben[0].satz).sort().join(',')).toBe(
        'compiled_kind,compiled_ok,reject_reason,screen,session_hash,text_de');
    });
    it('kuerzt den Regeltext auf 400 Zeichen', function () {
      var lang = new Array(600).join('a');
      mitZustand({ modus: 'live', zustand: { consent: true } }, function () {
        HR.logging.regelEingabe(lang, { ok: false, code: 'kein_werkzeug' });
      });
      expect(geschrieben[0].satz.text_de.length).toBe(400);
      expect(geschrieben[0].satz.reject_reason).toBe('kein_werkzeug');
      expect(geschrieben[0].satz.compiled_ok).toBeFalsy();
    });
    it('schreibt zum Lauf nur Kennzahlen, keinen Inhalt', function () {
      var e = HR.agent.mock.laufSynchron(HR.agent.anfrage({ constraints: HR.compiler.systemRegeln() }));
      mitZustand({ modus: 'live', zustand: { consent: true } }, function (z) {
        HR.logging.laufEreignis(e, z);
      });
      expect(Object.keys(geschrieben[0].satz).sort().join(',')).toBe(
        'disturbances,enforcement,goal_reached,rules_count,session_hash,violations_count');
      expect(geschrieben[0].tabelle).toBe('run_events');
    });
    it('nutzt eine Sitzungskennung, die nur im Speicher lebt', function () {
      expect(typeof HR.sessionHash).toBe('string');
      expect(HR.sessionHash.length).toBeGreaterThan(10);
    });
    it('nutzt keine Speicher-APIs des Browsers', function () {
      var quelle = HR.logging.schreiben.toString() + HR.logging.regelEingabe.toString() +
        HR.logging.laufEreignis.toString();
      expect(quelle.indexOf('localStorage')).toBe(-1);
      expect(quelle.indexOf('sessionStorage')).toBe(-1);
      expect(quelle.indexOf('document.cookie')).toBe(-1);
    });
    it('faengt einen Fehler im Versand ab, ohne die Demo zu stoeren', function () {
      var ergebnis = mitZustand({ modus: 'live', zustand: { consent: true } }, function () {
        HR.logging.transport = function () { throw new Error('netz weg'); };
        return HR.logging.regelEingabe('Niemals selbst freigeben', ergebnisOk);
      });
      expect(ergebnis).toBeFalsy();
    });
  });

  describe('Zustimmungszeile', function () {
    it('bietet die Zustimmung unaufdringlich an', function () {
      var h = HR.logging.zustimmungsmarkup(HR.store.anfang());
      expect(h).toContain('Wir werten anonymisiert aus');
      expect(h).toContain('data-aktion="zustimmen"');
      expect(h).toContain('Sie können den Text auch nur lokal verwenden');
    });
    it('dankt nach der Zustimmung und fragt nicht erneut', function () {
      var z = HR.store.reduzieren(HR.store.anfang(), { typ: 'consent' });
      var h = HR.logging.zustimmungsmarkup(z);
      expect(h).toContain('Danke');
      expect(h.indexOf('data-aktion="zustimmen"')).toBe(-1);
    });
    it('fragt im Vortragsmodus gar nicht', function () {
      var echt = HR.config.vortrag;
      HR.config.vortrag = true;
      var h = HR.logging.zustimmungsmarkup(HR.store.anfang());
      HR.config.vortrag = echt;
      expect(h).toBe('');
    });
  });
})(window.HR = window.HR || {});
