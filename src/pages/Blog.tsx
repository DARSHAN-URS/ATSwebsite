import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Search, BookOpen, ArrowRight, Clock, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { SEED_ARTICLES } from "@/pages/seo/BlogArticles";

// Category images
import blogHero from "@/assets/blog-hero.jpg";
import blogResumeTips from "@/assets/blog-resume-tips.jpg";
import blogInterviewPrep from "@/assets/blog-interview-prep.jpg";
import blogCareerGrowth from "@/assets/blog-career-growth.jpg";
import blogJobSearch from "@/assets/blog-job-search.jpg";
import blogSalary from "@/assets/blog-salary.jpg";

const CATEGORY_IMAGES: Record<string, string> = {
  "Resume Tips": blogResumeTips,
  "Interview Prep": blogInterviewPrep,
  "Career Growth": blogCareerGrowth,
  "Job Search": blogJobSearch,
  "Salary": blogSalary,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Resume Tips": "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "Interview Prep": "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
  "Career Growth": "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "Job Search": "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  "Salary": "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
};

function getCategoryImage(category: string): string {
  return CATEGORY_IMAGES[category] || blogResumeTips;
}

// All unique categories from articles
const ALL_CATEGORIES = ["All", ...Array.from(new Set(SEED_ARTICLES.map((a) => a.category)))];

export default function Blog() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const filteredArticles = SEED_ARTICLES.filter((a) => {
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = SEED_ARTICLES[0];
  const regularArticles = filteredArticles.filter((a) => a.slug !== featuredArticle.slug || search || activeCategory !== "All");

  const showFeatured = !search && activeCategory === "All";

  // JSON-LD for Blog + BreadcrumbList
  const blogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": "https://atsproresumebuilder.com/blog#blog",
        name: "ATS Pro Career Blog",
        url: "https://atsproresumebuilder.com/blog",
        description: "Expert career advice on ATS resumes, interview preparation, job search strategies, and more.",
        publisher: {
          "@type": "Organization",
          name: "ATS Pro Resume Builder",
          url: "https://atsproresumebuilder.com",
        },
        blogPost: SEED_ARTICLES.map((a) => ({
          "@type": "BlogPosting",
          headline: a.seoTitle,
          description: a.description,
          url: `https://atsproresumebuilder.com/blog/${a.slug}`,
          datePublished: a.date,
          keywords: a.keywords,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://atsproresumebuilder.com" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://atsproresumebuilder.com/blog" },
        ],
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="Career Blog — Resume Tips, Interview Advice & Job Search"
        description="Expert career advice: ATS resume guides, interview prep, salary negotiation, and job search strategies. 25+ free articles to land your dream job faster."
        canonical="https://atsproresumebuilder.com/blog"
        keywords="resume tips, interview advice, ATS resume guide, career blog, job search tips, salary negotiation, career growth"
      />

      <div className="min-h-screen bg-background">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <img
              src={blogHero}
              alt="Career Blog — Resume Tips & Career Advice"
              className="w-full h-full object-cover"
              loading="eager"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-28">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/20 px-4 py-1.5 text-primary text-sm font-semibold mb-5">
                <BookOpen className="h-4 w-4" /> Career Blog
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
                Career Insights<br />
                <span className="text-primary">&amp; Expert Tips</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Expert advice on{" "}
                <Link to="/ats-resume-builder" className="text-primary underline underline-offset-2 hover:text-primary/80">ATS resumes</Link>,{" "}
                <Link to="/interview-preparation" className="text-primary underline underline-offset-2 hover:text-primary/80">interviews</Link>,
                salary negotiation, and landing your dream job — written by career experts.
              </p>

              <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search articles…"
                    className="pl-9 bg-background/90 backdrop-blur border-border"
                    aria-label="Search blog articles"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              <p className="text-xs text-muted-foreground mt-3">{SEED_ARTICLES.length} free articles · Updated 2026</p>
            </div>
          </div>
        </section>

        {/* ── Category Filter Pills ─────────────────────────── */}
        <section className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSearch(""); setSearchInput(""); }}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/50 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1.5 text-xs opacity-60">
                      {SEED_ARTICLES.filter((a) => a.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Article (hero card) ─────────────────── */}
        {showFeatured && (
          <section className="max-w-6xl mx-auto px-4 pt-10 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px flex-1 bg-border/60" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Featured</span>
              <span className="h-px flex-1 bg-border/60" />
            </div>
            <Link to={`/blog/${featuredArticle.slug}`} className="group block">
              <Card className="overflow-hidden border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="grid md:grid-cols-2">
                  <div className="relative overflow-hidden h-56 md:h-full min-h-[240px]">
                    <img
                      src={getCategoryImage(featuredArticle.category)}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                      width={800}
                      height={512}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/10" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <Badge className={`w-fit mb-3 text-xs font-semibold border-0 ${CATEGORY_COLORS[featuredArticle.category] || "bg-primary/10 text-primary"}`}>
                      {featuredArticle.category}
                    </Badge>
                    <h2 className="text-xl md:text-2xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors mb-3">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {featuredArticle.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(featuredArticle.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featuredArticle.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Read Article <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </section>
        )}

        {/* ── Articles Grid ─────────────────────────────────── */}
        {filteredArticles.length > 0 ? (
          <section className="max-w-6xl mx-auto px-4 py-10">
            {showFeatured && (
              <h2 className="text-xl font-bold mb-6">
                All Guides
                <span className="ml-2 text-sm font-normal text-muted-foreground">({SEED_ARTICLES.length - 1} articles)</span>
              </h2>
            )}
            {!showFeatured && (
              <p className="text-sm text-muted-foreground mb-6">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
                {activeCategory !== "All" ? ` in "${activeCategory}"` : ""}
                {search ? ` matching "${search}"` : ""}
              </p>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(showFeatured ? regularArticles : filteredArticles).map((article) => (
                <Link key={article.slug} to={`/blog/${article.slug}`} className="group block">
                  <Card className="h-full overflow-hidden border-border/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-card">
                    {/* Card image */}
                    <div className="relative overflow-hidden h-44">
                      <img
                        src={getCategoryImage(article.category)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={800}
                        height={512}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <Badge className={`text-xs font-semibold border-0 ${CATEGORY_COLORS[article.category] || "bg-primary/10 text-primary"}`}>
                          {article.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="pt-4 pb-2 px-4">
                      <h3 className="text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    </CardContent>

                    <CardFooter className="px-4 pb-4 pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.date).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-1">No articles found</p>
            <p className="text-sm text-muted-foreground">Try a different search term or category.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSearchInput(""); setActiveCategory("All"); }}>
              Clear filters
            </Button>
          </div>
        )}

        {/* ── CTA / Internal Links ──────────────────────────── */}
        <section className="border-t border-border/60 bg-muted/30 py-12 mt-4">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-xl font-bold mb-2">Ready to Build Your ATS Resume?</h2>
            <p className="text-sm text-muted-foreground mb-6">Put this advice into action with our free AI-powered tools.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild><Link to="/">Start for Free</Link></Button>
              <Button variant="outline" asChild><Link to="/ats-resume-builder">ATS Resume Builder</Link></Button>
              <Button variant="outline" asChild><Link to="/resume-templates">Resume Templates</Link></Button>
              <Button variant="outline" asChild><Link to="/interview-preparation">Interview Prep</Link></Button>
              <Button variant="outline" asChild><Link to="/resume-builder-for-freshers">Fresher Resume</Link></Button>
            </div>
          </div>
        </section>
      </div>

      {/* ── JSON-LD Schema ────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
    </>
  );
}
