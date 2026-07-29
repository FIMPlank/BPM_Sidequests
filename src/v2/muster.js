/**
 * Vier Architekturmuster.
 *
 * Drei Regeln, je ein Ort — daraus ergeben sich 27 Belegungen und genau vier
 * Muster. Die Zuordnung ist eine reine Funktion der *Anzahlen*, nicht davon,
 * welche Regel wo steht: was eine Architektur ausmacht, ist ihr Schwerpunkt.
 *
 * Zwei Belegungen bekommen einen eigenen, unfreundlichen Satz. Wer alles zum
 * Kontrollpunkt macht, hat den alten Prozess nachgebaut und zahlt jetzt auch
 * noch fuer die KI. Wer alles in den Nachgang legt, prueft nur noch, was schon
 * passiert ist. Beides ist ein zulaessiges Ergebnis und wird auch so benannt.
 *
 * Rein und ohne DOM. Die Saetze stehen in `copy.de.js`, nicht hier.
 */
(function (HR) {
  'use strict';

  /** Die drei Regelplaetze der Kombination. */
  var REGELPLAETZE = ['eigen', 'zahlung', 'beleg'];

  var SCHLUESSEL = ['m1', 'm2', 'm3', 'm4'];

  function leereZuordnung() {
    return { eigen: null, zahlung: null, beleg: null };
  }

  /** @returns {boolean} Sind alle drei Regeln einem Ort zugewiesen? */
  function vollstaendig(zuordnung) {
    if (!zuordnung) return false;
    return REGELPLAETZE.every(function (p) {
      return HR.platzierung.PLATZIERUNGEN.indexOf(zuordnung[p]) !== -1;
    });
  }

  function zaehlen(zuordnung) {
    var z = { imperativ: 0, leitplanke: 0, nachgang: 0 };
    REGELPLAETZE.forEach(function (p) {
      var ort = zuordnung ? zuordnung[p] : null;
      if (z[ort] !== undefined) z[ort]++;
    });
    return z;
  }

  /**
   * Die Zuordnung. Total ueber alle 27 Belegungen.
   *
   * @param {Object} zuordnung
   * @returns {{schluessel:string, zaehlung:Object, entartet:boolean}|null}
   */
  function bestimmen(zuordnung) {
    if (!vollstaendig(zuordnung)) return null;
    var z = zaehlen(zuordnung);
    var i = z.imperativ, l = z.leitplanke, n = z.nachgang;

    // Die beiden Randfaelle zuerst: sie sind kein Mischverhaeltnis, sondern
    // eine Absage an die jeweils andere Seite.
    if (i === 3) return { schluessel: 'm1', zaehlung: z, entartet: true };
    if (n === 3) return { schluessel: 'm4', zaehlung: z, entartet: true };

    // Harte Kontrollpunkte *und* Leitplanken: das ist die These des Papiers.
    if (i >= 1 && l >= 1) return { schluessel: 'm2', zaehlung: z, entartet: false };

    // Kein harter Kontrollpunkt: entweder die Leitplanken tragen, oder es
    // wird ueberwiegend nachtraeglich geprueft.
    if (i === 0 && l >= 1) {
      return { schluessel: l >= n ? 'm3' : 'm4', zaehlung: z, entartet: false };
    }

    // Keine Leitplanke: harte Punkte gegen nachtraegliche Pruefung.
    return { schluessel: i >= n ? 'm1' : 'm4', zaehlung: z, entartet: false };
  }

  /** Alle 27 Belegungen, fuer die erschoepfende Pruefung. */
  function alleBelegungen() {
    var orte = HR.platzierung.PLATZIERUNGEN;
    var out = [];
    orte.forEach(function (a) {
      orte.forEach(function (b) {
        orte.forEach(function (c) {
          out.push({ eigen: a, zahlung: b, beleg: c });
        });
      });
    });
    return out;
  }

  HR.muster = {
    REGELPLAETZE: REGELPLAETZE,
    SCHLUESSEL: SCHLUESSEL,
    leereZuordnung: leereZuordnung,
    vollstaendig: vollstaendig,
    zaehlen: zaehlen,
    bestimmen: bestimmen,
    alleBelegungen: alleBelegungen
  };
})(window.HR = window.HR || {});
