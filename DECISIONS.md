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

## Phase 6
- Die Constraint-Spalte wertet die Regeln je Schritt gegen die tatsaechliche Vorgeschichte neu aus, statt nur die Belege des Checkers zu spiegeln. Nur so steht in jeder Zeile, welche Regel geprueft wurde — auch dort, wo sie eingehalten wurde.
- Der Export enthaelt bewusst keine Sitzungskennung. Die Datei gehoert dem Besucher; eine Kennung darin waere ohne Zweck.
- CSV mit Semikolon und CRLF, weil die Datei in Deutschland in Excel geoeffnet wird.
- Vergleichsgrundlage ist der Lauf von Screen 2 (Lauf A, ohne eigene Regel) gegen den Lauf von Screen 3 (Lauf B, mit eigener Regel). Beide nutzen dieselben zwei Stoerungen, sonst waere der Vergleich wertlos.

## Phase 7
- Die Edge Function bedient beide Aufgaben ueber denselben Endpunkt: `aufgabe: 'lauf'` (Vertrag aus §8) und `aufgabe: 'regel'` fuer die Regeluebersetzung. Eine zweite Funktion haette einen zweiten Deploy-Schritt im Dashboard bedeutet — genau das, was hier vermieden wird.
- Die Domaenenlogik (Praedikate, Leitplanke, Checker) ist in der Edge Function knapp nachgebaut, weil Deno die Browser-IIFEs nicht laden kann. Die Semantik ist Zeile fuer Zeile dieselbe; die Tests im Browser sind die Referenz.
- Das Modell steht als Secret `ANTHROPIC_MODELL` mit Vorgabewert in der Funktion. So laesst es sich im Dashboard wechseln, ohne die Datei erneut einzufuegen.
- Faellt der Live-Compiler aus (Netz, Kontingent, ungueltige Struktur), uebersetzt die oertliche Heuristik. Der Besucher merkt nur, dass es funktioniert.
- Die Antwort der Edge Function wird im Browser normalisiert und geprueft, bevor sie den Zustand erreicht. Fremde Felder werden verworfen, fehlende ergaenzt.

## Phase 8
- Geschrieben wird nur, wenn Zustimmung **und** Live-Modus **und** konfiguriertes Projekt zusammenkommen. Im Demo-Modus verlaesst nichts den Browser — das ist die Voreinstellung und der Zustand beim Doppelklick.
- Die RLS-Policies begrenzen zusaetzlich die Feldlaengen. Der anon-Schluessel ist oeffentlich; die Datenbank muss auch dann sinnvoll bleiben, wenn jemand ihn direkt benutzt.
- `select`, `update` und `delete` sind fuer `anon` ausdruecklich entzogen. Die Auswertung laeuft ueber das Dashboard.
- Die Aufbewahrungsgrenze steht als aufrufbare SQL-Funktion in der Datei, nicht als Scheduler-Job — ein Job waere ein weiterer Einrichtungsschritt.

## Phase 9
- Die beiden Grautoene wurden umbenannt und nachgezogen, weil `--ink-45` mit 2,9:1 unter der Schwelle lag. Der Name nennt jetzt die Rolle, nicht die Mischung.
- Ocker bleibt als Flaeche und als Linie unveraendert; nur fuer Text gibt es die abgedunkelte Variante. Sonst haette die rechte Seite ihre Waerme verloren.
- Bei reduzierter Bewegung wird die Animation nicht nur abgeschaltet, sondern durch eine Textzeile ersetzt. Ohne sie wirkt der harte Stopp links wie ein Fehler.

## v2 — Phase 0 (Werkzeuge am Ort)
- Auf dieser Maschine ist **kein Node** installiert. `tests/run-node.js` wird trotzdem genau wie in `AGENT.md` §4 gefordert geschrieben — es laeuft auf Maschinen mit Node, etwa dem GitHub-Actions-Runner aus dem Anhang.
- Verfuegbar sind: Python 3.12, Chrome und Edge. Das Gatter vor jedem Commit laeuft deshalb ueber **kopfloses Chrome** (`--headless=new --dump-dom`) auf `tests.html`. Es liest dieselbe Zusammenfassung „n Tests, 0 Fehler“, die der Doppelklick zeigt.
- `tests/run-node.js` selbst wurde zweifach geprueft: (1) Syntaxpruefung ueber `new Function(quelle)` im Browser, (2) ein emulierter Lauf, bei dem `require`, `fs`, `path`, `vm` und `process` im Browser nachgebildet sind. Der emulierte Lauf meldet dieselben 234 Tests, 0 Fehler und `exitCode 0` wie `tests.html`.
- Nicht ausgefuehrt werden konnte allein der Node-eigene Attrappenblock (`browserAufsetzen`), weil ein Browser `window`, `document` und `location` bereits mitbringt. Er wurde stattdessen gegen die vollstaendige Liste der in `src/` und `tests/` benutzten Browser-Globalen gelesen: `fetch`, `URLSearchParams`, `window.location.search`, `window.crypto`, `document.getElementById`, `matchMedia`, `Blob`, `URL.createObjectURL`, `window.setTimeout`. Jede davon ist abgedeckt.
- `window` wird im Knoten-Lauf auf `globalThis` gelegt, nicht auf ein eigenes Objekt. Nur so wird aus `window.describe = ...` in `tests/harness.js` eine globale Funktion — genau wie im Browser.

## v2 — V2-01 (Aktleiste, Fallzeile, Wegfindung)
- **Sechs Flaechen, fuenf Akte.** `AGENT.md` nennt einen „Vorspann“ Akt 0 *und* eine Leiste mit fuenf Beschriftungen. Beides zusammen geht nur, wenn Akt 0 vor der Leiste steht: er ist der Vorspann und wird darin nicht gefuehrt. Die Leiste zeigt Akt 1 bis Akt 5.
- **Die Fallzeile weicht in zwei Angaben vom Text in `AGENT.md` §3 ab.** Dort steht „Kundentermin Verona · 3 Nächte“. Der skriptierte Agent bucht aber Hamburg fuer zwei Naechte, und `src/agent/` ist unantastbar. Eine Kopfzeile, die etwas anderes behauptet als das Protokoll darunter, waere in einer Demo ueber Nachvollziehbarkeit der schlechteste denkbare Fehler. Nummer und Person bleiben wie vorgegeben (Nr. 2847, Frau Berger), Ziel und Dauer folgen dem Lauf. **Der Mensch mag das umdrehen wollen** — dann muesste der Vorgabewert in `src/agent/mockRunner.js` mitgezogen werden, was den Schutz von §6 beruehrt.
- `?akt=N` ist der neue Weg, `?screen=N` bleibt gueltig. Der Audit war Bildschirm 4 und ist jetzt Akt 5; die Abbildung steht als `SCREEN_ZU_AKT` im Speicher und wird geprueft.
- Die Ueberschriftskennungen heissen jetzt `akt-N-titel`. Akt 2 behaelt `screen-2-titel`, weil die Datei nicht angefasst werden darf; `index.html` verweist entsprechend.
- Akt 0 und Akt 4 bekommen in dieser Aufgabe nur ein Geruest (`auftrag.js`, `architektur.js`), damit „alle fuenf Akte erreichbar“ nicht auf eine leere Flaeche zeigt. V2-03, V2-07 und V2-08 fuellen sie.
- Das Gatter aus §4 schlaegt auf `index.html` in einem Kommentar an, der `type="module"` nur *erwaehnt* („Kein type=module: file://“). Der Kommentar bleibt; die Pruefung schliesst die Zeile aus.

## v2 — V2-02 (Rahmensatz und Ruecknahme)
- Beide Zeilen werden von der **Huelle** gesetzt (`HR.render.zeichnen`), nicht von den Aktmodulen. Nur so bekommt Akt 2 seine beiden Zeilen, ohne dass `src/ui/screens/preis.js` angefasst wird — §6 verbietet das. Der Rahmensatz steht als Vorzeile ueber der Ueberschrift, die Ruecknahme als abgesetzter Block darunter.
- Die Zeilen sind vorlaeufig, halten aber schon die Laengengrenzen ein; Tests pruefen zwoelf und zwanzig Woerter. V2-13 schreibt sie neu, die Tests bleiben das Gatter.
