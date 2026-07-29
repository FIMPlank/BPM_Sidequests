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
