import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import logo from "@/assets/logo.png";

export default function ResumeTemplates() {
  const templates = [
    { name: "Classic ATS", desc: "Traditional single-column layout with clean formatting. The most universally ATS-compatible template, ideal for any industry.", best: "All industries" },
    { name: "Modern Professional", desc: "Contemporary typography with slightly larger headings and tighter spacing. Perfect for corporate and tech roles.", best: "Corporate & Tech" },
    { name: "Skills-First", desc: "Places skills and keywords before work experience. Ideal for career changers and entry-level candidates looking to highlight competencies.", best: "Career changers" },
    { name: "Experience-Heavy", desc: "Maximizes space for work experience and achievements. Designed for senior professionals with extensive career histories.", best: "Senior professionals" },
    { name: "Fresher / Entry-Level", desc: "Prioritizes education, academic projects, internships, and skills. Built for recent graduates and first-time job seekers.", best: "Fresh graduates" },
    { name: "Technical / Engineering", desc: "Features grouped skill categories (Languages, Frameworks, Tools, Databases) with structured experience sections for IT and engineering roles.", best: "Engineers & IT" },
    { name: "Minimal Compact", desc: "Optimized to fit strong profiles into a single page using reduced margins and tighter line spacing without sacrificing readability.", best: "One-page resumes" },
    { name: "Combination", desc: "Blends chronological and functional formats. Highlights both skills and progressive career growth in a single layout.", best: "Versatile roles" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="ATS-Friendly Resume Templates — Free Professional Layouts"
        description="Browse 8+ free ATS-friendly resume templates designed to pass applicant tracking systems. Professional layouts for engineers, freshers, seniors, and career changers."
        canonical="https://atsproresumebuilder.com/resume-templates"
        keywords="ATS resume templates, free resume templates, ATS-friendly resume templates, professional resume layouts, resume templates for freshers"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-10" width={120} height={40} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/ats-resume-builder" className="text-sm text-muted-foreground hover:text-foreground transition">ATS Builder</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">Blog</Link>
            <Button size="sm" asChild><Link to="/">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 font-mono">Resume Templates</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Free ATS-Friendly Resume Templates
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Choose from 8+ professionally designed resume templates, each tested and optimized for Applicant Tracking Systems. Every template uses a clean, single-column layout with standard fonts to ensure your resume passes ATS scans and looks professional to recruiters.
          </p>
        </div>
      </section>

      <section className="border-t border-border/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-8 text-center">Browse All ATS Resume Templates</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {templates.map((t) => (
              <div key={t.name} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">{t.name}</h3>
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{t.best}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">What Makes a Resume Template ATS-Friendly?</h2>
          <p className="text-muted-foreground mb-4">
            Not all resume templates are created equal. Many beautifully designed templates with multi-column layouts, graphics, and fancy formatting actually fail ATS scans. Here's what makes our templates different:
          </p>
          <ul className="space-y-3">
            {[
              "Single-column layout that ATS parsers can read from top to bottom",
              "Standard fonts (Arial, Calibri, Times New Roman) for universal compatibility",
              "No images, icons, charts, or tables that ATS systems cannot parse",
              "Standard section headings recognized by all major ATS platforms",
              "Clean formatting with consistent spacing and hierarchy",
              "Tested against Workday, Lever, Greenhouse, Taleo, and iCIMS",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">How to Choose the Right Resume Template</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p><strong className="text-foreground">For freshers and recent graduates:</strong> Use the Fresher template to highlight education, projects, and skills when you have limited work experience. <Link to="/resume-builder-for-freshers" className="text-primary underline">Learn more about fresher resumes</Link>.</p>
            <p><strong className="text-foreground">For software engineers and technical roles:</strong> The Technical template organizes skills by category and structures experience for engineering hiring managers. <Link to="/software-engineer-resume" className="text-primary underline">See the engineer resume guide</Link>.</p>
            <p><strong className="text-foreground">For senior professionals:</strong> The Experience-Heavy template maximizes space for achievements and career progression.</p>
            <p><strong className="text-foreground">For career changers:</strong> The Skills-First template emphasizes transferable competencies over job titles.</p>
            <p><strong className="text-foreground">Not sure?</strong> Start with the Classic ATS template — it works for any industry and has the highest ATS pass rate.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Start Building Your Resume Today</h2>
          <p className="text-muted-foreground mb-6">Pick a template and create your ATS-optimized resume in under 10 minutes.</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">Choose a Template & Start Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>
    </div>
  );
}
