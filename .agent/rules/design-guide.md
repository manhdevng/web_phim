---
trigger: always_on
---

# Design Guide: Lumière Cinema (Apple-Liquid-Glass Style)

## 1. Core Visual Principles
- **Aesthetic:** High-end, dark cinematic atmosphere combined with Apple-style frosted glass.
- **Glassmorphism:** Use `backdrop-blur-xl` + `bg-white/10` + `border border-white/20`.
- **Shapes:** Use "Pill" shapes (`rounded-full`) for navigation and primary action buttons.

## 2. Layout Standards
- **Container:** Main content width should be expansive (`max-w-[90vw]`) to frame the movie experience.
- **Background:** Use `/img/brick.jpg` with a warm top-down spotlight effect (`radial-gradient`).
- **Navbar:** Must be a floating pill, centered via `grid-cols-[1fr_auto_1fr]` to ensure perfect symmetry of the central menu items.

## 3. Typography & Spacing
- **Titles:** `font-playfair` (Serif) for a classic theater feel.
- **Body/UI:** `font-inter` (Sans-serif) for modern legibility.
- **No Wrap:** Navigation labels must include `whitespace-nowrap` to prevent messy line breaks.

## 4. Components
- **Buttons:** Always add `transition-all duration-300` and subtle hover glows.
- **Modals:** Use `framer-motion` for entry/exit animations with a heavy dark backdrop blur.