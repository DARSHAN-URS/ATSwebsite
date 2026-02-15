

## LinkedIn Profile Sync using RapidAPI Real-Time LinkedIn Scraper

Import LinkedIn profile data into the resume editor by pasting a LinkedIn URL. Uses the RapidAPI "Real-Time LinkedIn Scraper API" to fetch structured profile data directly -- no AI parsing needed for most fields.

### Setup

**API Key**: You will need a RapidAPI key with access to the "Real-Time LinkedIn Scraper API" (linkedin-data-api). You'll be prompted to securely store it as a backend secret.

### What Changes

**1. New backend function: `sync-linkedin`** (`supabase/functions/sync-linkedin/index.ts`)
- Accepts a LinkedIn profile URL from the client
- Calls `https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url` with the RapidAPI key
- Maps the structured response directly to the `ResumeData` type:
  - `firstName` + `lastName` -> `personalInfo.fullName`
  - `geo.full` -> `personalInfo.location`  
  - `summary` -> `summary`
  - `position` array -> `experience[]` (title, companyName, description, start/end dates)
  - `educations` array -> `education[]` (degree, schoolName, start/end dates)
  - `skills` array -> `skills[]`
  - `languages` array -> `languages[]`
- Returns the mapped `ResumeData` to the client
- Requires authentication (uses the shared auth helper)

**2. Update `supabase/config.toml`**
- Add `[functions.sync-linkedin]` with `verify_jwt = false`

**3. Update Resume Editor UI** (`src/pages/Resumes.tsx`)
- Add a "Import from LinkedIn" button in the resume list header (next to the Upload Resume button)
- Clicking opens a dialog with:
  - A text input for the LinkedIn profile URL
  - A submit button that calls the `sync-linkedin` function
  - Loading state while fetching
- On success, creates a new resume populated with the LinkedIn data and opens the editor
- On error, shows a toast with the error message

### Data Mapping Details

The RapidAPI response provides structured JSON, so mapping is straightforward without needing AI:

```text
API Response Field        ->  ResumeData Field
─────────────────────────────────────────────────
firstName + lastName      ->  personalInfo.fullName
geo.full                  ->  personalInfo.location
summary                   ->  summary
position[].title          ->  experience[].title
position[].companyName    ->  experience[].company
position[].description    ->  experience[].description
position[].start/end      ->  experience[].startDate/endDate
educations[].degree       ->  education[].degree
educations[].schoolName   ->  education[].school
educations[].start/end    ->  education[].startDate/endDate
skills[]                  ->  skills[]
languages[].name          ->  languages[].name
languages[].proficiency   ->  languages[].proficiency
```

### Files to Create/Modify

- **Create**: `supabase/functions/sync-linkedin/index.ts`
- **Modify**: `src/pages/Resumes.tsx` (add LinkedIn import button and dialog)
- **Modify**: `supabase/config.toml` (add function entry)
