import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, BarChart3, Upload, Mail, Search, Briefcase, Building2, Users, Kanban, Star, Globe, Shield, Zap, Target, CheckCircle, TrendingUp, Clock, Award, Heart, Layers, MonitorSmartphone, Lock, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";

const jobSeekerFeatures = [
  { icon: FileText, title: "AI Resume Builder", desc: "Choose from 12 professionally designed templates — ATS Optimized, Modern, Elegant, Sidebar, and more. Our split-screen editor gives you a live A4 preview as you type, with one-click PDF export. Every template is engineered to pass Applicant Tracking Systems used by 98% of Fortune 500 companies.", bullets: ["12 ATS-optimized templates with tab-based filtering", "Live split-screen A4 preview with multi-page pagination", "Profile photo, custom sections, and language proficiency levels", "One-click high-quality PDF download"] },
  { icon: Sparkles, title: "AI Resume Grading", desc: "Get an instant, detailed analysis of your resume scored from 0-100%. Our AI evaluates three critical dimensions to give you actionable feedback — not just a number.", bullets: ["ATS Compatibility — keyword density, formatting, and parsability", "Writing Quality — grammar, clarity, impact verbs, and quantification", "Job-Specific Fit — relevance to your target role and industry", "Category-specific strengths and improvement suggestions"] },
  { icon: Target, title: "AI Resume Tailoring", desc: "Stop sending the same generic resume to every job. Paste any job description and our AI instantly rewrites your resume to maximize relevance — while keeping everything truthful.", bullets: ["Rewrites professional summary to match role requirements", "Reorders and adds skills based on job description keywords", "Refines experience bullet points for maximum relevance", "Maintains truthfulness while optimizing for ATS keywords"] },
  { icon: Upload, title: "Resume Import & Parsing", desc: "Already have a resume? Upload your existing PDF and our AI extracts every detail — work experience, education, skills, contact info — and maps it into structured, editable fields. No manual re-typing required.", bullets: ["PDF text extraction using advanced document processing", "AI-powered field mapping (Gemini Flash)", "Supports complex multi-page resume layouts", "Edit and enhance immediately after import"] },
  { icon: Mail, title: "AI Cover Letter Generator", desc: "Generate professional cover letters tailored to specific job descriptions. Link any of your resumes for context, choose a tone that matches the company culture, and fine-tune every section.", bullets: ["Tailored to specific job descriptions and your resume", "Tone selector: Professional, Friendly, Confident, and more", "Section-by-section manual editor for full control", "Link directly to job applications in the tracker"] },
  { icon: Search, title: "Smart Job Search", desc: "Search thousands of real-time job listings powered by the JSearch API. Filter by keyword, location, and job type — then let our AI score each listing against your resume to show you the best matches.", bullets: ["Real-time listings from thousands of employers", "Keyword, location, and job type filters", "AI match scoring (0-100%) against your selected resume", "Detailed fit explanations for every match score"] },
  { icon: Briefcase, title: "Unified Job Board", desc: "One place for all opportunities. Our Job Board combines platform-native posts from recruiters using ATS Pro with external listings, so you never miss an opening.", bullets: ["Tabbed interface: Platform jobs + External listings", "Direct in-app apply for recruiter posts (links your resume)", "AI-powered match scoring for external roles", "Save and track any listing with one click"] },
  { icon: BarChart3, title: "Application Tracker", desc: "Never lose track of where you applied. Our visual dashboard uses color-coded status indicators so you can see your entire pipeline at a glance.", bullets: ["Color-coded statuses: Applied, Interview, Offer, Rejected", "Link specific resumes and cover letters to each application", "Add notes, URLs, and dates for every entry", "Sort and filter to focus on active opportunities"] },
  { icon: Building2, title: "Company Directory", desc: "Research potential employers before you apply. Search by company name, industry, or location. View active listings, company details, and pin your target organizations for ongoing tracking.", bullets: ["Search by name, industry, and location", "View real-time active job listings per company", "Pin/save companies to a persistent watchlist", "Aggregated data from the JSearch API"] },
];

const recruiterFeatures = [
  { icon: Building2, title: "Company Profile & Branding", desc: "First impressions matter. Set up a complete company profile that appears on every job listing you post — building instant trust and credibility with candidates.", bullets: ["Company name, logo, website, industry, and size", "Rich description to showcase company culture", "Automatically displayed on all your job posts", "Logo upload with secure cloud storage"] },
  { icon: Briefcase, title: "Job Posting Dashboard", desc: "A polished command center for all your open positions. Create, edit, and manage job posts with a rich form, status filters, and real-time performance metrics.", bullets: ["Quick-create with step-by-step form layout", "Filter tabs: All, Active, Closed", "Inline stats per card: views count, applicant count", "Salary range, job type, location, and requirements fields"] },
  { icon: Kanban, title: "ATS-Lite Applicant Pipeline", desc: "Move beyond spreadsheets. Our Kanban-style pipeline gives you a visual, drag-and-drop interface to manage every applicant through your hiring stages.", bullets: ["5 stages: Applied → Screening → Interview → Offer → Rejected", "Candidate cards with name, applied date, and resume link", "Click to open detail drawer with full application info", "Status changes tracked with timestamps"] },
  { icon: Users, title: "Candidate Search & Database", desc: "Search across all applicants who have ever applied to any of your jobs. Filter by name, email, or the specific position they applied for — all from one unified view.", bullets: ["Searchable table of all unique applicants", "Filter by candidate info or job title", "View which jobs each candidate applied to", "Quick-navigate to specific job's applicant pipeline"] },
  { icon: BarChart3, title: "Recruiter Analytics", desc: "Data-driven hiring decisions. Track how your job posts perform with aggregate metrics and per-post breakdowns.", bullets: ["Total views and application counts", "Candidate status breakdown (Applied, Interviewing, etc.)", "Performance trends across all your postings", "Identify top-performing listings at a glance"] },
  { icon: Star, title: "Shortlisting & Private Notes", desc: "Collaborate and organize your hiring process. Star your top candidates and attach private recruiter notes to any application.", bullets: ["One-click shortlist toggle (star/flag)", "Private notes stored per application", "Notes visible only to the recruiter — never to candidates", "Quick-filter to view only shortlisted candidates"] },
];

const benefits = [
  { icon: TrendingUp, title: "3× More Interview Callbacks", desc: "ATS-optimized resumes pass automated filters that reject 75% of applications. Our users report significantly higher response rates from employers." },
  { icon: Clock, title: "Save Hours Every Week", desc: "Stop manually tailoring resumes and writing cover letters from scratch. Our AI does the heavy lifting in seconds, not hours." },
  { icon: Award, title: "Professional Quality, Zero Cost", desc: "Access 12 premium resume templates, AI grading, AI tailoring, and a full job tracker — completely free. No hidden fees, no credit card required." },
  { icon: Target, title: "Precision Job Matching", desc: "Our AI analyzes your resume against every job listing and gives you a compatibility score with detailed explanations — so you apply smarter, not harder." },
  { icon: Layers, title: "All-in-One Platform", desc: "Resume builder, cover letter generator, job search, application tracker, and company research — no need to juggle 5 different tools." },
  { icon: Heart, title: "Built for Real People", desc: "Whether you're a fresh graduate, career changer, or experienced professional — our templates and AI adapt to your level and industry." },
];

const platformHighlights = [
  { icon: Globe, title: "6 Languages", desc: "Full support for English, Arabic, French, Spanish, Hindi, and Portuguese. Every page, button, and label is translated — not just the marketing site." },
  { icon: Languages, title: "RTL Support", desc: "Automatic right-to-left layout switching for Arabic speakers. The entire interface mirrors seamlessly — navigation, forms, previews, and more." },
  { icon: Shield, title: "Privacy & Security", desc: "Your data stays yours. We use industry-standard encryption, secure authentication, and transparent privacy policies. We never sell your personal information." },
  { icon: Lock, title: "Role-Based Access", desc: "Job seekers and recruiters each get a tailored experience. Your data is isolated and protected with row-level security on every database table." },
  { icon: Zap, title: "AI-Powered Intelligence", desc: "All generative features — resume writing, grading, tailoring, cover letters, and job matching — are powered by cutting-edge AI with no API keys or setup required." },
  { icon: MonitorSmartphone, title: "Fully Responsive", desc: "Works beautifully on desktop, tablet, and mobile. The resume editor adapts its layout, and the navigation transforms into a mobile-friendly sidebar." },
];

const stats = [
  { value: "12", label: "Resume Templates" },
  { value: "6", label: "Languages Supported" },
  { value: "5", label: "ATS Pipeline Stages" },
  { value: "100%", label: "Free to Use" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="About — ATS Pro Resume Builder"
        description="Learn about ATS Pro Resume Builder: AI-powered resume building, grading, job search, and recruiter tools. Discover features and benefits for job seekers and employers."
        canonical="https://atsproresumebuilder.com/about"
        keywords="about ATS Pro, resume builder features, AI resume tools, recruiter ATS, job search platform, career tools, ATS optimization"
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
            About ATS Pro Resume Builder
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Your AI-Powered Career
            <span className="block text-primary mt-1">Command Center</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ATS Pro Resume Builder is a comprehensive, free career platform that bridges the gap between <strong className="text-foreground">job seekers</strong> and <strong className="text-foreground">recruiters</strong>. 
            We combine AI-powered resume tools, intelligent job matching, and a lightweight applicant tracking system into one seamless experience.
          </p>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Over 75% of resumes are rejected by Applicant Tracking Systems before a human ever sees them. We built ATS Pro to change that — giving every candidate the tools to create resumes that pass ATS filters and stand out to hiring managers.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary font-mono">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Our Mission
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Democratizing Career Success</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The job market is broken. Talented candidates get filtered out by algorithms before a recruiter ever reads their resume. Meanwhile, small and mid-sized employers struggle to find qualified candidates without expensive enterprise ATS software.
            </p>
            <p>
              <strong className="text-foreground">ATS Pro Resume Builder solves both sides of this equation.</strong> For job seekers, we provide AI-powered tools that ensure your resume not only passes automated filters but also impresses the humans on the other side. For recruiters, we offer a streamlined, free hiring dashboard that doesn't require a six-figure software budget.
            </p>
            <p>
              We believe that access to professional career tools shouldn't depend on your budget. That's why our entire platform — including AI features — is free to use. No trials, no paywalls, no bait-and-switch.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Why ATS Pro?
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Benefits That Make a Difference</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Real advantages that translate into real results for your career or hiring process.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-[0.625rem] border border-border bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Seeker Features */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              For Job Seekers
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Everything You Need to Land the Job</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              A complete suite of AI-powered tools designed to give you an unfair advantage in your job search.
            </p>
          </div>
          <div className="space-y-6">
            {jobSeekerFeatures.map((f) => (
              <div
                key={f.title}
                className="group rounded-[0.625rem] border border-border bg-card p-6 md:p-8 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {f.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
              For Recruiters & Employers
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Hire Smarter, Not Harder</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              A lightweight ATS and hiring dashboard — powerful enough for serious recruiting, simple enough to start in minutes.
            </p>
          </div>
          <div className="space-y-6">
            {recruiterFeatures.map((f) => (
              <div
                key={f.title}
                className="group rounded-[0.625rem] border border-border bg-card p-6 md:p-8 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {f.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Platform
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Built for Everyone, Everywhere</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Global, secure, responsive, and intelligent — by design, not as an afterthought.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformHighlights.map((h) => (
              <div key={h.title} className="rounded-[0.625rem] border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <h.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{h.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Getting Started
            </span>
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-3 text-muted-foreground">From signup to your first interview — in 4 simple steps.</p>
          </div>
          <div className="space-y-0">
            {[
              { step: "1", title: "Create Your Free Account", desc: "Sign up with email or Google in seconds. Choose your role — Job Seeker or Recruiter — and get instant access to all features." },
              { step: "2", title: "Build or Import Your Resume", desc: "Start from scratch with one of 12 templates, or upload an existing PDF and let our AI parse it into editable fields. Either way, you'll have a polished, ATS-optimized resume in minutes." },
              { step: "3", title: "Grade, Tailor & Perfect", desc: "Run the AI Grader for a detailed score and feedback. Then use AI Tailoring to customize your resume for specific jobs — maximizing your match score and ATS compatibility." },
              { step: "4", title: "Search, Apply & Track", desc: "Find jobs through our unified board, apply with one click, generate a matching cover letter, and track every application in your personal dashboard. Never lose track of an opportunity again." },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-5 py-6">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold font-mono text-sm">
                    {s.step}
                  </div>
                  {i < 3 && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-2">
                  <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
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
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands of job seekers and recruiters already using ATS Pro Resume Builder to land jobs faster and hire smarter.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/job-board">Browse Jobs</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required • Free forever • All features included</p>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-border py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h3 className="text-lg font-semibold mb-2">Questions or Feedback?</h3>
          <p className="text-sm text-muted-foreground">
            We'd love to hear from you. Reach out at{" "}
            <a href="mailto:support@atsproresumebuilder.com" className="text-primary font-medium hover:underline">
              support@atsproresumebuilder.com
            </a>
          </p>
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
