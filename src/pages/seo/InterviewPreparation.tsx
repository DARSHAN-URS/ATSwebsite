import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Mic, Brain, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import logo from "@/assets/logo.png";

export default function InterviewPreparation() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Interview Preparation — AI Mock Interviews & Question Bank"
        description="Prepare for your next job interview with AI-powered mock interviews, resume-based question generation, STAR method coaching, and readiness scoring. Free interview prep tools."
        canonical="https://atsproresumebuilder.com/interview-preparation"
        keywords="interview preparation, mock interview, interview questions, STAR method, behavioral interview, technical interview preparation"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-10 dark:brightness-100 brightness-0" width={167} height={40} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/ats-resume-builder" className="text-sm text-muted-foreground hover:text-foreground transition">Resume Builder</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">Blog</Link>
            <Button size="sm" asChild><Link to="/">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 font-mono">Interview Preparation</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            AI-Powered Interview Preparation
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Go from resume to offer with our comprehensive interview prep suite. Practice with AI mock interviews, generate role-specific questions from your resume, master the STAR method, and get a readiness score — all personalized to your target role.
          </p>
          <Button size="lg" className="gap-2 mt-8" asChild><Link to="/">Start Practicing Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-10">Interview Prep Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Mic className="h-5 w-5" />, title: "AI Mock Interviews", desc: "Practice with our AI interview coach 'Alex Carter'. Get real-time feedback on your answers with voice-enabled conversations that simulate actual interviews." },
              { icon: <Brain className="h-5 w-5" />, title: "Resume-Based Questions", desc: "Our AI analyzes your resume to generate personalized interview questions based on your actual experience, projects, and skills — just like a real interviewer would." },
              { icon: <Target className="h-5 w-5" />, title: "Question Bank Generator", desc: "Generate role-specific questions categorized by type: behavioral (HR), technical, resume-based. Includes STAR framework guidance and pro tips for each question." },
              { icon: <BookOpen className="h-5 w-5" />, title: "Strengths & Readiness Analysis", desc: "Get an interview readiness score based on your resume. See your likely strengths and potential weaknesses with preparation tips for each." },
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

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">How to Prepare for Any Job Interview</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <h3 className="text-lg font-semibold text-foreground">1. Master the STAR Method</h3>
            <p>The STAR method (Situation, Task, Action, Result) is the gold standard for answering behavioral interview questions. Structure every answer with: the <strong className="text-foreground">Situation</strong> you faced, the <strong className="text-foreground">Task</strong> you needed to accomplish, the <strong className="text-foreground">Action</strong> you took, and the <strong className="text-foreground">Result</strong> you achieved.</p>
            
            <h3 className="text-lg font-semibold text-foreground mt-6">2. Research the Company and Role</h3>
            <p>Understand the company's mission, recent news, and the specific requirements of the role. Tailor your answers to show how your experience aligns with what they're looking for.</p>
            
            <h3 className="text-lg font-semibold text-foreground mt-6">3. Practice With Your Own Resume</h3>
            <p>Interviewers will ask about your resume. Be ready to explain every role, project, and achievement in detail. Our <Link to="/ats-resume-builder" className="text-primary underline">resume-based question generator</Link> creates the exact questions interviewers are likely to ask based on your experience.</p>
            
            <h3 className="text-lg font-semibold text-foreground mt-6">4. Prepare for Common Question Types</h3>
            <ul className="space-y-2 mt-2">
              {[
                "Behavioral questions: 'Tell me about a time you handled conflict...'",
                "Technical questions: Role-specific knowledge and problem-solving",
                "Situational questions: 'What would you do if...'",
                "Culture fit questions: Values, teamwork, and work style",
              ].map((item, i) => (
                <li key={i} className="flex gap-3"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />{item}</li>
              ))}
            </ul>
            
            <h3 className="text-lg font-semibold text-foreground mt-6">5. Practice Out Loud</h3>
            <p>Reading answers silently is not enough. Use our AI mock interview feature to practice speaking your answers with voice input and receive real-time coaching feedback.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-8">Interview Preparation FAQs</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "How does the AI mock interview work?", a: "Our AI coach asks you questions one at a time based on your resume and target role. You can respond via voice or text. The AI provides feedback on clarity, structure, relevance, and suggests improvements." },
              { q: "What types of interview questions are covered?", a: "We cover behavioral (HR), technical, resume-based, and role-specific questions. Each question includes interviewer intent, a STAR/CAR framework guide, and pro tips." },
              { q: "Can I use this for technical interviews?", a: "Yes! Our question bank generates technical questions based on your listed skills and target role. For software engineers, check out our software engineer interview preparation guide." },
              { q: "Is the interview prep tool free?", a: "The mock interview and question bank features are available to registered users. Create a free account to get started." },
              { q: "How is the readiness score calculated?", a: "Our AI analyzes your resume against common interview topics for your target role. It evaluates the strength of your experience, skills coverage, and potential gaps to generate a readiness percentage." },
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
          <h2 className="font-serif text-xl font-bold mb-6">From Resume to Interview to Offer</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild><Link to="/ats-resume-builder">Build Your Resume</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/resume-templates">Resume Templates</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/software-engineer-resume">Engineer Resume</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/blog">Career Blog</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Ace Your Next Interview</h2>
          <p className="text-muted-foreground mb-6">Practice with AI, get personalized feedback, and walk into your interview with confidence.</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">Start Practicing Free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "How does the AI mock interview work?", acceptedAnswer: { "@type": "Answer", text: "Our AI coach asks questions based on your resume and target role. Respond via voice or text and receive real-time coaching feedback." } },
          { "@type": "Question", name: "What types of interview questions are covered?", acceptedAnswer: { "@type": "Answer", text: "Behavioral, technical, resume-based, and role-specific questions with STAR framework guidance." } },
          { "@type": "Question", name: "Is the interview prep tool free?", acceptedAnswer: { "@type": "Answer", text: "The mock interview and question bank features are available to registered users for free." } },
        ],
      }) }} />
    </div>
  );
}
