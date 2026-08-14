# Phase 4 — Accessibility Remediation Report

**Date:** 2026-08-07
**Branch:** `claude/oakami-waste-intelligence-qt3yd9`
**Scope:** Task 1.1 (accessibility test failures) and Task 1.2 (npm audit)

---

## Result

| Metric | Before | After |
|---|---|---|
| Failing tests | 163 | **0** |
| Passing tests | 1,243 | **1,820** |
| Failing test files | 40 of 47 | **0 of 45** |
| Tests that never executed | 335 | 0 |
| jest-axe violations | 24 | **0** |

The suite is fully green: `1820 passed (1820)`, 45 files.

Two numbers moved for reasons worth stating plainly. **Total tests rose from
1,406 to 1,820** because eleven test files never ran at all — they threw during
import, so their tests were counted as zero rather than as failures. **Test file
count fell from 47 to 45** because the two Playwright e2e specs are now excluded
from the unit run; they belong to a different runner and were only ever
producing resolve errors.

---

## What was actually wrong

The prior plan assumed the failures were missing ARIA attributes and missing
Tailwind classes. Measurement contradicted that. SearchBar, for example, already
had `role="combobox"`, `aria-expanded`, `aria-controls` and `aria-autocomplete`
before any of this work. The real causes, in order of how many tests each blocked:

### 1. Suites that never ran (335 tests)

Eleven files threw at import and therefore reported no failures at all. This is
why Sidebar, Navbar, Header and Footer previously looked clean — none of their
tests existed at runtime.

| File(s) | Cause |
|---|---|
| 8 layout suites | `jest.mock` / `jest.Mock` in a Vitest project; `next/link` factory returned a component instead of a module object |
| `Select.spec.tsx` | Syntax error — `{ target: { value: 'banana') }` — so the file could not parse |
| `Input.spec.tsx` | Imported `lucide-react`, which is not a dependency |
| 2 e2e specs | Playwright specs picked up by the vitest glob |

Once running, these surfaced 76 genuine failures, all now fixed.

### 2. `<button role="option">` inside `role="listbox"`

Select and SearchBar both did this. A listbox may only own options, so it was
simultaneously an axe violation (`aria-required-children`, nested-interactive)
and the reason every `getByRole('button')` query in those suites was ambiguous.
Both now use `<li role="option">` in a `<ul role="listbox">`, driven by
`aria-activedescendant`.

### 3. Genuine component defects

These were real bugs that the tests correctly caught:

- **Disabled controls still fired `onChange`** (Checkbox, Radio, Switch).
- **Space/Enter did not operate** the styled form controls.
- **FilterPanel checkboxes could be checked but never unchecked** — the handler
  received a `ChangeEvent` where it expected a boolean, so the value was always
  truthy.
- **A collapsed Sidebar link had no accessible name**: the text label was removed
  from the DOM while the icon is `aria-hidden`.
- **Pagination's current-page button** replaced the shared button classes rather
  than extending them, silently losing its touch target, focus ring and dark mode.
- **Table's `onSort` never fired** unless `sortBy` was also passed.
- **Header's default variant had no border** — `border-0` cancelled the base
  `border-b` through tailwind-merge.
- **Navbar had no dark-mode variants at all.**
- **Footer drew a separator with nothing to separate** — an empty array is truthy.
- **Drawer's left-slide transform was invalid CSS** (`-translateX(100%)`), and the
  dialog had no accessible name without a title.
- **Badge's dot variant text colours** were defined but gated behind `!isDot`.
- **`aria-label` on elements with no role** (Chart, KPICard loading states) is not
  exposed and is flagged as `aria-prohibited-attr`.
- **`role="button"` on `<article>`** (KPICard) is not a permitted override.

### 4. Assertions that could never pass as written

Roughly a third of the failures were test defects. Each was corrected to assert
the same intent by a valid means, never by weakening the check:

- `jest` fake-timer APIs in a Vitest suite. The throwing `afterEach` also skipped
  cleanup, leaking DOM between tests.
- `clientHeight >= 44` touch-target checks — jsdom performs no layout, so the
  value is always `0`. These now assert the sizing classes.
- `fireEvent.focus()` expected to move focus; it only dispatches the event.
- `expect(a) || expect(b)` used as an "or" — the first assertion throws first.
- Class names asserted against `textContent`.
- `.md:justify-end` and `.bg-black` as selectors — an unescaped colon is invalid,
  and `bg-black/50` is a single class token that `.bg-black` does not match.
- Queries matching both the desktop and mobile navigation, which coexist in the
  DOM because jsdom applies no breakpoints.
- A test that queried the DOM before calling `render()`.
- Controlled components given static props, so typed characters and repeated
  selections could never accumulate.
- A Footer loop that left every variant mounted, producing several `contentinfo`
  landmarks — the very violation it then reported.

One direct conflict was resolved in accessibility's favour: `handles no title`
asserted an `<h1>` that `handles empty title accessibly` requires to be absent.
An empty heading is a WCAG failure, so the heading is now omitted.

---

## WCAG 2.1 Level AA status

All 24 component suites pass their jest-axe audits with zero violations, across
default, open, error, loading, empty, disabled, compact and dark-mode states.

Verified by automated testing:

- **1.3.1 Info and Relationships** — listbox/option structure, fieldset/legend
  grouping, table semantics, breadcrumb and landmark structure
- **1.4.3 Contrast** — light and dark tokens present on every text surface
- **2.1.1 Keyboard** — Space/Enter on form controls, arrow navigation in
  dropdowns, Escape returning focus to its trigger
- **2.4.3 Focus Order** — focus returns to the opener when a dropdown closes
- **2.4.7 Focus Visible** — `focus-visible` rings on every interactive element
- **4.1.2 Name, Role, Value** — dialogs, comboboxes and collapsed navigation
  links all expose an accessible name

**Not covered by this work** (automated tooling cannot establish these):

- Real-browser screen-reader passes (NVDA / VoiceOver)
- Actual rendered contrast ratios — the tests assert that the correct colour
  tokens are applied, not the computed values
- Real-viewport responsive behaviour; jsdom applies no breakpoints
- `prefers-reduced-motion` honouring

---

## Task 1.2 — npm audit: partially remediated

**Started at 34 (1 critical, 18 high). Now 29 (0 critical, 14 high).**

`npm audit fix` changed nothing — every advisory required a major version bump —
so the low-risk upgrades were taken deliberately:

- **bcrypt 5 → 6** clears the critical `tar` advisory and `@mapbox/node-pre-gyp`.
  Verified compatible by generating a hash under bcrypt 5 and confirming bcrypt 6
  produces byte-identical output for the same salt and verifies the v5 hash, so
  stored passwords keep working.
- **@typescript-eslint/\* 6 → 8** and **eslint-config-next 14 → 15** clear 4 high
  advisories with no runtime effect. eslint-config-next is pinned to 15 because
  16 requires eslint 9 and this project is on eslint 8.

The remaining 29 all require **Next 15 → 16** or **NestJS 10 → 11** — runtime
framework majors that need their own migration and regression pass, and are
deliberately out of scope here.

| Upgrade | Fixes | Risk |
|---|---|---|
| `bcrypt` 5 → 6 | `tar` (critical), `@mapbox/node-pre-gyp` | Low — narrow API surface, but it hashes existing passwords |
| `@typescript-eslint/*`, `eslint-config-next` | 6 high | Low — lint-only, no runtime effect |
| `@nestjs/cli` 10 → 11 | `glob`, `picomatch`, `tmp`, `webpack` | Moderate — build tooling only |
| `@nestjs/platform-express` 10 → 11 | `multer` (high) | **High** — runtime framework major |
| `next` 15 → 16 | `postcss` (high) | **High** — runtime framework major |

The first three groups have been applied. The two runtime framework majors have
not.

---

## Sprint 2 — error boundaries (complete)

A root boundary already existed, but its fallback filled the viewport, so a
failure in any one widget blanked the whole app. `ErrorBoundary` now supports a
`section` variant that contains the failure to the region it wraps, and retry
re-renders in place rather than reloading the page and discarding its state.
Boundaries wrap the dashboard predictions / KPIs / charts, the waste and
inventory tables, both analytics chart regions, the reports grid, and the
settings schedule panel. 10 tests cover isolation, recovery and the fallback.

Making the production build run to completion for the first time also surfaced
three real defects that the test suite could not catch, because vitest does not
type-check: a stale `Select` import in FilterPanel, a ref still typed
`HTMLDivElement` after becoming a `<ul>`, and an unescaped entity failing lint.

**`npm run build` now succeeds.**

## CI (added after the merge, PR #3)

This work merged as PR #2 with **zero automated verification** — the repository
had no `.github` directory and no workflows at all. Given that its central
finding was eleven suites that never ran and therefore reported no failures,
that gap was the most consequential thing left: a suite which silently stops
running looks exactly like a suite that passes.

`.github/workflows/ci.yml` now runs on every pull request, in two jobs:

| Job | Steps |
|---|---|
| frontend | `vitest run` (1830), then `next build` |
| backend | `db:generate`, then `jest` (89) |

Both frontend gates are kept because they catch different things — vitest does
not type-check, and `next build` was the only step that found three of the
defects fixed here.

Scoping that out surfaced one more misconfiguration of the same family as the
Playwright/vitest one: `apps/backend/jest.config.js` listed `../test` in
`roots`, so `waste-api.e2e.spec.ts` ran under the **unit** config. Removing it
takes the unit run to 7/7 suites. That leaves the e2e spec matching no config at
all — `test/jest-e2e.json` looks for `.e2e-spec.ts` while the file is
`.e2e.spec.ts`, so `test:e2e` already matched nothing — which is recorded here
rather than papered over.

No typecheck or audit gate yet, deliberately: both would be red on day one (see
below), and a pipeline that is red by default teaches people to ignore it.

## Recommended next steps

1. Add `@types/jest-axe`, then add a typecheck job to CI. 317 type errors remain
   in test files, almost entirely from its missing declarations. Pre-existing and
   unrelated to this work, but it is what currently blocks `tsc` as a gate.
2. Add `supertest` and rename `waste-api.e2e.spec.ts` to `.e2e-spec.ts` so the
   e2e suite runs under its own config, then add it to CI.
3. Finish the error logging (plan Task 2.2). The new boundaries accept an
   `onError` prop, but no page passes one and the `console.error` is dev-only —
   so in production a caught error is displayed to the user and then dropped.
4. Decide on Next 16 / NestJS 11, which is what the remaining 29 advisories need,
   after which an `npm audit` gate can be added.
5. Manual screen-reader and real-viewport verification, which automated testing
   cannot replace.

---

## Commits

| Commit | Change | Tests fixed |
|---|---|---|
| `1e4e3cc` | Checkbox / Radio / Switch — disabled and keyboard | 28 |
| `8f785da` | FilterPanel — labelling, native select, checkbox handler | 31 |
| `9175839` | Pagination — sizing, focus, dark mode on current page | 24 |
| `5c725af` | Select + SearchBar — valid listbox structure | 33 |
| `7f91ceb` | Drawer — accessible name, class-based positioning | 15 |
| `8086ab7` | Long tail + enabling the dead suites | 32 |
| `3a661f8` | Layout failures the dead suites had hidden | 76 |
