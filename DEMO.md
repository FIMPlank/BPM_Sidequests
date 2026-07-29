# Vorführung in drei Minuten

Vorbereitung: `index.html?modus=vortrag` öffnen. Größere Schrift, Tastatur­steuerung,
kein Protokoll. `←`/`→` wechseln den Bildschirm, `1`–`3` werfen eine Störung ein,
`r` setzt alles zurück. Kein Netz nötig.

---

## 0:00 — Der Aufbau (20 Sekunden)

> „Links sehen Sie eine Reisekostenabrechnung als Prozessmodell. Sechs Schritte,
> jeder vorgeschrieben. Rechts steht derselbe Vorgang als drei Regeln — und
> darunter der Raum, den diese Regeln aufspannen."

**`Prozess starten` klicken.** Beide Seiten laufen durch.

> „Gleiches Ergebnis, gleicher Betrag. Bis hierhin kein Unterschied."

---

## 0:30 — Die Störung (30 Sekunden)

**Taste `1`** — *Reise wird kurzfristig verlängert*.

Links bleibt die Kette stehen, hart, ohne Übergang. Rechts zeichnet der Agent
einen neuen Weg.

> „Für diesen Fall gibt es keine Transition. Das Modell ist nicht falsch — es ist
> unvollständig, und das wird es immer sein. Der Zähler links sagt, was das
> kostet: **eine weitere Prozessvariante**."

**Taste `2`**, **Taste `3`**. Der Zähler steigt weiter.

> „Drei Störungen, drei Varianten. In Ihrer Realität sind es dreißig."

---

## 1:00 — Der Preis (45 Sekunden)

**`→` auf Bildschirm 2.** Zwei Störungen zugleich: das Hotel kostet 260 € statt
der 150 € aus der Richtlinie, und der Genehmiger ist im Urlaub.

**`Agent laufen lassen`.**

> „Ziel erreicht. 520 € erstattet. Und jetzt schauen Sie in den Ablauf."

Auf `selbst_freigeben` zeigen. Nicht kommentieren. Dann auf den Prüfblock zeigen:

> „**Null Regelverstöße.** Der Prüfer lügt nicht. Die Regel, dass 260 € pro Nacht
> zu viel sind, steht nirgends im System. Sie steht in einer Richtlinie als PDF."

Die Frage stehen lassen: **Sind Sie damit einverstanden?**

Zwei Sekunden warten. Dann `Nein` klicken.

---

## 1:45 — Die Regel (45 Sekunden)

Auf Bildschirm 3 in das Feld tippen:

```
Buchungen über 200 € pro Nacht brauchen eine Freigabe
```

**`Regel prüfen`.**

> „Kein Formular, keine Modellierungssprache, ein deutscher Satz. Daraus wird
> eine Schwellenwert-Regel: Zielwerkzeug, Bedingung, Forderung."

**`Regel übernehmen`.** Auf die Anzeigen zeigen — die Freiheitsgrade fallen.

> „Sie haben gerade deklarativ modelliert. Und Sie sehen sofort, was es kostet:
> mehr Kontext-Token, mehr Geld je Lauf, weniger Handlungsspielraum."

**`Erneut ausführen`.** Dieselben Störungen.

> „Der Agent versucht dieselbe Buchung. Die Leitplanke lehnt ab — an der
> Werkzeuggrenze, bevor gebucht wird. Er plant um, eskaliert an die Vertretung,
> bekommt die Freigabe und erreicht das Ziel. Anderer Weg, gleiches Ergebnis,
> regelkonform."

Falls Zeit ist: den Umschalter auf **`Prüfung im Nachgang`** stellen und noch
einmal laufen lassen.

> „Dieselbe Regel, nur später geprüft. Jetzt bucht er, und wir erfahren es
> hinterher. Die Frage ist nicht *ob* Sie Regeln haben, sondern **wo sie greifen**."

---

## 2:30 — Der Audit (30 Sekunden)

**`→` auf Bildschirm 4.**

> „Jeder Schritt mit Zeit, Akteur, Werkzeug, Eingabe und der Regel, die dabei
> geprüft wurde. Die abgelehnte Zeile lässt sich aufklappen: welche Bedingung auf
> welchem Wert gescheitert ist."

Eine abgelehnte Zeile aufklappen. Dann auf den Vergleich scrollen.

> „Links der Lauf ohne Ihre Regel, rechts mit. Ab Schritt drei laufen sie
> auseinander. Das ist der Unterschied, den eine einzige Regel macht — und
> exportierbar ist er auch."

Schlusssatz:

> „Weder ein Modell, das jede Abweichung als Fehler behandelt, noch ein Agent,
> der jedes Ziel irgendwie erreicht. Explizite Regeln, ein bewusster
> Kontrollpunkt, ein belegbarer Lauf."

---

## Wenn etwas dazwischenkommt

- **Kein Netz:** irrelevant. Der Demo-Modus braucht keins.
- **Verklickt:** `r` setzt zurück, `←`/`→` navigieren.
- **Zu wenig Zeit:** Bildschirm 1 und 2 reichen. Die Frage „Sind Sie damit
  einverstanden?" ist der Kern; alles danach ist die Auflösung.
- **Zu viel Zeit:** eine zweite Regel formulieren lassen — etwa
  „Niemals selbst freigeben" — und den Plot beobachten, wie die Verstöße fallen
  und die Kosten steigen.
- **Nachfrage nach dem Live-Agenten:** möglich, aber nur auf der gehosteten
  Fassung. Die Demo zeigt bewusst denselben Ablauf reproduzierbar.
