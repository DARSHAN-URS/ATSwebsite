import { Link } from "react-router-dom";
import { ArrowRight, Upload, BarChart3, Sparkles, LayoutTemplate, AlertTriangle, XCircle, FileWarning, CheckCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import dashboardPreview from "@/assets/dashboard-preview.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>JobFlow <span className="text-primary">AI</span></span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/resumes" className="text-sm text-muted-foreground transition hover:text-foreground">Resume Templates</Link>
            <Link to="/tracker" className="text-sm text-muted-foreground transition hover:text-foreground">Job Tracker</Link>
          </div>
          <Link to="/auth">
            <Button size="sm" className="rounded-full font-semibold">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(221_83%_53%/0.08),transparent_60%)]" />
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Trusted by 10,000+ job seekers — Free to start
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            The Best AI Resume Builder for{" "}
            <span className="text-primary">Modern ATS Success.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            Our free AI resume builder helps you create a professional, ATS-optimized resume in minutes. Use our <strong className="text-foreground">AI resume grader</strong> to scan your content, identify keyword gaps, and land 3× more interviews.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/resumes">
              <Button size="lg" className="gap-2 rounded-full px-8 font-semibold">
                Build Free ATS Resume <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/resumes">
              <Button variant="outline" size="lg" className="gap-2 rounded-full px-8 font-semibold">
                <Upload className="h-4 w-4" /> Upload Existing Resume
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success" /> 100% ATS-Friendly</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success" /> 2,400+ 5-Star Reviews</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success" /> Over 1M Resumes Built</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Powerful AI Features to Beat the Bots</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Stop getting rejected by Applicant Tracking Systems (ATS). Our tools ensure your resume reaches real recruiters and humans.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <BarChart3 className="h-6 w-6 text-primary" />,
                title: "AI Resume Grader",
                desc: "Instantly scan your resume against ATS criteria to find missing keywords, fix formatting, and improve readability.",
              },
              {
                icon: <Sparkles className="h-6 w-6 text-primary" />,
                title: "One-Click Tailoring",
                desc: "Paste a job description and our AI will tailor your resume to match the specific requirements of that role.",
              },
              {
                icon: <LayoutTemplate className="h-6 w-6 text-primary" />,
                title: "ATS Templates",
                desc: "Access a library of 8 professional, recruiter-approved resume templates designed specifically to be parsed by ATS software.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition hover:shadow-lg">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">{f.icon}</div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Resumes Fail */}
      <section className="py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Why 75% of Resumes Never Get Seen by a Recruiter
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                { icon: <AlertTriangle className="h-5 w-5 text-warning" />, title: "Generic Keywords", desc: "Most resumes lack tailored ATS-friendly keywords, leading to instant rejection." },
                { icon: <XCircle className="h-5 w-5 text-destructive" />, title: "Missing Keywords", desc: "If your resume doesn't match the specific keywords in a job description, it's filtered out automatically." },
                { icon: <FileWarning className="h-5 w-5 text-destructive" />, title: "Poor Readability", desc: "Dense formatting and generic language block your resume from making it past initial filtering systems." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/resumes" className="mt-8 inline-block">
              <Button className="gap-2 rounded-full font-semibold">
                Fix My Resume Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border shadow-2xl">
              <img src={dashboardPreview} alt="JobFlow AI dashboard showing resume score, templates, and job application tracker" className="w-full" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight md:text-3xl">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What is an ATS and why does it matter?", a: "An Applicant Tracking System (ATS) is software used by employers to filter resumes. Over 75% of resumes are rejected before a human ever sees them. JobFlow AI ensures your resume passes these filters." },
              { q: "Is this AI resume builder really free?", a: "Yes! You can create, edit, and download ATS-optimized resumes for free. Our AI-powered grading and tailoring features are also available at no cost." },
              { q: "How does the AI resume grader work?", a: "Our AI analyzes your resume against industry standards and specific job descriptions. It checks for keyword optimization, formatting, readability, and ATS compatibility, then provides an actionable score and suggestions." },
              { q: "Can I import my existing LinkedIn or resume?", a: "Absolutely. You can upload an existing PDF resume and our AI will parse it into an editable format, preserving your content while optimizing the structure for ATS compatibility." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-sidebar-background text-sidebar-foreground">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-5 w-5 text-primary" />
              JobFlow <span className="text-primary">AI</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-sidebar-accent-foreground/70">
              The world's most accurate AI-powered resume builder and ATS optimization suite. Built for job seekers, by recruiters.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sidebar-accent-foreground/50">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/resumes" className="transition hover:text-primary">Resume Templates</Link></li>
              <li><Link to="/resumes" className="transition hover:text-primary">AI Resume Grader</Link></li>
              <li><Link to="/tracker" className="transition hover:text-primary">Job Tracking</Link></li>
              <li><Link to="/cover-letters" className="transition hover:text-primary">Cover Letters</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sidebar-accent-foreground/50">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default text-sidebar-accent-foreground/70">Privacy Policy</span></li>
              <li><span className="cursor-default text-sidebar-accent-foreground/70">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-sidebar-border px-4 py-4">
          <p className="mx-auto max-w-5xl text-center text-xs text-sidebar-accent-foreground/50">
            © {new Date().getFullYear()} JobFlow AI. All rights reserved. Built with ❤️ for job seekers everywhere.
          </p>
        </div>
      </footer>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "JobFlow AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "AI-powered ATS resume builder that helps job seekers create optimized resumes, track applications, and land more interviews.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "2400" },
          }),
        }}
      />
    </div>
  );
};

export default Index;
