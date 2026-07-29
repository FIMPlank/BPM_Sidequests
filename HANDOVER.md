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
