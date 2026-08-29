# CPS Academy — Design System & Color Guide

This document establishes the official design specification and color palette for the CPS Academy Learning Management System. **All styling, theme tokens, and component designs must strictly follow these rules and use only the 4 specified brand colors.**

---

## 1. Official 4-Color Palette

| Token / Role | Hex Code | Color Name | Visual Role & Usage |
|---|:---:|---|---|
| **Primary Dark / Deep Slate Blue** | `#4A628A` | Deep Slate Blue | Primary header/footer base, primary brand dark background, high-contrast text in light mode, primary dark surface. |
| **Primary Interactive / Sky Steel Blue** | `#7AB2D3` | Sky Steel Blue | Primary buttons, active navigation indicators, CTAs, interactive highlights, key progress bars. |
| **Secondary Accent / Pale Teal** | `#B9E5E8` | Pale Teal | Secondary buttons, borders, sub-headings, icons, dark mode highlights, subtle badge outlines. |
| **Base Light / Soft Mint Canvas** | `#DFF2EB` | Soft Mint Canvas | Light mode background canvas, card surfaces, highlight badges, high-contrast text on dark backgrounds. |

---

## 2. Theme Token Architecture

### CSS Custom Properties (`globals.css`)

```css
:root {
  /* Official 4-Color Brand Palette */
  --primary: #4A628A;
  --secondary: #7AB2D3;
  --highlight: #B9E5E8;
  --light-neutral: #DFF2EB;

  /* Base Light Theme */
  --background: #DFF2EB;
  --foreground: #4A628A;
  --surface: #FFFFFF;
  --card: #FFFFFF;
  --card-foreground: #4A628A;
  --border: #B9E5E8;
  --muted: #5A7BA0;

  /* Footer Colors */
  --footer-bg: #4A628A;
  --footer-fg: #DFF2EB;
}

.dark {
  /* Base Dark Theme */
  --background: #1E2A3A;
  --foreground: #DFF2EB;
  --surface: #2A3D5A;
  --card: #2A3D5A;
  --card-foreground: #DFF2EB;
  --border: #7AB2D3;
  --muted: #B9E5E8;

  /* Footer Colors (Dark Mode) */
  --footer-bg: #151E2E;
  --footer-fg: #DFF2EB;
}
```

---

## 3. Strict Color Application Rules

1. **Four-Color Invariant**:
   - Every component, background, border, text, badge, and icon must strictly use one of the 4 defined palette colors (`#4A628A`, `#7AB2D3`, `#B9E5E8`, `#DFF2EB`) or their opacity variants.
   - Never introduce any random external hex colors outside this 4-color palette (except semantic error indicators when required).

2. **No Gradients**:
   - Use clean, solid flat colors with crisp borders and rounded corners (`rounded-2xl`, `rounded-3xl`, `rounded-xl`).

3. **Buttons & Interactivity**:
   - **Primary Action**: `bg-[#7AB2D3] text-white hover:bg-[#4A628A] dark:bg-[#7AB2D3] dark:text-[#1E2A3A] dark:hover:bg-[#B9E5E8] font-bold`
   - **Secondary Action**: `bg-[#4A628A] text-[#DFF2EB] hover:bg-[#5A7BA0] dark:bg-[#5A7BA0] dark:hover:bg-[#7AB2D3]`
   - **Outline**: `border border-[#7AB2D3] text-[#7AB2D3] hover:bg-[#7AB2D3]/10 dark:border-[#B9E5E8] dark:text-[#B9E5E8]`
   - **Highlight Pill / Badges**: `bg-[#B9E5E8]/30 text-[#4A628A] dark:bg-[#B9E5E8]/20 dark:text-[#B9E5E8] border border-[#B9E5E8]/60 font-bold`

4. **Typography**:
   - Font Family: **Roboto** (`var(--font-roboto)`).
   - High contrast headings and body text (`text-[#4A628A]` in light mode, `text-[#DFF2EB]` in dark mode).

5. **Logo & Emblem**:
   - Uses `HiCommandLine` (`>_` from `react-icons/hi2`) inside `#4A628A` / `#7AB2D3` emblem container.
