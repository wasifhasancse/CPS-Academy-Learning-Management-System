# CPS Academy — Design System & Color Guide

This document establishes the official design specification and color palette for the CPS Academy Learning Management System, inspired by the clean, modern aesthetics of Edule eLearning.

---

## 1. Official Palette

| Token / Role | Hex Code | Color Name | Visual Role & Usage |
|---|:---:|---|---|
| **Primary Brand / Interactive** | `#309255` | Emerald Green | Primary buttons, active navigation indicators, CTAs, interactive highlights, key progress bars, hover accents. |
| **Dark Base / Secondary Action** | `#212832` | Charcoal Slate | Secondary buttons, headers/footers, high-contrast dark backgrounds, headings, dark mode surfaces. |
| **Accent Mint Surface** | `#E7F8EE` | Soft Mint | Highlight badges, icon backgrounds, soft interactive hover pills, active tab backgrounds. |
| **Base Light Canvas** | `#F8FAF9` | Clean Canvas | Light mode background canvas, card surfaces. |
| **Border / Divider** | `#E2ECE6` / `#2E3846` | Soft Neutral Border | Subtle card borders, dividers, table lines. |
| **Muted Text** | `#52565B` / `#9BA4B4` | Muted Gray | Subtitles, body descriptions, timestamps, metadata. |

---

## 2. Theme Token Architecture

### CSS Custom Properties (`globals.css`)

```css
:root {
  /* Edule-Inspired Brand Palette */
  --primary: #309255;
  --secondary: #212832;
  --highlight: #E7F8EE;
  --light-neutral: #F8FAF9;

  /* Base Light Theme */
  --background: #F8FAF9;
  --foreground: #212832;
  --surface: #FFFFFF;
  --card: #FFFFFF;
  --card-foreground: #212832;
  --border: #E2ECE6;
  --muted: #52565B;

  /* Footer Colors */
  --footer-bg: #212832;
  --footer-fg: #F8FAF9;
}

.dark {
  /* Base Dark Theme */
  --background: #181E27;
  --foreground: #F5FBF7;
  --surface: #212832;
  --card: #212832;
  --card-foreground: #F5FBF7;
  --border: #2E3846;
  --muted: #9BA4B4;

  /* Footer Colors (Dark Mode) */
  --footer-bg: #11161D;
  --footer-fg: #F5FBF7;
}
```

---

## 3. Component & Interaction Guidelines

1. **Card Elevation & Hover Lift**:
   - Class: `transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl hover:border-[#309255]`
   - Image Zoom: `overflow-hidden` with `group-hover:scale-105 transition-transform duration-500`

### Shadow & Elevation Rules
- **Rule**: Never use heavy drop shadows (`shadow-xl`, `shadow-2xl`, `shadow-lg`, `shadow-md`).
- **Standard Token**: Strictly use `shadow-1` (`0 2px 6px rgba(0, 0, 0, 0.06)`) or `shadow-xs` / `shadow-2xs` for subtle, clean elevation across all cards, buttons, modals, and dropdowns.
- **Slight Hover Micro-Interactions**: Use subtle, slight micro-lift `hover:-translate-y-0.5` (avoid heavy jumps) combined with `hover:shadow-1` and `duration-300`. For images/thumbnails, use slight zoom `group-hover:scale-[1.02]`.

3. **Buttons & Interactivity**:
   - **Primary Action**: `bg-[#309255] text-white hover:bg-[#212832] transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md active:translate-y-0 font-bold`
   - **Secondary Action**: `bg-[#212832] text-white hover:bg-[#309255] transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md`
   - **Highlight / Mint Action**: `bg-[#E7F8EE] text-[#309255] border border-[#309255]/20 hover:bg-[#309255] hover:text-white transition-all duration-300 font-bold`
   - **Outline**: `border-2 border-[#309255] text-[#309255] hover:bg-[#309255] hover:text-white transition-all duration-300 font-bold`

4. **Badges**:
   - **Highlight / Mint**: `bg-[#E7F8EE] text-[#309255] border border-[#309255]/20 font-bold`
   - **Primary**: `bg-[#309255] text-white font-bold`
   - **Secondary**: `bg-[#212832] text-white font-bold`

4. **Typography**:
   - Font Family: **Roboto** (`var(--font-roboto)`).
   - High contrast headings (`text-[#212832]` in light mode, `text-[#F5FBF7]` in dark mode).
