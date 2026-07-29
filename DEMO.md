# Vorführung in vier Minuten

Ein Fall, fünf Akte. Der Fall steht die ganze Zeit im Kopf der Seite:
**Reisekostenabrechnung Nr. 2847 · Frau Berger · Kundentermin Hamburg · 2 Nächte.**

Vorbereitung: `index.html?modus=vortrag` öffnen. Größere Schrift, Tastatur­steuerung,
kein Protokoll. `←`/`→` wechseln den Akt, `1`–`3` werfen in Akt 1 eine Störung ein
und wählen in Akt 4 einen Ort, `r` setzt alles zurück. Kein Netz nötig.

Der Einstieg ist **Akt 0**. Er steht nicht in der Aktleiste, sondern davor.

---

## 0:00 — Akt 0, Der Auftrag (20 Sekunden)

Auf dem Schirm steht eine Ansage, keine Oberfläche:

> „Frau Berger war beim Kunden. Sorgen Sie dafür, dass sie ihr Geld zurückbekommt —
> regelkonform, und ohne dass ich jeden Beleg selbst ansehe."

Darunter zwei Knöpfe und sonst nichts.

> „Bevor irgendetwas läuft, entscheiden Sie. Machen wir es wie heute — ein
> Ablauf, jeder Schritt vorgeschrieben? Oder geben wir einem Agenten das Ziel
> und ein paar Regeln?"

**`So würde ein Agent es machen` klicken.** Die Seite springt in Akt 1, die
rechte Seite steht vorn, die linke bleibt sichtbar, und der Lauf startet.

> „Gleiches Ergebnis, gleicher Betrag. Bis hierhin kein Unterschied."

---

## 0:30 — Akt 1, Der Clash (40 Sekunden)

Erst wählen, dann laufen lassen. **Taste `2`** — *Beleg fehlt*.

Links bleibt die Kette stehen, hart, ohne Übergang. Rechts zeichnet der Agent
einen neuen Weg.

> „Für diesen Fall gibt es keine Transition. Das Modell ist nicht falsch — es ist
> unvollständig, und das wird es immer sein."

Auf die große Zahl links zeigen: **Modellierte Varianten.**

> „Das ist der Preis. Eine Störung, eine weitere Variante."

**Taste `1`**, **Taste `3`**. Die Zahl steigt.

> „Drei Störungen, drei Varianten. In Ihrer Realität sind es dreißig."

---

## 1:10 — Akt 2, Der Preis der Autonomie (45 Sekunden)

**`→`.** Zwei Störungen zugleich: das Hotel kostet 260 € statt der 150 € aus der
Richtlinie, und der Genehmiger ist im Urlaub.

**`Agent laufen lassen`.**

> „Ziel erreicht. 520 € erstattet. Und jetzt schauen Sie in den Ablauf."

Auf `selbst_freigeben` zeigen. **Nicht kommentieren.** Dann auf den Prüfblock:

> „**Null Regelverstöße.** Der Prüfer lügt nicht. Die Regel, dass 260 € pro Nacht
> zu viel sind, steht nirgends im System. Sie steht in einer Richtlinie als PDF."

Die Frage stehen lassen: **Sind Sie damit einverstanden?**

Zwei Sekunden warten. Dann `Nein` klicken.

Dieser Akt ist der Kern der Vorführung. Nichts hinzufügen, nichts vorwegnehmen.

---

## 1:55 — Akt 3, Sie modellieren (40 Sekunden)

In das Feld tippen:

```
Buchungen über 200 € pro Nacht brauchen eine Freigabe
```

**`Regel prüfen`.**

> „Kein Formular, keine Modellierungssprache, ein deutscher Satz. Daraus wird
> eine Schwellenwert-Regel: Zielwerkzeug, Bedingung, Forderung."

**`Regel übernehmen`**, dann **`Denselben Fall mit Ihren Regeln laufen lassen`**.

Auf die große Zahl zeigen: **Verstöße im letzten Lauf.**

> „Eine Regel, und die Zahl bewegt sich. Was sie kostet, steht daneben:
> Kontext-Token, Geld je Lauf, Freiheitsgrade."

---

## 2:35 — Akt 4, Die Architektur (70 Sekunden)

**`→`.** Das ist der Akt, um den es geht.

> „Dieselbe Regel. Dieselben zwei Störungen. Die Frage ist nur: **wo greift sie?**"

Drei Karten nebeneinander, jede mit denselben drei Maßen:

| Ort | Durchlaufzeit | Kosten je Lauf | Restrisiko |
|---|---|---|---|
| Imperativer Kontrollpunkt | 12 h 18 min | 10,50 € | 0,00 € |
| Leitplanke zur Laufzeit | 8 h 16 min | 7,00 € | 0,00 € |
| Prüfung im Nachgang | 4 h 14 min | 3,50 € | **520,00 €** |

**Taste `1`.** Der Kontrollpunkt: ein Mensch gibt frei, bevor gebucht wird.

> „Sicher. Und teuer, weil jemand warten muss."

**Taste `3`.** Die Prüfung im Nachgang.

> „Am schnellsten, am billigsten — und 520 € sind schon ausgezahlt, bevor
> jemand hingesehen hat."

**Taste `2`.** Die Leitplanke.

Die Tabelle nicht erklären. Sie sagt es selbst.

Darunter die Kombination: **drei Regeln, drei Orte.** Je Regel einen Ort
zuweisen — zum Beispiel die eigene Regel auf `Imperativer Kontrollpunkt`, die
Zahlungsgrenze und die Belegpflicht auf `Leitplanke zur Laufzeit`.

> „Sie haben gerade **Muster 2 — Deklarative Ziele, imperative Kontrollpunkte**
> gebaut. Das ist die Architektur, um die es im Whitepaper geht."

Auf die Fläche darunter zeigen: eine einzige Zeichnung, keine zwei Panels mehr.

> „Bis eben waren das zwei Welten mit einer Naht dazwischen. Hier ist es eine:
> der Handlungsraum, und darin die harten Schranken. Der Agent läuft frei —
> aber er muss hindurch."

Wenn jemand fragt, was passiert, wenn man alles hart absichert: alle drei auf
`Imperativer Kontrollpunkt` stellen.

> „**Sie haben den alten Prozess nachgebaut — mit Zusatzkosten für die KI.**"

---

## 3:45 — Akt 5, Der Audit (30 Sekunden)

**`→`.**

> „Jeder Schritt mit Zeit, Akteur, Werkzeug, Eingabe — und mit der Spalte
> `Platzierung`: welcher Architekturentscheidung diese Prüfung zu verdanken ist."

Eine abgelehnte Zeile aufklappen. Dann zum Vergleich scrollen.

> „Links der freie Lauf aus Akt 2, rechts Ihre Architektur. Ab Schritt drei
> laufen sie auseinander. Exportierbar als JSON und CSV, mit der neuen Spalte."

Schlusssatz:

> „Weder ein Modell, das jede Abweichung als Fehler behandelt, noch ein Agent,
> der jedes Ziel irgendwie erreicht. Die Frage ist nicht, *ob* Sie Regeln haben.
> Die Frage ist, **wo sie greifen.**"

---

## Wenn etwas dazwischenkommt

- **Kein Netz:** irrelevant. Der Demo-Modus braucht keins.
- **Verklickt:** `r` setzt zurück, `←`/`→` navigieren, `?akt=N` steigt direkt ein.
- **Zu wenig Zeit:** Akt 2 und Akt 4 reichen. „Sind Sie damit einverstanden?" ist
  die Frage, Akt 4 ist die Antwort. Alles andere ist Anlauf.
- **Zu viel Zeit:** eine zweite Regel formulieren lassen — etwa „Niemals selbst
  freigeben" — und in Akt 4 den Plot beobachten: er sammelt über die ganze
  Sitzung, nicht je Akt.
- **Nachfrage nach dem Live-Agenten:** möglich, aber nur auf der gehosteten
  Fassung. Die Demo zeigt bewusst denselben Ablauf reproduzierbar.

## Direkteinstieg

| Aufruf | Landet in |
|---|---|
| `index.html` | Akt 0, Der Auftrag |
| `index.html?akt=2` | Akt 2, Der Preis der Autonomie |
| `index.html?akt=4` | Akt 4, Die Architektur |
| `index.html?screen=4` | Akt 5 — die alte Nummerierung gilt weiter |
