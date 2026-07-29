# PROGRESS

Append-only log. Never rewrite earlier entries.

| Phase | Status | Datum |
|---|---|---|
| 0 | offen | |

---
## Phase 0 — GRUEN
Geruest steht: `index.html`, `tests.html`, Ordner, `HR`-Namensraum, Ladereihenfolge (in beiden HTML-Dateien identisch), CSS-Tokens (`styles/tokens.css`, `base.css`, `tests.css`), `tests/harness.js`.
Tooling erkannt: git, ripgrep, Python 3.12, Microsoft Edge, Google Chrome. **Kein Node.** Nichts installiert.
Gate: `tests.html` rendert `0 Tests, 0 Fehler` (headless in Edge geprueft).

## Phase 1 — GRUEN
`src/domain/` vollstaendig und DOM-frei: `tools.js`, `imperative.js`, `constraints.js`, `compiler.js`, `checker.js`, `guardrail.js`, `freedom.js`, `tokens.js`.
Gate: **97 Tests, 0 Fehler**. Abgedeckt: alle sechs Praedikatarten, alle fuenf Regelarten im Checker, die Leitplanke, der Compiler inkl. Ablehnungen, die Freiheitsgrad-Formel (40 Zellen, 90 % mit Systemregeln, minus 6 Zellen je Schwellenwert-Regel).

## Phase 2 — GRUEN
`src/agent/runner.js` (Vertrag, Stoerungsliste, Ergebnisbau) und `src/agent/mockRunner.js` (deterministischer Planer).
Gate: **134 Tests, 0 Fehler**. Belegt: Grundlauf 0 Verstoesse; Screen-2-Lauf Ziel erreicht, 0 Verstoesse, `selbst_freigeben` in der Trajektorie; mit Schwellenwert-Regel zur Laufzeit >= 1 geblockter Aufruf, Eskalation an die Vertretung, 0 Verstoesse, keine Selbstfreigabe; dieselbe Regel im Nachgang blockt nichts und meldet genau 1 Verstoss.

## Phase 3 — GRUEN
Huelle, Zustandsspeicher (`src/state/store.js`), Renderhilfe (`src/ui/render.js`), Texte (`src/ui/copy.de.js`), Komponenten `fsmDiagramm` und `handlungsraum`, Screen 1 (`src/ui/screens/clash.js`), Stile (`layout`, `imperativ`, `deklarativ`, `components`, `screens`).
Gate: **164 Tests, 0 Fehler**; zusaetzlich per Screenshot geprueft. Beide Paneele zeichnen, jede Stoerung laesst den Automaten hart stehen (Badge plus Verstoss-Knoten), der Agent plant um, der Variantenzaehler steigt.

## Phase 4 — GRUEN
Screen 2 (`src/ui/screens/preis.js`) plus Stile fuer Chips, Ablaufliste, Pruefpanel und die Frage.
Gate: **174 Tests, 0 Fehler**. Der Beat sitzt: Ziel erreicht, `selbst_freigeben` sichtbar im Ablauf, Pruefpanel meldet `0`, danach genau eine Frage. Ein Test stellt sicher, dass nirgends gewarnt wird.
Der Screen-2-Lauf ist zugleich Lauf A fuer den Vergleich auf Screen 4.

## Phase 5 — GRUEN
Screen 3 (`src/ui/screens/regeln.js`), Anzeigen (`components/zaehler.js`), handgezeichneter Plot (`components/plot.js`), Log-Komponente (`components/logTabelle.js`), Zustimmungs- und Protokollmodul (`src/logging.js`), Stile fuer Editor, Instrumente, Umschalter und Plot.
Gate: **189 Tests, 0 Fehler**. Der Satz „Buchungen über 200 € pro Nacht brauchen eine Freigabe" wird zu einer gueltigen Schwellenwert-Regel, erscheint lesbar zurueck, senkt die Freiheitsgrade und aendert den Pfad des naechsten Laufs (in Phase 2 belegt).
Zusatz: `?screen=N` als Direkteinstieg fuer den Vortrag.

## Phase 6 — GRUEN
Screen 4 (`src/ui/screens/audit.js`), volle Audit-Tabelle mit Belegaufklappung (`components/logTabelle.js`), Export als JSON und CSV ueber `Blob` und `URL.createObjectURL`, A/B-Vergleich, Selbstcheck und Kontakt.
Gate: **203 Tests, 0 Fehler**. Der JSON-Export laesst sich wieder einlesen (gleiche Schrittzahl, gleiche Werkzeuge, vier Regeln, Ziel erreicht) und traegt keine Sitzungskennung; der Vergleich hebt genau die abweichenden Schritte hervor (Schritt 1 und 2 gleich, ab Schritt 3 abweichend).

## Phase 7 — GRUEN
`functions/agent-run/index.js` (Deno, **nie lokal ausgefuehrt**, zum Einfuegen in den Supabase-Funktionseditor), `src/agent/liveRunner.js`, Live-Compiler ueber dieselbe Funktion, Anbindung in Screen 3 mit Rueckfall auf die Heuristik.
Gate: **220 Tests, 0 Fehler**. Eine oertliche Attrappe der Edge-Function-Antwort treibt alle vier Bildschirme durch `liveRunner`: Spur inklusive Abweisung auf Screen 1, Ablauf auf Screen 2, Anzeigen auf Screen 3, Audit-Tabelle und Export auf Screen 4. Kein Netzwerkaufruf, kein Modellaufruf im Test.
Nebenbefund und behoben: Screen 3 zeigt die Spur vollstaendig (dort wird nicht animiert).

## Phase 8 — GRUEN
`supabase/schema.sql` (zum Einfuegen in den SQL-Editor: zwei Tabellen, RLS nur `insert` fuer `anon`, Aufraeumfunktion fuer 24 Monate), Zustimmungsschranke in `src/logging.js`, `DATENSCHUTZ.md`.
Gate: **234 Tests, 0 Fehler**. Belegt: ohne Zustimmung wird nichts geschrieben, auch nicht im Live-Modus; mit Zustimmung, aber im Demo-Modus ebenfalls nicht; im Vortragsmodus nie; ohne konfiguriertes Projekt nie. Geschrieben werden genau die dokumentierten Felder, der Regeltext auf 400 Zeichen gekuerzt. Kein Zugriff auf Speicher-APIs.

## Phase 9 — GRUEN
Politur. Manuelle Pruefliste, alle Punkte abgehakt:

- [x] **Kontrast.** `--ink-70` und `--ink-45` heissen jetzt `--ink-mittel` (ca. 6,3:1) und `--ink-leise` (ca. 4,6:1) und liegen beide ueber 4,5:1 gegen `--paper`. Ocker traegt als Flaeche, aber nicht als Text: fuer Text gibt es `--deklarativ-text` (ca. 5:1). `--verstoss` 5,6:1, `--imperativ` ca. 7:1.
- [x] **Reduzierte Bewegung.** `prefers-reduced-motion` schaltet Uebergaenge und die Spuranimation ab; die Schrittfolge laeuft dann ohne Wartezeit. Auf Screen 1 steht in diesem Fall eine Zeile, die den Wechsel ohne Animation benennt.
- [x] **Tastatur.** Sichtbarer Fokus auf allen Bedienelementen (`:focus-visible`, 2 px). Aufklappbare Log-Zeilen sind fokussierbar und reagieren auf Eingabe- und Leertaste. Sprungmarke zum Inhalt an erster Stelle.
- [x] **Vortragsmodus.** `?modus=vortrag` setzt `class="vortrag"` (groessere Typo), zeigt `Modus: Vortrag`, blendet die Zustimmungszeile aus, schreibt nie und legt einen Tastaturhinweis in den Fuss. Pfeiltasten wechseln den Bildschirm, `1`–`3` werfen Stoerungen ein, `r` setzt zurueck. `?screen=N` steigt direkt ein.
- [x] **Mobil bis 390 px.** In einem echten 390-px-Rahmen geprueft: kein waagerechter Ueberlauf, Kopf und Steuerung brechen um, die Paneele stapeln sich, die Anzeigen stehen zweispaltig, breite Tabellen scrollen in ihrem eigenen Rahmen.
- [x] **Semantik.** `header`/`main`/`footer` mit Rollen, `h1` je Bildschirm, Tabellen mit `th scope`, Ergebnisse als `role="status"`, Zaehler mit `aria-live`, SVG mit `role="img"` und Beschriftung.
- [x] **Umschalter** melden ihren Zustand ueber `aria-pressed`, die Bildschirmnavigation ueber `aria-current`.

Gate: **234 Tests, 0 Fehler**.
