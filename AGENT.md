# Background Agent Workflow: Handlungsraum-Sandbox v2

You are a background agent working unattended on an existing repository. No human will answer questions. Each invocation does **one task**, verifies it, commits it, and exits.

---

## 1. Contract

- **One task per invocation.** Never start a second task, however small the first turned out to be.
- **Never ask.** Underspecified? Choose, append one line to `DECISIONS.md`, continue.
- **Never push to `main`.** All work lands on `v2-narrative`. The live site is served from `main` and must stay working while you build.
- **Never touch the protected list** (§6).
- **Idempotent.** If the task's acceptance criterion already passes, mark it `done` and exit without editing.
- Every task ends in exactly one of: `done`, `blocked`, or an untouched tree.

### Token discipline

Read `STATE.md` first — it is the only file you must read every time. Then read only the files your task names. Never re-read this spec, never print file contents into your output, use `rg` with narrow patterns, keep source files under 200 lines.

---

## 2. The loop

```
1. Read STATE.md
2. git checkout v2-narrative   (create from main if absent)
3. Pick the first task whose status is `todo` and whose deps are all `done`
4. Set it to `wip` in STATE.md, commit that line alone
5. Do the task — only the files it names
6. Verify (§4)
7. Green → set `done`, commit as `v2-<ID>: <what>`, exit
   Red after 3 fix attempts → set `blocked` with a one-line reason, git restore
   the work, commit only the STATE.md line, exit
8. No eligible task → open a PR from v2-narrative to main, exit
```

`STATE.md` is the single source of truth and the whole memory between invocations. One line per task:

```
V2-03 | done    | Akt 0 | 2026-07-29T02:14Z | 3 files
V2-04 | wip     | Akt 1 Reihenfolge | ...
V2-07 | blocked | Platzierungen | Trace-Neuberechnung kollidiert mit guardrail.js
```

Append notes below the table; never rewrite history above it.

---

## 3. Why v2 exists

Two defects in the shipped build. Fixing the second is the point.

**A — the visitor is a spectator until screen 3.** Press a button, watch, press again, watch. No orientation, no protagonist, no question of their own.

**B — the hybrid, the actual thesis, is invisible.** The imperative panel breaks in screen 1 and is never seen again. The demo currently argues "rigid loses, autonomous wins, then we tame it." The whitepaper argues the opposite: imperative control points *inside* declarative freedom spaces. That architecture is never shown. A toggle among five counters is not enough.

The target shape: **one case, five acts.**

> **Reisekostenabrechnung Nr. 2847 · Frau Berger · Kundentermin Verona · 3 Nächte**

persistent in the header, under a clickable five-act spine. Each act opens with one framing sentence (≤ 12 words) and closes with `Was ist gerade passiert?` (≤ 20 words, no jargon).

---

## 4. Verification

Two paths, both must be satisfiable:

- **Local, human:** double-clicking `tests.html` shows `n Tests, 0 Fehler`. The no-install/no-build/`file://` guarantee is unchanged and non-negotiable.
- **Yours, headless:** `node tests/run-node.js` runs the same files with a stubbed `window`. This exists so you can verify without a browser. It is a build-time convenience only — the shipped site must never depend on it.

Gate before every commit: headless suite green, plus the task's own acceptance criterion, plus `rg -n "type=\"module\"|localStorage|sessionStorage|cdn\.|fonts\.googleapis" src/ index.html` returns nothing.

---

## 5. Task queue

Do them in ID order unless deps say otherwise. Sizes: S ≈ one file, M ≈ two or three, L ≈ a new subsystem.

| ID | Dep | Size | Task | Acceptance |
|---|---|---|---|---|
| V2-00 | — | S | Make `tests/run-node.js` run the full suite headlessly with a stubbed `window`/`document`. Add nothing to the shipped page. | `node tests/run-node.js` exits 0 and reports the same count as `tests.html` |
| V2-01 | 00 | M | Act spine (five labels, current marked, clickable) + persistent case header. `?akt=N` routing, `?screen=N` kept as alias. | All five acts reachable by click and by URL; header text constant across acts |
| V2-02 | 01 | S | Slots for the framing sentence and the `Was ist gerade passiert?` line in every act, wired to `copy.de.js`. Leave placeholder strings. | Both slots render in all five acts |
| V2-03 | 01 | M | **Akt 0 — Der Auftrag.** Single panel, goal in a manager's words. Two buttons: `So machen wir es heute` / `So würde ein Agent es machen`. Choice reveals the split with the chosen side highlighted, other side greyed but present, and starts that run. | First interaction on the page is a choice; both choices lead into Akt 1 with the correct side active |
| V2-04 | 03 | S | **Akt 1.** Visitor picks the disturbance *before* running. Promote `Modellierte Varianten` to the act's primary readout. | Disturbance selection precedes the run; counter is the largest number in the act |
| V2-05 | 01 | M | **Akt 3.** Remove the enforcement toggle and the SVG plot (they move to Akt 4). One large primary number (`Verstöße im letzten Lauf`); the other four demoted to one quiet line. | Rule editor still compiles and enforces; exactly one large number in the act |
| V2-06 | 00 | S | New `src/domain/latency.js`: Durchlaufzeit from step count plus a fixed wait per human-approval step. Unit tests. | ≥ 6 tests green; pure, no DOM |
| V2-07 | 05,06 | L | **Akt 4, part 1 — Platzierung.** „Wo soll diese Regel greifen?" Three selectable placements, each re-running the same case with the same disturbances: `Imperativer Kontrollpunkt` (hard gate, extra variant + Wartezeit), `Leitplanke zur Laufzeit` (tool boundary rejects, agent replans), `Prüfung im Nachgang` (found afterwards, money already gone). Each shows `Durchlaufzeit`, `Kosten je Lauf`, `Restrisiko`. | The three placements produce three measurably different trajectories; a test asserts the traces differ |
| V2-08 | 07 | L | **Akt 4, part 2 — Kombination.** Three rules (the visitor's own + Zahlung über 1.000 € + Belegpflicht) assigned to three placement slots. On completion, name the result in the paper's vocabulary, e.g. „Sie haben gerade **Muster 2 — Deklarative Ziele, imperative Kontrollpunkte** gebaut", with one line of description and the typical use case. Map every configuration to one of the four patterns. Handle degenerates honestly: all-imperative → „Sie haben den alten Prozess nachgebaut — mit Zusatzkosten für die KI."; all-post-hoc → „Sie prüfen nur noch, was schon passiert ist." | Every reachable configuration maps to a named pattern; mapping is unit-tested exhaustively |
| V2-09 | 07 | L | **The merge visual.** Until Akt 4 the two paradigms are separate panels with a seam. In Akt 4 they become **one canvas**: the imperative chain re-forms as hard vertical gate bars *inside* the Handlungsraum terrain; the agent's trace runs free between them and must pass through them. Animate the merge once, ~900ms, on first entry. `prefers-reduced-motion` → cut to the merged state with a caption. | Panels visibly become one canvas; no seam remains in Akt 4; reduced-motion path verified |
| V2-10 | 08 | S | Move the SVG plot into Akt 4 (x = rules, y = Verstöße and Kosten, one point per run in the session). | Plot accumulates across the whole session, not per act |
| V2-11 | 08 | M | **Akt 5.** Add a `Platzierung` column to the trajectory log so each check is attributable to an architecture choice. A/B diff now compares the visitor's hybrid against the unconstrained Akt 2 run. | Export round-trips with the new column; diff highlights exactly the differing steps |
| V2-12 | 11 | S | Presenter mode: `←`/`→` across five acts; `1`–`3` inject disturbances in Akt 1 and select placements in Akt 4. Demote the `Modus:` pill from the header to the footer. | Full keyboard run-through works; pill no longer in the header |
| V2-13 | 12 | M | Copy pass. Write all framing and `Was ist gerade passiert?` lines now that behaviour is settled. German, sentence case, active voice, no exclamation marks, no marketing register. | Every act has both lines within the length limits; all strings live in `copy.de.js` |
| V2-14 | 13 | S | Rewrite `DEMO.md` for five acts; append to `HANDOVER.md` (additive — keep the existing deployment section). Update `README.md` screen list. | A cold reader can run the demo from `DEMO.md` in under four minutes |

**Priority under pressure:** V2-07, V2-08, V2-09 are the reason this revision exists. If the queue cannot be finished, a rough Akt 4 beats a polished everything-else.

---

## 6. Protected — do not modify

- `src/domain/*` except the new `latency.js`
- `src/agent/*`, `functions/`, `supabase/`, `tests/harness.js`
- **Akt 2 in its entirety.** Zero violations + „Sind Sie damit einverstanden?" is the strongest beat in the build. Do not add a hint, a tooltip, a warning, or a foreshadow. Do not adjust its timing.
- The DSGVO behaviour, and the no-install / no-build / no-server / `file://` / `window.HR` / no-storage-API constraints
- `main`

---

## 7. Escalation

On `blocked`: one line in `STATE.md`, restore the working tree, commit only the state line, exit. Do not attempt a workaround that touches protected files. Do not carry a broken tree into the next invocation.

If three tasks are blocked, stop picking up work: open the PR with what exists, title it `v2 (unvollständig)`, and list the blockers in the body.

---

## 8. Done

All tasks `done` → open a PR from `v2-narrative` to `main` with: the act-by-act summary, the `DECISIONS.md` entries the human may want to overrule, and a note that the live site is unaffected until merge.

---

## Appendix — how to run this

Both options need no admin rights and no local installs.

**A · GitHub Actions, browser-configured.** Install the Claude Code GitHub App on the repo, add `ANTHROPIC_API_KEY` under Settings → Secrets, and add a workflow on a schedule (e.g. every 30 minutes) whose prompt is: *"Read AGENT.md and STATE.md. Execute exactly one task per the loop in §2. Then stop."* Node is present on the runner, so §4's headless path works. The queue drains itself while the machine is off.

**B · Local headless loop.** In the repo, with Claude Code already installed:

```
for i in $(seq 1 20); do
  claude -p "Read AGENT.md and STATE.md. Execute exactly one task per the loop in §2. Then stop." \
    --allowedTools "Bash,Read,Write,Edit,Glob,Grep"
done
```

Each iteration is a fresh context that reads only `STATE.md` plus the files its task names — which is what keeps twenty invocations cheaper than one long run.

Save this file as `AGENT.md` in the repository root.
