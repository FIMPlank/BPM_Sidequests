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

  function knopf(aktion, beschriftung, opt) {
    opt = opt || {};
    return '<button type="button" class="knopf' + (opt.klasse ? ' ' + opt.klasse : '') + '"' +
      attr('data-aktion', aktion) + attr('data-wert', opt.wert) +
      (opt.deaktiviert ? ' disabled' : '') +
      attr('aria-pressed', opt.gedrueckt === undefined ? null : String(opt.gedrueckt)) +
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
  /** @param {number} n @param {{zeichnen:Function, nach?:Function}} modul */
  function bildschirm(n, modul) {
    bildschirme[n] = modul;
    HR.screens = HR.screens || {};
    HR.screens[n] = modul;   // fuer Tests und den Vortragsmodus zugaenglich
  }

  function zeichnen(zustand) {
    for (var n = 1; n <= 4; n++) {
      var el = document.getElementById('screen-' + n);
      if (!el) continue;
      var aktiv = zustand.screen === n;
      el.hidden = !aktiv;
      if (!aktiv) continue;
      var modul = bildschirme[n];
      if (!modul) continue;
      el.innerHTML = modul.zeichnen(zustand);
      if (modul.nach) modul.nach(el, zustand);
    }
    navZeichnen(zustand);
  }

  function navZeichnen(zustand) {
    var nav = document.getElementById('schrittnav');
    if (!nav) return;
    var html = '';
    for (var i = 1; i <= 4; i++) {
      html += '<button type="button" class="schrittnav__punkt' +
        (zustand.screen === i ? ' ist-aktiv' : '') + '" data-aktion="screen" data-wert="' + i + '"' +
        ' aria-current="' + (zustand.screen === i ? 'step' : 'false') + '">' +
        '<span class="schrittnav__nr">' + i + '</span>' +
        '<span class="schrittnav__text">' + esc(HR.copy.schritte[i - 1]) + '</span></button>';
    }
    nav.innerHTML = html;
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
    bewegungErlaubt: bewegungErlaubt
  };
})(window.HR = window.HR || {});
