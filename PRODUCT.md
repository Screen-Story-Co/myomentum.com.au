# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 5.12 (static output), deployed to Cloudflare Pages as `yiapanis-co`.
Repo: `Screen-Story-Co/yiapanis.co`. Content via Astro content collections
(`films`, `blog`, `profile` — the blog collection powers `/journal`). No CSS
framework — a hand-written system in `src/layouts/Base.astro`.

Canonical preview: `yiapanis-co.preview.screenstory.co` (always deploy with
`--branch=main`; the apex domain belongs to the incumbent and is untouched).
**The redesign is complete and live on the preview — it is the site now, not a
proposal.** See `DESIGN.md` for the committed visual world.

## Users

**Primary: two distinct audiences on one site, deliberately.**

1. **Film industry** — producers, commissioning editors, festival programmers,
   and potential collaborators (crew, cast, writers, producers) assessing
   Demetris as a director and screenwriter.
2. **Technical / creative-technology** — people evaluating Demetris as a
   creative technologist: his open-source work, Hermes Agent capability, and
   Sekreto.

These are separate audiences and currently share no content. The site must
serve both without diluting either.

## Product Purpose

A creator's personal site presenting a single working creator across two
disciplines. It exists to establish **credibility** and **showcase work** —
confirmed as the two jobs that matter most.

Success = a visitor from either audience can quickly judge the calibre of the
work and find the route to engage.

## Positioning

One creator, two bodies of work that are not presented as a career pivot or a
split identity, but as a single practice. The crossover is latent and
deliberate: agents will be used to make real films. The site should not
over-claim that crossover before it exists in shipped work.

## Identity

- Presented **independently** — personal creator brand, not agency-billed.
- Name: **Demetris Yiapanis**. The site descriptor is **σκηνοθέτης** (Greek,
  "director" — one who stages a production) with the gloss
  **SCREEN · STORIES · SOFTWARE**, which doubles as the navigation.
  **"Director & Screenwriter" is retired** — it named a profession, and neither
  film nor software is his profession. The Greek word is a noun describing what
  he does, not self-awarded praise.
- Both disciplines are the same person. Do not frame the technical work as a
  separate brand or consultancy.

## Confirmed Content

**Framing rule (IMPORTANT)** — *"film school projects & directorial work"*. The
films page subtitle carries this and it must be preserved.

All four are film-school projects, not commercial or commissioned credits. Do
**not** present them as professional production credits, festival selections, or
commissioned work. Credit them as directorial work completed during training —
Griffith Film School (2023–24) and VCA. That training is itself a credibility
asset, not something to gloss over. The films are early-career work: evidence of
craft and range, not a professional track record.

**Films (4)** — all with video (Cloudflare Stream), ordered *You Came*,
*A Basket Of Summer Fruit*, *Driving Joy*, *Reimagining Proof*:

- *You Came* — Short, Drama/Poetic, 2023. A virtual production project.
- *A Basket Of Summer Fruit* — Short, Drama/Romance, 2024. A recluse receives a
  basket of fruit at his front door; love beckons when he discovers it is from
  his neighbour.
- *Driving Joy* — Short, Drama, 2024. A widowed father must acknowledge his
  daughter's coming of age and confront his own yearning for love.
- *Reimagining Proof* — Reimagined Scene, Drama/Noir, 2024. Also known as
  *Out of Sight*. A scene from *Proof* (1991) directed under PJ Hogan and Bob
  Humphreys at Griffith Film School. **Its `videoUrl` must point at the user's
  own scene (`dacbfc70…`), not the 1991 original (`370e5521…`) — the two were
  cross-wired once and it shipped.** Verified against CF Stream metadata.

**Retired: In Development.** The collection, pages, schema, routes, CMS entry
and images were deleted 2026-10-09 at Demetri's instruction — *"Completely
delete the In Development section, pages and content."* Two projects existed:

- *Three Is A Crowd* — Feature, Drama. Widowed entrepreneur develops a love
  interest in a jaunty musician while fighting to retain control of the company
  she founded.
- *Black Jeans* — Short, Drama. Two strangers shop for black jeans; the pursuit
  of the perfect pair threatens a mutual attraction hiding in plain sight.

They are recoverable only by re-adding them as films. **Do not reinstate the
collection**, and do not renumber the rail to close the gap it left at 04 —
the numbers are identities, not a count (see DESIGN.md).

**Journal:** 10 entries at `/journal` (the collection folder remains
`src/content/blog`), including film-making write-ups and one on open source
(`embrace-open-source`).

**Bio:** Nicosia-born; Cyprus/Australia upbringing; Melbourne 2000 after Cypriot
National Guard service; a decade in IT and management; JMC Academy film & TV
training 2018; Master of Screenwriting, VCA 2020; acting training at Brave
Studios, Zen Zen Zo, Brisbane Arts Theatre; moved to Brisbane 2023; Graduate
Diploma in Screen Production, Griffith Film School 2024.

## Open-Source Work

Verified against the public GitHub API (`github.com/dyiapanis`) 2026-10-08.
All own-work unless marked. Dates are repo creation → last push.

**Published Hermes Agent plugins:**
- **limbic** — self-organising memory system: SQLite-backed, adaptive trust,
  organic atrophy, user-scoped. Python, 2026-08-06 → 2026-10-07. ★3
  **Licence: PolyForm Noncommercial 1.0.0 — NOT MIT.** (Verified from the repo's
  LICENSE file and the GitHub API, which returns NOASSERTION.) Noncommercial use
  only. **Do not describe limbic as open source without qualification** — it is
  source-available, not OSI-approved.
- **pass-secrets** — `pass` (password-store) secret source plugin:
  GPG-encrypted, git-tracked, local, offline. Python, MIT, 2026-10-02 → 2026-10-05.
  **This is the published plugin.** Supersedes `hermes-pass-secrets`.
- **hermes-analytics** — analytics plugin: LLM calls, tool usage, context
  pressure, cost tracking, fleet reporting. Python, MIT, 2026-08-02 → 2026-09-24

**Agent-plugin packages (Agent Plugins v1):**
- **agent-docs** — portable document lifecycle suite: create, convert, read.
  Python, MIT, 2026-08-01 → 2026-10-03. ★1
- **agent-intervals-icu** — Intervals.icu API skill: wellness (CTL/ATL/TSB),
  activities, streams, zones, planned-workout upload. Stdlib-only, zero deps.
  Python, MIT, 2026-09-25

**Other:**
- **dot-fountain** — TypeScript, MIT, 2026-09-23 → 2026-10-05. No description.

**Upstream contributions** (verified via GitHub API, 2026-10-08 — his forks
exist only to carry these patches; fork mirrors excluded):

| Upstream | Stars | Merged PRs | Commits |
|---|---:|---:|---:|
| `NousResearch/hermes-agent` | 252k | 3 | 8 |
| `daijro/camoufox` | 12.4k | 1 | 1 |
| `jo-inc/camofox-browser` | 11.5k | 1 | 1 |
| `redf0x1/camofox-browser` | 411 | 3 | 11 |
| `MarkEdit-app/extensions` | 3 | 2 | 2 |
| **Total** | | **10** | **24** |

Substantive fixes, not typo PRs — Xvfb display allocation, session-identity
recovery, fontconfig cache, WebGL↔screen consistency, cron plugin discovery.

**The strongest line:** two of his own plugins were accepted into the Hermes
Agent plugin catalog upstream (`limbic` #131827, `pass-secrets` #131832) — the
upstream project adopting his work as a distribution artifact.

**Do not present open PRs as merged.**

## Private Work (not for public listing)

**Screen-Story-Co (his org) — client/confidential:**
- `screenstory.co` — Astro 5 + Decap CMS + Cloudflare Pages
- `screenstory-studio` — Decap CMS admin hub for client sites
- `yiapanis.co` — this site

Do not name these as client work without permission.

**Own private projects — the "in development" tier:**
- **`wolverine`** (Rust) — browser automation server for AI agents. The engine
  behind the anti-detection browser used on this machine.
- **`scribu`** (TypeScript) — *a distraction-free Fountain screenwriting app*.
  **Intent: to be made public. Include on the site now, marked "in development."**
  Directly on-brand — a screenwriter's tool built by a screenwriter. Candidate
  for the *spine* of the ledger rather than one column: it belongs to both
  disciplines at once.
- **`centipede`** (Python) — Camofox-based anti-detection web extraction.

These may be **described** as in-development work. Do not link or claim them as
open source until they are.

**Infrastructure / not portfolio:** `cachyos-backup`, `omarchy-backup`,
`password-store`, `agent-plugin-intervals-icu` (private mirror of the public
`agent-intervals-icu`).

**In pipeline — the headline:** **Sekreto** — the big one, to be announced on
ship. Reserve a prominent place for it in the ledger rather than treating it as
one entry among many.

**Do NOT list publicly:** `hermes-pass-secrets` — superseded by `pass-secrets`,
pending deprecation/removal from GitHub.

## Content Posture

The ledger direction's two columns are backed by real, dated, verifiable work on
both sides — but the two columns are **not equal in kind**, and the page must not
pretend they are:

- **Film column:** film-school projects and early-career directorial work.
  Honest, modest, evidence of craft. Not professional credits.
- **Software column:** shipped, published, catalogue-adopted open source with
  merged upstream contributions. This is the stronger professional record.

The site should be **neither** an apology for the student films **nor** a claim that
they are something more. Both are simply true: training work on one side, shipped
software on the other.

The crossover the ledger asserts is **not** a claim about agent-made films. It is
the observable fact that one person produces a dated film slate and a dated
software release log in the same period — and, with `scribu`, builds the bridge
between them.

## Copy Rules

- **Humanize all copy.** `humanizer` skill; strip AI-isms, add real voice.
  Applied to the ledger homepage: 24 edits across two passes (third-person slip,
  subjectless fragments, em-dash overuse, one drumbeat rhythm across all software
  entries).
- **Every public claim must be verified against a primary source.** This session
  produced two fabrications of the same class: a vision model invented a film
  entry that didn't exist, and the agent wrote an MIT licence claim for `limbic`
  that was actually PolyForm Noncommercial. Fabrication happens in *both*
  directions — inventing content and inventing facts about real content. A
  licence, a date, a count, or a link is a factual claim and gets checked.
- **Never claim open source without qualification** for source-available
  licences. See the limbic note above.

## Contact & Presence

**Contact — form only. The email address is NOT printed on the site.**
- The form posts to `/api/contact` — a Cloudflare Pages Function
  (`functions/api/contact.js`) which routes the message to
  `demetris@yiapanis.co`. The address is the delivery target, not public copy.
- Honeypot field (`_gotcha`) present.
- Demetri's instruction (2026-10-09): *"remove my direct email address (form
  should route messages to it)."* Verified removed — zero occurrences in
  `dist/` and zero on the live `/` and `/contact`.
- **Do not re-add a `mailto:` link or print the address anywhere public.**

**Online presence:** GitHub, X, Discord — all `dyiapanis`, now surfaced on
`/contact` beneath the form.
- GitHub: `https://github.com/dyiapanis` (verified)
- X: `https://x.com/dyiapanis`
- Discord: handle `dyiapanis` as **plain text** — Discord handles are not
  web-addressable, so it is never a link.

## Open Decisions

- **Awards, press, or representation** — none recorded. Record only if real.
- **Whether the technical work is public-safe to name** — the plugins are public
  repos, but Demetri may not want client/fleet context surfaced. Confirm which
  projects may be named and linked.
- **Deprecate `hermes-pass-secrets`** — superseded by `pass-secrets`. Needs
  archiving or deletion on GitHub (Demetri's action, not ours). Exclude from the
  site either way.
- ~~404 page~~ — resolved: `src/pages/404.astro` serves a custom "Missing"
  sheet, and unknown paths return HTTP 404 rather than the homepage at 200.
- ~~X and Discord handles~~ — resolved: both `dyiapanis`.
- ~~Contact routing~~ — resolved: form only, address not printed.
- ~~scribu placement~~ — resolved: on the site, marked "in development".

## Notes

- Site must not invent testimonials, credits, awards, or client claims.
- Film content is portable from the existing repo; design is not.
- The technical work is **public open source** — cite real repo names and dates
  rather than describing it abstractly. Exception: `limbic` is source-available
  (PolyForm Noncommercial), never unqualified "open source".
- `_routes.json` and `.impeccable/` are generated — never hand-edit `_routes.json`,
  never commit it.
- The studio's `/api/config` endpoint no longer exists; client sites carry their
  Decap config inline in `public/admin/index.html` and authenticate through
  `/api/decap/identity` + `/api/decap/git-gateway`.
