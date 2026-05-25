import { useParams, Link } from "react-router-dom";
import { ArrowRight, CheckCircle, ChevronRight, Search, Target, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { getResumeExampleBySlug, getRelatedExamples } from "@/data/resumeExamples";
const logo = "/images/logo-main.png";
import Logo from "@/components/Logo";

export default function ResumeKeywordsPage() {
  const { jobTitle } = useParams<{ jobTitle: string }>();
  const data = getResumeExampleBySlug(jobTitle || "");

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Keywords page not found</h1>
          <Button asChild><Link to="/resume-examples">Browse all resume examples</Link></Button>
        </div>
      </div>
    );
  }

  const related = getRelatedExamples(data.slug, 6);
  const keywords = data.atsKeywords?.length ? data.atsKeywords : data.skills.slice(0, 12);
  const mistakes = data.commonMistakes ?? [
    "Not tailoring keywords to the specific job description",
    "Keyword-stuffing instead of natural placement",
    "Using acronyms without spelling them out at least once",
  ];

  const pageTitle = `Top ATS Keywords for ${data.jobTitle} Resumes (2026) | ATS Pro`;
  const pageDesc = `Discover the most important ATS keywords for ${data.jobTitle} resumes. Get a complete keyword list, placement tips, and optimization strategies to pass applicant tracking systems.`;
  const canonical = `https://atsproresumebuilder.com/resume-keywords/${data.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Top ATS Keywords for ${data.jobTitle} Resumes`,
    description: pageDesc,
    author: { "@type": "Organization", name: "ATS Pro Resume Builder" },
    publisher: { "@type": "Organization", name: "ATS Pro Resume Builder", logo: { "@type": "ImageObject", url: "https://atsproresumebuilder.com/favicon.png" } },
    mainEntityOfPage: canonical,
    datePublished: "2026-03-01",
    dateModified: "2026-03-08",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What are the best ATS keywords for a ${data.jobTitle} resume?`, acceptedAnswer: { "@type": "Answer", text: `The top ATS keywords for ${data.jobTitle} resumes include: ${keywords.slice(0, 8).join(", ")}. Always mirror the exact phrasing from the job description.` } },
      { "@type": "Question", name: `How many keywords should a ${data.jobTitle} resume have?`, acceptedAnswer: { "@type": "Answer", text: "Aim for 15-25 relevant keywords naturally distributed across your summary, skills, and experience sections. Don't keyword-stuff — focus on relevance and natural placement." } },
      { "@type": "Question", name: "Where should I place ATS keywords in my resume?", acceptedAnswer: { "@type": "Answer", text: "Place keywords in your professional summary, skills section, and throughout your experience bullets. The summary carries the most weight for ATS scoring since it appears first." } },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={pageTitle} description={pageDesc} canonical={canonical} keywords={`${data.jobTitle} resume keywords, ATS keywords ${data.jobTitle}, ${data.jobTitle} resume skills, resume optimization ${data.jobTitle}`} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-10" />
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
          <Link to="/resume-examples" className="hover:text-foreground transition">Resume Examples</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{data.jobTitle} Keywords</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">{data.category} · ATS Keywords</span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
            Top ATS Keywords for {data.jobTitle} Resumes
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Boost your ATS score with the exact keywords recruiters and applicant tracking systems look for in {data.jobTitle} applications.
          </p>
          <Button size="lg" className="gap-2 mt-8" asChild>
            <Link to="/">Build Your Optimized Resume <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Why Keywords Matter */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-extrabold">Why ATS Keywords Matter for {data.jobTitle} Roles</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Over 98% of Fortune 500 companies use Applicant Tracking Systems to filter resumes before a human reviews them.
            For {data.jobTitle} positions, ATS software scans your resume for specific keywords that match the job description.
            Without the right keywords, even highly qualified candidates get rejected automatically.
            Including role-specific terminology, technical skills, and industry phrases dramatically increases your chances of passing the initial screen.
          </p>
        </div>
      </section>

      {/* Primary Keywords */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-extrabold">Essential {data.jobTitle} ATS Keywords</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">These are the highest-impact keywords for {data.jobTitle} resumes based on job posting analysis:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-3">
            {keywords.map((kw) => (
              <div key={kw} className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium">{kw}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Skills Keywords */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-extrabold">Technical Skills & Tools to Include</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">ATS systems also look for specific tools, technologies, and certifications:</p>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-primary/30 bg-background text-foreground">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">💡 Always include both the full name and acronym — e.g., "Continuous Integration / Continuous Deployment (CI/CD)".</p>
        </div>
      </section>

      {/* Where to Place Keywords */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-4">Where to Place Keywords in Your Resume</h2>
          <div className="space-y-4">
            {[
              { title: "Professional Summary", desc: "Include 3-5 core keywords in your summary. This section carries the most weight as ATS reads it first." },
              { title: "Skills Section", desc: "List hard skills and tools in a dedicated skills section. Use the exact phrasing from the job description." },
              { title: "Work Experience Bullets", desc: "Weave keywords naturally into achievement statements. Combine keywords with quantified results for maximum impact." },
              { title: "Job Titles", desc: "If your actual title differs from the target role, include the target title in parentheses alongside your real title." },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-4">
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-2xl font-extrabold">Common Keyword Mistakes to Avoid</h2>
          </div>
          <ul className="space-y-3">
            {mistakes.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="text-destructive font-bold shrink-0">✗</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqJsonLd.mainEntity.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
                <h3 className="font-bold text-sm mb-2">{faq.name}</h3>
                <p className="text-sm text-muted-foreground">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary/5 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-extrabold mb-4">Build Your Keyword-Optimized {data.jobTitle} Resume</h2>
          <p className="text-muted-foreground mb-6">Our ATS Resume Builder automatically suggests relevant keywords based on your target role and provides real-time ATS scoring.</p>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/">Create Your ATS Resume Now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Related */}
      <section className="border-t border-border/60 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-display text-2xl font-extrabold text-center mb-8">Keywords for More Roles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((item) => (
              <Link key={item.slug} to={`/resume-keywords/${item.slug}`} className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.category}</span>
                <h3 className="font-bold text-sm mt-1 group-hover:text-primary transition-colors">{item.jobTitle} ATS Keywords</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Top keywords and skills for {item.jobTitle} resumes</p>
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
              { href: `/resume-examples/${data.slug}`, label: `${data.jobTitle} Resume Example` },
              { href: `/resume-template/${data.slug}`, label: `${data.jobTitle} Template` },
              { href: "/ats-resume-builder", label: "ATS Resume Builder" },
              { href: "/resume-templates", label: "All Templates" },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
