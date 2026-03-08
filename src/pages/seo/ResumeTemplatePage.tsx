import { useParams, Link } from "react-router-dom";
import { ArrowRight, CheckCircle, ChevronRight, Layout, FileText, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { getResumeExampleBySlug, getRelatedExamples } from "@/data/resumeExamples";
const logo = "/images/logo-main.png";
import Logo from "@/components/Logo";

export default function ResumeTemplatePage() {
  const { jobTitle } = useParams<{ jobTitle: string }>();
  const data = getResumeExampleBySlug(jobTitle || "");

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Template not found</h1>
          <Button asChild><Link to="/resume-templates">Browse all templates</Link></Button>
        </div>
      </div>
    );
  }

  const related = getRelatedExamples(data.slug, 6);
  const pageTitle = `${data.jobTitle} Resume Template (Free ATS-Friendly) | ATS Pro`;
  const pageDesc = `Download a free ATS-friendly ${data.jobTitle} resume template. Pre-written content, optimized formatting, and ATS-safe layout designed for ${data.category} roles.`;
  const canonical = `https://atsproresumebuilder.com/resume-template/${data.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${data.jobTitle} Resume Template — Free ATS-Friendly Layout`,
    description: pageDesc,
    author: { "@type": "Organization", name: "ATS Pro Resume Builder" },
    publisher: { "@type": "Organization", name: "ATS Pro Resume Builder", logo: { "@type": "ImageObject", url: "https://atsproresumebuilder.com/favicon.png" } },
    mainEntityOfPage: canonical,
    datePublished: "2026-03-01",
    dateModified: "2026-03-08",
  };

  const templateSections = [
    { icon: Star, title: "Professional Summary", content: data.summaryExample },
    {
      icon: FileText,
      title: "Key Skills",
      content: data.skills.join(" · "),
    },
    {
      icon: Layout,
      title: "Work Experience",
      content: `${data.experienceExample.title} at ${data.experienceExample.company} (${data.experienceExample.duration})\n${data.experienceExample.bullets.map((b) => `• ${b}`).join("\n")}`,
    },
    {
      icon: Download,
      title: "Education",
      content: `${data.educationExample.degree} — ${data.educationExample.school}, ${data.educationExample.year}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={pageTitle} description={pageDesc} canonical={canonical} keywords={`${data.jobTitle} resume template, free ${data.jobTitle} resume, ATS resume template ${data.jobTitle}, ${data.jobTitle} CV template`} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-12" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/resume-examples" className="text-sm text-muted-foreground hover:text-foreground transition">Examples</Link>
            <Link to="/resume-templates" className="text-sm text-muted-foreground hover:text-foreground transition">Templates</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">Blog</Link>
            <Button size="sm" asChild><Link to="/">Build Resume</Link></Button>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-4 pt-4">
        <nav className="flex items-center text-xs text-muted-foreground gap-1">
          <Link to="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/resume-templates" className="hover:text-foreground transition">Resume Templates</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{data.jobTitle}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">{data.category} · Free Template</span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
            {data.jobTitle} Resume Template
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">(ATS-Friendly · Free · {new Date().getFullYear()})</p>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Use this professionally crafted, ATS-optimized template to create a {data.jobTitle} resume that passes automated screening and impresses recruiters.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/">Use This Template Free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to={`/resume-examples/${data.slug}`}>View Full Example <FileText className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Template Preview */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-6 text-center">Template Preview</h2>
          <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8 space-y-6 shadow-lg">
            {/* Name Header */}
            <div className="text-center border-b border-border/60 pb-4">
              <h3 className="text-xl font-bold">[Your Full Name]</h3>
              <p className="text-sm text-muted-foreground mt-1">email@example.com · (555) 123-4567 · City, State · linkedin.com/in/yourname</p>
            </div>

            {templateSections.map(({ icon: Icon, title, content }) => (
              <div key={title}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Template */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-6">Why Use This {data.jobTitle} Template?</h2>
          <ul className="space-y-3">
            {[
              "ATS-optimized single-column layout that passes all major applicant tracking systems",
              `Pre-written content tailored for ${data.jobTitle} roles in the ${data.category} industry`,
              "Standard section headings that ATS parsers recognize immediately",
              "Clean formatting with no graphics, tables, or columns that break ATS parsing",
              "Professional typography that looks great to human reviewers after passing ATS",
              "Includes industry-specific keywords and action verbs for maximum match scores",
            ].map((point, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to Customize */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-6">How to Customize This Template</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Replace placeholder content", desc: "Swap the sample text with your own information. Keep the same section structure for ATS compatibility." },
              { step: "2", title: "Add job-specific keywords", desc: `Read the job description and incorporate relevant terms. Top keywords for ${data.jobTitle}: ${data.skills.slice(0, 5).join(", ")}.` },
              { step: "3", title: "Quantify your achievements", desc: "Replace generic statements with specific metrics: percentages, dollar amounts, team sizes, and timeframes." },
              { step: "4", title: "Tailor your summary", desc: "Rewrite the professional summary for each application, highlighting the most relevant experience for that specific role." },
              { step: "5", title: "Check your ATS score", desc: "Use our free ATS checker to verify your resume scores 80%+ before submitting." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 rounded-xl border border-border/60 bg-card p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">{item.step}</span>
                <div>
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATS Tips */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-4">ATS Tips for {data.jobTitle} Resumes</h2>
          <ul className="space-y-3">
            {data.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary/5 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-extrabold mb-4">Build Your {data.jobTitle} Resume in 2 Minutes</h2>
          <p className="text-muted-foreground mb-6">Start with this template, customize with your details, and get instant ATS scoring — all free.</p>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/">Create Your ATS Resume Now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Related Templates */}
      <section className="border-t border-border/60 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-display text-2xl font-extrabold text-center mb-8">More Resume Templates</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((item) => (
              <Link key={item.slug} to={`/resume-template/${item.slug}`} className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.category}</span>
                <h3 className="font-bold text-sm mt-1 group-hover:text-primary transition-colors">{item.jobTitle} Template</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.intro.slice(0, 120)}…</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" asChild><Link to="/resume-templates">View All Templates</Link></Button>
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="border-t border-border/60 bg-secondary/30 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-lg font-extrabold mb-4">More Resources</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: `/resume-examples/${data.slug}`, label: `${data.jobTitle} Example` },
              { href: `/resume-keywords/${data.slug}`, label: `${data.jobTitle} Keywords` },
              { href: "/ats-resume-builder", label: "ATS Resume Builder" },
              { href: "/resume-examples", label: "All Examples" },
              { href: "/blog", label: "Career Blog" },
            ].map(({ href, label }) => (
              <Button key={href} variant="outline" size="sm" asChild><Link to={href}>{label}</Link></Button>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
