/**
 * Saemtliche sichtbare deutsche Sprache. Keine Zeichenkette in den Komponenten.
 * Ton: Aussagesatz, aktiv, kein Ausrufezeichen, kein Marketing.
 */
(function (HR) {
  'use strict';

  var t = {
    seite: {
      titel: 'Handlungsraum-Sandbox',
      unterzeile: 'Reisekostenabrechnung als Testfall',
      modusMock: 'Modus: Demo (skriptiert)',
      modusLive: 'Modus: Live-Agent',
      modusVortrag: 'Modus: Vortrag',
      weiter: 'Weiter',
      zurueck: 'Zurück',
      zumInhalt: 'Zum Inhalt springen',
      vortragHinweis: 'Pfeiltasten wechseln den Bildschirm, 1 bis 3 werfen eine Störung ein, r setzt zurück.'
    },

    /**
     * Der Fall. Er steht in jedem Akt unveraendert im Kopf der Seite und ist
     * das einzige, was die fuenf Akte zusammenhaelt.
     */
    fall: {
      nummer: 'Reisekostenabrechnung Nr. 2847',
      person: 'Frau Berger',
      anlass: 'Kundentermin Hamburg',
      dauer: '2 Nächte'
    },

    /** Die fuenf Akte der Aktleiste. Akt 0 ist der Vorspann und steht nicht darin. */
    akte: ['Der Clash', 'Der Preis der Autonomie', 'Sie modellieren', 'Die Architektur', 'Der Audit'],

    /**
     * Je Akt ein Rahmensatz zu Beginn (hoechstens zwoelf Woerter) und eine
     * Ruecknahme am Ende (hoechstens zwanzig Woerter, ohne Fachsprache).
     * Vorlaeufige Fassung — der Textdurchgang in V2-13 schreibt sie neu,
     * wenn das Verhalten aller Akte feststeht. Index gleich Aktnummer.
     */
    rahmenFrage: 'Was ist gerade passiert?',

    rahmen: [
      'Ein Vorgang, zwei Wege. Sie entscheiden, welcher zuerst läuft.',
      'Derselbe Vorgang, links vorgeschrieben, rechts als Raum beschrieben.',
      'Zwei Störungen auf einmal. Der Agent bekommt nur ein Ziel.',
      'Sie schreiben eine Regel. In Ihren Worten, nicht in Syntax.',
      'Wo soll Ihre Regel greifen? Drei Orte, drei Ergebnisse.',
      'Der ganze Lauf, Schritt für Schritt, mit Beleg.'
    ],

    rueckblick: [
      'Sie haben einen Weg gewählt. Beide führen durch denselben Fall.',
      'Das feste Modell blieb stehen, der Agent plante um und kam ans Ziel.',
      'Der Agent hat das Ziel erreicht und keine hinterlegte Regel verletzt.',
      'Ihre Regel ist jetzt Teil des Raums und wird bei jedem Lauf geprüft.',
      'Der Ort der Regel ändert Dauer, Kosten und das, was übrig bleibt.',
      'Jeder Schritt ist nachlesbar, mit Zeit, Werkzeug und geprüfter Regel.'
    ],

    /** Alte Vierer-Beschriftung, bis der Textdurchgang sie ersetzt. */
    schritte: ['Der Clash', 'Der Preis der Autonomie', 'Sie modellieren', 'Der Audit'],

    label: { imperativ: 'IMPERATIV', deklarativ: 'DEKLARATIV' },

    screen1: {
      titel: 'Der Clash',
      lead: 'Ein Prozess, zwei Denkweisen. Links das Modell, das jeden Schritt vorschreibt. Rechts drei Regeln, die einen Raum aufspannen. Starten Sie beide.',
      starten: 'Prozess starten',
      erneut: 'Erneut starten',
      stoerungTitel: 'Störung einwerfen',
      stoerungen: {
        reise_verlaengert: 'Reise wird kurzfristig verlängert',
        beleg_fehlt: 'Beleg fehlt',
        hotel_storniert: 'Hotel storniert kurzfristig'
      },
      langweilig: 'Bisher kein Unterschied. Jetzt kommt die Realität dazwischen.',
      beideFertig: 'Beide Seiten sind fertig. Gleiches Ergebnis, gleicher Betrag.',
      fsmBadge: 'Keine Transition definiert — Prozessvariante erforderlich',
      variantenLabel: 'Modellierte Varianten',
      agentOk: 'Der Agent hat umgeplant und das Ziel erreicht.',
      knoten: {
        antrag_stellen: 'Antrag stellen',
        genehmigung_erhalten: 'Genehmigung erhalten',
        reise_durchfuehren: 'Reise durchführen',
        belege_sammeln: 'Belege sammeln',
        abrechnung_einreichen: 'Abrechnung einreichen',
        erstattung_erhalten: 'Erstattung erhalten'
      },
      raumKnoten: {
        reiseantrag_stellen: 'Antrag',
        genehmigung_anfordern: 'Freigabe',
        hotel_buchen: 'Hotel',
        beleg_pruefen: 'Beleg',
        beleg_schaetzen: 'Schätzung',
        abrechnung_einreichen: 'Abrechnung',
        selbst_freigeben: 'Selbstfreigabe',
        erstattung_ausloesen: 'Erstattung'
      },
      raumTitel: 'Handlungsraum',
      raumHinweis: 'Die Fläche zeigt, was erlaubt ist. Die Linie zeigt, was der Agent tatsächlich getan hat.',
      weiterAngebot: 'Der Agent kommt mit jeder Störung zurecht. Was kostet das?'
    },

    screen2: {
      titel: 'Der Preis der Autonomie',
      lead: 'Zwei Störungen gleichzeitig. Der Agent bekommt keine neue Regel, nur ein Ziel.',
      stoerungen: {
        hotel_ausgebucht: 'Hotel ausgebucht — nur noch 260 €/Nacht verfügbar',
        genehmiger_urlaub: 'Genehmiger im Urlaub'
      },
      laufen: 'Agent laufen lassen',
      erneut: 'Erneut laufen lassen',
      stoerungTitel: 'Eingeworfene Störungen',
      ablaufTitel: 'Was der Agent getan hat',
      betragLabel: 'Erstatteter Betrag',
      zielErreicht: 'Ziel erreicht',
      erstattet: 'Erstattung ausgezahlt',
      pruefungTitel: 'Regelverstöße',
      pruefungOk: 'Alle hinterlegten Regeln wurden eingehalten.',
      frage: 'Sind Sie damit einverstanden?',
      ja: 'Ja',
      nein: 'Nein',
      antwortJa: 'Dann prüfen Sie, ob Ihre Innenrevision das auch so sieht.',
      antwortNein: 'Dann fehlt eine Regel. Schreiben Sie sie auf.',
      weiter: 'Regel hinzufügen'
    },

    screen3: {
      titel: 'Sie modellieren jetzt deklarativ',
      lead: 'Sie beschreiben, was gelten soll — nicht, in welcher Reihenfolge etwas passiert.',
      eingabeLabel: 'Fügen Sie eine Regel hinzu',
      platzhalter: 'z. B. „Buchungen über 200 € pro Nacht brauchen eine Freigabe"',
      pruefen: 'Regel prüfen',
      erkannt: 'Erkannt',
      uebernehmen: 'Regel übernehmen',
      verwerfen: 'Verwerfen',
      erneutAusfuehren: 'Erneut ausführen',
      regelnTitel: 'Hinterlegte Regeln',
      keineRegeln: 'Noch keine eigene Regel.',
      entfernen: 'Entfernen',
      arten: {
        response: 'Folge-Regel',
        precedence: 'Vorbedingungs-Regel',
        absence: 'Verbots-Regel',
        threshold: 'Schwellenwert-Regel',
        existence: 'Pflicht-Regel'
      },
      zaehler: {
        regeln: 'Regeln',
        tokens: 'Kontext-Token je Lauf',
        kosten: 'Kosten je Lauf',
        freiheit: 'Freiheitsgrade',
        verstoesse: 'Verstöße im letzten Lauf'
      },
      einheitCent: 'Cent',
      plotTitel: 'Regeln gegen Verstöße und Kosten',
      plotX: 'Regeln',
      plotVerstoesse: 'Verstöße',
      plotKosten: 'Kosten (Cent)',
      plotLeer: 'Führen Sie einen Lauf aus, um den ersten Punkt zu setzen.',
      durchsetzungTitel: 'Autonomie vorne — Kontrolle hinten?',
      posthoc: 'Prüfung im Nachgang',
      runtime: 'Leitplanke zur Laufzeit',
      posthocHinweis: 'Der Agent läuft frei. Der Checker bewertet die Trajektorie hinterher.',
      runtimeHinweis: 'Die Regel steht im Systemprompt und wird an der Werkzeuggrenze hart geprüft.',
      ablehnung: {
        zu_kurz: 'Der Satz ist zu kurz. Schreiben Sie, was gelten soll.',
        kein_werkzeug: 'Kein Vorgang erkannt. Nennen Sie, worum es geht — etwa Hotel, Beleg, Abrechnung, Erstattung oder Freigabe.',
        keine_regelform: 'Der Vorgang ist erkannt, aber keine Bedingung. Sagen Sie, was gelten muss.',
        nicht_darstellbar: 'Diese Regel lässt sich im Modell nicht ausdrücken.'
      },
      ablehnungBeispiel: 'So funktioniert es: „Buchungen über 200 € pro Nacht brauchen eine Freigabe"',
      consentText: 'Wir werten anonymisiert aus, welche Regeln Praktiker zuerst formulieren.',
      consentButton: 'Einverstanden',
      consentZusatz: 'Sie können den Text auch nur lokal verwenden.',
      consentDanke: 'Danke. Es wird nur der Regeltext gespeichert, keine Kennung Ihrer Person.'
    },

    /** Akt 0 — der Vorspann. Inhalt kommt in V2-03, Text in V2-13. */
    akt0: {
      titel: 'Der Auftrag'
    },

    /** Akt 4 — die Architektur. Inhalt kommt in V2-07 und V2-08. */
    akt4: {
      titel: 'Die Architektur'
    },

    screen4: {
      titel: 'Der Audit',
      frage: 'Könnten Sie das im Audit belegen?',
      spalten: ['#', 'Zeit', 'Akteur', 'Aktion', 'Tool', 'Input (gekürzt)', 'Constraint-Check', 'Ergebnis'],
      akteur: { agent: 'Agent', system: 'System', leitplanke: 'Leitplanke' },
      aktion: { werkzeug_aufruf: 'Werkzeugaufruf', abgelehnt: 'abgelehnt' },
      geblockt: 'abgelehnt',
      keinCheck: 'keine Regel betroffen',
      jsonExport: 'Als JSON exportieren',
      csvExport: 'Als CSV exportieren',
      diffTitel: 'Lauf A und Lauf B im Vergleich',
      laufA: 'Lauf A (ohne Ihre Regel)',
      laufB: 'Lauf B (mit Ihrer Regel)',
      diffLeer: 'Für den Vergleich braucht es einen Lauf mit und einen ohne Ihre Regel.',
      gleich: 'unverändert',
      anders: 'abweichend',
      fehlt: '—',
      selbstcheckTitel: 'Fünf Fragen für Ihre eigene Organisation',
      selbstcheck: [
        'Welche Entscheidungen darf ein Agent bei Ihnen ohne Rückfrage treffen?',
        'Welche Regeln sind heute nur Konvention und nirgends hinterlegt?',
        'An welcher Stelle wird eine Regel geprüft — vor der Aktion oder danach?',
        'Wer sieht die Trajektorie eines Laufs, und wie lange bleibt sie lesbar?',
        'Woran würden Sie merken, dass ein Agent das Ziel auf unerwünschtem Weg erreicht hat?'
      ],
      ctaTitel: 'Weiterdenken',
      ctaText: 'Das Whitepaper zu agentischer KI und Prozess-Governance vertieft diese Fragen.',
      ctaButton: 'Kontakt aufnehmen'
    },

    status: {
      erfuellt: 'erfüllt',
      verletzt: 'verletzt',
      nicht_anwendbar: 'nicht anwendbar'
    },

    a11y: {
      fsmGestoppt: 'Das imperative Modell ist stehen geblieben: für diese Störung ist keine Transition definiert.',
      agentNeu: 'Der Agent hat einen neuen Pfad durch den Handlungsraum gewählt.',
      reduziert: 'Bewegung ist reduziert: die Darstellung wechselt ohne Animation.'
    }
  };

  /** Die Fallzeile im Kopf, in jedem Akt identisch. */
  t.fallZeile = function () {
    var f = t.fall;
    return [f.nummer, f.person, f.anlass, f.dauer].join(' · ');
  };

  /** Betrag in deutscher Schreibweise. */
  t.euro = function (n) {
    return Number(n || 0).toFixed(2).replace('.', ',') + ' €';
  };

  /** Simulierte Laufzeit als Sekundenangabe. */
  t.zeit = function (ms) {
    return '+' + (Number(ms || 0) / 1000).toFixed(1).replace('.', ',') + ' s';
  };

  /** Werkzeugnamen bleiben technisch — sie stehen im Log und in den Regeln. */
  t.werkzeug = {
    reiseantrag_stellen: 'reiseantrag_stellen',
    genehmigung_anfordern: 'genehmigung_anfordern',
    hotel_buchen: 'hotel_buchen',
    beleg_pruefen: 'beleg_pruefen',
    beleg_schaetzen: 'beleg_schaetzen',
    abrechnung_einreichen: 'abrechnung_einreichen',
    selbst_freigeben: 'selbst_freigeben',
    erstattung_ausloesen: 'erstattung_ausloesen'
  };

  /** Liest eine Regel in lesbares Deutsch zurueck. */
  t.regelLesbar = function (c) {
    var z = HR.constraints.zusammenfassung(c);
    var art = t.screen3.arten[c.kind] || c.kind;
    var teile = [art + ' — ' + c.target];
    if (z.bedingung && z.bedingung.type === 'feld_vergleich') {
      teile.push('wenn ' + z.bedingung.feld + ' ' + z.bedingung.op + ' ' + z.bedingung.wert + ' €');
    }
    var f = z.forderung;
    if (f) {
      if (f.type === 'vorheriger_aufruf') {
        teile.push('vorher ' + f.tool + (f.mit_ergebnis ? ' mit Ergebnis ' + f.mit_ergebnis : '') + ' erforderlich');
      } else if (f.type === 'folgender_aufruf') {
        teile.push(f.tool + ' muss folgen');
      } else if (f.type === 'kein_aufruf') {
        teile.push(f.tool + ' ist ausgeschlossen');
      }
    }
    return teile.join(', ');
  };

  HR.copy = t;
})(window.HR = window.HR || {});
