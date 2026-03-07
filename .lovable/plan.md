

# Sci-Fi UI Redesign Plan (Same Colors)

Transform the entire website into a futuristic sci-fi aesthetic while keeping the existing blue/accent color palette (HSL 217 primary, gold accent, success green, etc.).

## Design Language

The sci-fi theme will be achieved through:
- **Geometric borders**: Clipped corners (CSS `clip-path`) on cards and sections instead of soft rounded corners
- **Glowing effects**: Neon-style glow on borders, buttons, and active elements using `box-shadow` with primary color
- **Grid/scan-line overlays**: Subtle repeating-linear-gradient patterns for a "holographic display" feel
- **Typography**: Switch display font to a more techy/geometric font (e.g., `Orbitron` or `Rajdhani` from Google Fonts) while keeping DM Sans for body readability
- **Animated accents**: Pulse lines, scan-line animations, flickering glow effects
- **Dark-first design**: The sci-fi aesthetic works best in dark mode; light mode will get a cooler/metallic tint

## Files to Change

### 1. `index.html`
- Add Google Font `Rajdhani` (or `Orbitron`) for display headings

### 2. `src/index.css`
- Update CSS variables: keep same HSL hue values but adjust saturation/lightness for a more "tech screen" feel
- Add new utility classes: `.sci-fi-border` (clipped corners), `.glow-border`, `.scan-line` overlay, `.neon-text`
- Add keyframes: `scan-line`, `glow-pulse`, `data-stream`
- Replace `.bounce-hover` with a sci-fi hover effect (glow intensify + slight scale)
- Replace `.card-lift` with a glow-lift effect

### 3. `tailwind.config.ts`
- Update `fontFamily.display` to use `Rajdhani`
- Add sci-fi-specific keyframes and animations

### 4. `src/components/ui/card.tsx`
- Replace `rounded-2xl` with clipped-corner sci-fi border style
- Add subtle glow border effect

### 5. `src/components/ui/button.tsx`
- Update default variant: add glow shadow, sharper corners (clip-path or small radius), scan-line hover
- Keep same colors, just change the shape and glow effects

### 6. `src/pages/Index.tsx` (Landing Page)
- **Navbar**: Add scan-line overlay, sharper border, subtle glow underline on active items
- **Hero**: Replace soft gradient blobs with geometric grid pattern background, add animated scan lines, hexagonal decorations
- **Feature cards**: Clip-path corners, glow borders on hover
- **Stats section**: Mono/tech styling with border glow
- **Review cards**: Tech-panel style with corner accents
- **Footer**: Dark tech-panel with grid overlay
- **Pricing cards**: HUD-style borders with corner brackets

### 7. `src/components/AppLayout.tsx` (Dashboard Sidebar)
- Sidebar: Add scan-line overlay, sharper nav items with glow on active
- Tech-style user card with border glow

### 8. SEO Pages (ATSResumeBuilder, ResumeTemplates, ResumeDownloadFormats, etc.)
- Apply same nav/footer sci-fi treatment
- Update section backgrounds with grid patterns

### 9. `src/App.css`
- Clean up unused default Vite styles

## Key CSS Additions

```text
.sci-fi-card {
  clip-path: polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 
                      100% calc(100% - 8px), calc(100% - 8px) 100%, 
                      8px 100%, 0 calc(100% - 8px));
  border: 1px solid hsl(var(--primary) / 0.3);
}

.glow-border {
  box-shadow: 0 0 8px hsl(var(--primary) / 0.15), 
              inset 0 0 8px hsl(var(--primary) / 0.05);
}

.scan-line::before {
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    hsl(var(--primary) / 0.03) 2px, hsl(var(--primary) / 0.03) 4px
  );
}

.grid-bg {
  background-image: linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

## Scope
- All public pages (landing, SEO pages, about, pricing, blog)
- Dashboard layout and sidebar
- UI primitives (card, button)
- CSS foundation (variables, utilities, animations)

No color changes. No functionality changes. Pure visual/aesthetic transformation.

