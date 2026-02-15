

## Merge Job Board: Show Both External Jobs and Recruiter Posts

Currently, the Job Board (`/job-board`) only shows recruiter-posted jobs from the database. The user wants it to also display external job listings (from the JSearch API) alongside recruiter posts -- all in one unified view.

### What Changes

**Single unified Job Board page** (`src/pages/JobBoard.tsx`) that displays two sections using tabs:

1. **"All Jobs" tab** -- Shows recruiter-posted jobs from the database (loaded automatically on page load, as it works today)
2. **"Find External Jobs" tab** -- Shows AI-matched external jobs from the JSearch API (requires selecting a resume and searching, similar to the current Find Jobs page)

### Implementation Details

**File: `src/pages/JobBoard.tsx`**

- Add Tabs component with two tabs: "Recruiter Posts" and "External Jobs"
- **Recruiter Posts tab**: Keep the existing recruiter job listing logic (fetching from `job_posts` table, search/filter, apply button, expand details)
- **External Jobs tab**: Port the search-jobs functionality from `FindJobs.tsx`:
  - Resume selector dropdown
  - Search query, location, and job type filters
  - Call the `search-jobs` edge function
  - Display results with match scores and save/track actions
- Both tabs share the same search bar for filtering by keyword
- Add a "source" badge on each card so users can distinguish between "Platform" (recruiter) and "External" jobs

**File: `src/pages/FindJobs.tsx`**

- No changes needed -- it remains as a separate dedicated page for power users who want the full AI job search experience

**Navigation**: No route changes needed. The `/job-board` page simply becomes richer with the additional tab.

### Technical Steps

1. Import Tabs, resume fetching logic, and the `search-jobs` edge function invocation into `JobBoard.tsx`
2. Add state for external jobs, selected resume, search query, location, loading state
3. Add a Tabs wrapper around the existing recruiter job list, placing it under a "Recruiter Posts" tab
4. Create an "External Jobs" tab with the resume selector, filters, search button, and results list with match scores
5. Make the header layout responsive (`flex-col sm:flex-row`) to fix mobile styling consistency
