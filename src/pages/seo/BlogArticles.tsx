import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import logo from "@/assets/logo.png";

export interface BlogArticle {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  keywords: string;
  content: string[];
}

export const SEED_ARTICLES: BlogArticle[] = [
  {
    slug: "what-is-ats-resume",
    title: "What Is an ATS Resume and How It Works",
    seoTitle: "What Is an ATS Resume? Complete Guide for Job Seekers",
    description: "Learn what an ATS resume is, how applicant tracking systems work, and how to format your resume to pass ATS scans. Complete guide with examples and tips.",
    category: "Resume Tips",
    readTime: "8 min read",
    date: "2025-12-15",
    keywords: "ATS resume, what is ATS, applicant tracking system, ATS resume format, how ATS works",
    content: [
      "## What Is an ATS Resume?",
      "An ATS (Applicant Tracking System) resume is a resume specifically formatted and optimized to pass through automated screening software used by employers. Over 95% of Fortune 500 companies and 75% of all employers use ATS to filter job applications before a human recruiter reviews them.",
      "When you submit a resume online, it rarely goes directly to a hiring manager. Instead, it's first processed by ATS software like Workday, Lever, Greenhouse, Taleo, or iCIMS. The system parses your resume, extracts key information (contact details, skills, experience, education), and ranks you against other candidates based on keyword matches and relevance to the job description.",
      "## How Does an ATS Work?",
      "An ATS performs several functions: **Resume Parsing** — the system reads your resume and extracts structured data. **Keyword Matching** — it compares your resume content against the job description's requirements. **Ranking** — candidates are scored and ranked based on how well their resume matches the job criteria. **Filtering** — resumes below a certain threshold are automatically rejected.",
      "This means that a highly qualified candidate can be rejected simply because their resume wasn't formatted correctly or didn't include the right keywords. Studies show that up to 75% of resumes are rejected by ATS before a human ever reads them.",
      "## How to Format Your Resume for ATS",
      "To ensure your resume passes ATS scans, follow these formatting guidelines:",
      "**Use a single-column layout.** Multi-column resumes confuse most ATS parsers. Stick to a straightforward top-to-bottom layout that the system can read sequentially.",
      "**Choose standard fonts.** Use Arial, Calibri, Times New Roman, or Helvetica. Decorative fonts may not be recognized by ATS.",
      "**Avoid images, charts, and tables.** ATS cannot read visual elements. All your important information should be in plain text.",
      "**Use standard section headings.** Label your sections with universally recognized headings: 'Work Experience', 'Education', 'Skills', 'Professional Summary'. Creative headings like 'My Journey' or 'Toolbox' may not be parsed correctly.",
      "**Save as PDF or DOCX.** These are the most ATS-compatible file formats. Avoid saving as JPG, PNG, or other non-text formats.",
      "## Keywords: The Key to ATS Success",
      "The most important factor in passing ATS is keyword optimization. Carefully read the job description and identify the key skills, technologies, and qualifications mentioned. Then, incorporate these exact phrases naturally throughout your resume.",
      "For example, if a job posting mentions 'project management', 'Agile methodology', and 'cross-functional teams', make sure these exact phrases appear in your resume where relevant. Our [ATS resume builder](/ats-resume-builder) includes an AI-powered keyword scanner that automatically identifies missing keywords and suggests where to add them.",
      "## ATS Resume vs. Regular Resume",
      "The main differences between an ATS-optimized resume and a regular resume are: **Formatting** — ATS resumes use simple, clean layouts without graphics. **Keywords** — ATS resumes are tailored to include specific keywords from the job description. **File format** — ATS resumes are saved in parseable formats (PDF/DOCX). **Content structure** — ATS resumes use standard headings and clear hierarchy.",
      "## Tools to Check ATS Compatibility",
      "Before submitting your resume, use an [ATS resume grader](/ats-resume-builder) to check compatibility. Our free AI-powered tool scans your resume against ATS parsing standards and provides a compatibility score with actionable suggestions for improvement.",
      "Ready to build an ATS-friendly resume? [Start with our free ATS resume builder](/) and choose from 8+ templates designed to pass every ATS scan.",
    ],
  },
  {
    slug: "ats-resume-vs-normal-resume",
    title: "ATS Resume vs Normal Resume — Key Differences",
    seoTitle: "ATS Resume vs Normal Resume: What's the Difference?",
    description: "Understand the key differences between ATS-optimized resumes and regular resumes. Learn why formatting matters and how to convert your resume for ATS compatibility.",
    category: "Resume Tips",
    readTime: "6 min read",
    date: "2025-12-20",
    keywords: "ATS resume vs normal resume, resume comparison, ATS formatting, resume optimization",
    content: [
      "## ATS Resume vs Normal Resume: What's the Difference?",
      "If you've been applying for jobs and not hearing back, your resume format might be the problem. The difference between an ATS resume and a normal resume can be the difference between getting an interview and being automatically rejected.",
      "## What Is a Normal Resume?",
      "A 'normal' or traditional resume is designed primarily for human readability. It often includes creative formatting, multiple columns, icons, color blocks, graphics, and decorative fonts. While these elements look great on screen, they can cause serious problems when processed by Applicant Tracking Systems.",
      "## What Is an ATS Resume?",
      "An ATS resume prioritizes machine readability while maintaining professional appearance. It uses clean formatting, standard fonts, single-column layouts, and keyword-optimized content that ATS software can accurately parse and evaluate.",
      "## Key Differences",
      "**Layout:** Normal resumes often use two-column or creative layouts. ATS resumes use a single-column, top-to-bottom format for reliable parsing.",
      "**Fonts:** Normal resumes may use decorative or custom fonts. ATS resumes stick to standard system fonts (Arial, Calibri, Times New Roman).",
      "**Visual Elements:** Normal resumes include icons, charts, images, and color blocks. ATS resumes avoid all visual elements that cannot be parsed as text.",
      "**Section Headings:** Normal resumes might use creative headings like 'My Toolbox' or 'The Journey'. ATS resumes use standard headings: 'Skills', 'Work Experience', 'Education'.",
      "**Keywords:** Normal resumes may use generic language. ATS resumes are specifically tailored with keywords from the target job description.",
      "**File Format:** Normal resumes are sometimes shared as images or designed PDFs. ATS resumes are always text-based PDF or DOCX files.",
      "## Why Does This Matter?",
      "Research shows that 75% of resumes are rejected by ATS before reaching a recruiter. Even if you're perfectly qualified for a role, a poorly formatted resume will be filtered out automatically. This is why converting your resume to an ATS-friendly format is one of the highest-impact changes you can make in your job search.",
      "## How to Convert Your Resume for ATS",
      "1. **Start with an ATS-friendly template.** Use our [free resume templates](/resume-templates) designed specifically for ATS compatibility.",
      "2. **Remove visual elements.** Strip out icons, images, charts, and decorative borders.",
      "3. **Simplify the layout.** Convert multi-column layouts to a single column.",
      "4. **Standardize headings.** Replace creative section names with recognized headings.",
      "5. **Add keywords.** Review the job description and incorporate relevant keywords naturally.",
      "6. **Test your resume.** Use our [AI resume grader](/ats-resume-builder) to check ATS compatibility before applying.",
      "Don't leave your job search to chance. [Build an ATS-optimized resume](/) that passes automated screening and impresses recruiters.",
    ],
  },
  {
    slug: "top-resume-mistakes-ats",
    title: "Top 10 Resume Mistakes That Fail ATS Scans",
    seoTitle: "Top 10 Resume Mistakes That Get You Rejected by ATS",
    description: "Avoid these common resume mistakes that cause ATS rejection. Learn what formatting, keyword, and content errors to fix for better interview rates.",
    category: "Resume Tips",
    readTime: "7 min read",
    date: "2026-01-05",
    keywords: "resume mistakes, ATS rejection, resume errors, why resume rejected, ATS formatting mistakes",
    content: [
      "## Top 10 Resume Mistakes That Get You Rejected by ATS",
      "Submitting dozens of applications with no response? The problem might not be your qualifications — it could be your resume format. Here are the top 10 resume mistakes that cause ATS rejection, and how to fix each one.",
      "## 1. Using Multi-Column Layouts",
      "Multi-column resumes look elegant, but most ATS parsers read text in a single stream from top to bottom. Columns cause content to be jumbled, with skills appearing mixed into education sections.",
      "**Fix:** Use a single-column layout. All our [ATS resume templates](/resume-templates) use this format.",
      "## 2. Missing Keywords from the Job Description",
      "ATS systems match your resume against job description keywords. If the posting says 'project management' and your resume says 'managing projects', some ATS won't recognize the match.",
      "**Fix:** Use exact phrases from the job description. Our [AI resume tailoring tool](/ats-resume-builder) automates this process.",
      "## 3. Using Images, Icons, or Charts",
      "ATS cannot read visual elements. Skills displayed as star ratings, progress bars, or icons are completely invisible to the system.",
      "**Fix:** List all skills as plain text. Replace visual ratings with descriptive text.",
      "## 4. Creative Section Headings",
      "Headings like 'My Toolbox', 'Professional Journey', or 'What I Bring' confuse ATS parsers. They expect standard labels.",
      "**Fix:** Use 'Skills', 'Work Experience', 'Education', 'Professional Summary', 'Certifications'.",
      "## 5. Incorrect File Format",
      "Submitting resumes as images (JPG/PNG), Google Docs links, or non-standard PDFs prevents ATS from reading the content.",
      "**Fix:** Always submit as text-based PDF or DOCX. Our builder [exports in both formats](/resume-download).",
      "## 6. Headers and Footers for Contact Info",
      "Many ATS systems cannot read text in headers and footers. If your name and contact info are in the header, they may be completely missed.",
      "**Fix:** Place all contact information in the main body of your resume.",
      "## 7. No Professional Summary",
      "Jumping straight into work experience without a summary means ATS has less context to evaluate your candidacy against the job requirements.",
      "**Fix:** Add a 2-3 sentence professional summary with your key qualifications and target role.",
      "## 8. Generic Content Not Tailored to the Role",
      "Sending the same generic resume to every job means you're only matching a fraction of each job's keywords.",
      "**Fix:** Tailor your resume for each application. Our one-click tailoring feature makes this take seconds, not hours.",
      "## 9. Inconsistent Formatting",
      "Mixed date formats, inconsistent bullet styles, and varying font sizes confuse ATS parsers and create a poor impression on recruiters.",
      "**Fix:** Maintain consistent formatting throughout. Our templates handle this automatically.",
      "## 10. Spelling and Grammar Errors",
      "Misspelled keywords won't match job description requirements. 'Javscript' won't match 'JavaScript'.",
      "**Fix:** Proofread carefully, especially technical terms and tool names. Our AI checks for common errors.",
      "## Next Steps",
      "Avoid these mistakes by using an [ATS-optimized resume builder](/) that handles formatting, keywords, and compatibility automatically. Then, prepare for interviews with our [AI interview coach](/interview-preparation).",
    ],
  },
  {
    slug: "interview-questions-software-engineers",
    title: "Interview Questions for Software Engineers — 2026 Guide",
    seoTitle: "Top Interview Questions for Software Engineers [2026]",
    description: "Prepare for your software engineering interview with the most common technical, behavioral, and system design questions. Includes answer frameworks and tips.",
    category: "Interview Prep",
    readTime: "10 min read",
    date: "2026-01-15",
    keywords: "software engineer interview questions, technical interview, coding interview, system design interview, behavioral interview engineer",
    content: [
      "## Top Interview Questions for Software Engineers in 2026",
      "Software engineering interviews typically cover three areas: technical knowledge, system design, and behavioral/cultural fit. This comprehensive guide covers the most common questions across all categories, with frameworks for structuring your answers.",
      "## Technical Interview Questions",
      "**Data Structures & Algorithms:** 'Explain the difference between a hash map and a tree map. When would you use each?' — Focus on time complexity trade-offs and real-world use cases. 'How would you detect a cycle in a linked list?' — Discuss Floyd's algorithm and its O(1) space complexity.",
      "**Language-Specific Questions:** 'What are closures in JavaScript and how do they work?' 'Explain the difference between an interface and an abstract class in Java/TypeScript.' 'How does Python's GIL affect multithreading?'",
      "**Framework Questions:** 'Explain the virtual DOM in React and why it improves performance.' 'What is dependency injection and how does Spring/Angular implement it?' 'How do you handle state management in a large React application?'",
      "## System Design Questions",
      "'Design a URL shortener like bit.ly.' — Discuss hashing strategies, database choices, and scaling. 'How would you design a real-time chat application?' — Cover WebSockets, message queues, and database sharding. 'Design a notification system that handles millions of users.' — Discuss pub/sub patterns, rate limiting, and delivery guarantees.",
      "**Framework for System Design Answers:** Start by clarifying requirements and constraints. Outline the high-level architecture. Discuss database choices and data models. Address scaling, caching, and load balancing. Consider failure scenarios and recovery.",
      "## Behavioral Interview Questions",
      "Tech companies increasingly value soft skills alongside technical ability. Prepare for these questions using the STAR method (Situation, Task, Action, Result):",
      "'Tell me about a time you disagreed with a technical decision.' — Show that you can advocate for your position while remaining collaborative and data-driven.",
      "'Describe a project where you had to learn a new technology quickly.' — Demonstrate adaptability, curiosity, and systematic learning approaches.",
      "'Tell me about a time you dealt with a production incident.' — Highlight your ability to stay calm under pressure, communicate clearly, and implement preventive measures.",
      "'How do you handle conflicting priorities from different stakeholders?' — Show your ability to prioritize based on impact and communicate trade-offs.",
      "## Coding Interview Preparation Tips",
      "1. **Practice daily on platforms like LeetCode or HackerRank.** Focus on medium-difficulty problems covering arrays, strings, trees, graphs, and dynamic programming.",
      "2. **Think aloud during interviews.** Interviewers want to understand your thought process, not just the final answer.",
      "3. **Start with brute force, then optimize.** Always state the brute force solution first, then discuss how to improve time/space complexity.",
      "4. **Test your code with edge cases.** Consider empty inputs, single elements, duplicates, and large datasets.",
      "5. **Practice with your actual resume.** Use our [interview preparation tool](/interview-preparation) to generate questions based on your specific experience and tech stack.",
      "## Company-Specific Preparation",
      "**FAANG companies** emphasize algorithmic problem-solving and system design. **Startups** focus more on practical coding skills and cultural fit. **Enterprise companies** value experience with specific technologies and frameworks.",
      "Build a strong [software engineer resume](/software-engineer-resume) first, then prepare for interviews with our [AI mock interview coach](/interview-preparation) that generates questions personalized to your resume.",
    ],
  },
];

export function BlogArticlePage() {
  const { slug } = useParams();
  const article = SEED_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <Button asChild><Link to="/blog">Back to Blog</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={article.seoTitle}
        description={article.description}
        canonical={`https://atsproresumebuilder.com/blog/${article.slug}`}
        keywords={article.keywords}
        ogType="article"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-10" width={120} height={40} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">Blog</Link>
            <Button size="sm" asChild><Link to="/">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-4 py-12">
        <Button variant="ghost" size="sm" className="gap-1.5 mb-6" asChild>
          <Link to="/blog"><ArrowLeft className="h-4 w-4" /> Back to Blog</Link>
        </Button>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{article.category}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-8">{article.title}</h1>

        <div className="prose prose-sm max-w-none">
          {article.content.map((block, i) => {
            if (block.startsWith("## ")) {
              return <h2 key={i} className="font-serif text-xl font-bold mt-8 mb-3 text-foreground">{block.replace("## ", "")}</h2>;
            }
            // Convert markdown links and bold
            const html = block
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
            return <p key={i} className="text-sm text-muted-foreground mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
          })}
        </div>

        {/* Internal links */}
        <div className="mt-12 pt-8 border-t border-border/60">
          <h3 className="text-sm font-semibold mb-4">Related Resources</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild><Link to="/ats-resume-builder">ATS Resume Builder</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/resume-templates">Resume Templates</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/interview-preparation">Interview Prep</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/">Build Your Resume Free</Link></Button>
          </div>
        </div>
      </article>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        author: { "@type": "Organization", name: "ATS Pro Resume Builder" },
        publisher: { "@type": "Organization", name: "ATS Pro Resume Builder", logo: { "@type": "ImageObject", url: "https://atsproresumebuilder.com/favicon.png" } },
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://atsproresumebuilder.com/blog/${article.slug}` },
      }) }} />
    </div>
  );
}
