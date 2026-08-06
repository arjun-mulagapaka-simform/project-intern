# Frontend design rules — "Slambook" theme

The entire UI is themed as a handwritten, nostalgic friendship-slambook /
scrapbook — notebook paper, washi tape, polaroids, sticky notes, dashed
borders, hard drop-shadow buttons. This is a deliberate, consistent design
language, not a placeholder style. **Every new page or component must look
like it belongs in the same slambook**, not a generic SaaS dashboard.

There is no Tailwind/Chakra/MUI here. Styling is one hand-authored
stylesheet: `src/index.css`. All theme tokens and reusable classes live
there — read it before styling anything.

## Non-negotiable rules

1. **Reuse existing `slam-*` / `slambook-*` classes before writing new CSS.**
   Check `src/index.css` for a fitting class first (see catalogue below).
   Only add a new class when no existing one fits, and add it to
   `index.css` following the same naming convention (`slam-` prefix) and
   the same visual grammar (dashed/solid borders, hard offset shadows,
   rotation, paper/tape motifs) — don't invent a parallel styling system.
2. **Never use raw hex colors or ad hoc fonts in components.** Always go
   through the CSS variables defined in `:root` (`--bg-desk`, `--paper-bg`,
   `--text-dark`, `--ink-blue`, `--tape-yellow`, etc.) or an existing
   utility class. If a new accent color is truly needed, add it as a CSS
   variable in the same pastel/washi-tape family, not an arbitrary color.
3. **Font roles are fixed — don't mix them up:**
   - `--font-heading` (Permanent Marker) — page titles, stamp badges, nav
     buttons. Bold, marker-style, all-caps-friendly.
   - `--font-handwriting` (Caveat) — form labels, subtitles, links, error
     text, alerts. The "handwritten note" voice.
   - `--font-body` (Patrick Hand) — reserved for body copy.
   - `--font-sans` (Outfit) — the only "normal" UI font; used for base
     body text and anything that must stay legible/small.
   Do not introduce a flat system-UI look (no default sans everywhere) —
   the handwritten fonts are the point of the theme.
4. **No flat corporate UI patterns.** No plain rectangular cards with
   subtle box-shadows, no rounded-pill flat buttons, no thin 1px gray
   borders as the primary style. The default look is: cream desk
   background with dot-grid texture, white "paper" cards with ruled lines
   and a red margin line, dashed borders, and hard 3-5px offset shadows
   (`box-shadow: Npx Npx 0px var(--text-dark)`) on interactive elements.
5. **Decorative motifs are part of the UI, not clutter** — use them
   deliberately on key surfaces (auth cards, profile cards, empty states):
   washi tape corners (`.washi-tape` + a `-top-left`/`-top-right`/
   `-bottom-right` position class), polaroid photo frames
   (`.polaroid-frame` / `.polaroid-photo` / `.polaroid-tape`), sticky notes
   (`.sticky-note-card`), and slight rotation (`transform: rotate(...)`)
   for a hand-placed feel. Don't apply them to dense data tables/lists
   where they'd hurt readability — use plain `.slambook-card` there.
6. **Buttons/inputs must match the existing components exactly** — use
   `.slam-btn` (primary, yellow, hard-shadow), `.slam-nav-btn` /
   `.slam-nav-btn-danger` (secondary/nav), `.slam-input` /
   `.slam-textarea` with `.slam-field` + `.slam-label` wrapping, and
   `.slam-error-text` / `.slam-alert` for validation and error states.
   Don't reach for unstyled native `<button>`/`<input>` elements or
   one-off inline styles in new forms.
7. **Layout containers**: wrap auth pages in `.slambook-auth-container`,
   other top-level pages in `.slambook-page-container`, and page sections
   in `.slambook-card`. Keep the existing `.app-header` / `.main-content`
   shell as the outer structure — don't replace it per-page.
8. This is a **single light theme** by design (see the `Premium Light
   Slambook Palette` comment in `index.css`) — do not add a dark mode
   toggle or dark-mode media query unless explicitly asked.

## Class catalogue (in `src/index.css`)

- Layout: `.app-container`, `.app-header`, `.brand-logo`,
  `.brand-logo-icon`, `.nav-actions`, `.main-content`,
  `.slambook-auth-container`, `.slambook-page-container`
- Cards/surfaces: `.slambook-card`, `.profile-header-bar`,
  `.profile-grid`, `.profile-sidebar-card`, `.profile-main-content`,
  `.bio-display-box`, `.edit-form-card`, `.form-grid-2col`,
  `.activity-matrix-container`, `.sticky-note-card`
- Typography: `.slambook-title`, `.slambook-subtitle`, `.slambook-link`,
  `.slambook-stamp`
- Forms: `.slam-field`, `.slam-label`, `.slam-input-wrapper`,
  `.slam-input-icon`, `.slam-input`, `.slam-input.has-toggle`,
  `.slam-textarea`, `.slam-toggle-btn`, `.slam-input-error`,
  `.slam-error-text`
- Buttons: `.slam-btn`, `.slam-nav-btn`, `.slam-nav-btn-danger`
- Decoration: `.washi-tape` (+ `-top-left`/`-top-right`/`-bottom-right`),
  `.polaroid-frame`, `.polaroid-photo`, `.polaroid-tape`
- Feedback: `.slam-alert`

When building a new page, start from an existing page in `src/pages/`
(e.g. `LoginPage.tsx`, `MyProfilePage.tsx`) as the reference for how these
classes compose together.
