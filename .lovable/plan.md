

# Job Portal — Find and Apply for Jobs Based on Your Resume

## Overview
Add a Job Portal feature to the ATS Resume Builder where users can discover relevant job listings matched to their resume content, and apply directly or track applications seamlessly.

---

## How It Works

Since we don't have access to a paid job board API, we'll use a smart, practical approach:

1. **AI-Powered Job Search via Web Scraping** — Use an edge function that leverages Lovable AI to generate relevant job search queries based on the user's resume, then use a free job search API or scraping service to fetch listings.
2. **Resume-Based Job Matching** — AI analyzes the user's resume (skills, experience, job titles) and scores each job listing for relevance.
3. **One-Click Apply Tracking** — When a user finds a job they like, they can open the external listing or save it directly to the Job Application Tracker with the resume and cover letter pre-linked.

---

## Feature Breakdown

### 1. Job Discovery Page
- New "Find Jobs" section in the sidebar navigation
- User selects which resume to match against
- Optional filters: location, job type (remote/hybrid/onsite), experience level
- AI extracts key skills, job titles, and industry from the selected resume to build search queries

### 2. Job Listings Display
- Card-based layout showing: Job Title, Company, Location, Job Type, Posted Date
- Each card shows an **AI Match Score** (0-100%) indicating how well the job fits the user's resume
- Sort by: Match Score, Date Posted, Company Name
- Click a card to expand and see full job description

### 3. Job Data Source
- Use the **JSearch API** (via RapidAPI — free tier available with 200 requests/month) to fetch real job listings
- Alternative: Use Lovable AI to generate search queries and fetch from free APIs
- Edge function handles API calls server-side to protect API keys
- Results are cached briefly to avoid redundant API calls

### 4. AI Match Scoring
- When job listings are fetched, an edge function sends the resume content + job descriptions to Lovable AI
- AI returns a match score (0-100%) and a brief explanation (e.g., "Strong match: 4/5 required skills present")
- Scores displayed as colored badges on each job card

### 5. Apply Flow
- **"Save & Track"** button on each job card:
  - Automatically creates a new entry in the Job Application Tracker
  - Pre-fills Company, Position, URL, and Date
  - Links the selected resume
  - Option to generate a tailored cover letter before saving
- **"Apply Externally"** button: opens the job posting URL in a new tab

### 6. Saved Jobs
- Users can bookmark jobs to review later
- Saved jobs tab within the Job Portal page
- Move saved jobs to the Application Tracker when ready to apply

---

## Database Changes

### New Table: `saved_jobs`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| job_title | text | Job title |
| company | text | Company name |
| location | text | Job location |
| job_type | text | Remote/hybrid/onsite |
| description | text | Full job description |
| url | text | External job posting URL |
| match_score | integer | AI match score (0-100) |
| match_explanation | text | AI explanation of match |
| source_resume_id | uuid | Resume used for matching |
| is_bookmarked | boolean | Whether user saved it |
| posted_date | date | When the job was posted |
| created_at | timestamptz | When the record was created |

- RLS policy: users can only access their own saved jobs

---

## API Strategy

| Purpose | Service | Details |
|---------|---------|---------|
| Job listings | JSearch API (RapidAPI) | Free tier: 200 req/month. Called via edge function |
| Match scoring | Lovable AI (Gemini Flash) | Scores resume vs job description relevance |
| Search query generation | Lovable AI (Gemini Flash) | Extracts keywords from resume to build optimal search queries |

The JSearch API key will be stored as a Supabase secret. If the user prefers not to use an external API, we can fall back to a manual job URL input mode where users paste job URLs and the AI fetches/analyzes the description.

---

## New Edge Functions

1. **search-jobs** — Takes resume data and optional filters, generates search queries via AI, calls JSearch API, returns listings
2. **match-jobs** — Takes resume data + job descriptions, returns match scores via Lovable AI

---

## UI Pages

1. **Find Jobs** (`/jobs`) — Main job portal with search, filters, and results grid
2. **Job Detail** — Expanded view within the page showing full description, match breakdown, and apply/save actions

---

## Navigation Update
- Add "Find Jobs" to the sidebar between "Cover Letters" and "Job Tracker"
- Dashboard gets a new widget: "Top Job Matches" showing the 3 highest-scoring recent matches

---

## Technical Notes

- Job search results are not permanently stored — only bookmarked/saved jobs are persisted
- Match scoring can be done in batch (up to 10 jobs per AI call) to minimize API usage
- The feature degrades gracefully: if the job API is unavailable, users can still manually add jobs to the tracker
- All API calls go through edge functions to keep keys secure

