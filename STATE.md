# STATE — Handlungsraum-Sandbox v2

Zweig: `v2-narrative`. Einzige Quelle der Wahrheit zwischen zwei Aufrufen.
Der Ablauf steht in `AGENT.md` §2. Eine Zeile je Aufgabe, Notizen nur unterhalb der Tabelle.

| ID | Status | Abhängig von | Was | Zeit | Umfang |
|---|---|---|---|---|---|
| V2-00 | done | — | Headless-Testlauf `tests/run-node.js` | 2026-07-29 | 2 Dateien |
| V2-01 | done | 00 | Aktleiste und feste Fallzeile | 2026-07-29 | 11 Dateien |
| V2-02 | done | 01 | Rahmensatz- und Rückblick-Slots | 2026-07-29 | 4 Dateien |
| V2-03 | done | 01 | Akt 0 — Der Auftrag | 2026-07-29 | 6 Dateien |
| V2-04 | done | 03 | Akt 1 — Störung vor dem Lauf | 2026-07-29 | 6 Dateien |
| V2-05 | done | 01 | Akt 3 — eine große Zahl | 2026-07-29 | 5 Dateien |
| V2-06 | done | 00 | `src/domain/latency.js` | 2026-07-29 | 4 Dateien |
| V2-07 | todo | 05, 06 | Akt 4, Teil 1 — Platzierung | | |
| V2-08 | todo | 07 | Akt 4, Teil 2 — Kombination und Muster | | |
| V2-09 | todo | 07 | Die Verschmelzung zu einer Fläche | | |
| V2-10 | todo | 08 | Plot nach Akt 4 | | |
| V2-11 | todo | 08 | Akt 5 — Spalte Platzierung, A/B-Vergleich | | |
| V2-12 | todo | 11 | Vortragsmodus über fünf Akte | | |
| V2-13 | todo | 12 | Textdurchgang | | |
| V2-14 | todo | 13 | `DEMO.md`, `HANDOVER.md`, `README.md` | | |

## Notizen

- Aufsetzen: Zweig `v2-narrative` aus `main`, `AGENT.md` und `STATE.md` angelegt.
- V2-00: Kein Node am Ort. Gatter laeuft ueber kopfloses Chrome auf `tests.html` (234 Tests, 0 Fehler); `tests/run-node.js` zusaetzlich emuliert geprueft. Begruendung in `DECISIONS.md`.
- V2-01: Akt 0 ist der Vorspann, die Leiste fuehrt Akt 1 bis 5. Fallzeile weicht bewusst von `AGENT.md` §3 ab (Hamburg statt Verona) — siehe `DECISIONS.md`. 243 Tests, 0 Fehler.
- V2-02: Beide Zeilen setzt die Huelle, damit Akt 2 unberuehrt bleibt. 249 Tests, 0 Fehler.
- V2-03: Wahl fuehrt nach Akt 1, gewaehlte Seite vorn, andere zurueckgenommen, Lauf startet mit. Im Browser geklickt geprueft. 258 Tests, 0 Fehler.
- V2-04: Auswahl vor dem Lauf, Leitzahl Varianten bei 52 px. Im Browser geklickt geprueft. 261 Tests, 0 Fehler.
- V2-05: Eine Leitzahl, vier Nebenwerte; Schalter und Plot raus. 261 Tests, 0 Fehler.
- V2-06: 11 Tests fuer die Durchlaufzeit, rein und ohne DOM. 272 Tests, 0 Fehler.
