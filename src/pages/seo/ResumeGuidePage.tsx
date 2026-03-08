import { useParams, Link } from "react-router-dom";
import { ArrowRight, ChevronRight, BookOpen, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { getGuideBySlug, getAllGuideSlugs } from "@/data/resumeGuides";
import RESUME_GUIDES from "@/data/resumeGuides";
const logo = "/images/logo-main.png";
import Logo from "@/components/Logo";

export default function ResumeGuidePage() {
  const { topic } = useParams<{ topic: string }>();
  const data = getGuideBySlug(topic || "");

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Guide not found</h1>
          <Button asChild><Link to="/resume-examples">Browse resume resources</Link></Button>
        </div>
      </div>
    );
  }

  const otherGuides = RESUME_GUIDES.filter((g) => g.slug !== data.slug);
  const canonical = `https://atsproresumebuilder.com/resume-guide/${data.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.metaDescription,
    author: { "@type": "Organization", name: "ATS Pro Resume Builder" },
    publisher: { "@type": "Organization", name: "ATS Pro Resume Builder", logo: { "@type": "ImageObject", url: "https://atsproresumebuilder.com/favicon.png" } },
    mainEntityOfPage: canonical,
    datePublished: "2026-03-01",
    dateModified: "2026-03-08",
  };

  const faqJsonLd = data.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={data.metaTitle} description={data.metaDescription} canonical={canonical} keywords={`${data.title}, resume tips, ATS resume guide, resume writing, career advice`} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-24" />
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
        <nav className="flex items-center text-xs text-muted-foreground gap-1 flex-wrap">
          <Link to="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/resume-examples" className="hover:text-foreground transition">Resources</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{data.title}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Resume Guide</span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{data.title}</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">{data.intro}</p>
          <Button size="lg" className="gap-2 mt-8" asChild>
            <Link to="/">Build Your ATS Resume Now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Sections */}
      {data.sections.map((section, i) => {
        const isAlt = i % 2 === 0;
        return (
          <section key={i} className={`border-t border-border/60 py-12 ${isAlt ? "bg-secondary/30" : ""}`}>
            <div className="mx-auto max-w-3xl px-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl font-extrabold">{section.heading}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          </section>
        );
      })}

      {/* FAQ */}
      {data.faqs.length > 0 && (
        <section className="border-t border-border/60 py-12">
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-extrabold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {data.faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
                  <h3 className="font-bold text-sm mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary/5 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-extrabold mb-4">Ready to Apply These Tips?</h2>
          <p className="text-muted-foreground mb-6">Create an ATS-optimized resume in minutes with our free builder. Get real-time scoring and keyword suggestions.</p>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/">Create Your ATS Resume <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* More Guides */}
      {otherGuides.length > 0 && (
        <section className="border-t border-border/60 py-12">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="font-display text-2xl font-extrabold text-center mb-8">More Resume Guides</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherGuides.map((guide) => (
                <Link key={guide.slug} to={`/resume-guide/${guide.slug}`} className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Guide</span>
                  <h3 className="font-bold text-sm mt-1 group-hover:text-primary transition-colors">{guide.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{guide.intro.slice(0, 120)}…</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Internal links */}
      <section className="border-t border-border/60 bg-secondary/30 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-lg font-extrabold mb-4">More Resources</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/ats-resume-builder", label: "ATS Resume Builder" },
              { href: "/resume-examples", label: "Resume Examples" },
              { href: "/resume-templates", label: "Templates" },
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
    </div>
  );
}
