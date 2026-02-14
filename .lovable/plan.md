

## Improve Resume Template Selector with Tab Filters

Redesign the template selector to use horizontal filter tabs (similar to the reference screenshot) instead of grouped category sections.

### What Changes

**Current**: Templates grouped under category headings (Traditional, Modern, Simple, etc.) in separate sections.

**New**: A single horizontal tab bar at the top with filter options:
- All Templates (default, shows all 12)
- Simple
- Modern
- Professional
- Creative
- Traditional
- ATS

Clicking a tab filters the grid to show only templates in that category. "All Templates" shows everything.

### Visual Style
- Tabs displayed as a horizontal row with icons (matching the reference)
- Active tab highlighted with primary color
- Template cards remain the same thumbnail + name + description layout below

### Technical Details

**File: `src/components/resume/TemplateSelector.tsx`**
- Replace the category-grouped layout with a `Tabs` component (already available via Radix UI)
- Add an "All Templates" default tab plus one tab per unique category
- Filter `RESUME_TEMPLATES` based on the selected tab
- Display filtered templates in a single grid below the tabs

No other files need to change. The template data and categories already exist in `pdfTemplates.ts`.

