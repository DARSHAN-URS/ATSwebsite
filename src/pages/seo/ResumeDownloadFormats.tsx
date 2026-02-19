import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, FileType, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import logo from "@/assets/logo.png";

export default function ResumeDownloadFormats() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Resume Download — PDF, DOCX & TXT Export Options"
        description="Download your ATS-optimized resume in PDF, DOCX, or TXT format. Every format is tested for ATS compatibility. Free resume download with professional formatting."
        canonical="https://atsproresumebuilder.com/resume-download"
        keywords="resume download, download resume PDF, resume DOCX download, resume TXT format, ATS resume download free"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-10" width={167} height={40} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/ats-resume-builder" className="text-sm text-muted-foreground hover:text-foreground transition">ATS Builder</Link>
            <Link to="/resume-templates" className="text-sm text-muted-foreground hover:text-foreground transition">Templates</Link>
            <Button size="sm" asChild><Link to="/">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 font-mono">Export Options</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Download Your Resume in Any Format
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Export your ATS-optimized resume in PDF, DOCX, or plain text. Every format preserves your content and formatting for maximum ATS compatibility and professional presentation.
          </p>
        </div>
      </section>

      <section className="border-t border-border/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-10">Choose Your Export Format</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <FileText className="h-6 w-6" />, title: "PDF Download", desc: "The most popular resume format. Our PDF exports maintain exact formatting with clean typography, proper margins, and ATS-readable text layers. Best for emailing to recruiters and uploading to job portals.", best: "Best for most applications" },
              { icon: <FileType className="h-6 w-6" />, title: "DOCX Download", desc: "Microsoft Word format that some ATS systems prefer. Easily editable after download. Preserves all formatting while remaining fully compatible with Word, Google Docs, and LibreOffice.", best: "Best for editable copies" },
              { icon: <FileCode className="h-6 w-6" />, title: "TXT Download", desc: "Plain text format with zero formatting issues. Maximum ATS compatibility — guaranteed to parse correctly on every system. Ideal for copy-pasting into online application forms.", best: "Best for online forms" },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border/60 bg-card p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{f.icon}</div>
                <h3 className="text-base font-bold mb-1">{f.title}</h3>
                <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{f.best}</span>
                <p className="text-sm text-muted-foreground mt-3">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">Which Resume Format Should I Use?</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p><strong className="text-foreground">For job portal uploads (LinkedIn, Indeed, Glassdoor):</strong> Use PDF. It preserves formatting exactly as designed and is universally accepted.</p>
            <p><strong className="text-foreground">For emailing directly to recruiters:</strong> Use PDF. It looks professional and cannot be accidentally edited.</p>
            <p><strong className="text-foreground">For company application portals:</strong> Check the job posting. Some request DOCX specifically — our DOCX export is fully ATS-compatible.</p>
            <p><strong className="text-foreground">For online application text boxes:</strong> Use TXT. Copy-paste the content directly without formatting issues.</p>
            <p><strong className="text-foreground">Pro tip:</strong> Keep copies of your resume in all three formats. Our builder lets you <Link to="/ats-resume-builder" className="text-primary underline">export in any format</Link> with one click.</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">ATS Compatibility by Format</h2>
          <ul className="space-y-3">
            {[
              "PDF: 95% ATS compatibility — text-based PDFs parse correctly on all modern ATS platforms.",
              "DOCX: 98% ATS compatibility — native Word format is the most widely supported by legacy systems.",
              "TXT: 100% ATS compatibility — zero formatting means zero parsing errors.",
              "All exports preserve keyword optimization from your resume content.",
              "Consistent section headings and content structure across all formats.",
              "No images, tables, or graphical elements that could break ATS parsing.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border/60 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-serif text-xl font-bold mb-6">Related Tools</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild><Link to="/ats-resume-builder">ATS Resume Builder</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/resume-templates">Resume Templates</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/interview-preparation">Interview Prep</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/blog">Career Blog</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Create & Download Your Resume Now</h2>
          <p className="text-muted-foreground mb-6">Build an ATS-optimized resume and download it in PDF, DOCX, or TXT — completely free.</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">Start Building Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>
    </div>
  );
}
