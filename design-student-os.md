# Design System — AI Student OS

> Adapted from a reference dark-dashboard design system for use on **AI Student OS**
> (Control Center / Task Matrix / AI Study Assistant), based on the four production
> screens reviewed. This version keeps the reference's overall discipline — near-black
> surfaces, restrained accent use, no shadow-driven depth — but replaces its single-lime
> accent model with a **three-accent system** suited to this app's actual structure, and
> folds in the UX changes from the accompanying makeover (persistent nav, merged stats,
> removal of dev-only content, visible due dates, a real priority scale).
>
> Hex values are a considered starting palette, not final brand colors — run a contrast
> check (§9) before shipping, and nudge to taste once real usage data exists.

---

## 1. Design Character

A **dark, terminal-native control panel for a student's own "operating system."** The
mood should read as precise and personal — a console the student is logged into, not a
generic SaaS dashboard and not an engineer's staging environment. Module headers,
bracketed parameters, monospace status text, and a persistent sense of "system" carry
the personality; nothing here should look decorative for its own sake.

The key structural idea for this version: **the app has three functionally distinct
zones, and each gets exactly one accent color, used nowhere else.**
- **Cyan** — the system itself: navigation, primary actions, core data.
- **Violet** — anything AI-generated or AI-assisted, and only that.
- **Amber** — progress and reward: XP, levels, streaks, and only that.

A student should be able to tell, by color alone, whether they're looking at "the app,"
"something the AI did," or "my progress" — without reading a label. That's the whole
reason this system uses three accents instead of the reference file's one; collapsing
these back into a single hue would erase a signal the app actually needs.

The one thing explicitly **cut** from this version: any content whose audience is the
developer, not the student. Raw HTTP/latency/infra readouts and internal build-phase
roadmaps do not belong on a user-facing surface, however well they fit the terminal
aesthetic. If system status needs to exist at all, it's one quiet line, not a panel.

Keywords: **dark, console, modular, terminal-precise, three-signal, no dev leakage.**

---

## 2. Color Tokens

### Surfaces
Cool, blue-black — not the reference's warm near-black — so cyan and violet read clean
against it instead of muddy.

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#05080B` | Page/app background |
| `--bg-surface` | `#0D141B` | Default card background |
| `--bg-surface-raised` | `#16202A` | Hover state / active nested panel |
| `--bg-surface-inset` | `#080D12` | Recessed panels (terminal box, empty-state well) |
| `--border-subtle` | `rgba(255,255,255,0.07)` | Card outlines, dividers |
| `--border-strong` | `rgba(255,255,255,0.14)` | Focus rings, active dividers |

### Primary — Cyan (system / core actions)
| Token | Hex | Usage |
|---|---|---|
| `--accent-cyan` | `#22D3EE` | Primary nav active state, primary buttons, core stat emphasis, focus rings |
| `--accent-cyan-tint` | `#7DE7F5` | Hover state for cyan elements |
| `--accent-cyan-dim` | `rgba(34,211,238,0.12)` | Subtle fills — active tab background, badge wash |

### Secondary — Violet (AI-touched moments only)
| Token | Hex | Usage |
|---|---|---|
| `--accent-violet` | `#A78BFA` | AI Planner module tag + nav item, "Generate" button, "AI-generated" source tag |
| `--accent-violet-tint` | `#D7CCFB` | Hover state for violet elements |
| `--accent-violet-dim` | `rgba(167,139,250,0.12)` | Subtle fills for AI-context cards |

### Tertiary — Amber (progress / reward only)
| Token | Hex | Usage |
|---|---|---|
| `--accent-amber` | `#FBBF24` | XP bar fill, level badge, streak counter, level-up moment |
| `--accent-amber-tint` | `#FDE49A` | Hover state for amber elements |
| `--accent-amber-dim` | `rgba(251,191,36,0.12)` | Subtle fills for gamification cards |

**Rule of thumb:** each accent has exactly one job. Never use violet on something the
student made themselves; never use amber outside the gamification surface; never use
cyan to signal "AI did this." One accent, one meaning — that consistency is what makes
the color legible without a legend.

### Status (functional — state, not brand)
Kept deliberately separate from the three accents above so meaning never overlaps with
identity.

| Token | Hex | Usage |
|---|---|---|
| `--status-success` | `#34D399` | Complete, online, connected, healthy |
| `--status-danger` | `#FB7185` | High priority, overdue, offline/error |
| `--status-warning` | `#FB923C` | Medium priority / caution — a distinct orange, not the amber accent above |
| `--status-neutral` | `--text-secondary` | Pending / not-yet-due — **not** red. "Pending" just means unfinished, not urgent; only the priority badge should carry alarm, and only at High. |

This fixes a real overlap in the current build: the Pending count and the High-priority
badge both currently use the same red, so a low-priority pending task and a genuinely
urgent one read identically at a glance.

### Text
| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#F2F5F7` | Headings, big stat numbers |
| `--text-secondary` | `#8B96A3` | Labels, captions, inactive nav |
| `--text-tertiary` | `#545E6B` | Disabled / lowest-emphasis text, Low-priority tag |
| `--text-on-accent` | `#071019` | Text/icons on any solid accent fill (cyan, violet, or amber — all three are light enough that one dark ink works across all of them) |

### Chart-specific
| Token | Hex | Usage |
|---|---|---|
| `--chart-dim` | `rgba(255,255,255,0.12)` | Inactive bars/segments |
| `--chart-active` | `#F2F5F7` | Selected/current value |
| `--chart-accent` | `--accent-cyan` | Highlighted point on a general/system chart |
| `--chart-accent-ai` | `--accent-violet` | Highlighted point only on an AI-planner chart (e.g. projected study load) |

---

## 3. Typography

Three families, each doing one job — display for personality, body for legibility, mono
for genuinely code/data-shaped content (module tags, terminal text, IDs). Mono is used
narrowly on purpose: it's justified here because the content really is system output,
not decoration slapped on ordinary labels.

```css
font-family: "Space Grotesk", "Inter", -apple-system, sans-serif;      /* display / headings */
font-family: "Inter", -apple-system, "Segoe UI", Roboto, sans-serif;   /* body / UI */
font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace; /* data / system */
font-feature-settings: "tnum" 1; /* tabular figures on every stat number */
```

| Role | Size / Line-height | Weight | Family | Tracking | Example |
|---|---|---|---|---|---|
| Hero stat | 44px / 48px | 600 | Space Grotesk | -0.01em | `5`, `50 / 100` |
| Card stat | 30px / 34px | 600 | Space Grotesk | -0.01em | `233 ms`, `Level 1` |
| Page heading | 26px / 32px | 600 | Space Grotesk | 0 | "Control Center" |
| Card title | 15px / 20px | 600 | Inter | 0 | "User Telemetry" |
| Body | 14px / 20px | 500 | Inter | 0 | nav links, form labels |
| Module eyebrow | 11px / 14px | 500 | JetBrains Mono | +0.04em | "MODULE // TASK_MATRIX" |
| Terminal / status text | 13px / 20px | 400 | JetBrains Mono | 0 | "SYSTEM ONLINE", timestamps |
| Micro / tag | 11px / 14px | 500 | Inter | +0.01em | "HIGH", "AI-generated" |

Nav and tab active state = color + weight, never underline: active is `--text-primary`
(or the zone's accent, for nav) at 600; inactive is `--text-secondary` at 500. Keep mono
out of body paragraphs and descriptions — it's for labels and system readouts only.

---

## 4. Spacing & Radius

**Spacing scale** (4px base): `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`
- Card inner padding: `20–24px`
- Gap between cards: `16px`
- Page outer margin: `32px` desktop, `16px` mobile
- Top nav height: `64px`

**Radius scale** — tighter than the reference file on purpose: a console reads more
precise at a smaller radius than a consumer app does.

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Badges, micro-tags |
| `--radius-md` | 10px | Inputs, inset panels |
| `--radius-lg` | 16px | Cards |
| `--radius-full` | 999px | Buttons, pills, tabs, toggles |

Depth comes from surface-color steps (`bg-surface` → `bg-surface-raised`), not
`box-shadow`. No hard drop shadows anywhere.

---

## 5. Layout Patterns

### 5.1 Global shell — replaces the per-page "Return to Dashboard" pattern
```
┌──────────────────────────────────────────────────────────────┐
│ ● AI STUDENT OS   Dashboard   Tasks   AI Planner     ● Lvl 1  │  ← 64px nav, bg-base
├──────────────────────────────────────────────────────────────┤
│  Page content (max-width ~1280px, 32px outer padding)         │
└──────────────────────────────────────────────────────────────┘
```
One persistent nav across all three sections. Active item = its zone's accent (cyan for
Dashboard/Tasks, violet for AI Planner) at weight 600. System status, if shown at all,
is a single small dot in the nav corner — not a page section.

### 5.2 Dashboard template (revised)
```
┌───────────────────────────┬───────────────────────────┐
│ Progress                  │ Level & streak (amber)     │
│ (ring + total/pending/    │ XP bar, streak counter      │
│  complete merged — one    ├───────────────────────────┤
│  card, not two)           │ Up next                    │
│                            │ (2–3 nearest-deadline       │
│                            │  tasks, links to Task Matrix)│
└───────────────────────────┴───────────────────────────┘
   [optional, collapsed by default] All systems operational ⌄
```
- One progress representation, not a stat-tiles-plus-donut duplicate.
- "Up next" replaces the roadmap card: it's the same visual weight, but it's the
  student's own data instead of the dev team's backlog.
- Diagnostics, if kept at all, is a single collapsed line — expand only on click, and
  even expanded it should say "healthy / degraded," never print raw request/response
  bodies to a student-facing screen.

### 5.3 Task Matrix template
```
┌─────────────────────────────────────────────────────────┐
│ Active tasks                          [+ New directive]  │  ← form opens on click,
├─────────────────────────────────────────────────────────┤     not permanently open
│ ☐ Title            Subject tag   [Priority]   Due date   │
│ ☐ Title            Subject tag   [Priority]   Due date   │
└─────────────────────────────────────────────────────────┘
```
- Creation form collapses behind a single trigger — the list, not the form, is the
  default view for a returning user.
- Every card shows a due date. Priority uses the 3-step scale (§2), not a single red
  badge for everything above Low.
- A task with an AI source gets a small violet "AI-generated" tag next to the title —
  the only place violet appears in this template.

### 5.4 AI Planner template
Two-pane form + output, same shape as the current build — that layout works. On
generation, the output panel's accents switch to violet (this is the one page where
violet is the dominant, not accent, color, since the whole page is an AI surface).
Consider offering an "Add to my tasks" action on the generated plan so it feeds directly
into the Task Matrix instead of dead-ending in the output panel.

---

## 6. Components

### 6.1 Top navigation (new)
Logo mark left, 3 nav items inline (Dashboard / Tasks / AI Planner), small status dot +
level pill right. No border under the nav — separation from 64px of breathing room.

### 6.2 Module eyebrow tag
`● MODULE // SECTION_NAME` — mono, 11px, tracked. Dot color = zone accent (cyan for
system pages, violet for AI Planner). This is a label, never a button — no brackets.

### 6.3 Progress card (merged stat + ring)
One card: a small ring/donut on one side, the three numbers (Total / Pending / Complete)
as plain labeled figures beside it — one dataset, one visualization, not two.

### 6.4 Gamification bar
Level pill + XP progress bar + streak count, all in amber. This is the one card allowed
to feel rewarding rather than utilitarian — the system's single "hero" accent moment,
same restraint principle as the reference file's lime hero card.

### 6.5 Task card
```
┌──────────────────────────────────────────────┐
│ ☐ Title                    [Priority]  Due:   │
│   Subject tag   ⟨AI-generated, if applicable⟩ │
└──────────────────────────────────────────────┘
```
Priority badge: High = `--status-danger` fill, Medium = `--status-warning` fill, Low =
`--text-tertiary` outline only, no fill. Due date always visible, right-aligned.

### 6.6 Buttons
`--radius-full`, `--bg-surface-raised` for low-emphasis actions; solid accent fill
(cyan for system actions, violet for AI actions) with `--text-on-accent` label for
primary actions. **Brackets (`[ ]`) are reserved exclusively for buttons** — a static
label like "Level 1" or a field caption never uses brackets, so bracket presence alone
tells the user "this is clickable."

### 6.7 Form field
Label above input, mono micro-label style (`PARAMETER [FIELD_NAME]` is fine to keep —
it's a caption, not a button, so no ambiguity once §6.6's rule is in place). Input:
`--bg-surface-inset`, `--border-subtle`, `--radius-md`.

### 6.8 Terminal / status panel (simplified)
If retained anywhere, it's a single line: status dot + "SYSTEM ONLINE" / "DEGRADED" in
mono. No request/response bodies, no environment name, no port number, no latency
figure — none of that is student-relevant, and all of it reads as leftover debug output
on a production surface.

### 6.9 "Coming soon" teaser (optional — only if you want to keep some version)
If you still want to tease upcoming features, don't reuse the internal roadmap. Reframe
in user-benefit language only ("Habit tracking — coming soon," not "Phase 3: Task &
Habit Manager, JWT route guards"), and give every locked item the **same** muted
treatment — one lock icon, one dim tone — never a different color per card. A rainbow of
"locked" states with no rule behind it reads as noise, not information.

### 6.10 Empty state
Keep the current pattern (icon + "Standby" + one line of context) — it's a good, quiet
empty state and needs no change beyond recoloring the icon/accent to violet on the AI
Planner page.

### 6.11 Tabs (Text Mode / Image Mode)
Plain text, no pill chrome. Active = `--text-primary` / 600 with a thin underline in the
page's zone accent (violet on AI Planner); inactive = `--text-secondary` / 500.

---

## 7. Iconography

`lucide-react`, 1.5–1.75px stroke, no fills, no duotone. A handful of literal
system glyphs (lock, terminal, cpu, flask) are appropriate given the OS framing — use
them for module identity, not as general decoration.

---

## 8. Motion

Restrained by default — this is a console, not a marketing surface.
- Card hover: `bg-surface` → `bg-surface-raised`, ~150ms ease.
- Tab/nav active change: color + underline transition, ~150ms.
- Chart bars/rings: animate in once on first load only (~400ms, staggered).
- **Level-up is the one deliberate expressive moment** — a brief amber pulse on the
  gamification card. This replaces the reference file's glowing-illustration moment;
  here, the "signature" beat is a progress event, not a static image.
- Respect `prefers-reduced-motion`: disable the level-up pulse and load-in stagger.

---

## 9. Accessibility Notes

- `--text-secondary` (`#8B96A3`) on `--bg-base`/`--bg-surface` — verify against WCAG AA
  (4.5:1) at your actual font sizes; darken background or lighten text if it falls short.
- `--text-on-accent` (`#071019`) is dark by design so it works on all three accent
  fills (cyan, violet, amber) — never place white text on any of the three.
- Priority is conveyed by color **and** a text label ("High"/"Medium"/"Low") — never by
  color alone.
- Give nav items, tabs, and toggles a visible focus outline (`--border-strong`) for
  keyboard users — weight/color changes alone aren't sufficient signal.
- Keep the "AI-generated" tag as a text label, not just a violet color chip, so
  colorblind users can still tell AI content apart from their own.

---

## 10. Implementation Starter (Tailwind-style tokens)

```js
// tailwind.config.js (excerpt)
module.exports = {
  theme: {
    extend: {
      colors: {
        base: "#05080B",
        surface: "#0D141B",
        "surface-raised": "#16202A",
        "surface-inset": "#080D12",
        cyan: { DEFAULT: "#22D3EE", tint: "#7DE7F5" },
        violet: { DEFAULT: "#A78BFA", tint: "#D7CCFB" },
        amber: { DEFAULT: "#FBBF24", tint: "#FDE49A" },
        success: "#34D399",
        danger: "#FB7185",
        warning: "#FB923C",
        "text-primary": "#F2F5F7",
        "text-secondary": "#8B96A3",
        "text-tertiary": "#545E6B",
        "text-on-accent": "#071019",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "-apple-system", "sans-serif"],
        sans: ["Inter", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
};
```

**Suggested stack:** Space Grotesk + Inter + JetBrains Mono (all free, Google
Fonts/open-source), `lucide-react` for icons, custom SVG for the progress ring and any
sparklines so they hold this system's tokens rather than a default chart-library skin.

---

## 11. Do / Don't

**Do**
- Give each of the three accents exactly one job — cyan (system), violet (AI), amber
  (progress) — and never let them cross over.
- Show a due date on every task card.
- Keep the whole app behind one persistent nav; nothing should be a dead end that only
  offers "back to dashboard."
- Reserve `[ ]` bracket styling strictly for clickable buttons.
- Use mono type only where the content is genuinely system/data-shaped.

**Don't**
- Don't show raw HTTP requests, latency figures, ports, or environment names on a
  student-facing screen — that's debug output, not product.
- Don't surface the internal development roadmap as app content.
- Don't represent the same stat twice in one view (e.g. tiles + a donut of the same
  numbers).
- Don't color-code "locked" or status badges without a consistent rule behind the color.
- Don't use red for "pending" — reserve it for genuinely high-priority or overdue items.
