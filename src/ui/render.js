/**
 * Renderhilfe statt Framework: Zustand hinein, DOM des aktiven Bildschirms neu,
 * Ereignisse delegiert ueber data-aktion. Vier Bildschirme brauchen nicht mehr.
 */
(function (HR) {
  'use strict';

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Baut ein Attribut nur, wenn ein Wert vorliegt. */
  function attr(name, wert) {
    return (wert === null || wert === undefined || wert === false) ? '' : ' ' + name + '="' + esc(wert) + '"';
  }

  /**
   * @param {string} aktion Kennung fuer die Delegation
   * @param {string} beschriftung sichtbarer Text
   * @param {{klasse?:string, wert?:string, deaktiviert?:boolean, gedrueckt?:boolean,
   *          label?:string}} [opt] `label` nur, wo der sichtbare Text fuer sich
   *          genommen mehrdeutig waere; er muss darin enthalten bleiben.
   */
  function knopf(aktion, beschriftung, opt) {
    opt = opt || {};
    return '<button type="button" class="knopf' + (opt.klasse ? ' ' + opt.klasse : '') + '"' +
      attr('data-aktion', aktion) + attr('data-wert', opt.wert) +
      (opt.deaktiviert ? ' disabled' : '') +
      attr('aria-pressed', opt.gedrueckt === undefined ? null : String(opt.gedrueckt)) +
      attr('aria-label', opt.label) +
      '>' + esc(beschriftung) + '</button>';
  }

  var behandler = {};

  /** Registriert eine Aktion. Aufruf: (wert, ereignis, element) */
  function auf(aktion, fn) { behandler[aktion] = fn; }

  function delegieren(wurzel) {
    wurzel.addEventListener('click', function (ev) {
      var el = ev.target.closest ? ev.target.closest('[data-aktion]') : null;
      if (!el || !wurzel.contains(el)) return;
      var fn = behandler[el.getAttribute('data-aktion')];
      if (!fn) return;
      ev.preventDefault();
      fn(el.getAttribute('data-wert'), ev, el);
    });
    wurzel.addEventListener('keydown', function (ev) {
      var el = ev.target;
      if (!el || !el.getAttribute) return;
      if (ev.key === 'Enter' && el.getAttribute('data-enter')) {
        var fnE = behandler[el.getAttribute('data-enter')];
        if (!fnE) return;
        ev.preventDefault();
        fnE(el.value, ev, el);
        return;
      }
      // Aufklappbare Zeilen sind keine Knoepfe, muessen aber wie welche reagieren.
      if ((ev.key === 'Enter' || ev.key === ' ') && el.getAttribute('data-aktion') &&
          el.tagName !== 'BUTTON' && el.tagName !== 'A') {
        var fnA = behandler[el.getAttribute('data-aktion')];
        if (!fnA) return;
        ev.preventDefault();
        fnA(el.getAttribute('data-wert'), ev, el);
      }
    });
  }

  var bildschirme = {};
  /** @param {number} n Aktnummer 0 bis 5 @param {{zeichnen:Function, nach?:Function}} modul */
  function bildschirm(n, modul) {
    bildschirme[n] = modul;
    HR.screens = HR.screens || {};
    HR.screens[n] = modul;   // fuer Tests und den Vortragsmodus zugaenglich
  }

  /**
   * Der zuletzt gezeichnete Akt und die zuletzt bekannte Fokusstelle.
   * Beides zusammen entscheidet, wo der Fokus nach dem Neuzeichnen steht:
   * nach einem Aktwechsel auf der Ueberschrift, sonst dort, wo er vorher war.
   */
  var letzterAkt = null;
  var letzteMarke = null;

  function zeichnen(zustand) {
    var wechsel = letzterAkt !== null && letzterAkt !== zustand.akt;
    for (var n = HR.store.AKT_MIN; n <= HR.store.AKT_MAX; n++) {
      var el = document.getElementById('akt-' + n);
      if (!el) continue;
      var aktiv = zustand.akt === n;
      el.hidden = !aktiv;
      if (!aktiv) continue;
      var modul = bildschirme[n];
      if (!modul) continue;
      var verloren = HR.a11y ? HR.a11y.fokusVerloren() : true;
      var marke = HR.a11y ? HR.a11y.fokusMerken(el) : null;
      if (marke) letzteMarke = marke;
      // Rahmensatz und Ruecknahme kommen aus der Huelle, nicht aus dem Akt.
      // So bekommt auch Akt 2 beide Zeilen, ohne dass seine Datei angefasst wird.
      el.innerHTML = rahmenMarkup(n) + modul.zeichnen(zustand) + rueckblickMarkup(n, zustand);
      if (modul.nach) modul.nach(el, zustand);
      fokusSetzen(el, wechsel, marke, verloren);
    }
    letzterAkt = zustand.akt;
    aktleisteZeichnen(zustand);
    fallZeileZeichnen();
  }

  /**
   * Nach dem Aktwechsel steht der Fokus auf der Ueberschrift des neuen Akts —
   * gleich, ob per Aktleiste, Tastatur oder Vortragsmodus gewechselt wurde.
   * Innerhalb eines Akts wird das ersetzte Bedienelement wieder aufgesucht;
   * war der Fokus schon vorher verloren (etwa weil ein Knopf waehrend des Laufs
   * gesperrt war), greift die zuletzt bekannte Stelle.
   */
  function fokusSetzen(el, wechsel, marke, verloren) {
    if (!HR.a11y) return;
    if (wechsel) {
      letzteMarke = null;
      HR.a11y.zurUeberschrift(el);
      return;
    }
    if (marke) { HR.a11y.fokusHerstellen(el, marke); return; }
    if (verloren && letzteMarke) HR.a11y.fokusHerstellen(el, letzteMarke);
  }

  /** Ein Satz zu Beginn des Akts. Er sagt, worum es hier geht, und sonst nichts. */
  function rahmenMarkup(akt) {
    var text = HR.copy.rahmen[akt];
    if (!text) return '';
    return '<p class="aktrahmen">' + esc(text) + '</p>';
  }

  /**
   * Beobachtung, Grund, Bedeutung — das eine Muster fuer die Zusammenfassung
   * nach einem Lauf. Es steht hier und nur hier; die Akte rufen es auf, statt
   * sich je eine eigene Form auszudenken.
   * @param {?Object} befund aus HR.copy.befund
   * @returns {string} HTML, leer wenn kein Befund vorliegt
   */
  function befundMarkup(befund) {
    if (!befund) return '';
    var l = HR.copy.befundLabel;
    var h = ['<div class="befund">'];
    if (befund.mitTitel) h.push('<p class="befund__titel">' + esc(l.titel) + '</p>');
    ['beobachtung', 'grund', 'bedeutung'].forEach(function (schluessel) {
      if (!befund[schluessel]) return;
      h.push('<p class="befund__zeile befund__zeile--' + schluessel + '">' +
        '<span class="befund__label">' + esc(l[schluessel]) + '</span> ' +
        '<span class="befund__text">' + esc(befund[schluessel]) + '</span></p>');
    });
    h.push('</div>');
    return h.join('');
  }

  /**
   * Akt 2 bekommt seinen Befund aus der Huelle — seine eigene Datei bleibt
   * unangetastet. Er erscheint erst, wenn der Besucher den Lauf selbst
   * ausgeloest hat: vorher gaebe es nichts zu beobachten.
   */
  function akt2Gelaufen(zustand) {
    if (!zustand) return true;   // ohne Zustand (Tests) steht das Muster da
    return !!(zustand.lauf && zustand.laufKontext && zustand.laufKontext.screen === 2);
  }

  /** Die Ruecknahme am Ende: was der Besucher gerade gesehen hat, ohne Fachsprache. */
  function rueckblickMarkup(akt, zustand) {
    var text = HR.copy.rueckblick[akt];
    if (!text) return '';
    var befund = (akt === 2 && akt2Gelaufen(zustand)) ? befundMarkup(HR.copy.befund.akt2) : '';
    return '<aside class="rueckblick">' +
      '<p class="rueckblick__frage">' + esc(HR.copy.rahmenFrage) + '</p>' +
      '<p class="rueckblick__text">' + esc(text) + '</p>' + befund + '</aside>';
  }

  /**
   * Wo der Besucher steht. Akt 0 ist der Vorspann und bekommt keine Zahl —
   * gezaehlt wird ab Akt 1, damit „Schritt 5 von 5" auch wirklich der letzte ist.
   */
  function schrittMarkup(zustand) {
    var s = HR.copy.seite;
    var text = zustand.akt === 0 ? s.vorspann : s.schritt.replace('{n}', String(zustand.akt));
    return '<p class="aktleiste__schritt">' + esc(text) + '</p>';
  }

  /**
   * Die Aktleiste zeigt die fuenf Akte. Akt 0 ist der Vorspann und steht nicht
   * darin; solange er laeuft, ist kein Punkt als aktuell markiert.
   * Jeder Punkt traegt zwei Zeilen: was dort geschieht, und darunter den Namen
   * des Akts. Die Beschriftung fuehrt, der Name bleibt.
   * @returns {string} HTML, auch fuer die Tests
   */
  function aktleisteMarkup(zustand) {
    var html = schrittMarkup(zustand);
    for (var i = 1; i <= HR.store.AKT_MAX; i++) {
      var aktuell = zustand.akt === i;
      html += '<button type="button" class="aktleiste__punkt' +
        (aktuell ? ' ist-aktiv' : '') + '" data-aktion="akt" data-wert="' + i + '"' +
        ' aria-current="' + (aktuell ? 'step' : 'false') + '">' +
        '<span class="aktleiste__nr">' + i + '</span>' +
        '<span class="aktleiste__text">' + esc(HR.copy.akte[i - 1]) +
        '<span class="aktleiste__untertitel">' + esc(HR.copy.akteUntertitel[i - 1]) +
        '</span></span></button>';
    }
    return html;
  }

  function aktleisteZeichnen(zustand) {
    var nav = document.getElementById('aktleiste');
    if (!nav) return;
    nav.innerHTML = aktleisteMarkup(zustand);
  }

  /** Der Fall steht in jedem Akt gleich im Kopf — er wird nie neu geschrieben. */
  function fallZeileZeichnen() {
    var el = document.getElementById('fallzeile');
    if (!el) return;
    var text = HR.copy.fallZeile();
    if (el.textContent !== text) el.textContent = text;
  }

  /** Bewegung nur, wenn der Nutzer sie nicht abbestellt hat. */
  function bewegungErlaubt() {
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  HR.render = {
    esc: esc,
    attr: attr,
    knopf: knopf,
    auf: auf,
    delegieren: delegieren,
    bildschirm: bildschirm,
    zeichnen: zeichnen,
    aktleisteMarkup: aktleisteMarkup,
    schrittMarkup: schrittMarkup,
    rahmenMarkup: rahmenMarkup,
    rueckblickMarkup: rueckblickMarkup,
    befundMarkup: befundMarkup,
    bewegungErlaubt: bewegungErlaubt
  };
})(window.HR = window.HR || {});
