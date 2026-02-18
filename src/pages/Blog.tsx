import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Search, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { SEED_ARTICLES } from "@/pages/seo/BlogArticles";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const filteredSeedArticles = SEED_ARTICLES.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SEOHead title="Career Blog — Resume Tips & Interview Advice" description="Expert career advice on ATS resumes, interview preparation, job search strategies, and more. Read free guides to land your dream job." canonical="https://atsproresumebuilder.com/blog" keywords="resume tips, interview advice, ATS resume guide, career blog, job search tips" />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary text-sm font-semibold mb-4">
              <BookOpen className="h-4 w-4" /> Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Career Insights & Tips
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Expert advice on <Link to="/ats-resume-builder" className="text-primary underline">ATS resumes</Link>, <Link to="/interview-preparation" className="text-primary underline">interviews</Link>, and landing your dream job.
            </p>

            <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search articles…"
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
        </section>

        {/* Seed Articles */}
        {filteredSeedArticles.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-xl font-bold mb-6">Featured Guides</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredSeedArticles.map((article) => (
                <Link key={article.slug} to={`/blog/${article.slug}`} className="group block">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 bg-card">
                    <CardHeader className="pb-2">
                      <Badge variant="secondary" className="text-xs font-medium w-fit mb-2">{article.category}</Badge>
                      <h3 className="text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-xs text-muted-foreground line-clamp-3">{article.description}</p>
                    </CardContent>
                    <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.date).toLocaleDateString(undefined, { year: "numeric", month: "short" })}</span>
                      <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">Read <ArrowRight className="h-3 w-3" /></span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {filteredSeedArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No articles found.</p>
          </div>
        )}

        {/* Internal Links */}
        <section className="border-t border-border/60 bg-secondary/30 py-10">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-lg font-bold mb-4">Explore Our Tools</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm" asChild><Link to="/ats-resume-builder">ATS Resume Builder</Link></Button>
              <Button variant="outline" size="sm" asChild><Link to="/resume-templates">Resume Templates</Link></Button>
              <Button variant="outline" size="sm" asChild><Link to="/interview-preparation">Interview Prep</Link></Button>
              <Button variant="outline" size="sm" asChild><Link to="/resume-builder-for-freshers">Fresher Resume</Link></Button>
              <Button variant="outline" size="sm" asChild><Link to="/software-engineer-resume">Engineer Resume</Link></Button>
            </div>
          </div>
        </section>
      </div>

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "ATS Pro Resume Builder Blog",
        url: "https://atsproresumebuilder.com/blog",
        description: "Expert career advice on ATS resumes, interview preparation, and job search strategies.",
        publisher: { "@type": "Organization", name: "ATS Pro Resume Builder" },
      }) }} />
    </>
  );
}
