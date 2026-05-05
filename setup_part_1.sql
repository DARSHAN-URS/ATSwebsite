
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
