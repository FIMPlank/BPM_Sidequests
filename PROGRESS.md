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
