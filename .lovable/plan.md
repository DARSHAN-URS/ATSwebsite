

# Recruiter Portal Redesign

A comprehensive overhaul of the recruiter experience, transforming the current basic job posting pages into a full-featured employer hub with company profiles, an ATS-lite applicant manager, resume search, and candidate pipeline management.

---

## What You Will Get

1. **Employer Company Profile Page** -- A dedicated page where recruiters set up their company info (name, logo, description, website, industry, size). This profile is displayed on job listings to build trust with candidates.

2. **Redesigned Job Posting Dashboard** -- A polished tabbed interface replacing the current flat list. Includes quick stats per job (views, applicants), bulk actions, status filters, and a richer create/edit form with a step-by-step layout.

3. **Applicant Management System (ATS-Lite)** -- A per-job-post view showing all candidates in a Kanban-style pipeline (Applied > Screening > Interview > Offer > Rejected). Recruiters can drag-and-drop or click to change status, add private notes, and view linked resumes.

4. **Resume Search** -- A searchable list of all applicants who have applied to any of the recruiter's jobs, with keyword filtering across resume content, skills, and job titles.

5. **Shortlisting, Notes, and Status Updates** -- Each candidate card supports shortlist toggling (star/flag), private recruiter notes (stored per application), and quick status dropdown changes with timestamp tracking.

---

## New Pages and Routes

| Route | Page | Purpose |
|---|---|---|
| `/recruiter/company` | RecruiterCompany | Company profile setup |
| `/recruiter/jobs` | RecruiterJobs (redesigned) | Job posting dashboard with filters/tabs |
| `/recruiter/jobs/:jobId/applicants` | RecruiterApplicants | ATS-lite pipeline for a specific job |
| `/recruiter/candidates` | RecruiterCandidates | Resume search across all applicants |
| `/recruiter/analytics` | RecruiterAnalytics (enhanced) | Existing analytics, kept as-is |

---

## Database Changes

### New Table: `recruiter_companies`
Stores the recruiter's company profile.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| recruiter_id | uuid | Owner (auth.uid) |
| company_name | text | Required |
| logo_url | text | Optional |
| website | text | Optional |
| industry | text | Optional |
| company_size | text | Optional (e.g. "1-10", "11-50") |
| description | text | Optional |
| created_at / updated_at | timestamptz | Auto |

RLS: recruiters can only CRUD their own row.

### Alter Table: `job_post_applications`
Add columns for recruiter notes and shortlisting.

| New Column | Type | Notes |
|---|---|---|
| recruiter_notes | text | Private notes by recruiter |
| is_shortlisted | boolean | Default false |

RLS: existing policies already allow recruiter updates on their posts' applications.

---

## Navigation Update

The recruiter sidebar will expand from 3 to 5 items:

- Dashboard
- Company Profile
- Job Posts
- Candidates (resume search)
- Analytics

---

## Implementation Steps

### Step 1: Database Migration
- Create `recruiter_companies` table with RLS policies
- Add `recruiter_notes` and `is_shortlisted` columns to `job_post_applications`
- Add DELETE policy for `job_post_applications` (currently missing)

### Step 2: Company Profile Page (`RecruiterCompany.tsx`)
- Form to create/edit company info (name, logo upload, website, industry, size, description)
- Auto-loads existing profile on mount, upserts on save
- Logo upload uses the existing `resume-photos` storage bucket

### Step 3: Redesign Job Posting Dashboard (`RecruiterJobs.tsx`)
- Add filter tabs: All / Active / Closed
- Show inline stats per card (views count, applicant count)
- Add "View Applicants" button on each job card linking to the ATS page
- Improve the create/edit dialog with better layout and validation
- Pull company name from `recruiter_companies` as default

### Step 4: Applicant Management Page (`RecruiterApplicants.tsx`)
- Route: `/recruiter/jobs/:jobId/applicants`
- Pipeline columns: Applied, Screening, Interview, Offer, Rejected
- Each candidate card shows: name (from profile), applied date, linked resume link, shortlist star, notes icon
- Click a card to open a detail drawer with: resume preview link, status dropdown, notes editor, shortlist toggle
- Status changes update `job_post_applications.status`
- Notes saved to `job_post_applications.recruiter_notes`

### Step 5: Resume/Candidate Search Page (`RecruiterCandidates.tsx`)
- Lists all unique applicants across all recruiter's job posts
- Search bar filters by applicant email/name and the job they applied for
- Each row shows: candidate info, which job(s) they applied to, current status, shortlisted flag
- Click to navigate to the specific job's applicant view

### Step 6: Update Navigation
- Add new routes to `App.tsx`
- Expand `recruiterNav` in `AppLayout.tsx` with Company Profile and Candidates links
- Add translation keys for new nav items and page content

### Step 7: Localization
- Add all new UI strings to `translations.ts` for all 6 languages (en, ar, es, fr, hi, pt)

