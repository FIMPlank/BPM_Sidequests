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

## v2 — V2-03 (Akt 0)
- Akt 0 traegt genau zwei Knoepfe und sonst keinen. Ein „Weiter“ daneben haette die Wahl zur Zierde gemacht; die Aufgabe verlangt, dass die erste Handlung eine Entscheidung ist. Wer die Wahl umgehen will, nimmt `?akt=1`.
- Die nicht gewaehlte Seite wird auf halbe Deckkraft gesetzt, nicht ausgeblendet, und kommt bei Zeigen oder Tastaturfokus zurueck. Der Akt heisst „Der Clash“ — ohne beide Seiten gaebe es keinen.
- Die Wahl startet denselben Lauf, den auch der Knopf im Akt ausloest; `clash.js` gibt `starten` dafuer nach aussen. Zwei Startwege haetten zwei Verhalten bedeutet.

## v2 — V2-04 (Akt 1)
- Die Stoerungsknoepfe sind jetzt eine **Auswahl**, kein Ausloeser: sie sind von Anfang an bedienbar, tragen `aria-pressed` und aendern fuer sich genommen nichts. Erst der eine Startknopf laesst laufen, und er sagt an, was er mitbringt. Ein zweites Anklicken derselben Stoerung nimmt die Wahl zurueck.
- Der Grundlauf ohne Stoerung bleibt erhalten und wird weiterhin von der Wahl in Akt 0 ausgeloest. Er ist der Beleg fuer „bisher kein Unterschied“ — ohne ihn haette die erste Stoerung nichts, wogegen sie sich abheben koennte.
- `Modellierte Varianten` steht als Leitzahl (52 px) unter dem imperativen Modell. Je Akt gibt es genau eine solche Zahl; der Test zaehlt sie.

## v2 — V2-05 (Akt 3)
- Fuenf gleich grosse Zahlen sind ein Armaturenbrett und sagen nichts. Es fuehrt jetzt eine: `Verstoesse im letzten Lauf` — sie ist das, was eine Regel bewirkt. Die vier anderen bleiben vollstaendig lesbar, aber als ruhige Zeile daneben.
- Der Schalter fuer den Ort der Durchsetzung ist ersatzlos aus Akt 3 verschwunden. Er war dort eine Nebenfrage; in Akt 4 ist er die Hauptfrage. `z.enforcement` bleibt im Speicher und steht weiterhin auf `runtime`.
- Der Plot verschwindet aus Akt 3, ohne Ersatz. Er zeigte je Akt nur ein Bruchstueck; in Akt 4 sammelt er ueber die ganze Sitzung (V2-10).

## v2 — V2-06 (Durchlaufzeit)
- Die Rechnung hat zwei Teile, und das ist der Punkt: zwei Minuten je Maschinenschritt, vier Stunden je menschlicher Freigabe. Wer eine Regel als harten Kontrollpunkt setzt, kauft Sicherheit mit Wartezeit — sichtbar wird das nur, wenn Warten um Groessenordnungen teurer ist als Rechnen. Ein Test haelt dieses Verhaeltnis fest.
- Als Freigabe zaehlt `genehmigung_anfordern` sowie jeder Schritt mit `action: 'freigabe'`. Letzteres ist der Haken, an dem der imperative Kontrollpunkt aus V2-07 haengt.
- Ein **abgewiesener** Aufruf zaehlt als Schritt, aber nicht als Freigabe: die Leitplanke hat entschieden, kein Mensch. Genau daran wird die Leitplanke spaeter schneller als der Kontrollpunkt.
- `latency.js` ist die einzige neue Datei unter `src/domain/` und die einzige, die §6 dort zulaesst.

## v2 — V2-07 (Akt 4, Teil 1: Platzierung)
- Neue Ablage `src/v2/` fuer Logik, die weder Domaene noch Oberflaeche ist. `src/domain/` ist nach §6 gesperrt (ausser `latency.js`), `src/agent/` ebenso — die Platzierungslogik brauchte einen eigenen, klar unbeteiligten Ort.
- **Der Kontrollpunkt wird der fertigen Trajektorie vorangestellt, nicht im Agenten erzeugt.** `src/agent/mockRunner.js` ist unantastbar. Der Freigabeschritt (`actor: system`, `action: freigabe`, `tool: kontrollpunkt`) wird vor den ersten Aufruf des geregelten Werkzeugs gesetzt und die Nummerierung neu gezogen. Ein Test haelt fest, dass der Agent selbst unveraendert dieselbe Trajektorie liefert.
- Die drei Orte unterscheiden sich nicht durch Beschriftung, sondern durch Mechanik: `imperativ` und `leitplanke` laufen mit `runtime` (die Leitplanke weist ab, der Agent plant um), `nachgang` mit `posthoc` (niemand haelt etwas auf). Der Kontrollpunkt kommt beim ersten obendrauf. Ergebnis sind drei verschiedene Wege — 9, 8 und 7 Schritte.
- **Kosten je Lauf** sind Kontextkosten plus 3,50 € Sachbearbeitung je menschlicher Freigabe. Ohne den menschlichen Anteil waeren alle drei Orte praktisch gleich teuer, und der Akt haette keine Aussage. Der Kontextanteil steht als Nebenzeile daneben, damit die Groessenordnung ehrlich bleibt.
- **Restrisiko** ist der ausgezahlte Betrag, wenn der Checker Verstoesse findet, sonst null. Konkret statt „hoch/mittel/niedrig“: im Nachgang stehen 520,00 € offen, an den beiden anderen Orten nichts.
- Die guenstige Stelle (Leitplanke: schnell, billig, nichts offen) wird **nicht** beschriftet — dieselbe Zurueckhaltung wie beim Plot in der ersten Fassung. Sie soll sich aus den Zahlen ergeben.
- Ohne eigene Regel greift der Akt auf die Beispielregel zurueck, damit `?akt=4` ohne Vorlauf funktioniert. Ein Hinweis sagt das an.

## v2 — V2-08 (Akt 4, Teil 2: Kombination und Muster)
- Die Zuordnung haengt **nur an den Anzahlen**, nicht daran, welche Regel wo steht. Was eine Architektur ausmacht, ist ihr Schwerpunkt; ob die Belegpflicht oder die Zahlungsgrenze am harten Punkt haengt, aendert das Muster nicht. Ein Test haelt die Vertauschbarkeit fest.
- Die Zuordnungsregel in Worten: alles imperativ → Muster 1 (Randfall); alles nachgelagert → Muster 4 (Randfall); mindestens ein Kontrollpunkt *und* mindestens eine Leitplanke → Muster 2 (die These); kein Kontrollpunkt → Muster 3 oder 4, je nachdem ob Leitplanken oder Nachgang ueberwiegen; keine Leitplanke → Muster 1 oder 4 nach demselben Massstab. Alle 27 Belegungen werden erschoepfend geprueft, jede trifft eines der vier Muster.
- Die beiden Randfaelle bekommen **statt** des „Sie haben gerade … gebaut“-Satzes ihren eigenen, unfreundlichen Satz, und darunter trotzdem den Musternamen. Ein Ergebnis zu benennen und ein Ergebnis zu loben sind zwei verschiedene Dinge.
- Die beiden Zusatzregeln laufen durch `HR.compiler.uebersetzen`, also durch genau den Weg, den auch der Besucher benutzt. Haette ich sie als Objekte hingeschrieben, waere unbewiesen geblieben, dass sie im geschlossenen Schema ueberhaupt ausdrueckbar sind.
- Die Mustertexte stehen in `copy.de.js`, nicht in `muster.js`. `muster.js` liefert nur den Schluessel — dieselbe Trennung wie im Rest des Hauses.

## v2 — V2-09 (Die verschmolzene Flaeche)
- **Eine Zeichnung, keine Naht.** Akt 4 enthaelt weder `.clash` noch die beiden `.panel`-Haelften; ein Test prueft, dass keines der drei Kennzeichen uebrig ist. Der Handlungsraum bleibt, die imperative Kette formt sich in ihm neu.
- Der Spezifikationstext sagt „hard vertical gate bars“. In dieser Zeichnung laeuft der Fall von oben (Antrag) nach unten (Erstattung); eine Schranke *quer* dazu ist waagerecht. Umgesetzt ist deshalb eine **Tuer**: zwei Wandstuecke waagerecht, dazwischen ein Durchlass, markiert von zwei senkrechten Pfosten. Damit ist beides erfuellt — senkrechte Balken, und die Spur muss hindurch. Die Alternative waere gewesen, die Geometrie des Signaturelements zu drehen; das haette Akt 1 und Akt 3 mitgerissen.
- `fusion.js` setzt die Schranken in das vorhandene SVG des Handlungsraums, statt es nachzubauen. Ein Nachbau haette die Ankertabelle verdoppelt und waere beim naechsten Eingriff auseinandergelaufen.
- Die Verschmelzung laeuft **einmal je Sitzung**, nicht bei jedem Neuzeichnen: ein Merker im Modul, nach 900 ms wird die Klasse entfernt. Im Browser nachgemessen: 0 ms und 300 ms „verschmilzt/0.9s“, 1400 ms „fertig“.
- Bei `prefers-reduced-motion` steht die Flaeche sofort verschmolzen da, und statt des Hinweistextes erscheint die Bildunterschrift aus `a11y.verschmolzen`. Ebenfalls im Browser nachgemessen (`--force-prefers-reduced-motion`).
- Welche Regeln zu Schranken werden, ergibt sich aus der Zuordnung in Teil 2; solange dort nichts steht, zeigt die Flaeche die Wahl aus Teil 1. So ist sie nie leer und nie erfunden.

## v2 — V2-10 (Plot in Akt 4)
- Der Plot musste nicht umgebaut werden: `z.historie` sammelte schon immer jeden Lauf aus jedem Akt. In Akt 3 sah man davon nur ein Bruchstueck. In Akt 4 steht er an der richtigen Stelle — dort, wo es um die Form der Kurve geht, nicht um einen einzelnen Lauf. Eine Zeile sagt an, dass die Punkte aus allen Akten kommen.

## v2 — V2-11 (Akt 5)
- Die Spalte `Platzierung` wird **aus dem Schritt selbst abgeleitet**, nicht aus dem Laufkontext: ein eigener Schritt `kontrollpunkt` heisst imperativ, ein Vermerk der Leitplanke am Aufruf heisst Laufzeit, und was beides nicht hat, aber vom Checker berührt wird, ist erst hinterher aufgefallen. Damit bleibt die Zurechnung auch dann richtig, wenn ein Lauf mehrere Orte mischt — was in Akt 4, Teil 2 der Normalfall ist.
- Der Export legt die Spalte auf **jeden Schritt** und laesst die Trajektorie im Zustand unberuehrt (Kopie je Schritt). Ein Test prueft beides: der Wiedereinlesevorgang findet die Spalte, der Ursprungslauf hat sie nicht.
- Der Vergleich heisst jetzt, was er ist: `Akt 2 — ohne Ihre Regel` gegen `Ihre Architektur`. Die Verdrahtung war schon richtig (Akt 2 setzt `vergleichsbasis`, Akt 4 setzt `mitNutzerregel`), nur die Beschriftung sprach noch von „Lauf A“ und „Lauf B“.
- **Luecke im Gatter geschlossen:** eine Testdatei mit Syntaxfehler laesst die Gesamtzahl *sinken*, statt rot zu werden — der Lauf bleibt gruen. Genau das ist hier einmal passiert. Das Gatter zaehlt jetzt zusaetzlich die geladenen Suiten gegen die `describe`-Aufrufe in den Dateien.

## v2 — V2-12 (Vortragsmodus)
- Die Zifferntasten bedeuten im Akt das, was dort zur Wahl steht: in Akt 1 die drei Stoerungen, in Akt 4 die drei Orte. In allen anderen Akten tun sie nichts und geben das Ereignis weiter — sonst haette eine Taste je nach Flaeche einen unsichtbaren Effekt.
- In Akt 1 waehlt eine Ziffer die Stoerung **und** startet den Lauf. Im Vortrag soll ein Tastendruck einen Schritt der Erzaehlung tun; zwei Tasten fuer einen Gedanken waeren eine Bedienungsanleitung.
- Die Modus-Pille steht jetzt in der Fusszeile. Sie ist eine Fussnote — im Kopf hat sie mit der Fallzeile um Aufmerksamkeit konkurriert.
- Nachgemessen im Browser mit echten Tastenereignissen: Wahl → Akt 1, `2` wirft `beleg_fehlt` ein (Varianten 2), dreimal rechts → Akt 4, `1` und `3` waehlen Orte, rechts → Akt 5 und dort Anschlag, sechsmal links → Akt 0.

## v2 — V2-13 (Textdurchgang)
- Die Ruecknahme zu **Akt 2** sagt ausschliesslich nach, was ohnehin auf der Flaeche steht („Ziel erreicht“, „keine Regel verletzt“). Sie darf nichts andeuten: §6 verbietet Hinweis, Warnung und Vorgriff, und die Zeile steht direkt unter „Sind Sie damit einverstanden?“. Ein Test verbietet dort ausdruecklich `achtung`, `warnung`, `vorsicht`, `problem`, `gefahr` und auch die einschraenkenden `aber`, `obwohl`, `trotzdem`.
- Zusaetzlich zu den Laengengrenzen pruefen Tests jetzt: Satzschreibung (kein Wort in Versalien), Punkt am Ende, kein Ausrufezeichen, und eine Sperrliste gegen Werbesprache (`einfach`, `mühelos`, `revolution`, `innovativ`, …). Die beiden Versalwoerter `IMPERATIV` und `DEKLARATIV` bleiben — sie sind ein bewusstes Gestaltungsmittel der ersten Fassung und dort eigens getestet.
- Die letzte Zeichenkette ausserhalb von `copy.de.js` (`' Schritte'` in Akt 4) ist umgezogen. Die alte Vierer-Liste `copy.schritte` ist entfallen, nachdem `copy.akte` sie abgeloest hatte.
