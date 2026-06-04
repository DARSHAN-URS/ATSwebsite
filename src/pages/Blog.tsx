import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Search, BookOpen, ArrowRight, Clock, ChevronRight, Loader2, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { SEED_ARTICLES as RAW_ARTICLES } from "@/pages/seo/BlogArticles";
import { useLanguage } from "@/i18n/LanguageContext";
import { miscTranslations } from "@/i18n/miscTranslations";
import { useBlogTranslation } from "@/hooks/useBlogTranslation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";


const SEED_ARTICLES = RAW_ARTICLES.filter((a, i, arr) => arr.findIndex((b) => b.slug === a.slug) === i);

const CATEGORY_COLORS: Record<string, string> = {
  "Resume Tips": "text-violet-500 bg-violet-50",
  "Interview Prep": "text-teal-500 bg-teal-50",
  "Career Growth": "text-amber-500 bg-amber-50",
  "Job Search": "text-blue-500 bg-blue-50",
  "Salary": "text-green-500 bg-green-50",
  "Product Guide": "text-rose-500 bg-rose-50",
  "AI & Tech": "text-indigo-500 bg-indigo-50",
};

export default function Blog({ isInternal = false }: { isInternal?: boolean }) {
  const { locale } = useLanguage();
  const mt = miscTranslations[locale].blog;
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredArticles = SEED_ARTICLES.filter((a) => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const ALL_CATEGORIES = ["All", ...Array.from(new Set(SEED_ARTICLES.map((a) => a.category)))];

  return (
    <div className={cn("min-h-screen font-sans", !isInternal ? "bg-white dark:bg-slate-900" : "bg-transparent")}>
      <SEOHead title="Career Blog — ResumePro" description="Expert career advice on ATS resumes, interview preparation, and job search strategies." />

      {!isInternal && <Navbar />}

      <main className={cn(isInternal ? "pb-20" : "pb-40")}>

      {/* Hero Section */}
      <section className={cn("relative pb-20 overflow-hidden", isInternal ? "pt-10" : "pt-32")}>
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
         <div className="container mx-auto px-8 relative z-10 text-center space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl">
               <Sparkles className="w-4 h-4 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Insider Insights</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-4xl md:text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight">
               Master the <span className="text-primary">market.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
               Expert-written guides on landing interviews, negotiating salary, and building an elite professional brand.
            </motion.p>

            <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }} className="max-w-xl mx-auto flex gap-3 p-2 bg-slate-100 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 mt-12">
               <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search articles..." className="pl-12 bg-transparent border-none focus-visible:ring-0 h-12 font-medium" />
               </div>
               <Button type="submit" className="bg-primary text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-lg shadow-primary/20">Search</Button>
            </form>
         </div>
      </section>

      {/* Category Filter */}
      <section className={cn("sticky z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100", isInternal ? "top-14" : "top-0")}>
         <div className="container mx-auto px-8 flex gap-4 overflow-x-auto py-4 scrollbar-hide no-scrollbar">
            {ALL_CATEGORIES.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat)}
                 className={cn(
                   "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   activeCategory === cat ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600"
                 )}
               >
                  {cat}
               </button>
            ))}
         </div>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-8 py-32">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredArticles.map((article, i) => (
               <motion.div 
                 key={article.slug} 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
               >
                  <Link to={isInternal ? `/dashboard/blog/${article.slug}` : `/blog/${article.slug}`} className="group block h-full">
                     <Card className="rounded-[4rem] border-none bg-slate-50/50 shadow-sm hover:shadow-3xl hover:bg-white transition-all overflow-hidden h-full flex flex-col group-hover:-translate-y-4">
                        <div className="p-4">
                           <div className="aspect-[16/10] bg-white dark:bg-slate-900 relative overflow-hidden rounded-[3rem]">
                              <img 
                                src={`https://images.unsplash.com/photo-${i % 2 === 0 ? '1454165833767-13a6cdba79a7' : '1504384308090-c894fdcc538d'}?q=80&w=800&auto=format&fit=crop`}
                                alt={article.title}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
                              <div className="absolute bottom-6 left-6">
                                 <Badge className={cn("rounded-full px-5 py-2 font-black text-[9px] uppercase tracking-[0.2em] border-none shadow-xl", CATEGORY_COLORS[article.category] || "bg-white dark:bg-slate-900 text-primary")}>
                                    {article.category}
                                 </Badge>
                              </div>
                           </div>
                        </div>
                        <CardContent className="p-12 pt-6 flex-1 space-y-6">
                           <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                              <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                           </div>
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-[1.2] tracking-tight group-hover:text-primary transition-colors line-clamp-2 uppercase">
                              {article.title}
                           </h3>
                           <p className="text-slate-500 font-medium line-clamp-3 text-base leading-relaxed">
                              {article.description}
                           </p>
                        </CardContent>
                        <CardFooter className="px-12 pb-12 pt-0">
                           <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-[10px] group/btn">
                              Read Analysis <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                           </div>
                        </CardFooter>
                     </Card>
                  </Link>
               </motion.div>
            ))}
         </div>

         {filteredArticles.length === 0 && (
            <div className="py-32 text-center space-y-6">
               <BookOpen className="w-16 h-16 text-slate-200 mx-auto" />
               <h3 className="text-2xl font-black">No articles found</h3>
               <p className="text-slate-500 font-medium">Try a different search term or category.</p>
               <Button variant="outline" onClick={() => { setSearch(""); setSearchInput(""); setActiveCategory("All"); }} className="rounded-xl font-bold px-8">Clear Filters</Button>
            </div>
         )}
      </section>

      {/* Newsletter */}
      {!isInternal && (
        <section className="container mx-auto px-8 pb-32">
           <div className="rounded-[3rem] bg-slate-900 p-12 md:p-20 text-center space-y-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10 space-y-6 max-w-xl mx-auto">
                 <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">Stay <span className="text-primary">Ahead.</span></h2>
                 <p className="text-slate-400 font-medium">Get exclusive career strategies and resume hacks delivered to your inbox every Sunday.</p>
                 <form className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="you@example.com" className="bg-white/10 border-white/10 text-white rounded-2xl h-14 px-6 font-medium focus-visible:ring-primary" />
                    <Button className="bg-primary text-white font-black uppercase tracking-widest text-xs h-14 px-10 rounded-2xl shadow-xl shadow-primary/20">Subscribe</Button>
                 </form>
              </div>
           </div>
        </section>
      )}
      </main>
      {!isInternal && <Footer />}
    </div>
  );
}
