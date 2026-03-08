import { useParams, Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Briefcase, GraduationCap, Lightbulb, Star, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { getResumeExampleBySlug, getRelatedExamples } from "@/data/resumeExamples";
const logo = "/images/logo-main.png";

export default function ResumeExamplePage() {
  const { jobTitle } = useParams<{ jobTitle: string }>();
  const data = getResumeExampleBySlug(jobTitle || "");

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Resume example not found</h1>
          <Button asChild><Link to="/resume-examples">Browse all resume examples</Link></Button>
        </div>
      </div>
    );
  }

  const related = getRelatedExamples(data.slug, 6);
  const pageTitle = `${data.jobTitle} Resume Example (ATS-Friendly Template) | ATS Pro`;
  const pageDesc = `Free ATS-optimized ${data.jobTitle} resume example with professional summary, key skills, and work experience. Build your ${data.jobTitle} resume and pass applicant tracking systems.`;
  const canonical = `https://atsproresumebuilder.com/resume-examples/${data.slug}`;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${data.jobTitle} Resume Example — ATS-Friendly Template`,
    description: pageDesc,
    author: { "@type": "Organization", name: "ATS Pro Resume Builder" },
    publisher: { "@type": "Organization", name: "ATS Pro Resume Builder", logo: { "@type": "ImageObject", url: "https://atsproresumebuilder.com/favicon.png" } },
    mainEntityOfPage: canonical,
    datePublished: "2026-03-01",
    dateModified: "2026-03-08",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={pageTitle} description={pageDesc} canonical={canonical} keywords={`${data.jobTitle} resume example, ${data.jobTitle} resume template, ATS resume ${data.jobTitle}, ${data.jobTitle} CV`} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ATS Pro Resume Builder" className="h-12 dark:invert dark:brightness-200" width={48} height={48} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/resume-examples" className="text-sm text-muted-foreground hover:text-foreground transition">All Examples</Link>
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
          <Link to="/resume-examples" className="hover:text-foreground transition">Resume Examples</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{data.jobTitle}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">{data.category}</span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{data.jobTitle} Resume Example</h1>
          <p className="mt-2 text-lg text-muted-foreground">(ATS-Friendly Template — {new Date().getFullYear()})</p>
          <Button size="lg" className="gap-2 mt-8" asChild>
            <Link to="/">Build Your ATS Resume Now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Introduction */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-4">How to Write an ATS-Friendly {data.jobTitle} Resume</h2>
          <p className="text-muted-foreground leading-relaxed">{data.intro}</p>
        </div>
      </section>

      {/* Professional Summary */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-extrabold">Professional Summary Example</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">A strong professional summary instantly grabs the recruiter's attention and passes ATS keyword filters. Here's an optimized example for a {data.jobTitle} role:</p>
          <blockquote className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed italic">
            "{data.summaryExample}"
          </blockquote>
          <p className="text-xs text-muted-foreground mt-3">💡 Tip: Tailor this summary to each job posting by incorporating specific keywords from the description.</p>
        </div>
      </section>

      {/* Key Skills */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-extrabold">Key ATS Keywords & Skills</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Include these high-impact keywords in your {data.jobTitle} resume to pass ATS screening:</p>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-primary/30 bg-background text-foreground">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">💡 Match the exact phrasing from the job description. If they say "Project Management," don't just write "PM."</p>
        </div>
      </section>

      {/* Work Experience */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-extrabold">Work Experience Example</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Use this format for maximum ATS compatibility and recruiter impact:</p>
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-base">{data.experienceExample.title}</h3>
                <p className="text-sm text-muted-foreground">{data.experienceExample.company}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 sm:mt-0">{data.experienceExample.duration}</span>
            </div>
            <ul className="space-y-2">
              {data.experienceExample.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-3">💡 Start each bullet with a strong action verb and include quantifiable results wherever possible.</p>
        </div>
      </section>

      {/* Education */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-extrabold">Education Section Example</h2>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h3 className="font-bold text-base">{data.educationExample.degree}</h3>
            <p className="text-sm text-muted-foreground">{data.educationExample.school} — {data.educationExample.year}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">💡 List your highest degree first. Include relevant coursework, honors, or GPA (3.5+) if you're a recent graduate.</p>
        </div>
      </section>

      {/* Tips */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-extrabold">Tips to Pass Applicant Tracking Systems</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Follow these expert tips to ensure your {data.jobTitle} resume scores high on ATS screening:</p>
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
          <h2 className="font-display text-2xl font-extrabold mb-4">Ready to Build Your {data.jobTitle} Resume?</h2>
          <p className="text-muted-foreground mb-6">Use our free ATS Resume Builder to create a professional, ATS-optimized resume in minutes. Choose from industry-proven templates and get real-time ATS scoring.</p>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/">Build Your ATS Resume Now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Related Examples */}
      <section className="border-t border-border/60 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-display text-2xl font-extrabold text-center mb-8">Explore More Resume Examples</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((item) => (
              <Link key={item.slug} to={`/resume-examples/${item.slug}`} className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.category}</span>
                <h3 className="font-bold text-sm mt-1 group-hover:text-primary transition-colors">{item.jobTitle} Resume Example</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.intro.slice(0, 120)}…</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" asChild><Link to="/resume-examples">View All Resume Examples</Link></Button>
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="border-t border-border/60 bg-secondary/30 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-lg font-extrabold mb-4">More Resources</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/ats-resume-builder", label: "ATS Resume Builder" },
              { href: "/resume-templates", label: "Resume Templates" },
              { href: "/resume-builder-for-freshers", label: "Fresher Resumes" },
              { href: "/interview-preparation", label: "Interview Prep" },
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
