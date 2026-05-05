-- 1. Create missing tables safely
CREATE TABLE IF NOT EXISTS public.scheduled_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL,
  recruiter_id UUID NOT NULL,
  application_id UUID NOT NULL REFERENCES public.job_post_applications(id) ON DELETE CASCADE,
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  zoom_meeting_id TEXT,
  zoom_join_url TEXT,
  zoom_start_url TEXT,
  zoom_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  token TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS safely
ALTER TABLE public.scheduled_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies and Storage
DROP POLICY IF EXISTS "Anyone can view company profiles" ON public.recruiter_companies;
CREATE POLICY "View companies with active jobs"
  ON public.recruiter_companies FOR SELECT
  USING (
    auth.uid() = recruiter_id OR
    EXISTS (
      SELECT 1 FROM public.job_posts
      WHERE job_posts.recruiter_id = recruiter_companies.recruiter_id
        AND job_posts.status = 'active'
    )
  );

UPDATE storage.buckets SET public = true WHERE id = 'resume-photos';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload resume photos') THEN
    CREATE POLICY "Users can upload resume photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resume-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Resume photos are publicly readable') THEN
    CREATE POLICY "Resume photos are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'resume-photos');
  END IF;
END $$;

-- Add AI Apply Queue and History if they don't exist
CREATE TABLE IF NOT EXISTS public.ai_apply_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_apply_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own ai apply queue" ON public.ai_apply_queue;
CREATE POLICY "Users can view own ai apply queue" ON public.ai_apply_queue FOR SELECT USING (auth.uid() = user_id);
