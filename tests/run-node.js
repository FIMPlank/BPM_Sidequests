/**
 * Kopflos laufender Testlauf fuer den Hintergrundagenten.
 *
 * Er laedt genau die Dateien, die `tests.html` laedt — die Liste wird aus der
 * Datei selbst gelesen, damit sie nicht auseinanderlaufen kann — und fuehrt sie
 * gegen ein knapp gehaltenes `window`/`document` aus.
 *
 * Diese Datei gehoert nicht zur ausgelieferten Seite. Weder `index.html` noch
 * `tests.html` verweisen auf sie; der Doppelklick-Weg bleibt unveraendert.
 *
 * Aufruf:  node tests/run-node.js
 * Rueckgabe: 0 wenn alle Tests gruen sind, sonst 1.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var WURZEL = path.resolve(__dirname, '..');
var TESTSEITE = path.join(WURZEL, 'tests.html');

// — Attrappe des Browsers ————————————————————————————————————
// `window` ist im Browser das globale Objekt. Genau das wird hier nachgebaut:
// nur so wird aus `window.describe = ...` in der Harness eine globale Funktion,
// die die Testdateien anschliessend unqualifiziert aufrufen koennen.

function knotenAttrappe() {
  var knoten = {
    tagName: 'DIV',
    className: '',
    innerHTML: '',
    textContent: '',
    hidden: false,
    style: {},
    dataset: {},
    childNodes: [],
    classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
    setAttribute: function () {},
    getAttribute: function () { return null; },
    removeAttribute: function () {},
    appendChild: function (k) { knoten.childNodes.push(k); return k; },
    removeChild: function () {},
    insertBefore: function (k) { knoten.childNodes.unshift(k); return k; },
    addEventListener: function () {},
    removeEventListener: function () {},
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    closest: function () { return null; },
    contains: function () { return false; },
    scrollIntoView: function () {},
    click: function () {},
    focus: function () {}
  };
  return knoten;
}

/**
 * Setzt einen globalen Wert nur, wenn er fehlt. Neuere Node-Versionen legen
 * einige Globale (etwa `navigator`) als reine Lesezugriffe an; ein Zuweisen
 * wuerde im strikten Modus werfen. Fehlt der Wert, wird er definiert.
 */
function globalSetzen(name, wert) {
  var g = globalThis;
  if (g[name] !== undefined && g[name] !== null) return;
  try {
    g[name] = wert;
  } catch (e) {
    Object.defineProperty(g, name, { value: wert, writable: true, configurable: true });
  }
}

function browserAufsetzen() {
  var g = globalThis;

  globalSetzen('window', g);          // wie im Browser: window === globales Objekt

  globalSetzen('document', {
    readyState: 'complete',
    documentElement: knotenAttrappe(),
    body: knotenAttrappe(),
    head: knotenAttrappe(),
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    createElement: function () { return knotenAttrappe(); },
    addEventListener: function () {},
    removeEventListener: function () {}
  });

  globalSetzen('location', { search: '', hash: '', origin: 'null', href: 'file:///', protocol: 'file:' });
  globalSetzen('navigator', { userAgent: 'node' });

  // Ohne gesetzte Praeferenz meldet HR.render.bewegungErlaubt() „Bewegung
  // erlaubt“ — dieselbe Vorgabe wie in einem frisch geoeffneten Browser.
  globalSetzen('matchMedia', function () {
    return { matches: false, media: '', addListener: function () {}, removeListener: function () {} };
  });

  if (!g.crypto || typeof g.crypto.randomUUID !== 'function') {
    var nodeCrypto = require('crypto');
    try {
      Object.defineProperty(g, 'crypto', {
        value: {
          randomUUID: function () { return nodeCrypto.randomUUID(); },
          getRandomValues: function (b) { nodeCrypto.randomFillSync(b); return b; }
        },
        writable: true, configurable: true
      });
    } catch (e) { /* dann liefert config.js seine eigene Ersatzkennung */ }
  }

  // Netz und Datei-Export kommen in den Tests nur als Attrappe vor. Beides ist
  // hier bewusst funktionslos: der kopflose Lauf darf nichts nach draussen geben.
  globalSetzen('fetch', function () {
    return Promise.reject(new Error('kein Netz im kopflosen Lauf'));
  });
  globalSetzen('Blob', function (teile) { this.teile = teile; });
  globalSetzen('URL', {});
  if (typeof g.URL.createObjectURL !== 'function') {
    try {
      g.URL.createObjectURL = function () { return 'blob:node'; };
      g.URL.revokeObjectURL = function () {};
    } catch (e) { /* Export wird in den Tests nicht ausgeloest */ }
  }
}

// — Ladeliste aus tests.html ————————————————————————————————

/** @returns {string[]} Pfade relativ zur Wurzel, in der Reihenfolge der Seite. */
function ladeliste() {
  var html = fs.readFileSync(TESTSEITE, 'utf8');
  var muster = /<script\s+src="([^"]+)"\s*>\s*<\/script>/g;
  var treffer = [];
  var m;
  while ((m = muster.exec(html)) !== null) treffer.push(m[1]);
  if (!treffer.length) throw new Error('tests.html nennt keine Skripte');
  return treffer;
}

function laden(relativ) {
  var datei = path.join(WURZEL, relativ);
  var quelle = fs.readFileSync(datei, 'utf8');
  vm.runInThisContext(quelle, { filename: datei });
}

// — Ausgabe ——————————————————————————————————————————————

function berichten(ergebnis) {
  ergebnis.suites.forEach(function (suite) {
    suite.rows.forEach(function (r) {
      if (!r.ok) console.log('  FEHLER  ' + suite.name + ' — ' + r.name + '\n          ' + r.msg);
    });
  });
  console.log(ergebnis.total + ' Tests, ' + ergebnis.failed + ' Fehler');
}

function main() {
  browserAufsetzen();
  ladeliste().forEach(laden);

  if (!globalThis.HR || !globalThis.HR.test) {
    throw new Error('HR.test fehlt — wurde tests/harness.js geladen?');
  }
  var ergebnis = globalThis.HR.test.run(null);
  berichten(ergebnis);
  // exitCode statt process.exit(): so wird die Ausgabe noch vollstaendig
  // geschrieben, bevor der Prozess endet.
  process.exitCode = ergebnis.failed === 0 ? 0 : 1;
}

main();
