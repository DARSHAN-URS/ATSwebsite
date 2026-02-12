

# Cover Letter Builder - Implementation Plan

## Overview
Add a full Cover Letter Builder feature that lets users generate AI-tailored cover letters based on their resume and a job description, with manual editing, tone selection, and PDF export.

---

## What You'll Get

1. **New "Cover Letters" page** in the sidebar navigation
2. **AI-powered generation** -- select a resume, paste a job description, pick a tone, and AI writes a tailored cover letter
3. **Section-based editor** -- manually edit greeting, opening, body paragraphs, and closing
4. **Tone selector** -- Professional, Enthusiastic, or Conversational
5. **Cover letter management** -- list, edit, delete saved cover letters
6. **PDF export** -- download your cover letter as a clean PDF
7. **Dashboard integration** -- cover letter count shown on the dashboard

---

## Technical Details

### 1. Database: `cover_letters` table

New table with columns:
- `id` (uuid, primary key)
- `user_id` (uuid, not null)
- `title` (text, not null)
- `resume_id` (uuid, nullable, references resumes)
- `job_description` (text, nullable)
- `tone` (text, default 'professional')
- `cover_letter_data` (jsonb) -- stores sections: greeting, opening, body, closing
- `created_at`, `updated_at` (timestamptz)

RLS policies: users can only CRUD their own cover letters.

### 2. Edge Function: `generate-cover-letter`

- Accepts: resume data, job description, tone
- Uses Lovable AI (Gemini Flash) to generate a structured cover letter with sections (greeting, opening, body, closing)
- Uses tool calling to extract structured JSON output
- Handles 429/402 rate limit errors gracefully

### 3. New Page: `CoverLetters.tsx` (`/cover-letters`)

- Lists all saved cover letters in a card grid
- "New Cover Letter" dialog:
  - Select a resume from dropdown
  - Paste job description
  - Choose tone (Professional / Enthusiastic / Conversational)
  - "Generate with AI" button
- After generation, opens a section editor for manual tweaking
- Preview panel showing formatted cover letter
- "Download PDF" button using browser print

### 4. Navigation & Dashboard Updates

- Add "Cover Letters" nav item to sidebar (between Resumes and Find Jobs)
- Add cover letter count card to Dashboard
- Add `cover_letter_id` column to `job_applications` table for linking

### 5. Files Changed/Created

| File | Action |
|------|--------|
| `supabase/migrations/...` | Create `cover_letters` table + RLS + add `cover_letter_id` to `job_applications` |
| `supabase/functions/generate-cover-letter/index.ts` | New edge function for AI generation |
| `src/pages/CoverLetters.tsx` | New page with list, create, edit, preview, export |
| `src/components/AppLayout.tsx` | Add Cover Letters nav item |
| `src/pages/Dashboard.tsx` | Add cover letter count stat |
| `src/App.tsx` | Add `/cover-letters` route |

