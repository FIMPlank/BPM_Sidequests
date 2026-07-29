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

## Phase 2
- Der Mock-Agent ist ein kleiner Planer, kein Abspielband: er waehlt die naechste Aktion aus dem Weltzustand und plant nach einer Ablehnung um. Dadurch entstehen Pfadwechsel echt statt vorgemalt — und der Live-Agent kann sich in dieselbe Trajektorienform einfuegen.
- Stoerungen wirken auf die Welt (Preise, Verfuegbarkeiten, Abwesenheiten), nicht auf den Agenten. Der Agent sieht nur Ergebnisse seiner Werkzeuge.
- `reise_verlaengert` und `hotel_storniert` fuehren jeweils zu einer zweiten Buchung — das ist der sichtbare Umweg auf der deklarativen Seite, waehrend der Automat links stehen bleibt.
- Der Runner liefert die vollstaendige Trajektorie zurueck; die Schrittanimation macht die Oberflaeche. So bleibt der Runner testbar und der Live-Pfad identisch.

## Phase 3
- Die Oberflaeche zeichnet den ganzen aktiven Bildschirm neu. Das Texteingabefeld auf Screen 3 bleibt deshalb unkontrolliert: sein Wert wird erst beim Absenden gelesen, damit kein Tastendruck ein Rerendern ausloest.
- Beide Diagramme sind vertikal aufgebaut (300x430). Ein waagerechtes BPMN-Band waere auf 390 px Breite unlesbar geworden; die Naht zwischen den Paradigmen traegt die Gegenueberstellung ohnehin.
- Der Variantenzaehler ueberlebt den Neustart des Automaten. Er ist das Gedaechtnis der Demo: jede Stoerung kostet eine weitere modellierte Variante.
- Beim Einwerfen einer Stoerung laeuft die linke Kette erst drei Schritte an und bleibt dann stehen. Das liest sich als Unterbrechung, nicht als Fehlbedienung.
- Alle sichtbaren Texte tragen echte Umlaute; technische Bezeichner (Werkzeugnamen, Statuswerte, Regel-Kennungen) bleiben ASCII, weil sie im Log und in Exporten als Kennungen erscheinen.

## Phase 4
- Der Ablauf des Laufs wird auf Screen 2 vollstaendig und nuechtern aufgelistet. Das Unbehagen entsteht dadurch, dass `selbst_freigeben` einfach dasteht — nicht durch eine Hervorhebung. Ein Test haelt fest, dass die Seite an dieser Stelle nicht warnt.
- `Nein` fuehrt direkt auf Screen 3, `Ja` blendet erst den Verweis auf die Innenrevision ein und dann den Weiterweg. Beide Wege enden auf Screen 3.

## Phase 5
- `?screen=N` springt direkt auf einen Bildschirm. Fuer den Vortrag praktisch, fuer die Pruefung der Seite noetig, sonst folgenlos.
- Die Ablehnung des Compilers nennt Grund und ein funktionierendes Beispiel; sie entschuldigt sich nicht.
- Die guenstige Stelle im Plot bleibt unbeschriftet. Ein Test haelt fest, dass dort weder „Sweet Spot" noch „Optimum" steht.
- `src/logging.js` liegt in der Ladereihenfolge hinter `render.js`, weil es eine Aktion registriert.
