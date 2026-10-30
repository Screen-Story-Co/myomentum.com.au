# Design

<!-- impeccable:design-schema 1 -->

The committed visual world for yiapanis.co. Derived from the implemented
system (2026-10-09), not an aspiration — every value here exists in
`src/layouts/Base.astro` or `src/pages/index.astro`.

---

## Mode

**Experience** — the visitor is inside the work itself. Portfolio of a creator.

**Direction: the ledger — a release log bound like a production book.**
Films on the recto, software releases on the verso, one spine, one date
sequence. The binding is the mechanism: the crossover is *logged*, not
asserted. Two disciplines share one date order, so the connection reads as
fact rather than claim.

Derivation and the six rejected alternatives: `.impeccable/direction.md`.

**Category rut kept out:** the dark film-portfolio template — near-black
ground, one gold accent, "Director & Screenwriter", full-bleed stills. That is
the incumbent. Its predictable opposite — the bright minimal developer
portfolio with a project grid — is the other rut.

---

## The central tension, and how it resolves

A filmmaker's site wants images. This one is **text-first**: the film work is
presented as a dated catalogue with poster plates, not as a full-bleed
showreel. The hero carries exactly one photographic asset; everything after it
is paper.

The resolution is a **printed programme**: cream stock, numbered sections, mono
metadata, one oxide accent. Depth comes from typography, layering and
scroll-driven motion — never from a theme flip between dark and light.

---

## Surfaces

One continuous surface with a title plate at the top.

**The cover.** Dark. A behind-the-scenes photograph (a monitor glowing on set,
chroma-key green in the frame) under a slow drifting zoom. Over it: the name,
the Greek word, and the gloss — which *is* the navigation.

**The sheets.** Light, cream, numbered. Everything below the cover is printed
matter: rails, rules, plates, index rows.

The cover-to-sheet transition is the only full theme change on the site. It
happens once, at the top, and is never revisited.

---

## Palette

Paper programme: off-white stock, pure-white plates, ink, one oxide accent.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#fbfbf9` | Page stock |
| `--plate` | `#ffffff` | Prints laid on the paper (posters, form fields) |
| `--fg` | `#141414` | Ink |
| `--muted` | `#6a6a66` | Secondary prose |
| `--faint` | `#9c9c96` | Rail labels, indices, notes |
| `--accent` | `#9a3324` | Oxide. One accent, used sparingly |
| `--border` | `#dcdcd6` | Structural rules |
| `--rule` | `#c9c9c2` | Heavier separators |

**Cover overrides** (dark ground, so fixed values rather than tokens):
ink `#f7f7f4`, secondary `rgba(247,247,244,.78)`, cover rule
`rgba(247,247,244,.22)`, active gloss `#d9634b`.

**Discipline:** one accent colour. `--accent` marks the active state, the rail
number, links, and the drop cap — nothing else. No second hue, no gradients as
decoration, no colour-coded status.

---

## Type

Four families, each with one job.

| Family | Token | Role |
|---|---|---|
| **Newsreader** | `--font-display` | Names, titles, headings. Italic for the lede. |
| **Public Sans** | `--font-body` | Prose. Weight 300. |
| **IBM Plex Mono** | `--font-mono` | Metadata, rails, nav, labels, buttons. Uppercase, tracked. |
| **EB Garamond** | — | **Greek only.** `σκηνοθέτης`. |

**Why EB Garamond exists:** Newsreader ships latin, latin-ext and vietnamese
subsets — **no Greek**. Greek text in Newsreader falls back to a system serif
and the word breaks visually. EB Garamond carries the Greek subset and is
scoped to `.cover-role` alone. Do not remove it, and do not apply it elsewhere.

**Typographic rules:**
- Mono is always uppercase with wide tracking (`letter-spacing: .16em`).
- Display sizes use `clamp()` — never fixed px for headings.
- Body measure caps at `74ch` (`.sheet-body`).
- Rail labels sit at `.62rem`, rail numbers at `.72rem`.

---

## Structure

### The rail

Every section is a `.sheet`: a two-column grid — a narrow sticky rail
(`8.5rem`) and a body capped at `74ch`.

```
┌──────────┬────────────────────────────────┐
│ FILMS    │   Film school projects         │
│ (sticky) │   ─────────────────────────    │
│          │   [plates…]                    │
└──────────┴────────────────────────────────┘
```

The rail holds a **label** in faint mono. It sticks below the header while its
section scrolls.

**The rail carried sequential numbers (01–06) until they were retired.** They
implied a reading order nobody had asked for, and retiring In Development left a
permanent gap at 04 that made the sequence read as broken. Rail labels are
identifiers — do not reintroduce numerals to "close" the gap.

### Panels

Screen, Stories and Software are the three gloss destinations. Exactly
one is visible; the gloss switches between them. Contact sits below, always
visible, so the page always ends with a way to make contact. The journal lives
only on its own page (`/journal`), reached from the header nav — it is not
mirrored onto the homepage.

---

## The gloss — navigation as typography

The gloss (`SCREEN · STORIES · SOFTWARE`) is the primary navigation. It is set
in mono, uppercase, tracked, at `clamp(0.76rem, 1.05vw, 0.88rem)` — deliberately
larger than a caption, because it is not decoration.

**Affordance without chrome:** no pills, no fills, no borders. A hairline rule
sits above it. Each item carries `0.75rem` vertical padding for a ~44px touch
target while staying visually light. Hover brightens to `#f7f7f4` and draws a
1px underline scaling from the left via `::after` (so layout never shifts).
Active state is `#d9634b`.

**Do not add buttons, chevrons, or backgrounds.** The weight comes from size,
contrast and the underline's appearance. This was a deliberate correction after
an earlier attempt made it look heavy-handed.

---

## Motion

Native CSS only. No JavaScript animation libraries.

- **Cover drift:** slow scale + translate on the hero image, keyframes.
- **Scroll reveals:** `animation-timeline: view()` — content arrives as it
  enters, no scroll listener.
- **Hover:** transform/box-shadow on plates, underline on links, colour on
  gloss items.
- **Grain:** a static `aria-hidden` texture layer over the cover.

**Constraint:** every animation must leave content **visible** if it never runs.
An earlier revision used a reveal that left the hero name invisible in
captures until `fill-mode: forwards` was added. Content is present and legible
without motion; motion only adds.

---

## Vocabulary

Reusable classes, defined once in `Base.astro`, consumed by every page. This is
why index/films/journal/contact read as one document.

| Class | Purpose |
|---|---|
| `.sheet` / `.sheet-rail` / `.sheet-body` | Section grid |
| `.rail-label` | Sticky rail label |
| `.sheet-note` | Mono metadata line under a rule |
| `.link` | Oxide link with animated underline |
| `.plates` / `.plate` / `.plate-*` | Poster prints (A-series `0.708`) |
| `.plate-blank` | Films without artwork — a printed stand-in, not a hole |
| `.journal-grid` / `.journal-item` / `.journal-*` | Journal entries |
| `.prose` | Long-form article body |
| `.sw-index` / `.sw-row` / `.sw-name` / `.sw-note` / `.sw-meta` | Software index |
| `.contact-title` / `.contact-body` / `.contact-links` | Contact |

**A blank plate is designed, not empty** — diagonal hairlines and the title set
in display type, so a film without a poster still reads as a printed entry.

---

## Rules

1. **Text-first.** One photographic asset on the cover; everything else is
   printed matter. Do not add hero imagery to inner sections.
2. **One accent.** Oxide marks state and links. Nothing else.
3. **Light by default.** The cover is the only dark surface.
4. **No JS libraries** for layout, scroll or animation.
5. **No third-party branding** anywhere — white-label is mandatory. No vendor
   logos, URLs or widget chrome in any surface.
6. **No self-praise and no invented facts.** No testimonials, awards, or
   client claims. Dates, licences and counts are verified claims.
7. **The rail numbers are identities, not a count.** Leave the gap at 04.
8. **Content works without motion.** Animation adds; it never gates.
9. **Greek text uses EB Garamond.** Newsreader has no Greek subset.
