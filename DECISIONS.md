# DECISIONS

Eine Zeile je Entscheidung, die die Spezifikation offen gelassen hat.

## Phase 0
- Vorhandenes Tooling auf dieser Maschine: `git 2.53`, `ripgrep 14.1`, `Python 3.12.10`. **Kein Node.** Nichts davon wurde installiert, nichts davon ist Projektabhängigkeit.
- Weil kein Node vorhanden ist, entfällt der optionale Shim `tests/run-node.js`. Verifikation läuft ausschliesslich über `tests.html` im Browser (Doppelklick) — der Weg, den das Projekt ohnehin garantiert.
- Ladereihenfolge der Skripte wird in `index.html` und `tests.html` identisch gepflegt; beide Listen stehen als zusammenhängender Block im jeweiligen `<head>`-Ende, damit sie nicht auseinanderlaufen.
- CSS wird in sieben Dateien nach Zuständigkeit getrennt (`tokens, base, layout, imperativ, deklarativ, components, screens`) und über `@layer` geordnet.
- `crypto.randomUUID()` ist auf `file://` in Chrome/Edge verfügbar (secure context schliesst `file:` ein); ein Fallback auf `crypto.getRandomValues` ist trotzdem eingebaut, damit ältere Browser nicht hart scheitern.
- Verifikation waehrend des Baus: das auf der Maschine bereits vorhandene Microsoft Edge wird headless mit `--dump-dom` auf `tests.html` gerichtet. Nichts installiert, nichts vendorisiert, keine Projektabhaengigkeit — der garantierte Weg bleibt der Doppelklick auf `tests.html`.

## Phase 1
- Die Praedikat-Union hat sechs Mitglieder: `feld_vergleich`, `vorheriger_aufruf`, `folgender_aufruf`, `kein_aufruf`, `und`, `wenn_dann`. `wenn_dann` ist noetig, um Schwellenwert-Regeln ohne generierten Code auszudruecken; `folgender_aufruf` fuer `response`.
- `vorheriger_aufruf` kennt ein optionales `mit_ergebnis`. Damit zaehlt eine *angefragte* Genehmigung nicht als *erteilte* — genau daran haengt der Umweg ueber die Vertretung auf Screen 3.
- Der Compiler bekommt eine eigene Datei `src/domain/compiler.js` (die Spezifikation nennt ihn unter §5.3, listet aber keine Datei).
- Zur Laufzeit entscheidbar sind nur `threshold`, `precedence`, `absence`. `response` und `existence` sprechen ueber die Zukunft eines Laufs und werden ausschliesslich nachgelagert geprueft; die Leitplanke laesst sie passieren.
- Freiheitsgrade zaehlen beide Durchsetzungsarten gleich, weil eine Regel den sanktionierten Raum einschraenkt, unabhaengig davon, wo sie geprueft wird. Ausgewertet wird gegen die leere Vorgeschichte (konservative Lesart, im Kopf von `freedom.js` hergeleitet).
- Die drei Systemregeln sind bereits `runtime`; der Umschalter auf Screen 3 setzt die Durchsetzungsart fuer alle Regeln eines Laufs.
