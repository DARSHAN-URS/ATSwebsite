
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create resumes table
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- Create saved_jobs table
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT,
  description TEXT,
  url TEXT,
  match_score INTEGER,
  match_explanation TEXT,
  source_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  is_bookmarked BOOLEAN NOT NULL DEFAULT true,
  posted_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved jobs" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved jobs" ON public.saved_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved jobs" ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  url TEXT,
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'applied',
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON public.job_applications FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create cover_letters table
CREATE TABLE public.cover_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  job_description TEXT,
  tone TEXT NOT NULL DEFAULT 'professional',
  cover_letter_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own cover letters"
ON public.cover_letters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cover letters"
ON public.cover_letters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cover letters"
ON public.cover_letters FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cover letters"
ON public.cover_letters FOR DELETE
USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_cover_letters_updated_at
BEFORE UPDATE ON public.cover_letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add cover_letter_id to job_applications
ALTER TABLE public.job_applications
ADD COLUMN cover_letter_id UUID REFERENCES public.cover_letters(id) ON DELETE SET NULL;

-- Create storage bucket for resume profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('resume-photos', 'resume-photos', true);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload own resume photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resume-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update own resume photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resume-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete own resume photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'resume-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to resume photos
CREATE POLICY "Resume photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'resume-photos');
-- Add defensive checks to handle_new_user SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that we're only creating profile for the new user
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;
  
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.handle_new_user() IS 'SECURITY DEFINER required to insert into profiles table from auth trigger. Only processes NEW.id from the triggering auth.users insert. Do not modify without security review.';
-- Make resume-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'resume-photos';

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Resume photos are publicly accessible" ON storage.objects;

-- Create user-scoped SELECT policy
CREATE POLICY "Users can view own resume photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'resume-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE TABLE public.pinned_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  company_website TEXT,
  company_type TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_name)
);

ALTER TABLE public.pinned_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pinned companies" ON public.pinned_companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pinned companies" ON public.pinned_companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pinned companies" ON public.pinned_companies FOR DELETE USING (auth.uid() = user_id);

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('job_seeker', 'recruiter');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create job_posts table
CREATE TABLE public.job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  job_type TEXT NOT NULL DEFAULT 'full-time',
  description TEXT,
  requirements TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

-- Recruiters can manage their own posts
CREATE POLICY "Recruiters can insert own posts"
  ON public.job_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Recruiters can update own posts"
  ON public.job_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Recruiters can delete own posts"
  ON public.job_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

-- All authenticated users can view active posts
CREATE POLICY "Anyone can view active posts"
  ON public.job_posts FOR SELECT
  TO authenticated
  USING (status = 'active' OR auth.uid() = recruiter_id);

-- Trigger for updated_at
CREATE TRIGGER update_job_posts_updated_at
  BEFORE UPDATE ON public.job_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Track views on job posts
CREATE TABLE public.job_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (job_post_id, viewer_id)
);

ALTER TABLE public.job_post_views ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert a view (once per user per job)
CREATE POLICY "Users can insert own views"
  ON public.job_post_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

-- Recruiters can see views on their own posts
CREATE POLICY "Recruiters can view their post views"
  ON public.job_post_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.job_posts
      WHERE job_posts.id = job_post_views.job_post_id
        AND job_posts.recruiter_id = auth.uid()
    )
    OR auth.uid() = viewer_id
  );

-- Applications to recruiter-posted jobs
CREATE TABLE public.job_post_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'applied',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (job_post_id, applicant_id)
);

ALTER TABLE public.job_post_applications ENABLE ROW LEVEL SECURITY;

-- Applicants can insert their own applications
CREATE POLICY "Users can apply to jobs"
  ON public.job_post_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

-- Applicants can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.job_post_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = applicant_id);

-- Recruiters can view applications on their posts
CREATE POLICY "Recruiters can view applications on their posts"
  ON public.job_post_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.job_posts
      WHERE job_posts.id = job_post_applications.job_post_id
        AND job_posts.recruiter_id = auth.uid()
    )
  );

-- Recruiters can update application status on their posts
CREATE POLICY "Recruiters can update application status"
  ON public.job_post_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.job_posts
      WHERE job_posts.id = job_post_applications.job_post_id
        AND job_posts.recruiter_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_job_post_applications_updated_at
  BEFORE UPDATE ON public.job_post_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create recruiter_companies table
CREATE TABLE public.recruiter_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL,
  company_name text NOT NULL,
  logo_url text,
  website text,
  industry text,
  company_size text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (recruiter_id)
);

ALTER TABLE public.recruiter_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can view own company"
  ON public.recruiter_companies FOR SELECT
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert own company"
  ON public.recruiter_companies FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Recruiters can update own company"
  ON public.recruiter_companies FOR UPDATE
  USING (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Recruiters can delete own company"
  ON public.recruiter_companies FOR DELETE
  USING (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

-- Auto-update updated_at
CREATE TRIGGER update_recruiter_companies_updated_at
  BEFORE UPDATE ON public.recruiter_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add columns to job_post_applications
ALTER TABLE public.job_post_applications
  ADD COLUMN recruiter_notes text,
  ADD COLUMN is_shortlisted boolean NOT NULL DEFAULT false;

-- Add missing DELETE policy for job_post_applications
CREATE POLICY "Recruiters can delete applications on their posts"
  ON public.job_post_applications FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM job_posts
    WHERE job_posts.id = job_post_applications.job_post_id
      AND job_posts.recruiter_id = auth.uid()
  ));

-- Allow anyone to view company profiles (for job listings display)
CREATE POLICY "Anyone can view company profiles"
  ON public.recruiter_companies FOR SELECT
  USING (true);
-- Drop the foreign key constraint on user_roles that references auth.users
-- This prevents issues when auth user records are not yet synced
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
-- Add a unique constraint on user_id alone so upsert works
-- First drop existing unique constraint on (user_id, role) if it exists
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Add unique constraint on user_id (one role per user)
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'free',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_subscription_id TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'inactive',
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view company profiles" ON public.recruiter_companies;

-- Replace with a policy that only shows companies with active job posts (or own company)
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
-- Make resume-photos bucket public so getPublicUrl works
UPDATE storage.buckets SET public = true WHERE id = 'resume-photos';

-- Ensure RLS policies exist for uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload resume photos'
  ) THEN
    CREATE POLICY "Users can upload resume photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resume-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update their resume photos'
  ) THEN
    CREATE POLICY "Users can update their resume photos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'resume-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Resume photos are publicly readable'
  ) THEN
    CREATE POLICY "Resume photos are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resume-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their resume photos'
  ) THEN
    CREATE POLICY "Users can delete their resume photos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'resume-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Create AI Apply Queue table
CREATE TABLE public.ai_apply_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- queued | applied | dismissed
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT,
  job_url TEXT,
  description TEXT,
  match_score INTEGER,
  match_explanation TEXT,
  tailored_resume_data JSONB,
  cover_letter_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_apply_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own ai apply queue"
  ON public.ai_apply_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai apply queue"
  ON public.ai_apply_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai apply queue"
  ON public.ai_apply_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai apply queue"
  ON public.ai_apply_queue FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_ai_apply_queue_updated_at
  BEFORE UPDATE ON public.ai_apply_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.email_outreach_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_application_id UUID NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  recruiter_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  resume_id UUID NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_outreach_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email history"
  ON public.email_outreach_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email history"
  ON public.email_outreach_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own email history"
  ON public.email_outreach_history FOR DELETE
  USING (auth.uid() = user_id);

-- Add attachments column to email_outreach_history to store additional document metadata
ALTER TABLE public.email_outreach_history 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL;

-- Create ai_apply_campaigns table
CREATE TABLE IF NOT EXISTS public.ai_apply_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | running | completed | failed
  location TEXT,
  job_type TEXT,
  min_score INTEGER NOT NULL DEFAULT 60,
  max_applications INTEGER NOT NULL DEFAULT 20,
  jobs_searched INTEGER NOT NULL DEFAULT 0,
  jobs_scored INTEGER NOT NULL DEFAULT 0,
  jobs_queued INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_apply_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own campaigns"
  ON public.ai_apply_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
  ON public.ai_apply_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON public.ai_apply_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON public.ai_apply_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Add campaign_id to ai_apply_queue
ALTER TABLE public.ai_apply_queue
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.ai_apply_campaigns(id) ON DELETE SET NULL;

-- Auto-update timestamp trigger
CREATE TRIGGER update_ai_apply_campaigns_updated_at
  BEFORE UPDATE ON public.ai_apply_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add apply_method column to track how each job was auto-applied
ALTER TABLE public.ai_apply_queue 
ADD COLUMN IF NOT EXISTS apply_method text DEFAULT 'manual';

-- Add apply_error column for failed auto-apply attempts
ALTER TABLE public.ai_apply_queue 
ADD COLUMN IF NOT EXISTS apply_error text;
INSERT INTO storage.buckets (id, name, public) VALUES ('email-assets', 'email-assets', true) ON CONFLICT (id) DO NOTHING;

-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Create restricted INSERT policy: users can only self-assign 'job_seeker'
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'job_seeker'
);

-- Remove user-facing INSERT and UPDATE policies on user_subscriptions
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;

-- =============================================
-- Convert all RESTRICTIVE policies to PERMISSIVE
-- by dropping and recreating each one
-- =============================================

-- job_post_views
DROP POLICY IF EXISTS "Recruiters can view their post views" ON public.job_post_views;
CREATE POLICY "Recruiters can view their post views" ON public.job_post_views
  FOR SELECT TO authenticated
  USING ((EXISTS (SELECT 1 FROM job_posts WHERE job_posts.id = job_post_views.job_post_id AND job_posts.recruiter_id = auth.uid())) OR (auth.uid() = viewer_id));

DROP POLICY IF EXISTS "Users can insert own views" ON public.job_post_views;
CREATE POLICY "Users can insert own views" ON public.job_post_views
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

-- job_posts
DROP POLICY IF EXISTS "Anyone can view active posts" ON public.job_posts;
CREATE POLICY "Anyone can view active posts" ON public.job_posts
  FOR SELECT TO authenticated
  USING (status = 'active' OR auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "Recruiters can delete own posts" ON public.job_posts;
CREATE POLICY "Recruiters can delete own posts" ON public.job_posts
  FOR DELETE TO authenticated
  USING (auth.uid() = recruiter_id AND has_role(auth.uid(), 'recruiter'));

DROP POLICY IF EXISTS "Recruiters can insert own posts" ON public.job_posts;
CREATE POLICY "Recruiters can insert own posts" ON public.job_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = recruiter_id AND has_role(auth.uid(), 'recruiter'));

DROP POLICY IF EXISTS "Recruiters can update own posts" ON public.job_posts;
CREATE POLICY "Recruiters can update own posts" ON public.job_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = recruiter_id AND has_role(auth.uid(), 'recruiter'));

-- resumes
DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
CREATE POLICY "Users can delete own resumes" ON public.resumes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
CREATE POLICY "Users can insert own resumes" ON public.resumes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
CREATE POLICY "Users can update own resumes" ON public.resumes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ai_apply_campaigns
DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.ai_apply_campaigns;
CREATE POLICY "Users can delete own campaigns" ON public.ai_apply_campaigns
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.ai_apply_campaigns;
CREATE POLICY "Users can insert own campaigns" ON public.ai_apply_campaigns
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaigns" ON public.ai_apply_campaigns;
CREATE POLICY "Users can update own campaigns" ON public.ai_apply_campaigns
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own campaigns" ON public.ai_apply_campaigns;
CREATE POLICY "Users can view own campaigns" ON public.ai_apply_campaigns
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_subscriptions (SELECT only - INSERT/UPDATE removed for security)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- saved_jobs
DROP POLICY IF EXISTS "Users can delete own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can delete own saved jobs" ON public.saved_jobs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can insert own saved jobs" ON public.saved_jobs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can update own saved jobs" ON public.saved_jobs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- email_outreach_history
DROP POLICY IF EXISTS "Users can delete own email history" ON public.email_outreach_history;
CREATE POLICY "Users can delete own email history" ON public.email_outreach_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email history" ON public.email_outreach_history;
CREATE POLICY "Users can insert own email history" ON public.email_outreach_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own email history" ON public.email_outreach_history;
CREATE POLICY "Users can view own email history" ON public.email_outreach_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- job_applications
DROP POLICY IF EXISTS "Users can delete own applications" ON public.job_applications;
CREATE POLICY "Users can delete own applications" ON public.job_applications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own applications" ON public.job_applications;
CREATE POLICY "Users can insert own applications" ON public.job_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.job_applications;
CREATE POLICY "Users can update own applications" ON public.job_applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own applications" ON public.job_applications;
CREATE POLICY "Users can view own applications" ON public.job_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- cover_letters
DROP POLICY IF EXISTS "Users can delete own cover letters" ON public.cover_letters;
CREATE POLICY "Users can delete own cover letters" ON public.cover_letters
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cover letters" ON public.cover_letters;
CREATE POLICY "Users can insert own cover letters" ON public.cover_letters
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cover letters" ON public.cover_letters;
CREATE POLICY "Users can update own cover letters" ON public.cover_letters
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own cover letters" ON public.cover_letters;
CREATE POLICY "Users can view own cover letters" ON public.cover_letters
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- pinned_companies
DROP POLICY IF EXISTS "Users can delete own pinned companies" ON public.pinned_companies;
CREATE POLICY "Users can delete own pinned companies" ON public.pinned_companies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pinned companies" ON public.pinned_companies;
CREATE POLICY "Users can insert own pinned companies" ON public.pinned_companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own pinned companies" ON public.pinned_companies;
CREATE POLICY "Users can view own pinned companies" ON public.pinned_companies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'job_seeker');

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ai_apply_queue
DROP POLICY IF EXISTS "Users can delete own ai apply queue" ON public.ai_apply_queue;
CREATE POLICY "Users can delete own ai apply queue" ON public.ai_apply_queue
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ai apply queue" ON public.ai_apply_queue;
CREATE POLICY "Users can insert own ai apply queue" ON public.ai_apply_queue
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ai apply queue" ON public.ai_apply_queue;
CREATE POLICY "Users can update own ai apply queue" ON public.ai_apply_queue
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own ai apply queue" ON public.ai_apply_queue;
CREATE POLICY "Users can view own ai apply queue" ON public.ai_apply_queue
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- recruiter_companies
DROP POLICY IF EXISTS "Recruiters can delete own company" ON public.recruiter_companies;
CREATE POLICY "Recruiters can delete own company" ON public.recruiter_companies
  FOR DELETE TO authenticated
  USING (auth.uid() = recruiter_id AND has_role(auth.uid(), 'recruiter'));

DROP POLICY IF EXISTS "Recruiters can insert own company" ON public.recruiter_companies;
CREATE POLICY "Recruiters can insert own company" ON public.recruiter_companies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = recruiter_id AND has_role(auth.uid(), 'recruiter'));

DROP POLICY IF EXISTS "Recruiters can update own company" ON public.recruiter_companies;
CREATE POLICY "Recruiters can update own company" ON public.recruiter_companies
  FOR UPDATE TO authenticated
  USING (auth.uid() = recruiter_id AND has_role(auth.uid(), 'recruiter'));

DROP POLICY IF EXISTS "Recruiters can view own company" ON public.recruiter_companies;
CREATE POLICY "Recruiters can view own company" ON public.recruiter_companies
  FOR SELECT TO authenticated USING (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "View companies with active jobs" ON public.recruiter_companies;
CREATE POLICY "View companies with active jobs" ON public.recruiter_companies
  FOR SELECT TO authenticated
  USING (auth.uid() = recruiter_id OR EXISTS (SELECT 1 FROM job_posts WHERE job_posts.recruiter_id = recruiter_companies.recruiter_id AND job_posts.status = 'active'));

-- job_post_applications
DROP POLICY IF EXISTS "Recruiters can delete applications on their posts" ON public.job_post_applications;
CREATE POLICY "Recruiters can delete applications on their posts" ON public.job_post_applications
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM job_posts WHERE job_posts.id = job_post_applications.job_post_id AND job_posts.recruiter_id = auth.uid()));

DROP POLICY IF EXISTS "Recruiters can update application status" ON public.job_post_applications;
CREATE POLICY "Recruiters can update application status" ON public.job_post_applications
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM job_posts WHERE job_posts.id = job_post_applications.job_post_id AND job_posts.recruiter_id = auth.uid()));

DROP POLICY IF EXISTS "Recruiters can view applications on their posts" ON public.job_post_applications;
CREATE POLICY "Recruiters can view applications on their posts" ON public.job_post_applications
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM job_posts WHERE job_posts.id = job_post_applications.job_post_id AND job_posts.recruiter_id = auth.uid()));

DROP POLICY IF EXISTS "Users can apply to jobs" ON public.job_post_applications;
CREATE POLICY "Users can apply to jobs" ON public.job_post_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Users can view own applications" ON public.job_post_applications;
CREATE POLICY "Users can view own applications" ON public.job_post_applications
  FOR SELECT TO authenticated USING (auth.uid() = applicant_id);

-- Make resume-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'resume-photos';

-- Drop the unrestricted public SELECT policy
DROP POLICY IF EXISTS "Resume photos are publicly readable" ON storage.objects;

-- Add a user-scoped SELECT policy so users can read their own photos via signed URLs
CREATE POLICY "Users can read own resume photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resume-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE TABLE public.payment_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  token text NOT NULL UNIQUE,
  used boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_tokens ENABLE ROW LEVEL SECURITY;

-- No client-side access policies - only service role can read/write

-- 1. Add UNIQUE constraint on user_roles(user_id) to prevent multiple role rows
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- 2. Fix scheduled_interviews policies: change from public to authenticated role
DROP POLICY IF EXISTS "Applicants can view own interviews" ON public.scheduled_interviews;
DROP POLICY IF EXISTS "Recruiters can delete own interviews" ON public.scheduled_interviews;
DROP POLICY IF EXISTS "Recruiters can insert own interviews" ON public.scheduled_interviews;
DROP POLICY IF EXISTS "Recruiters can update own interviews" ON public.scheduled_interviews;
DROP POLICY IF EXISTS "Recruiters can view own interviews" ON public.scheduled_interviews;

CREATE POLICY "Applicants can view own interviews"
ON public.scheduled_interviews FOR SELECT TO authenticated
USING (auth.uid() = applicant_id);

CREATE POLICY "Recruiters can view own interviews"
ON public.scheduled_interviews FOR SELECT TO authenticated
USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert own interviews"
ON public.scheduled_interviews FOR INSERT TO authenticated
WITH CHECK ((auth.uid() = recruiter_id) AND has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Recruiters can update own interviews"
ON public.scheduled_interviews FOR UPDATE TO authenticated
USING ((auth.uid() = recruiter_id) AND has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Recruiters can delete own interviews"
ON public.scheduled_interviews FOR DELETE TO authenticated
USING ((auth.uid() = recruiter_id) AND has_role(auth.uid(), 'recruiter'::app_role));

-- 1. Fix resume-photos storage policies: remove duplicates and change to authenticated role
DROP POLICY IF EXISTS "Users can delete own resume photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their resume photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own resume photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their resume photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own resume photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload resume photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own resume photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own resume photos" ON storage.objects;

CREATE POLICY "Users can read own resume photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resume-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload own resume photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resume-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own resume photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'resume-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own resume photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resume-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
-- 1) Make the unused 'email-assets' bucket private to prevent unauthenticated reads
UPDATE storage.buckets SET public = false WHERE id = 'email-assets';

-- 2) Restrict EXECUTE on the SECURITY DEFINER has_role function:
--    Revoke from PUBLIC and anon so unauthenticated users cannot call it via the API.
--    Authenticated users (and the service role) retain EXECUTE so RLS policies and app code work.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
-- Add admin to app_role enum if it exists, otherwise recreate it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('job_seeker', 'recruiter', 'admin');
  ELSE
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
  END IF;
END $$;

-- Ensure RLS policies allow admins to see everything
-- Resumes
CREATE POLICY "Admins can view all resumes" ON public.resumes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Job Posts
CREATE POLICY "Admins can manage all job posts" ON public.job_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
