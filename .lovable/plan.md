

## Add Recruiter Job Portal (Two-Sided Job Board)

Enable recruiters to post jobs on your platform that are visible to job seekers browsing the site.

### How It Works

**User Roles**: When signing up, users choose whether they are a "Job Seeker" or a "Recruiter." Each role gets a different experience:

- **Recruiters** see a dashboard to create, edit, and manage job postings
- **Job Seekers** see a "Job Board" page listing all active recruiter-posted jobs, with search and filters

### New Database Tables

1. **`user_roles`** -- Stores whether a user is a `job_seeker` or `recruiter` (using an enum `app_role`)
2. **`job_posts`** -- Recruiter-created job listings with fields: title, company, location, job type (full-time/part-time/contract/remote), description, requirements, salary range, status (active/closed), and timestamps

RLS policies ensure recruiters can only manage their own posts, while all authenticated users can view active job posts.

### New Pages and Components

1. **Role Selection** -- After signup, new users pick their role (Job Seeker or Recruiter) via a simple selection screen
2. **Recruiter Dashboard (`/recruiter/jobs`)** -- List, create, edit, and close job postings with a form dialog
3. **Job Board (`/job-board`)** -- Public-facing page for job seekers to browse all active job postings with search by title/company and filters by job type and location

### Navigation Changes

- Sidebar navigation adapts based on role: recruiters see "My Job Posts" instead of resume/cover letter links; job seekers see a new "Job Board" link
- Both roles share common pages like Dashboard

### Technical Details

**Database migration (SQL):**
- Create enum: `app_role` with values `job_seeker`, `recruiter`
- Create `user_roles` table with `user_id`, `role`, RLS policies
- Create `has_role()` security definer function
- Create `job_posts` table with columns: `id`, `recruiter_id`, `title`, `company_name`, `location`, `job_type`, `description`, `requirements`, `salary_min`, `salary_max`, `salary_currency`, `status`, `created_at`, `updated_at`
- RLS: recruiters CRUD own posts; all authenticated users SELECT active posts

**New files:**
- `src/pages/RoleSelection.tsx` -- post-signup role picker
- `src/pages/RecruiterJobs.tsx` -- recruiter job management page
- `src/pages/JobBoard.tsx` -- job seeker browsing page
- `src/hooks/useUserRole.ts` -- hook to fetch current user's role

**Modified files:**
- `src/App.tsx` -- add new routes, role-based routing
- `src/components/AppLayout.tsx` -- dynamic sidebar nav based on role
- `src/i18n/translations.ts` -- add translation keys for new pages

