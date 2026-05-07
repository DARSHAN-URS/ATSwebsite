

# Plan: Fix AI Apply Timeout Issue

## Problem
The `ai-apply` edge function times out because it tries to do too much in a single request:
1. Searches 5 pages of jobs in parallel (up to 50 jobs)
2. Scores all jobs in AI batches of 10 (multiple slow AI calls)
3. Inserts results into the database

The edge function timeout (~60s) is exceeded, causing "connection closed before message completed".

## Solution: Split into a Two-Phase Architecture

Instead of doing everything in one long-running request, split the work into smaller pieces that each complete within the timeout.

### Phase 1: Reduce work in `ai-apply` function
- Reduce parallel job search from 5 pages to 2 pages (max ~20 jobs)
- Reduce AI batch size to process fewer jobs at once
- Add early timeout detection to return partial results rather than crashing

### Phase 2: Process AI scoring incrementally
- Score only the first batch of 10 jobs in the initial request
- Return results immediately after the first batch completes
- If more jobs need scoring, the client can trigger additional batches

### Technical Changes

**File: `supabase/functions/ai-apply/index.ts`**
- Reduce `[1, 2, 3, 4, 5]` page searches to `[1, 2]` (max ~20 unique jobs instead of 50)
- Add a total timeout guard (45s) that stops processing and returns partial results
- Reduce AI prompt size by trimming job descriptions further (300 -> 200 chars)
- Add `AbortController` with timeout to the AI gateway call to prevent individual batch hangs

**File: `src/pages/Resumes.tsx`**
- Handle partial results gracefully (show "X of Y jobs scored" in toast)
- Adjust step animation timings to match the shorter expected duration (~20s instead of 45s)

### Why This Approach
- No database schema changes needed
- No new edge functions needed
- Stays within edge function timeout limits
- User gets results faster (fewer jobs but reliably)
- The existing auto-apply queue and campaign tracking continues to work

