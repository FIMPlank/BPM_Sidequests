/**
 * Abhaengigkeitsfreier Testrunner. Laeuft per Doppelklick in tests.html.
 * describe / it / expect / run() — mehr braucht es nicht.
 */
(function (HR) {
  'use strict';

  var suites = [];
  var current = null;

  function describe(name, fn) {
    current = { name: name, tests: [] };
    suites.push(current);
    fn();
    current = null;
  }

  function it(name, fn) {
    if (!current) throw new Error('it() ausserhalb von describe(): ' + name);
    current.tests.push({ name: name, fn: fn });
  }

  function stringify(v) {
    try {
      return typeof v === 'string' ? v : JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  }

  function expect(actual) {
    return {
      toBe: function (exp) {
        if (actual !== exp) {
          throw new Error('erwartet ' + stringify(exp) + ', erhalten ' + stringify(actual));
        }
      },
      toEqual: function (exp) {
        var a = stringify(actual), b = stringify(exp);
        if (a !== b) throw new Error('erwartet ' + b + ', erhalten ' + a);
      },
      toBeTruthy: function () {
        if (!actual) throw new Error('erwartet truthy, erhalten ' + stringify(actual));
      },
      toBeFalsy: function () {
        if (actual) throw new Error('erwartet falsy, erhalten ' + stringify(actual));
      },
      toContain: function (needle) {
        var ok = actual && typeof actual.indexOf === 'function' && actual.indexOf(needle) !== -1;
        if (!ok) throw new Error(stringify(actual) + ' enthaelt nicht ' + stringify(needle));
      },
      toBeGreaterThan: function (n) {
        if (!(actual > n)) throw new Error(stringify(actual) + ' ist nicht groesser als ' + n);
      },
      toBeGreaterThanOrEqual: function (n) {
        if (!(actual >= n)) throw new Error(stringify(actual) + ' ist nicht >= ' + n);
      },
      toBeLessThan: function (n) {
        if (!(actual < n)) throw new Error(stringify(actual) + ' ist nicht kleiner als ' + n);
      },
      toBeCloseTo: function (n, digits) {
        var d = typeof digits === 'number' ? digits : 6;
        if (Math.abs(actual - n) > Math.pow(10, -d) / 2) {
          throw new Error(stringify(actual) + ' ist nicht nahe ' + n);
        }
      },
      toThrow: function () {
        var threw = false;
        try { actual(); } catch (e) { threw = true; }
        if (!threw) throw new Error('erwartet: Ausnahme, es wurde keine geworfen');
      }
    };
  }

  function run(mount) {
    var total = 0, failed = 0;
    var out = [];
    for (var s = 0; s < suites.length; s++) {
      var suite = suites[s];
      var rows = [];
      for (var t = 0; t < suite.tests.length; t++) {
        var test = suite.tests[t];
        total++;
        try {
          test.fn();
          rows.push({ ok: true, name: test.name, msg: '' });
        } catch (err) {
          failed++;
          rows.push({ ok: false, name: test.name, msg: err && err.message ? err.message : String(err) });
        }
      }
      out.push({ name: suite.name, rows: rows });
    }
    if (mount) render(mount, out, total, failed);
    return { total: total, failed: failed, suites: out };
  }

  function render(mount, out, total, failed) {
    var html = '';
    html += '<p class="t-summary ' + (failed ? 'is-rot' : 'is-gruen') + '">' +
      total + ' Tests, ' + failed + ' Fehler</p>';
    for (var i = 0; i < out.length; i++) {
      html += '<section class="t-suite"><h2>' + esc(out[i].name) + '</h2><ul>';
      for (var j = 0; j < out[i].rows.length; j++) {
        var r = out[i].rows[j];
        html += '<li class="' + (r.ok ? 'is-gruen' : 'is-rot') + '">' +
          (r.ok ? '✓ ' : '✗ ') + esc(r.name) +
          (r.ok ? '' : '<br><code>' + esc(r.msg) + '</code>') + '</li>';
      }
      html += '</ul></section>';
    }
    mount.innerHTML = html;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  HR.test = { describe: describe, it: it, expect: expect, run: run, suites: suites };
  window.describe = describe;
  window.it = it;
  window.expect = expect;
})(window.HR = window.HR || {});
