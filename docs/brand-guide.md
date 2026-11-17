# Klearway brand guide

## Idea

Klearway is about **the paper trail being right**. The visual language borrows from shipping documents: warm paper, ledger lines, monospace references, stamps and a folded document corner. It is calm and precise, with one warm accent for action. There are no robots, glowing gradients or "AI magic".

## Logo

A document sheet with a folded amber corner. Inside it, a "K" whose lower stroke ends in a check mark.

| Asset | File |
|---|---|
| Mark (SVG, React) | `public/favicon.svg`, `src/components/brand/Logo.jsx` |
| Mark, 512 px | `public/logo-512.png` |
| Horizontal lockup (dark on light / light on dark) | `docs/brand/logo-horizontal.svg/.png`, `docs/brand/logo-horizontal-light.svg/.png` |
| LinkedIn logo, 400 px | `docs/brand/linkedin-logo-400.png` |

- **Clear space:** keep at least half the mark's width around it.
- **Smallest size:** 16 px for the mark, 96 px wide for the lockup.

## Colour

| Token | Hex | Use |
|---|---|---|
| Ink | `#0F1D1C` | Text, dark sections, primary dark buttons |
| Paper | `#F5F1E8` | Page background |
| Paper 50 | `#FBF9F4` | Cards and sheets |
| Signal | `#E9A23B` | Primary CTA (with ink text), highlights. Never used for body text on paper. |
| Tide | `#1E6B5A` | Verified, matches, links on light backgrounds |
| Flag | `#B8402A` | Mismatches and errors only |

Contrast: ink on paper is 15.4:1, tide on paper is 5.6:1, ink on signal is 8:1, flag on paper is 4.9:1, and ink-400 (#566A67, used for hints) on paper is 5.3:1.

## Typography

- **IBM Plex Sans** (400/500/600) for interface and headings, with tight tracking on headings.
- **IBM Plex Mono** (400/500) for references, container numbers, eyebrows and data.
- Fonts are self-hosted with `@fontsource` (Latin subset, `font-display: swap`).

## Components and motion

- **Stamps:** small mono, uppercase, bordered labels for status (Matches, Mismatch, Missing, Check, Sample data).
- **Sheets:** cards with a 1 px paper-300 border and a soft shadow, like stacked documents.
- **Buttons:** amber for the main action, ink for secondary actions in the app, outline for tertiary ones.
- **Motion:** a 0.6 s fade-and-rise when sections enter view, a scan line over the hero document, and a pulse on the flagged mismatch. Motion is turned off under `prefers-reduced-motion`.
- **Icons:** Lucide icons at a 1.5–2 px stroke.
