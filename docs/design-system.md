# Signal House Design System

A minimal dashboard design system so implementation stays coherent across developers. Spacing, typography, color, borders, and component rules.

> Every visual decision in every other issue derives from here. Do not start any other frontend work before this is documented.

---

## 1. Color Palette

Tailwind CSS v4 extension, dark theme only — Signal House is an operator dashboard.

### Surface hierarchy (dark)

| Token        | Value     | Usage              |
| ------------ | --------- | ------------------ |
| `page-bg`    | `#07080a` | Near-black page    |
| `card-bg`    | `#111318` | Dark card surface  |
| `card-hover` | `#1a1d24` | Hover state        |
| `card-border`| `#1e2128` | Card borders       |
| `divider`    | `#262a33` | Subtle dividers    |

### Text hierarchy

| Token            | Value     | Usage                      |
| ---------------- | --------- | -------------------------- |
| `text-primary`   | `#f1f5f9` | Primary text               |
| `text-secondary` | `#94a3b8` | Secondary text             |
| `text-muted`     | `#64748b` | Muted text                 |
| `text-disabled`  | `#475569` | Disabled text              |

### Status colors

| Token     | Value     | Tailwind ref |
| --------- | --------- | ------------ |
| `success` | `#4ade80` | green-400    |
| `warning` | `#fbbf24` | amber-400    |
| `error`   | `#f87171` | red-400      |
| `info`    | `#38bdf8` | sky-400      |
| `stale`   | `#a78bfa` | violet-400   |
| `neutral` | `#64748b` | slate-500    |

### Accent

| Token    | Value                          |
| -------- | ------------------------------ |
| `primary`| `#38bdf8` (sky-400)           |
| `subtle` | `rgba(56, 189, 248, 0.08)`    |

Register these in `tailwind.config.ts` or `globals.css` `@theme` block (Tailwind v4).

### Rules

- ONE consistent color assignment per status state (never multiple mappings).
- Sparse accent color: only for active/selected/urgent, never decoration.
- No hex values in component code — all through Tailwind utilities.

---

## 1b. Background Depth

Avoid flat solid backgrounds. The page background should have subtle depth. Apply a near-black base with an extremely subtle noise/grain texture overlay:

```css
body {
  background: #07080a;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.015'/></svg>");
  pointer-events: none;
  z-index: -1;
}
```

Card surfaces use a slightly lighter tone with a thin border rather than shadows for separation. **Do NOT use box-shadows on cards.**

---

## 2. Typography

Fonts are loaded via `next/font` in `app/layout.tsx` (handled by #154):

```ts
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})
const satoshi = localFont({
  src: './fonts/Satoshi-Variable.woff2',
  variable: '--font-heading',
})
```

### CSS variable references

| Role          | Variable            | Font            |
| ------------- | ------------------- | --------------- |
| Headings      | `--font-heading`    | Satoshi         |
| Body          | `--font-body`       | Instrument Sans |
| Data/numbers  | `--font-mono`       | JetBrains Mono  |

### Scale

Per frontend guidelines — dramatic jumps, not timid increments:

| Token     | Size  | Usage                                    |
| --------- | ----- | ---------------------------------------- |
| `caption` | 12px  | Metadata, badges                         |
| `small`   | 14px  | Timestamps, secondary labels             |
| `body`    | 16px  | Default body text (minimum legible size) |
| `large`   | 18px  | Card headings, section titles            |
| `h3`      | 24px  | Subsection headings (1.5x jump)          |
| `h2`      | 32px  | Section headings (2x jump)               |
| `h1`      | 40px  | Page title (only one per page, 2.5x)     |

### Weights

- Headings: 600–700
- Body: 400
- Metric values: 700 (monospace condensed)

### Line height

- Body: 1.5–1.6
- Headings: 1.2

---

## 3. Spacing

Use the Tailwind scale — no custom values.

| Context       | Token   | Value   |
| ------------- | ------- | ------- |
| Section spacing | `p-6` | 24px  |
| Card padding  | `p-4`   | 16px    |
| Card gap      | `gap-3` | 12px    |
| Grid gap      | `gap-4` | 16px    |
| Content max   | —       | 1280px  |

---

## 4. Border Radius

| Element   | Token          | Value |
| --------- | -------------- | ----- |
| Cards     | `rounded-lg`   | 8px   |
| Badges    | `rounded-full` | —     |
| Buttons   | `rounded-md`   | 6px   |
| Inputs    | `rounded-md`   | 6px   |
| Tooltips  | `rounded-md`   | 6px   |

---

## 5. Shadows and Elevation

- **No box-shadows on cards** (use borders instead).
- Shadows only for:
  - Dropdown: `shadow-lg` + `rgba(0,0,0,0.4)`
  - Modal backdrop: `bg-black/40 backdrop-blur-sm`
  - Hover lift: `translateY(-1px)`

---

## 6. Transitions

### Default

`transition-all duration-150 ease-out` (Tailwind, framework-agnostic)

### Entrance animations

Framer Motion `motion.div`:

```ts
initial={{ opacity: 0, y: 4 }}
animate={{ opacity: 1, y: 0 }}
// duration: 0.3
```

Staggered at 80ms between items.

### Reduced motion

Respect `prefers-reduced-motion: reduce`.

### Staggered list pattern

```tsx
import { motion } from 'framer-motion'

const container = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const item = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

// Usage:
<motion.div variants={container} initial="initial" animate="animate">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      ...
    </motion.div>
  ))}
</motion.div>
```

---

## 7. shadcn/ui Theming (`globals.css`)

shadcn/ui uses CSS variables for theming. These override the defaults after `npx shadcn@latest init`:

```css
/* Dark theme overrides for Signal House */
:root {
  --background: #07080a;
  --foreground: #f1f5f9;
  --card: #111318;
  --card-foreground: #f1f5f9;
  --border: #1e2128;
  --primary: #38bdf8;
  --primary-foreground: #07080a;
  --secondary: #1a1d24;
  --secondary-foreground: #94a3b8;
  --muted: #1a1d24;
  --muted-foreground: #64748b;
  --accent: rgba(56, 189, 248, 0.08);
  --accent-foreground: #38bdf8;
  --destructive: #f87171;
  --destructive-foreground: #07080a;
  --ring: #38bdf8;
  --radius: 0.5rem;
}
```

---

## 8. Performance Guidelines

- Health summary cards and status strip are above the fold — eager render.
- Attention queue and model usage sections are below the fold — use `next/dynamic` with `ssr: false` for non-critical sections.
- The source diagnostics panel must be lazy — never fetch or render it until the user expands it.
- Trend charts should use ECharts' `notMerge` option on updates to prevent memory leaks from accumulated chart instances.
- No section should cause layout shift (CLS > 0) — all state placeholders (skeletons) must reserve exact real-content dimensions.
- Target: initial content render within 1.5s on LAN, interactive within 2.5s.

---

## 9. One Memorable Element

Every page needs one unforgettable design choice. For Signal House this is the **animated health summary strip** — five cards that pulse-stagger into view on page load (80ms delay between each card, 300ms ease-out entrance, implemented via Framer Motion). This is the first thing the user sees and it should feel alive, not static.

- The animation must respect `prefers-reduced-motion: reduce`.
- Only play once per page load (not on every refresh).
