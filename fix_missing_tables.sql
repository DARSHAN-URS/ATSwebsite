-- Create missing scheduled_interviews table
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

-- Enable RLS
ALTER TABLE public.scheduled_interviews ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at
CREATE TRIGGER update_scheduled_interviews_updated_at
  BEFORE UPDATE ON public.scheduled_interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create missing payment_tokens table
CREATE TABLE IF NOT EXISTS public.payment_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  token TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_tokens ENABLE ROW LEVEL SECURITY;
