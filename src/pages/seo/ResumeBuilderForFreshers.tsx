import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, GraduationCap, Lightbulb, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import logo from "@/assets/logo.png";

export default function ResumeBuilderForFreshers() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Resume Builder for Freshers — Free ATS-Friendly Templates"
        description="Build a professional resume as a fresher or recent graduate. Free ATS-optimized templates designed for entry-level candidates with limited work experience."
        canonical="https://atsproresumebuilder.com/resume-builder-for-freshers"
        keywords="resume builder for freshers, fresher resume, entry level resume builder, resume for fresh graduates, first job resume template"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-10" width={167} height={40} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/resume-templates" className="text-sm text-muted-foreground hover:text-foreground transition">Templates</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">Blog</Link>
            <Button size="sm" asChild><Link to="/">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 font-mono">For Freshers</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Resume Builder for Freshers & Recent Graduates
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            No work experience? No problem. Our ATS-friendly fresher resume templates help you showcase education, projects, internships, and skills to land your first job. Trusted by 10,000+ fresh graduates worldwide.
          </p>
          <Button size="lg" className="gap-2 mt-8" asChild><Link to="/">Build Your Fresher Resume Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">Why Freshers Need a Different Resume Format</h2>
          <p className="text-muted-foreground mb-4">
            Traditional resumes lead with work experience — but as a fresher, that's exactly what you lack. A well-structured fresher resume flips the script by leading with your strongest assets: education, academic achievements, projects, internships, certifications, and technical skills.
          </p>
          <p className="text-muted-foreground mb-4">
            Our fresher resume template is specifically designed to highlight what matters most to recruiters hiring entry-level talent. It uses ATS-friendly formatting so your resume passes automated screening systems and reaches hiring managers.
          </p>
          <h3 className="text-lg font-semibold mt-8 mb-4">What to Include in a Fresher Resume</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <GraduationCap className="h-5 w-5" />, title: "Education First", desc: "Lead with your degree, GPA (if strong), relevant coursework, and academic honors." },
              { icon: <Lightbulb className="h-5 w-5" />, title: "Projects & Internships", desc: "Highlight academic projects, hackathons, volunteer work, and internship experiences." },
              { icon: <BookOpen className="h-5 w-5" />, title: "Skills & Certifications", desc: "List technical skills, tools, languages, and relevant certifications prominently." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{item.icon}</div>
                <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">Tips for Writing a Strong Fresher Resume</h2>
          <ul className="space-y-3">
            {[
              "Use action verbs like 'Developed', 'Analyzed', 'Implemented', 'Researched' to describe your projects.",
              "Quantify achievements where possible: 'Increased app downloads by 40%' or 'Managed a team of 5 members'.",
              "Include a professional summary at the top — 2-3 sentences about your goals and strengths.",
              "List relevant coursework if it relates to the target role.",
              "Add certifications from platforms like Coursera, Udemy, or Google to fill experience gaps.",
              "Keep it to one page — recruiters spend only 6-8 seconds on a first scan.",
              "Use our AI resume grader to check ATS compatibility before applying.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-8">Fresher Resume FAQs</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "How do I write a resume with no experience?", a: "Focus on education, projects, internships, volunteer work, and skills. Use our Fresher template which is designed to highlight these sections prominently." },
              { q: "Should I include my GPA on a fresher resume?", a: "Include it if it's 3.5/4.0 or above (or equivalent). If it's lower, focus on relevant coursework and projects instead." },
              { q: "How long should a fresher resume be?", a: "Keep it to one page. Recruiters prefer concise resumes, especially for entry-level positions. Our Minimal Compact template is perfect for this." },
              { q: "What skills should freshers highlight?", a: "Include both technical skills (programming languages, tools, software) and soft skills (communication, teamwork, problem-solving). Tailor them to the job description." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-serif text-xl font-bold mb-6">Related Resources</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild><Link to="/ats-resume-builder">ATS Resume Builder</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/resume-templates">All Templates</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/interview-preparation">Interview Prep</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/blog">Career Blog</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Land Your First Job With Confidence</h2>
          <p className="text-muted-foreground mb-6">Create a professional, ATS-optimized resume in under 10 minutes — no experience required.</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">Start Building Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>
    </div>
  );
}
