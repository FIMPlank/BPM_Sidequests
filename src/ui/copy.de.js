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
      zurueck: 'Zurück',
      zumInhalt: 'Zum Inhalt springen',
      /**
       * Der Fortschritt. Akt 0 ist der Vorspann und traegt keine Schrittzahl —
       * gezaehlt wird erst ab Akt 1, damit „Schritt 5 von 5" auch der letzte ist.
       */
      schritt: 'Schritt {n} von 5',
      vorspann: 'Vorspann, vor Schritt 1',
      vortragHinweis: 'Pfeiltasten wechseln den Akt. 1 bis 3 wirft in Akt 1 eine Störung ein und wählt in Akt 4 einen Ort. r setzt zurück.'
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

    /**
     * Die fuenf Akte der Aktleiste. Akt 0 ist der Vorspann und steht nicht darin.
     * `akte` sagt, was in dem Akt geschieht — das ist die Beschriftung, nach der
     * jemand sucht, der wissen will, wo er ist. Der dramatische Name steht als
     * Unterzeile daneben; er bleibt, er fuehrt nur nicht mehr.
     */
    akte: ['Vergleich', 'Freier Lauf', 'Ihre Regel', 'Ort der Regel', 'Protokoll'],
    akteUntertitel: ['Der Clash', 'Der Preis der Autonomie', 'Sie modellieren', 'Die Architektur', 'Der Audit'],

    /**
     * Je Akt ein Rahmensatz zu Beginn (hoechstens zwoelf Woerter) und eine
     * Ruecknahme am Ende (hoechstens zwanzig Woerter, ohne Fachsprache).
     * Index gleich Aktnummer. Die Ruecknahme zu Akt 2 sagt nur nach, was auf
     * der Flaeche steht — sie warnt nicht und deutet nichts an.
     */
    rahmenFrage: 'Was ist gerade passiert?',

    rahmen: [
      'Ein Auftrag, zwei Wege. Sie entscheiden, welcher zuerst läuft.',
      'Links steht der Ablauf fest. Rechts steht nur, was gelten muss.',
      'Zwei Störungen auf einmal. Der Agent bekommt nur ein Ziel.',
      'Sie schreiben eine Regel, in Ihren Worten.',
      'Dieselbe Regel an drei Orten. Der Ort entscheidet.',
      'Der ganze Lauf, Schritt für Schritt, mit Beleg.'
    ],

    rueckblick: [
      'Sie haben gewählt. Beide Wege bearbeiten denselben Fall.',
      'Das feste Modell blieb stehen. Der Agent plante um und erreichte das Ziel.',
      'Der Agent hat das Ziel erreicht. Keine der hinterlegten Regeln wurde verletzt.',
      'Ihre Regel gehört jetzt zum Raum und wird bei jedem Lauf geprüft.',
      'Der Ort einer Regel bestimmt Dauer, Kosten und das, was offen bleibt.',
      'Jeder Schritt ist nachlesbar: Zeit, Werkzeug, geprüfte Regel und Ort der Prüfung.'
    ],

    /**
     * Der Befund nach einem Lauf. Immer dieselben drei Zeilen, immer in
     * derselben Reihenfolge: was zu sehen war, warum es so kam, was daraus
     * folgt. Das Muster steht einmal in render.js und wird ueberall
     * wiederverwendet — Akt 1 und Akt 4 rufen es selbst auf, Akt 2 bekommt es
     * aus der Huelle, damit seine Datei unangetastet bleibt.
     */
    befundLabel: {
      titel: 'Kurz zusammengefasst',
      beobachtung: 'Beobachtung',
      grund: 'Grund',
      bedeutung: 'Bedeutung'
    },

    befund: {
      akt1: {
        mitTitel: true,
        beobachtung: 'Das feste Modell ist an der Störung stehen geblieben. Der Agent hat weitergearbeitet und den Fall zu Ende gebracht.',
        grund: 'Im festen Ablauf ist für genau diesen Fall kein Übergang modelliert. Der Agent kennt nur das Ziel und die drei Regeln und darf den Weg dorthin selbst wählen.',
        bedeutung: 'Jede weitere Störung verlangt im festen Modell eine weitere Prozessvariante. Im Regelmodell bleibt die Zahl der Regeln dieselbe.'
      },
      // Akt 2 sagt nach, was auf der Fläche steht. Keine Wertung, kein Hinweis,
      // keine Vorwegnahme dessen, was in Akt 3 kommt.
      akt2: {
        beobachtung: 'Der Agent hat das Ziel erreicht. Die Erstattung ist ausgezahlt, die Prüfung meldet null Verstöße.',
        grund: 'Er hat jede hinterlegte Regel eingehalten. Für die Schritte, die er zusätzlich gewählt hat, ist keine Regel hinterlegt.',
        bedeutung: 'Geprüft wird, was hinterlegt ist. Erwartungen, die nirgends hinterlegt sind, kommen in der Prüfung nicht vor.'
      },
      akt4: {
        mitTitel: true,
        beobachtung: 'Dieselbe Regel führt an den drei Orten zu drei verschiedenen Läufen — mit unterschiedlicher Dauer, unterschiedlichen Kosten und unterschiedlich viel, was ungeprüft bleibt.',
        grund: 'Der Ort entscheidet, wann geprüft wird: vorher durch einen Menschen, währenddessen an der Werkzeuggrenze oder erst hinterher im Protokoll.',
        bedeutung: 'Nicht die Regel allein ist die Entscheidung, sondern ihr Ort. Er bestimmt, was ein Lauf an Zeit und Geld kostet und was ungeprüft durchgeht.'
      }
    },

    label: { imperativ: 'IMPERATIV', deklarativ: 'DEKLARATIV' },

    screen1: {
      titel: 'Der Clash',
      lead: 'Ein Prozess, zwei Denkweisen. Links das Modell, das jeden Schritt vorschreibt. Rechts drei Regeln, die einen Raum aufspannen. Starten Sie beide.',
      starten: 'Prozess starten',
      erneut: 'Erneut starten',
      startenMitStoerung: 'Mit dieser Störung starten',
      stoerungTitel: 'Störung einwerfen',
      stoerungWaehlen: 'Störung wählen',
      laufOhneWahl: 'Ohne Störung läuft der Fall wie im Lehrbuch.',
      laufMitWahl: 'Beide Seiten bekommen dieselbe Störung.',
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
      weiterAngebot: 'Der Agent kommt mit jeder Störung zurecht. Was kostet das?',
      /** Jeder Weiterknopf nennt sein Ziel. „Weiter" allein sagt nichts. */
      weiterZuPreis: 'Weiter zu Akt 2: Der Preis der Autonomie'
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
      erneutAusfuehren: 'Denselben Fall mit Ihren Regeln laufen lassen',
      weiterZuArchitektur: 'Weiter zu Akt 4: Die Architektur',
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
      /**
       * Erst die Alltagssprache, dann das Fachwort in Klammern. Wer den Begriff
       * kennt, findet ihn; wer ihn nicht kennt, versteht die Zeile trotzdem.
       */
      zaehler: {
        regeln: 'Regeln',
        tokens: 'Mitgeschickter Text je Lauf (Kontext-Token)',
        kosten: 'Kosten je Lauf',
        freiheit: 'Verbleibender Handlungsspielraum (Freiheitsgrade)',
        verstoesse: 'Verstöße im letzten Lauf'
      },
      zaehlerHinweis: 'Jede Regel schränkt den Handlungsspielraum ein: Freiheitsgrade sind der Anteil der Schritte, die dem Agenten noch erlaubt sind. Kontext-Token sind der Text, den das Modell bei jedem Lauf mitliest — er kostet Geld.',
      einheitCent: 'Cent',
      plotTitel: 'Regeln gegen Verstöße und Kosten',
      plotX: 'Regeln',
      plotVerstoesse: 'Verstöße',
      plotKosten: 'Kosten (Cent)',
      plotLeer: 'Führen Sie einen Lauf aus, um den ersten Punkt zu setzen.',
      durchsetzungTitel: 'Autonomie vorne — Kontrolle hinten?',
      posthoc: 'Hinterher prüfen (Prüfung im Nachgang)',
      runtime: 'Währenddessen abweisen (Leitplanke zur Laufzeit)',
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

    /** Akt 0 — der Vorspann. Eine Ansage, zwei Wege, keine dritte Option. */
    akt0: {
      titel: 'Der Auftrag',
      /**
       * Die Einleitung vor der Wahl. Sie sagt in zwei Saetzen, was hier
       * verglichen wird, wie lange es dauert und dass niemand hier etwas
       * falsch machen kann. Ohne diesen Absatz beginnt die Demo mit einer
       * Entscheidung, deren Folgen der Besucher nicht abschaetzen kann.
       */
      einleitung: 'Diese Demo stellt zwei Arten gegenüber, denselben Vorgang zu erledigen: einen festen Ablauf, in dem jeder Schritt vorher feststeht — und einen Agenten, dem Sie nur das Ziel und ein paar Regeln geben und der den Weg dorthin selbst sucht. Beide bearbeiten hier denselben Fall.',
      dauer: 'Fünf Akte, rund vier Minuten.',
      keineFalscheWahl: 'Sie können hier nichts falsch machen: Beide Wege führen durch dieselben fünf Akte, nichts wird bewertet, und Sie können jeden Akt über die Leiste oben erneut aufrufen.',
      rolle: 'Leiterin Finanzen, Montagmorgen',
      ansage: 'Frau Berger war beim Kunden. Sorgen Sie dafür, dass sie ihr Geld zurückbekommt — regelkonform, und ohne dass ich jeden Beleg selbst ansehe.',
      frage: 'Wie soll das laufen?',
      heute: 'So machen wir es heute',
      agent: 'So würde ein Agent es machen',
      heuteHinweis: 'Ein modellierter Ablauf. Jeder Schritt steht fest, bevor der erste getan ist.',
      agentHinweis: 'Ein Ziel und ein paar Regeln. Den Weg sucht der Agent selbst.',
      gewaehltHeute: 'Sie haben den festen Ablauf gewählt.',
      gewaehltAgent: 'Sie haben den Agenten gewählt.',
      seiteAktiv: 'Ihr Weg',
      seitePassiv: 'Der andere Weg'
    },

    /** Akt 4 — die Architektur. Der Ort einer Regel ist die eigentliche Entscheidung. */
    akt4: {
      titel: 'Die Architektur',
      frage: 'Wo soll diese Regel greifen?',
      regelLabel: 'Ihre Regel',
      ersatzregel: 'Sie haben noch keine eigene Regel geschrieben. Solange gilt die Beispielregel.',
      gleicheLage: 'Alle drei Läufe bekommen denselben Fall und dieselben zwei Störungen.',
      /**
       * Der Fachbegriff allein — er steht in Spaltenköpfen und im Protokoll,
       * wo Platz für einen Satz fehlt und wo er wörtlich so gebraucht wird
       * wie im Whitepaper.
       */
      orte: {
        imperativ: 'Imperativer Kontrollpunkt',
        leitplanke: 'Leitplanke zur Laufzeit',
        nachgang: 'Prüfung im Nachgang'
      },
      /**
       * Dieselben drei Orte als Überschrift der Karten: erst der Zeitpunkt in
       * Alltagssprache — vorher, währenddessen, hinterher —, dann der Begriff.
       */
      orteLang: {
        imperativ: 'Vorher freigeben — Imperativer Kontrollpunkt',
        leitplanke: 'Währenddessen abweisen — Leitplanke zur Laufzeit',
        nachgang: 'Hinterher prüfen — Prüfung im Nachgang'
      },
      ortHinweis: {
        imperativ: 'Der Lauf hält an und wartet: ein Mensch gibt frei, bevor gebucht wird. Das ist eine weitere Prozessvariante.',
        leitplanke: 'Die Werkzeuggrenze weist den Aufruf ab, während der Agent läuft. Niemand muss warten, der Agent sucht einen anderen Weg.',
        nachgang: 'Niemand hält etwas auf. Der Verstoß fällt erst danach auf und steht im Protokoll.'
      },
      masseHinweis: 'Die drei Maße je Karte beantworten dieselbe Frage aus drei Richtungen: wie lange ein Lauf dauert, was er an Geld kostet und wie viel bereits ausgezahlt war, bevor jemand hingesehen hat.',
      masse: {
        zeit: 'Durchlaufzeit',
        kosten: 'Kosten je Lauf',
        risiko: 'Ungeprüft ausgezahlt (Restrisiko)'
      },
      kontextanteil: 'davon mitgeschickter Text (Kontext)',
      schritteEinheit: 'Schritte',
      risikoKeins: 'nichts offen',
      risikoOffen: 'ausgezahlt, bevor jemand hinsah',
      waehlen: 'Diesen Ort wählen',
      weiterZuAudit: 'Weiter zu Akt 5: Der Audit',
      gewaehlt: 'Ihr Ort',
      ablaufTitel: 'Was in diesem Lauf passiert ist',
      kontrollpunktSchritt: 'Freigabe durch einen Menschen',

      // — Teil 2: die Kombination —
      kombiTitel: 'Drei Regeln, drei Orte',
      kombiLead: 'Weisen Sie jeder Regel einen Ort zu. Die Mischung ergibt eine Architektur.',
      spalteRegel: 'Regel',
      regelnamen: {
        eigen: 'Ihre Regel',
        zahlung: 'Erstattungen über 1.000 €',
        beleg: 'Belegpflicht'
      },
      offen: 'Noch nicht zugewiesen',
      zuruecksetzen: 'Zuordnung zurücksetzen',

      // — Die verschmolzene Flaeche —
      flaecheTitel: 'Eine Fläche',
      flaecheHinweis: 'Die Schranken sind die harten Kontrollpunkte. Dazwischen sucht der Agent seinen Weg selbst.',
      plotHinweis: 'Ein Punkt je Lauf dieser Sitzung — aus allen Akten, nicht nur aus diesem.'
    },

    /**
     * Die vier Muster in der Sprache des Whitepapers. Das Ergebnis wird
     * benannt, nicht bewertet — auch dann, wenn es keine gute Idee war.
     */
    muster: {
      satz: 'Sie haben gerade {muster} gebaut.',
      m1: {
        name: 'Muster 1 — Imperative Steuerung mit KI-Unterstützung',
        beschreibung: 'Der Ablauf steht fest, die KI arbeitet innerhalb vorgegebener Schritte zu.',
        einsatz: 'Typisch dort, wo jeder Schritt belegt sein muss: Zahlungsverkehr, Meldewesen.',
        entartet: 'Sie haben den alten Prozess nachgebaut — mit Zusatzkosten für die KI.'
      },
      m2: {
        name: 'Muster 2 — Deklarative Ziele, imperative Kontrollpunkte',
        beschreibung: 'Der Agent wählt seinen Weg frei und muss an festen Punkten durch eine Freigabe.',
        einsatz: 'Typisch dort, wo Tempo zählt, aber einzelne Entscheidungen einen Menschen brauchen.'
      },
      m3: {
        name: 'Muster 3 — Deklarativer Handlungsraum mit Leitplanken',
        beschreibung: 'Kein Mensch wartet. Die Werkzeuggrenze weist ab, was nicht erlaubt ist.',
        einsatz: 'Typisch für Vorgänge mit hoher Stückzahl und klar beschreibbaren Grenzen.'
      },
      m4: {
        name: 'Muster 4 — Freie Autonomie mit nachgelagerter Prüfung',
        beschreibung: 'Nichts hält den Agenten auf. Abweichungen fallen erst im Protokoll auf.',
        einsatz: 'Typisch für kleine Beträge, wo Prüfen teurer wäre als der mögliche Schaden.',
        entartet: 'Sie prüfen nur noch, was schon passiert ist.'
      }
    },

    screen4: {
      titel: 'Der Audit',
      frage: 'Könnten Sie das im Audit belegen?',
      spalten: ['#', 'Zeit', 'Akteur', 'Aktion', 'Tool', 'Input (gekürzt)', 'Platzierung', 'Constraint-Check', 'Ergebnis'],
      /**
       * Die Spaltenköpfe bleiben technisch — sie gehen so in den Export und in
       * eine Prüfung. Der Satz darüber sagt in Alltagssprache, was sie meinen.
       */
      spaltenHinweis: 'Zwei Spalten sind Fachsprache: „Platzierung" ist der Ort, an dem eine Regel gegriffen hat — vorher durch einen Menschen, währenddessen an der Werkzeuggrenze oder erst hinterher. „Constraint-Check" ist die Regelprüfung: welche Regel bei diesem Schritt geprüft wurde und wie sie ausging.',
      akteur: { agent: 'Agent', system: 'System', leitplanke: 'Leitplanke' },
      aktion: { werkzeug_aufruf: 'Werkzeugaufruf', abgelehnt: 'abgelehnt' },
      geblockt: 'abgelehnt',
      keinCheck: 'keine Regel betroffen',
      jsonExport: 'Als JSON exportieren',
      csvExport: 'Als CSV exportieren',
      diffTitel: 'Der freie Lauf und Ihre Architektur im Vergleich',
      laufA: 'Akt 2 — ohne Ihre Regel',
      laufB: 'Ihre Architektur',
      diffLeer: 'Für den Vergleich braucht es den Lauf aus Akt 2 und einen Lauf mit Ihrer Regel.',
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
      reduziert: 'Bewegung ist reduziert: die Darstellung wechselt ohne Animation.',
      verschmolzen: 'Beide Seiten stehen hier in einer Fläche: Handlungsraum mit harten Schranken darin.',

      /*
       * Beschriftungen, die nur die Vorlesehilfe hoert oder die eine sichtbare
       * Beschriftung ergaenzen, wo sie fuer sich genommen mehrdeutig waere.
       * {n}, {regel} und {ort} werden zur Laufzeit gefuellt.
       */
      fsmDiagramm: 'Imperatives Prozessmodell mit sechs Schritten',
      regelHilfe: 'Ein Satz genügt: Vorgang und Bedingung, etwa „Buchungen über 200 € pro Nacht brauchen eine Freigabe".',
      zuordnungTabelle: 'Zuordnung der drei Regeln zu den drei Orten',
      knopfImKontext: '{knopf}: {kontext}',
      auditTabelle: 'Protokoll des Laufs, je Schritt eine Zeile',
      belegOeffnen: 'Beleg zu Schritt {n} anzeigen',
      belegSchliessen: 'Beleg zu Schritt {n} ausblenden'
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
