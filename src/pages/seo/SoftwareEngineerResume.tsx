import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Code, Cpu, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import logo from "@/assets/logo.png";

export default function SoftwareEngineerResume() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Software Engineer Resume Builder — ATS-Optimized for Tech"
        description="Build an ATS-optimized software engineer resume with our free builder. Technical resume templates with grouped skills, project sections, and engineering-focused formatting."
        canonical="https://atsproresumebuilder.com/software-engineer-resume"
        keywords="software engineer resume builder, tech resume template, developer resume, programming resume, engineering resume ATS"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-10" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/resume-templates" className="text-sm text-muted-foreground hover:text-foreground transition">Templates</Link>
            <Link to="/interview-preparation" className="text-sm text-muted-foreground hover:text-foreground transition">Interview Prep</Link>
            <Button size="sm" asChild><Link to="/">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 font-mono">For Engineers</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Software Engineer Resume Builder
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Create a technical resume that passes ATS filters at top tech companies. Our engineering-focused templates organize your skills, projects, and experience exactly how technical recruiters expect to see them.
          </p>
          <Button size="lg" className="gap-2 mt-8" asChild><Link to="/">Build Your Tech Resume Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-8 text-center">Technical Skills Organization</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Our Technical resume template groups your skills into categories that tech recruiters and ATS systems recognize, making it easy to match keywords from job descriptions.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: <Code className="h-5 w-5" />, title: "Languages", examples: "Python, JavaScript, TypeScript, Java, Go, Rust, C++" },
              { icon: <Globe className="h-5 w-5" />, title: "Frameworks", examples: "React, Node.js, Django, Spring Boot, Next.js, FastAPI" },
              { icon: <Cpu className="h-5 w-5" />, title: "Tools & Platforms", examples: "AWS, Docker, Kubernetes, Git, CI/CD, Terraform, Jenkins" },
              { icon: <Database className="h-5 w-5" />, title: "Databases", examples: "PostgreSQL, MongoDB, Redis, MySQL, DynamoDB, Elasticsearch" },
            ].map((cat) => (
              <div key={cat.title} className="rounded-xl border border-border/60 bg-card p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{cat.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{cat.title}</h3>
                <p className="text-xs text-muted-foreground">{cat.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">How to Write a Software Engineer Resume That Gets Interviews</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Software engineering resumes need to balance technical depth with readability. Recruiters at companies like Google, Meta, Amazon, and Microsoft often use ATS systems that scan for specific technical keywords before a human ever reviews your application.</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">1. Lead With a Technical Summary</h3>
            <p>Write a 2-3 line summary that includes your years of experience, primary tech stack, and the type of systems you've built. Example: "Full-stack engineer with 5 years of experience building scalable microservices with Python and React, serving 10M+ monthly users."</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">2. Structure Experience With Impact Metrics</h3>
            <p>Use the formula: <strong className="text-foreground">Action + Technology + Measurable Impact</strong>. Instead of "Built backend services", write "Designed and deployed microservices using Go and gRPC, reducing API latency by 60% and handling 50K requests/second."</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">3. Include Projects (Especially for Junior Engineers)</h3>
            <p>Personal projects, open-source contributions, and hackathon entries demonstrate initiative. Include the tech stack, your role, and quantifiable outcomes.</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">4. Tailor to the Job Description</h3>
            <p>Our <Link to="/ats-resume-builder" className="text-primary underline">AI resume tailoring tool</Link> automatically matches your resume keywords to the job description, ensuring maximum ATS compatibility.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">Software Engineer Resume Checklist</h2>
          <ul className="space-y-3">
            {[
              "Technical summary with years of experience and primary stack",
              "Grouped technical skills (Languages, Frameworks, Tools, Databases)",
              "Work experience with impact-driven bullet points and metrics",
              "Projects section with tech stack and outcomes",
              "Education with relevant coursework and GPA (if recent graduate)",
              "Certifications (AWS, Google Cloud, Kubernetes, etc.)",
              "Clean single-column ATS-friendly formatting",
              "PDF or DOCX export for maximum compatibility",
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
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-8">Software Engineer Resume FAQs</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Should I list every programming language I know?", a: "No. Focus on languages relevant to the target role. List your strongest 5-8 languages/frameworks and group them by category for readability." },
              { q: "How long should a software engineer resume be?", a: "1 page for 0-5 years experience, up to 2 pages for senior engineers. Use our Minimal Compact template to fit more content on one page." },
              { q: "Should I include my GitHub profile?", a: "Yes, if you have meaningful contributions. Include your GitHub, LinkedIn, and portfolio links in the contact section." },
              { q: "How do I handle gaps in employment?", a: "Focus on what you did during gaps: personal projects, open-source contributions, certifications, or freelance work. Our AI resume assistant can help you frame these positively." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="border-t border-border/60 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-serif text-xl font-bold mb-6">More Career Resources</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild><Link to="/ats-resume-builder">ATS Resume Builder</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/resume-templates">All Templates</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/resume-builder-for-freshers">Fresher Resume</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/interview-preparation">Interview Prep</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Build Your Engineering Resume Now</h2>
          <p className="text-muted-foreground mb-6">Join thousands of engineers who landed roles at top tech companies.</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">Start Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>
    </div>
  );
}
