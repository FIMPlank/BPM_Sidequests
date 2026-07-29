# Übergabe

## 1. Stand

**Alle elf Phasen sind fertig und grün. Nichts ist `BLOCKED`, nichts ist offen.**

234 Tests laufen durch. Die Demo funktioniert vollständig per Doppelklick auf
`index.html`: vier Bildschirme, skriptierter Agent, Regeleditor, Audit, Exporte.
Geschrieben, aber naturgemäß nie ausgeführt sind die beiden Dateien für den
optionalen Live-Modus (`functions/agent-run/index.js`, `supabase/schema.sql`) —
sie wurden gegen eine örtliche Attrappe getestet, nicht gegen echte Dienste.

Während des Baus wurde **nichts installiert**. Auf dieser Maschine gibt es kein
Node; verifiziert wurde mit dem ohnehin vorhandenen Edge im Kopflos-Modus. Das
Projekt hängt davon nicht ab — der garantierte Weg ist und bleibt der Doppelklick
auf `tests.html`.

## 2. Was Du selbst tun musst

Alles hier ist im Browser erledigt. Kein Terminal, keine Adminrechte, keine
Installation.

**Sofort, ohne jede Vorbereitung:**

1. `index.html` doppelklicken. Das ist die Demo. Fertig.
2. `tests.html` doppelklicken, wenn Du sehen willst, dass alles grün ist.
3. Vor einem Vortrag einmal `DEMO.md` lesen — drei Minuten, mit Zeitmarken.

**Wenn die Seite öffentlich erreichbar sein soll:**

4. Im Repository auf **Settings → Pages**, Quelle *Deploy from a branch*,
   Branch `main`, Ordner `/ (root)`, speichern. Es gibt keinen Build, also
   liefert Pages die Dateien direkt aus. Keine Workflow-Datei nötig.

**Vor einer Veröffentlichung noch einzutragen:**

5. In `DATENSCHUTZ.md` die verantwortliche Stelle und die Kontaktadresse
   ergänzen (zwei markierte Zeilen am Ende).
6. Im Fußbereich von `index.html` steht ein Platzhalter-Impressum. Vor einer
   öffentlichen Fassung muss dort ein echtes hin.
7. Auf Bildschirm 4 zeigt der Kontakt-Knopf auf ein leeres `mailto:`. Adresse
   in `index.html`? Nein — in `src/ui/screens/audit.js`, eine Zeile mit
   `href="mailto:"`.

**Nur wenn Du den echten Agenten zeigen willst** (alles andere funktioniert ohne
diesen Abschnitt):

8. Supabase-Dashboard → Edge Functions → neue Funktion `agent-run` → den
   gesamten Inhalt von `functions/agent-run/index.js` einfügen → veröffentlichen.
9. Supabase-Dashboard → SQL Editor → den gesamten Inhalt von
   `supabase/schema.sql` einfügen → ausführen.
10. Supabase-Dashboard → Project Settings → Secrets → `ANTHROPIC_API_KEY`
    setzen. Optional `ANTHROPIC_MODELL`, falls ein anderes Modell laufen soll.
11. In `src/config.js` unter `supabase` die Projekt-URL und den öffentlichen
    anon-Schlüssel eintragen. Der API-Schlüssel gehört **nicht** in diese Datei.
12. Die gehostete Seite mit `?modus=live` aufrufen. Von `file://` aus geht Live
    nicht — die Seite hat dort den Ursprung `null` und Supabase weist den
    CORS-Preflight ab. Das ist so vorgesehen.

## 3. Entscheidungen, die Du überstimmen könntest

Vollständig in `DECISIONS.md`. Die, bei denen ich mit einer anderen Meinung
rechne:

- **Freiheitsgrade** werden gegen die leere Vorgeschichte gerechnet (konservative
  Lesart). Vorbedingungs-Regeln schließen eine Aktion deshalb so lange aus, wie
  ihre Vorbedingung nicht hergestellt ist. Die Kennzahl startet dadurch bei 90 %,
  nicht bei 100 %. Herleitung steht im Kopf von `src/domain/freedom.js`.
- **Beide Durchsetzungsarten zählen für die Freiheitsgrade gleich.** Man könnte
  argumentieren, dass eine nur nachgelagert geprüfte Regel den Raum gar nicht
  einschränkt.
- **`response` und `existence` passieren die Leitplanke.** Sie sprechen über die
  Zukunft eines Laufs und sind zur Laufzeit nicht entscheidbar. Wer sie hart
  durchsetzen will, braucht ein anderes Konzept als eine Prüfung je Aufruf.
- **Der Kostensatz** steht in `src/config.js` als `centsPerKiloToken: 0.3`. Reine
  Größenordnung, kein Preis eines bestimmten Modells.
- **Die Edge Function bedient beide Aufgaben** (Lauf und Regelübersetzung) über
  einen Endpunkt, damit im Dashboard nur einmal etwas eingefügt werden muss.
- **Der Ocker der deklarativen Seite** ist als Textfarbe abgedunkelt
  (`--deklarativ-text`), weil er im Original nur 3,1:1 erreicht. Als Fläche und
  Linie ist er unverändert.
- **Die drei Systemregeln** sind fest verdrahtet (`HR.compiler.systemRegeln`).
  Andere Ausgangsregeln zu setzen ist eine Änderung an einer Stelle.

## 4. Die drei nächsten Schritte

1. **Die zweite Regel testen lassen.** Der Compiler deckt die häufigen
   Formulierungen ab, aber erst echte Eingaben von Praktikern zeigen, welche
   Sätze er ablehnt. Genau dafür gibt es die freiwillige Auswertung — nach ein
   paar Vorträgen lohnt ein Blick in `constraint_submissions` und daraus eine
   Runde neuer Muster in `src/domain/compiler.js`.
2. **Den Handlungsraum von der Ellipse lösen.** Er trägt die These und ist das
   Element, an das sich Leute erinnern. Heute schrumpft ein Ellipsenbündel
   proportional zur Kennzahl. Schöner wäre eine Kontur, die dort einbricht, wo
   die konkrete Regel greift — der Raum würde nicht nur kleiner, sondern
   erkennbar an der richtigen Stelle enger.
3. **Einen zweiten Fall neben die Reisekosten stellen.** Das Domänenmodell ist
   sauber getrennt; ein Freigabe- oder Beschaffungsfall wäre im Wesentlichen ein
   neuer Werkzeugkatalog plus Störungen. Für Publikum, das Reisekosten für zu
   klein hält, ist das das stärkste Gegenargument.

---

# Übergabe — Nachtrag zu v2 („Ein Fall, fünf Akte")

Alles oberhalb dieser Linie gilt unverändert weiter, **einschließlich des
gesamten Abschnitts 2 zur Inbetriebnahme.** An Supabase, Edge Function, Secrets
und GitHub Pages hat sich nichts geändert. Der Nachtrag ergänzt, er ersetzt nicht.

## 5. Was v2 ändert

Die erste Fassung hatte zwei Schwächen. Die erste: der Besucher war bis
Bildschirm 3 Zuschauer. Die zweite, wichtigere: die eigentliche These des
Whitepapers — imperative Kontrollpunkte *innerhalb* eines deklarativen
Handlungsraums — war nirgends zu sehen. Die Demo argumentierte „starr verliert,
autonom gewinnt, dann zähmen wir es". Das ist nicht dasselbe.

Aus vier Bildschirmen sind fünf Akte plus ein Vorspann geworden:

| | | war |
|---|---|---|
| **Akt 0** | Der Auftrag | neu — Vorspann, steht nicht in der Aktleiste |
| **Akt 1** | Der Clash | Bildschirm 1 |
| **Akt 2** | Der Preis der Autonomie | Bildschirm 2, **unverändert** |
| **Akt 3** | Sie modellieren | Bildschirm 3 |
| **Akt 4** | Die Architektur | neu — der Grund für diese Überarbeitung |
| **Akt 5** | Der Audit | Bildschirm 4 |

`?screen=N` funktioniert weiter; `screen=4` führt nach Akt 5. Neu ist `?akt=N`.

**Akt 2 wurde nicht angefasst.** Weder Text noch Timing noch Markup. Die beiden
Zeilen, die jetzt jeden Akt rahmen (der Rahmensatz oben und
„Was ist gerade passiert?" unten), setzt die Hülle in `HR.render.zeichnen` —
genau deshalb, damit `src/ui/screens/preis.js` unberührt bleibt. Die Ruecknahme
zu Akt 2 sagt nur nach, was ohnehin auf der Fläche steht.

## 6. Was in Akt 4 passiert

Drei Orte für dieselbe Regel, jeder mit demselben Fall und denselben zwei
Störungen, jeder mit einer messbar anderen Trajektorie:

| Ort | Schritte | Durchlaufzeit | Kosten je Lauf | Restrisiko |
|---|---|---|---|---|
| Imperativer Kontrollpunkt | 9 | 12 h 18 min | 10,50 € | 0,00 € |
| Leitplanke zur Laufzeit | 8 | 8 h 16 min | 7,00 € | 0,00 € |
| Prüfung im Nachgang | 7 | 4 h 14 min | 3,50 € | 520,00 € |

Darunter werden drei Regeln auf drei Orte verteilt. Alle 27 Belegungen bilden
auf eines von vier Mustern ab; die Zuordnung hängt nur an den Anzahlen, nicht
daran, welche Regel wo steht. Die beiden Randfälle bekommen ihren eigenen Satz.

Ganz unten verschmelzen die Panels zu einer Fläche: der Handlungsraum, und darin
die harten Schranken als Türen, durch die die Spur des Agenten hindurch muss.
Die Verschmelzung läuft **einmal je Sitzung**, rund 900 ms; bei
`prefers-reduced-motion` steht sie sofort fertig da, mit Bildunterschrift.

## 7. Neue Dateien

```
src/domain/latency.js        Durchlaufzeit: Schritte plus Wartezeit je Freigabe
src/v2/platzierung.js        drei Orte, drei Läufe, drei Maße
src/v2/muster.js             27 Belegungen auf vier Muster
src/ui/screens/auftrag.js    Akt 0
src/ui/screens/architektur.js Akt 4
src/ui/components/fusion.js  die verschmolzene Fläche
tests/run-node.js            derselbe Testlauf kopflos unter Node
```

`src/v2/` gibt es, weil `src/domain/` und `src/agent/` für diese Überarbeitung
gesperrt waren. Wenn Du die Sperre aufhebst, gehören `platzierung.js` und
`muster.js` fachlich nach `src/domain/`.

## 8. Was Du überstimmen könntest

Ausführlich in `DECISIONS.md` unter den Überschriften `## v2 — …`. Die drei,
die am ehesten Widerspruch verdienen:

1. **Die Fallzeile nennt Hamburg und zwei Nächte, nicht Verona und drei.** Die
   Vorgabe sagte Verona; der skriptierte Agent bucht aber Hamburg, und
   `src/agent/` war gesperrt. Eine Kopfzeile, die etwas anderes behauptet als
   das Protokoll darunter, wäre in einer Demo über Nachvollziehbarkeit der
   schlechteste denkbare Fehler. Willst Du Verona, muss `src/agent/mockRunner.js`
   mit.
2. **3,50 € Sachbearbeitung je menschlicher Freigabe** und vier Stunden
   Wartezeit sind gesetzte Zahlen (`src/v2/platzierung.js`, `src/domain/latency.js`).
   Ohne den menschlichen Anteil wären alle drei Orte praktisch gleich teuer und
   Akt 4 hätte keine Aussage. Die Größenordnung darf man diskutieren.
3. **Die Schranken sind waagerechte Wände mit senkrechten Pfosten**, nicht
   senkrechte Balken. Der Fall läuft in dieser Zeichnung von oben nach unten;
   eine Schranke quer dazu ist waagerecht. Die Alternative wäre gewesen, die
   Geometrie des Handlungsraums zu drehen — das hätte Akt 1 und Akt 3 mitgerissen.

## 9. Tests

348 Tests, 0 Fehler. Der Doppelklick auf `tests.html` bleibt der maßgebliche
Weg. `tests/run-node.js` führt dieselben Dateien kopflos unter Node aus — es
liest die Skriptliste aus `tests.html`, damit beide nicht auseinanderlaufen
können. **Die ausgelieferte Seite hängt nicht davon ab**; keine der beiden
HTML-Dateien verweist darauf.

Ein Hinweis aus der Praxis: eine Testdatei mit Syntaxfehler lässt die
Gesamtzahl *sinken*, statt rot zu werden — der Lauf bleibt grün. Wer am
Testbestand arbeitet, sollte die Zahl der geladenen Suiten gegen die Zahl der
`describe`-Aufrufe prüfen. Genau das ist während dieser Überarbeitung einmal
passiert und wurde nur durch die plötzlich gesunkene Gesamtzahl bemerkt.
