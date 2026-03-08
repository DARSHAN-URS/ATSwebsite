import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEOHead from "@/components/SEOHead";
import RESUME_EXAMPLES from "@/data/resumeExamples";
const logo = "/images/logo-main.png";

const CATEGORIES = [...new Set(RESUME_EXAMPLES.map((r) => r.category))];

export default function ResumeExamplesIndex() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return RESUME_EXAMPLES.filter((r) => {
      const matchSearch = !search || r.jobTitle.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !activeCategory || r.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ATS Resume Examples for 50+ Job Titles",
    description: "Browse free ATS-friendly resume examples for every job title. Professional templates, keyword suggestions, and expert tips.",
    url: "https://atsproresumebuilder.com/resume-examples",
    publisher: { "@type": "Organization", name: "ATS Pro Resume Builder" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="ATS Resume Examples for 50+ Job Titles — Free Templates"
        description="Browse free ATS-friendly resume examples for software engineers, data analysts, product managers, nurses, teachers, and 45+ more. Professional templates with keywords and tips."
        canonical="https://atsproresumebuilder.com/resume-examples"
        keywords="ATS resume examples, resume templates, resume keywords, job title resume, ATS-friendly resume, resume samples"
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ATS Pro Resume Builder" className="h-12 dark:invert dark:brightness-200" width={48} height={48} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/resume-templates" className="text-sm text-muted-foreground hover:text-foreground transition">Templates</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">Blog</Link>
            <Button size="sm" asChild><Link to="/">Build Resume</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Free Resume Examples</p>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">ATS Resume Examples for 50+ Job Titles</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Professional, ATS-optimized resume examples with keywords, tips, and ready-to-use templates. Find your job title and start building.</p>
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search job titles..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div className="sticky top-14 z-40 border-y border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
          <button onClick={() => setActiveCategory(null)} className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${!activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            All ({RESUME_EXAMPLES.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No resume examples found</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearch(""); setActiveCategory(null); }}>Clear filters</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <Link key={item.slug} to={`/resume-examples/${item.slug}`} className="group rounded-xl border border-border/60 bg-card p-5 hover:border-primary/40 hover:shadow-lg transition-all">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.category}</span>
                  <h2 className="font-bold text-sm mt-1.5 group-hover:text-primary transition-colors">{item.jobTitle}</h2>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">{item.intro.slice(0, 140)}…</p>
                  <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-3">
                    View Example <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary/5 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-extrabold mb-4">Build Your ATS-Optimized Resume</h2>
          <p className="text-muted-foreground mb-6">Use our free resume builder with ATS-friendly templates, real-time scoring, and AI-powered suggestions.</p>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/">Start Building Now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
