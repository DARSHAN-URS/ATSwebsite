import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, BarChart3, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import logo from "@/assets/logo.png";

export default function ATSResumeBuilder() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="ATS Resume Builder — Build ATS-Friendly Resumes Free"
        description="Create ATS-optimized resumes that pass applicant tracking systems. Free AI resume builder with 8+ professional templates, instant grading, and one-click tailoring."
        canonical="https://atsproresumebuilder.com/ats-resume-builder"
        keywords="ATS resume builder, ATS-friendly resume, applicant tracking system resume, ATS optimized resume, free ATS resume builder"
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ATS Pro Resume Builder" className="h-10" width={120} height={40} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">Blog</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition">About</Link>
            <Button size="sm" asChild><Link to="/">Get Started Free</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 font-mono">ATS Resume Builder</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Build an ATS-Friendly Resume That Gets You Hired
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Over 75% of resumes are rejected by Applicant Tracking Systems before a human ever reads them. Our free ATS resume builder ensures your resume passes every ATS scan, lands on the recruiter's desk, and helps you get 3× more interviews.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="gap-2" asChild><Link to="/">Build Your ATS Resume Now <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button variant="outline" size="lg" asChild><Link to="/resume-templates">Browse Templates</Link></Button>
          </div>
        </div>
      </section>

      {/* What is ATS */}
      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">What Is an ATS Resume?</h2>
          <p className="text-muted-foreground mb-4">
            An ATS (Applicant Tracking System) is software used by employers to collect, sort, and filter job applications. Companies like Google, Amazon, Deloitte, and 95% of Fortune 500 companies use ATS to screen resumes before they reach a hiring manager.
          </p>
          <p className="text-muted-foreground mb-4">
            An <strong className="text-foreground">ATS-friendly resume</strong> is specifically formatted and keyword-optimized to pass through these automated filters. It uses clean single-column layouts, standard fonts, proper section headings, and relevant keywords from the job description.
          </p>
          <p className="text-muted-foreground">
            Without an ATS-optimized resume, even highly qualified candidates get filtered out. Our ATS resume builder solves this problem by automatically formatting your resume for maximum ATS compatibility while maintaining a professional, human-readable design.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-10">How Our ATS Resume Builder Works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <FileText className="h-5 w-5" />, title: "ATS-Optimized Templates", desc: "Choose from 8+ professionally designed templates that are tested against major ATS platforms including Workday, Lever, Greenhouse, and Taleo." },
              { icon: <BarChart3 className="h-5 w-5" />, title: "AI Resume Grading", desc: "Get an instant ATS compatibility score. Our AI analyzes your resume against the job description and provides actionable feedback to improve your match rate." },
              { icon: <Sparkles className="h-5 w-5" />, title: "One-Click Tailoring", desc: "Paste any job description and our AI automatically tailors your resume — adjusting keywords, bullet points, and skills to maximize your ATS score." },
              { icon: <Target className="h-5 w-5" />, title: "Keyword Optimization", desc: "Our ATS keyword scanner identifies missing keywords from the job posting and suggests where to add them naturally in your resume." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border/60 bg-card p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{f.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATS Tips */}
      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Top Tips for ATS-Friendly Resumes</h2>
          <ul className="space-y-4">
            {[
              "Use a single-column layout — multi-column resumes confuse most ATS parsers.",
              "Stick to standard fonts like Arial, Calibri, or Times New Roman for reliable parsing.",
              "Avoid images, charts, tables, and icons — ATS cannot read visual elements.",
              "Use standard section headings: 'Work Experience', 'Education', 'Skills'.",
              "Include exact keywords from the job description in your resume content.",
              "Save your resume as a PDF or DOCX — these are the most ATS-compatible formats.",
              "Quantify achievements with numbers, percentages, and metrics wherever possible.",
              "Keep your formatting clean — no text boxes, headers/footers, or fancy borders.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions About ATS Resumes</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What does ATS stand for?", a: "ATS stands for Applicant Tracking System. It's software used by companies to manage job applications, filter resumes based on keywords, and rank candidates before a recruiter reviews them." },
              { q: "How do I know if my resume is ATS-friendly?", a: "Use our free AI resume grader. It scans your resume against ATS parsing standards and the target job description, then gives you a score with specific improvement suggestions." },
              { q: "What file format is best for ATS?", a: "PDF and DOCX are the most widely accepted ATS formats. Our builder exports in both, plus TXT for maximum compatibility." },
              { q: "Can I use this ATS resume builder for free?", a: "Yes! You can create, edit, and download ATS-optimized resumes completely free. Premium features like AI grading and one-click tailoring are available with a Pro subscription." },
              { q: "How is this different from other resume builders?", a: "Unlike generic resume builders, every template we offer is specifically designed and tested for ATS compatibility. Our AI grading system checks your resume against real ATS parsing algorithms." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Internal Links */}
      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-serif text-xl font-bold mb-6">Explore More Career Tools</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild><Link to="/resume-templates">Resume Templates</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/resume-builder-for-freshers">Fresher Resume Builder</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/software-engineer-resume">Engineer Resume Builder</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/interview-preparation">Interview Preparation</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/blog">Career Blog</Link></Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">Ready to Beat the ATS?</h2>
          <p className="text-muted-foreground mb-6">Join 10,000+ job seekers who landed interviews with ATS Pro Resume Builder.</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">Build Your ATS Resume Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What does ATS stand for?", acceptedAnswer: { "@type": "Answer", text: "ATS stands for Applicant Tracking System. It's software used by companies to manage job applications and filter resumes." } },
          { "@type": "Question", name: "How do I know if my resume is ATS-friendly?", acceptedAnswer: { "@type": "Answer", text: "Use our free AI resume grader to scan your resume against ATS parsing standards and get a score with improvement suggestions." } },
          { "@type": "Question", name: "Can I use this ATS resume builder for free?", acceptedAnswer: { "@type": "Answer", text: "Yes! Create, edit, and download ATS-optimized resumes completely free." } },
        ],
      }) }} />
    </div>
  );
}
