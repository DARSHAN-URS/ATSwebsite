import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, BarChart3, Upload, Mail, Search, Briefcase, Building2, Users, Kanban, Star, Globe, Shield, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";

const jobSeekerFeatures = [
  { icon: FileText, title: "AI Resume Builder", desc: "12 professional templates with a split-screen editor, live A4 preview, and PDF export. Build ATS-optimized resumes in minutes." },
  { icon: Sparkles, title: "AI Resume Grading", desc: "Get an instant 0-100% score with detailed feedback on ATS compatibility, writing quality, and job-specific fit." },
  { icon: Target, title: "AI Resume Tailoring", desc: "Paste a job description and let AI rewrite your summary, reorder skills, and refine bullet points for maximum relevance." },
  { icon: Upload, title: "Resume Import", desc: "Upload an existing PDF resume and our AI automatically parses it into structured, editable fields." },
  { icon: Mail, title: "AI Cover Letters", desc: "Generate cover letters tailored to specific job descriptions with tone selection and a manual section editor." },
  { icon: Search, title: "Job Search Portal", desc: "Search real-time listings with keyword, location, and type filters. AI match scoring shows how well each role fits your resume." },
  { icon: Briefcase, title: "Unified Job Board", desc: "Browse platform-native recruiter posts and external listings in one place, with direct in-app apply." },
  { icon: BarChart3, title: "Application Tracker", desc: "Track every application with color-coded statuses and link specific resumes and cover letters to each entry." },
  { icon: Building2, title: "Company Directory", desc: "Search companies by name, industry, and location. Pin target organizations and view their active listings." },
];

const recruiterFeatures = [
  { icon: Building2, title: "Company Profile", desc: "Set up your employer brand with logo, industry, size, and description — displayed on all your job listings." },
  { icon: Briefcase, title: "Job Posting Dashboard", desc: "Create and manage job posts with status filters, inline stats for views and applicants, and a rich editor." },
  { icon: Kanban, title: "ATS-Lite Pipeline", desc: "Kanban board with Applied → Screening → Interview → Offer → Rejected stages. Drag to update, add notes, and shortlist." },
  { icon: Users, title: "Candidate Search", desc: "Search and filter all applicants across every job post from a single, unified table." },
  { icon: BarChart3, title: "Recruiter Analytics", desc: "Track performance metrics including total views, application counts, and candidate status breakdowns." },
  { icon: Star, title: "Shortlisting & Notes", desc: "Star your top candidates and add private recruiter notes to any application for your team's reference." },
];

const platformHighlights = [
  { icon: Globe, title: "6 Languages", desc: "English, Arabic, French, Spanish, Hindi, and Portuguese with automatic RTL support." },
  { icon: Shield, title: "Privacy First", desc: "Your data is yours. Secure authentication, encrypted storage, and transparent privacy policies." },
  { icon: Zap, title: "AI-Powered", desc: "All generative features are powered by cutting-edge AI — no API keys or setup required." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="About — ATS Pro Resume Builder"
        description="Learn about ATS Pro Resume Builder: AI-powered resume building, grading, job search, and recruiter tools. Discover features for job seekers and employers."
        canonical="https://atsproresumebuilder.com/about"
        keywords="about ATS Pro, resume builder features, AI resume tools, recruiter ATS, job search platform"
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ATS Pro Resume Builder" className="h-[72px]" />
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-6">
            About the Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Your AI-Powered Career
            <span className="block text-primary mt-1">Command Center</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ATS Pro Resume Builder is a comprehensive career platform that serves both <strong className="text-foreground">job seekers</strong> and <strong className="text-foreground">recruiters</strong>. 
            From AI-optimized resumes to a full applicant tracking system — everything you need in one place.
          </p>
        </div>
      </section>

      {/* Job Seeker Features */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              For Job Seekers
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Land Your Dream Job Faster</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              AI-powered tools to build, optimize, and track every step of your job search.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobSeekerFeatures.map((f) => (
              <div
                key={f.title}
                className="group rounded-[0.625rem] border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruiter Features */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              For Recruiters
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Hire Smarter, Not Harder</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              A lightweight ATS with everything you need to post jobs, manage applicants, and find the best talent.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recruiterFeatures.map((f) => (
              <div
                key={f.title}
                className="group rounded-[0.625rem] border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Built for Everyone</h2>
            <p className="mt-3 text-muted-foreground">Global, secure, and intelligent by design.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformHighlights.map((h) => (
              <div key={h.title} className="text-center p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <h.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{h.title}</h3>
                <p className="text-sm text-muted-foreground">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Supercharge Your Career?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Join thousands of job seekers and recruiters already using ATS Pro Resume Builder.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/job-board">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ATS Pro Resume Builder. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
