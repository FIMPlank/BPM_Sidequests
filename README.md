# Handlungsraum-Sandbox

Eine interaktive Demo zu agentischer KI und Prozess-Governance, am Beispiel einer
Reisekostenabrechnung. Sie macht ein Argument erfahrbar, statt es zu erklären:

> Starre Prozessmodelle brechen, sobald die Wirklichkeit abweicht. Autonome
> Agenten kommen zurecht — erreichen das Ziel aber auf Wegen, die niemand
> freigegeben hat. Die Antwort ist keines von beidem: explizite Regeln,
> bewusst gesetzte Kontrollpunkte, Nachvollziehbarkeit.

## Starten

**Doppelklick auf `index.html`.** Das ist alles.

Kein Server, keine Installation, kein Übersetzungsschritt, keine Abhängigkeiten.
Die Dateien im Repository sind die Dateien, die laufen. Es werden keine Inhalte
von fremden Servern geladen — keine Schriften, keine Skripte, nichts.

Die Demo läuft standardmäßig im **Demo-Modus**: der Agent ist skriptiert und
läuft vollständig im Browser. Dieser Modus ist für Konferenzräume mit schlechtem
WLAN gedacht und funktioniert ohne Netz.

## Die vier Bildschirme

1. **Der Clash** — derselbe Prozess als Kette und als Handlungsraum. Beide
   erreichen dasselbe Ergebnis. Dann kommt eine Störung: links bleibt das Modell
   stehen und braucht eine weitere Prozessvariante, rechts plant der Agent um.
2. **Der Preis der Autonomie** — zwei Störungen gleichzeitig. Der Agent erreicht
   das Ziel, bucht ein Hotel über der Richtlinie und gibt die Abrechnung selbst
   frei. Der Regelprüfer meldet ehrlich **null Verstöße**: die Regel dazu gibt es
   noch nicht. Danach steht genau eine Frage im Raum.
3. **Sie modellieren jetzt deklarativ** — der Besucher schreibt eine Regel in
   eigenen Worten. Sie wird in eine strukturierte Form übersetzt, lesbar
   zurückgegeben und beim nächsten Lauf durchgesetzt. Live sichtbar: Zahl der
   Regeln, Kontext-Token, Kosten je Lauf, Freiheitsgrade, Verstöße. Dazu die
   Frage, wo die Kontrolle greift — im Nachgang oder an der Werkzeuggrenze.
4. **Der Audit** — die vollständige Trajektorie mit Belegen, Export als JSON und
   CSV, und der Vergleich des Laufs ohne mit dem Lauf mit der eigenen Regel.

## Aufrufparameter

| Aufruf | Wirkung |
|---|---|
| `index.html` | Demo-Modus, skriptierter Agent, ohne Netz |
| `index.html?modus=vortrag` | größere Schrift, Tastatursteuerung, kein Protokoll |
| `index.html?modus=live` | echter Agent über die eigene Edge Function (nur gehostet) |
| `index.html?screen=3` | steigt direkt auf dem dritten Bildschirm ein |

Im Vortragsmodus: `←`/`→` wechseln den Bildschirm, `1`–`3` werfen eine Störung
ein, `r` setzt zurück.

## Tests

**Doppelklick auf `tests.html`.** Die Seite führt die gesamte Testsuite im
Browser aus und zeigt oben `n Tests, 0 Fehler`. Auch dafür wird nichts
installiert und nichts gestartet.

## Veröffentlichen

Es gibt keinen Übersetzungsschritt, also kann GitHub Pages das Repository direkt
ausliefern:

1. Im Repository auf **Settings → Pages** gehen.
2. Unter *Build and deployment* als Quelle **Deploy from a branch** wählen.
3. Branch `main`, Ordner `/ (root)`, speichern.

Fertig. Keine Workflow-Datei, kein Artefakt, keine Pfadanpassung — alle Verweise
im Projekt sind relativ und funktionieren deshalb gleichermaßen von `file://`,
aus einem Unterordner und von der Pages-Adresse.

## Live-Modus (optional)

Alles außer dem Live-Modus funktioniert ohne jede Einrichtung. Wer einen echten
Agenten zeigen will, braucht ein eigenes Supabase-Projekt und trägt drei Dinge
über die Weboberflächen ein:

1. `functions/agent-run/index.js` in den Funktionseditor des Supabase-Dashboards
   einfügen und veröffentlichen.
2. `supabase/schema.sql` in den SQL-Editor einfügen und ausführen.
3. `ANTHROPIC_API_KEY` in den Projekt-Secrets hinterlegen. Optional
   `ANTHROPIC_MODELL`, wenn ein anderes Modell verwendet werden soll.

Danach in `src/config.js` die Projekt-URL und den öffentlichen anon-Schlüssel
eintragen. Der API-Schlüssel bleibt in den Secrets und erreicht den Browser nie.

Der Live-Modus setzt eine **gehostete** Seite voraus. Von `file://` aus hat die
Seite den Ursprung `null`, und Supabase weist den CORS-Preflight ab. Das ist so
erwartet und kein Fehler.

## Aufbau

```
index.html                 Doppelklick — lädt alle Skripte in fester Reihenfolge
tests.html                 Doppelklick — führt die Tests in der Seite aus
src/config.js              Modus, Preise, Projektdaten
src/domain/                reine Logik, ohne DOM, vollständig getestet
src/agent/                 Vertrag, skriptierter Agent, Live-Agent
src/ui/                    Renderhilfe, Komponenten, Bildschirme, alle Texte
src/state/store.js         Reducer und Abonnement
styles/                    eine Datei je Zuständigkeit, über @layer geordnet
functions/agent-run/       Deno-Quelltext für die Edge Function
supabase/schema.sql        Datenmodell der freiwilligen Auswertung
tests/                     abhängigkeitsfreier Testrunner und die Tests
```

Jede Quelldatei ist eine gekapselte Funktion, die sich an einen einzigen
globalen Namensraum `window.HR` hängt. Das ist ein altes Muster und hier das
richtige: nur so bleiben die Dateien getrennt und testbar **und** die Seite
läuft trotzdem per Doppelklick.

## Datenschutz

Keine Cookies, keine Speicher-APIs, keine fremden Server, kein Tracking. Im
Demo-Modus verlässt nichts den Browser. Die freiwillige Auswertung auf dem
dritten Bildschirm ist ausdrücklich einzuwilligen und schreibt nur den Regeltext
und Kennzahlen. Einzelheiten in [`DATENSCHUTZ.md`](DATENSCHUTZ.md).

## Weitere Dokumente

- [`DEMO.md`](DEMO.md) — Vorführung in drei Minuten
- [`DECISIONS.md`](DECISIONS.md) — Entscheidungen, die die Spezifikation offen ließ
- [`PROGRESS.md`](PROGRESS.md) — Bauprotokoll
- [`HANDOVER.md`](HANDOVER.md) — was noch von Hand zu tun ist
