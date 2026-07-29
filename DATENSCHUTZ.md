# Datenschutz

Diese Seite ist eine Demonstration. Sie kommt ohne Cookies, ohne Tracking und
ohne fremde Server aus.

## Was diese Seite grundsätzlich nicht tut

- Sie setzt **keine Cookies** und nutzt **keine Speicher-APIs** des Browsers
  (kein `localStorage`, kein `sessionStorage`, kein IndexedDB).
- Sie lädt **keine Inhalte von Dritten** — keine Schriften, keine Skripte,
  keine Bilder, keine Karten, keine Analysewerkzeuge. Alles liegt im Repository.
- Sie erhebt **keine IP-Adresse**, **keinen User-Agent**, **keinen Fingerabdruck**
  und **keine Kennung**, die Sie wiedererkennbar machen würde.
- Im Demo-Modus — das ist der Standard und der Zustand beim Öffnen der Datei —
  verlässt **nichts** Ihren Browser. Der Agent läuft vollständig lokal.

## Was gespeichert werden kann, wenn Sie zustimmen

Auf dem dritten Bildschirm können Sie eine Regel in eigenen Worten formulieren.
Uns interessiert fachlich, **welche Regel Praktiker zuerst aufschreiben**. Genau
dafür — und für nichts anderes — gibt es dort eine Schaltfläche `Einverstanden`.

Erst nach diesem Klick, und nur auf der gehosteten Fassung im Live-Modus, werden
zwei Datensätze an das Projekt des Betreibers bei Supabase gesendet:

**`constraint_submissions`**

| Feld | Inhalt |
|---|---|
| `text_de` | der Regeltext, den Sie eingegeben haben (max. 400 Zeichen) |
| `compiled_kind` | die erkannte Regelart, etwa `threshold` |
| `compiled_ok` | ob die Regel übersetzt werden konnte |
| `reject_reason` | falls nicht: woran es lag |
| `session_hash` | eine Zufallszahl, siehe unten |
| `screen` | auf welchem Bildschirm die Eingabe entstand |
| `created_at` | Zeitpunkt |

**`run_events`**

| Feld | Inhalt |
|---|---|
| `rules_count` | wie viele Regeln aktiv waren |
| `violations_count` | wie viele Verstöße der Checker fand |
| `enforcement` | `posthoc` oder `runtime` |
| `goal_reached` | ob der Agent das Ziel erreicht hat |
| `disturbances` | welche Störungen eingeworfen wurden |
| `session_hash` | dieselbe Zufallszahl |
| `created_at` | Zeitpunkt |

Schreiben Sie einen Personenbezug selbst in das Textfeld, landet er im Feld
`text_de`. Bitte tun Sie das nicht — das Feld ist für Regeln gedacht.

## Zur Sitzungskennung

`session_hash` ist eine Zufallszahl, die beim Laden der Seite im Arbeitsspeicher
entsteht (`crypto.randomUUID()`). Sie wird nirgends abgelegt und ist nach dem
Neuladen der Seite verloren. Sie dient allein dazu, die Regeleingabe und die
Läufe **einer** Sitzung fachlich zusammenzuhalten. Ein Rückschluss auf Ihre
Person ist damit nicht möglich, und ein Wiedererkennen über Sitzungen hinweg
ebenso wenig.

## Rechtsgrundlage und Widerruf

Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Sie geben
sie ausdrücklich durch den Klick auf `Einverstanden`. Ohne diesen Klick wird
nichts gesendet; die Demo funktioniert vollständig, es fehlt lediglich der
Schreibvorgang.

Die Einwilligung gilt nur für die laufende Sitzung. Laden Sie die Seite neu, ist
sie erloschen.

## Aufbewahrung

Die beiden Tabellen werden **24 Monate** nach Erhebung gelöscht.

## Löschung und Kontakt

Da keine personenbezogene Kennung gespeichert wird, lässt sich ein einzelner
Eintrag nachträglich in aller Regel nicht mehr Ihnen zuordnen. Wenn Sie dennoch
die Löschung eines Beitrags wünschen und ihn beschreiben können (etwa über den
Wortlaut und den ungefähren Zeitpunkt), löschen wir ihn.

> **Verantwortlich:** *(hier die verantwortliche Stelle eintragen — Name,
> Anschrift, E-Mail)*
> **Datenschutz:** *(hier die Kontaktadresse für Betroffenenrechte eintragen)*

Ein Impressum ist im Fußbereich der Seite verlinkt und vor einer Veröffentlichung
zu ergänzen.

## Technische Umsetzung

- Der Schlüssel für das Sprachmodell liegt in den Supabase-Secrets und erreicht
  den Browser nie.
- Die beiden Tabellen erlauben dem öffentlichen Schlüssel ausschließlich
  `insert`. Lesen, Ändern und Löschen sind per Row Level Security ausgeschlossen
  (siehe `supabase/schema.sql`).
- Im Vortragsmodus (`?modus=vortrag`) wird grundsätzlich nichts geschrieben.
