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
