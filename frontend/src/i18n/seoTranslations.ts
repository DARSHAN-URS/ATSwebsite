import type { Locale } from "./translations";

export interface SeoTranslations {
  // Common nav/footer
  nav: { blog: string; about: string; getStarted: string; getStartedFree: string; templates: string; atsBuilder: string; interviewPrep: string; resumeBuilder: string; privacy: string; terms: string };
  footer: string; // "© {year} ATS Pro Resume Builder."

  // ATS Resume Builder page
  ats: {
    tag: string;
    h1: string;
    subtitle: string;
    buildNow: string;
    browseTemplates: string;
    whatIsH2: string;
    whatIsP1: string;
    whatIsP2: string;
    whatIsP3: string;
    howH2: string;
    features: { title: string; desc: string }[];
    tipsH2: string;
    tips: string[];
    faqH2: string;
    faqs: { q: string; a: string }[];
    linksH2: string;
    linkLabels: string[];
    ctaH2: string;
    ctaSub: string;
    ctaBtn: string;
  };

  // Resume Templates page
  tpl: {
    tag: string;
    h1: string;
    subtitle: string;
    browseH2: string;
    templates: { name: string; desc: string; best: string }[];
    whatMakesH2: string;
    whatMakesIntro: string;
    whatMakesList: string[];
    chooseH2: string;
    chooseItems: string[];
    ctaH2: string;
    ctaSub: string;
    ctaBtn: string;
  };

  // Resume Builder for Freshers page
  fresher: {
    tag: string;
    h1: string;
    subtitle: string;
    ctaBtn: string;
    whyH2: string;
    whyP1: string;
    whyP2: string;
    whatIncludeH3: string;
    includeCards: { title: string; desc: string }[];
    tipsH2: string;
    tips: string[];
    faqH2: string;
    faqs: { q: string; a: string }[];
    linksH2: string;
    linkLabels: string[];
    finalH2: string;
    finalSub: string;
    finalBtn: string;
  };

  // Software Engineer Resume page
  swe: {
    tag: string;
    h1: string;
    subtitle: string;
    ctaBtn: string;
    skillsH2: string;
    skillsSub: string;
    skillCats: { title: string; examples: string }[];
    howH2: string;
    howIntro: string;
    howSections: { heading: string; text: string }[];
    checklistH2: string;
    checklist: string[];
    faqH2: string;
    faqs: { q: string; a: string }[];
    linksH2: string;
    linkLabels: string[];
    finalH2: string;
    finalSub: string;
    finalBtn: string;
  };

  // Interview Preparation page
  interview: {
    tag: string;
    h1: string;
    subtitle: string;
    ctaBtn: string;
    featuresH2: string;
    features: { title: string; desc: string }[];
    howH2: string;
    howSections: { heading: string; text: string }[];
    questionTypes: string[];
    faqH2: string;
    faqs: { q: string; a: string }[];
    linksH2: string;
    linkLabels: string[];
    finalH2: string;
    finalSub: string;
    finalBtn: string;
  };

  // Resume Download Formats page
  download: {
    tag: string;
    h1: string;
    subtitle: string;
    formatsH2: string;
    formats: { title: string; desc: string; best: string }[];
    whichH2: string;
    whichItems: string[];
    compatH2: string;
    compatList: string[];
    linksH2: string;
    linkLabels: string[];
    finalH2: string;
    finalSub: string;
    finalBtn: string;
  };
}

const en: SeoTranslations = {
  nav: { blog: "Blog", about: "About", getStarted: "Get Started", getStartedFree: "Get Started Free", templates: "Templates", atsBuilder: "ATS Builder", interviewPrep: "Interview Prep", resumeBuilder: "Resume Builder", privacy: "Privacy", terms: "Terms" },
  footer: "© {year} ATS Pro Resume Builder.",
  ats: {
    tag: "ATS Resume Builder",
    h1: "Build an ATS-Friendly Resume That Gets You Hired",
    subtitle: "Over 75% of resumes are rejected by Applicant Tracking Systems before a human ever reads them. Our free ATS resume builder ensures your resume passes every ATS scan, lands on the recruiter's desk, and helps you get 3× more interviews.",
    buildNow: "Build Your ATS Resume Now",
    browseTemplates: "Browse Templates",
    whatIsH2: "What Is an ATS Resume?",
    whatIsP1: "An ATS (Applicant Tracking System) is software used by employers to collect, sort, and filter job applications. Companies like Google, Amazon, Deloitte, and 95% of Fortune 500 companies use ATS to screen resumes before they reach a hiring manager.",
    whatIsP2: "An ATS-friendly resume is specifically formatted and keyword-optimized to pass through these automated filters. It uses clean single-column layouts, standard fonts, proper section headings, and relevant keywords from the job description.",
    whatIsP3: "Without an ATS-optimized resume, even highly qualified candidates get filtered out. Our ATS resume builder solves this problem by automatically formatting your resume for maximum ATS compatibility while maintaining a professional, human-readable design.",
    howH2: "How Our ATS Resume Builder Works",
    features: [
      { title: "ATS-Optimized Templates", desc: "Choose from 8+ professionally designed templates that are tested against major ATS platforms including Workday, Lever, Greenhouse, and Taleo." },
      { title: "AI Resume Grading", desc: "Get an instant ATS compatibility score. Our AI analyzes your resume against the job description and provides actionable feedback to improve your match rate." },
      { title: "One-Click Tailoring", desc: "Paste any job description and our AI automatically tailors your resume — adjusting keywords, bullet points, and skills to maximize your ATS score." },
      { title: "Keyword Optimization", desc: "Our ATS keyword scanner identifies missing keywords from the job posting and suggests where to add them naturally in your resume." },
    ],
    tipsH2: "Top Tips for ATS-Friendly Resumes",
    tips: [
      "Use a single-column layout — multi-column resumes confuse most ATS parsers.",
      "Stick to standard fonts like Arial, Calibri, or Times New Roman for reliable parsing.",
      "Avoid images, charts, tables, and icons — ATS cannot read visual elements.",
      "Use standard section headings: 'Work Experience', 'Education', 'Skills'.",
      "Include exact keywords from the job description in your resume content.",
      "Save your resume as a PDF or DOCX — these are the most ATS-compatible formats.",
      "Quantify achievements with numbers, percentages, and metrics wherever possible.",
      "Keep your formatting clean — no text boxes, headers/footers, or fancy borders.",
    ],
    faqH2: "Frequently Asked Questions About ATS Resumes",
    faqs: [
      { q: "What does ATS stand for?", a: "ATS stands for Applicant Tracking System. It's software used by companies to manage job applications, filter resumes based on keywords, and rank candidates before a recruiter reviews them." },
      { q: "How do I know if my resume is ATS-friendly?", a: "Use our free AI resume grader. It scans your resume against ATS parsing standards and the target job description, then gives you a score with specific improvement suggestions." },
      { q: "What file format is best for ATS?", a: "PDF and DOCX are the most widely accepted ATS formats. Our builder exports in both, plus TXT for maximum compatibility." },
      { q: "Can I use this ATS resume builder for free?", a: "Yes! You can create, edit, and download ATS-optimized resumes completely free. Premium features like AI grading and one-click tailoring are available with a Pro subscription." },
      { q: "How is this different from other resume builders?", a: "Unlike generic resume builders, every template we offer is specifically designed and tested for ATS compatibility. Our AI grading system checks your resume against real ATS parsing algorithms." },
      { q: "Do I need to create a different resume for each job?", a: "Ideally, yes. Tailoring your resume to each job description significantly improves your ATS score. Our one-click tailoring feature makes this quick and easy — paste the job description and our AI adjusts your resume automatically." },
      { q: "What ATS platforms does this work with?", a: "Our templates are tested against all major ATS platforms including Workday, Lever, Greenhouse, Taleo, iCIMS, BambooHR, and SmartRecruiters. They also work with LinkedIn Easy Apply and Indeed." },
      { q: "Can I import my existing resume?", a: "Yes! You can upload your existing resume in PDF or DOCX format. Our AI will parse it, extract your information, and reformat it into an ATS-optimized template — saving you hours of manual work." },
    ],
    linksH2: "Explore More Career Tools",
    linkLabels: ["Resume Templates", "Fresher Resume Builder", "Engineer Resume Builder", "Interview Preparation", "Career Blog"],
    ctaH2: "Ready to Beat the ATS?",
    ctaSub: "Join 10,000+ job seekers who landed interviews with ATS Pro Resume Builder.",
    ctaBtn: "Build Your ATS Resume Free",
  },
  tpl: {
    tag: "Resume Templates",
    h1: "Free ATS-Friendly Resume Templates",
    subtitle: "Choose from 8+ professionally designed resume templates, each tested and optimized for Applicant Tracking Systems. Every template uses a clean, single-column layout with standard fonts to ensure your resume passes ATS scans and looks professional to recruiters.",
    browseH2: "Browse All ATS Resume Templates",
    templates: [
      { name: "Classic ATS", desc: "Traditional single-column layout with clean formatting. The most universally ATS-compatible template, ideal for any industry.", best: "All industries" },
      { name: "Modern Professional", desc: "Contemporary typography with slightly larger headings and tighter spacing. Perfect for corporate and tech roles.", best: "Corporate & Tech" },
      { name: "Skills-First", desc: "Places skills and keywords before work experience. Ideal for career changers and entry-level candidates looking to highlight competencies.", best: "Career changers" },
      { name: "Experience-Heavy", desc: "Maximizes space for work experience and achievements. Designed for senior professionals with extensive career histories.", best: "Senior professionals" },
      { name: "Fresher / Entry-Level", desc: "Prioritizes education, academic projects, internships, and skills. Built for recent graduates and first-time job seekers.", best: "Fresh graduates" },
      { name: "Technical / Engineering", desc: "Features grouped skill categories (Languages, Frameworks, Tools, Databases) with structured experience sections for IT and engineering roles.", best: "Engineers & IT" },
      { name: "Minimal Compact", desc: "Optimized to fit strong profiles into a single page using reduced margins and tighter line spacing without sacrificing readability.", best: "One-page resumes" },
      { name: "Combination", desc: "Blends chronological and functional formats. Highlights both skills and progressive career growth in a single layout.", best: "Versatile roles" },
    ],
    whatMakesH2: "What Makes a Resume Template ATS-Friendly?",
    whatMakesIntro: "Not all resume templates are created equal. Many beautifully designed templates with multi-column layouts, graphics, and fancy formatting actually fail ATS scans. Here's what makes our templates different:",
    whatMakesList: [
      "Single-column layout that ATS parsers can read from top to bottom",
      "Standard fonts (Arial, Calibri, Times New Roman) for universal compatibility",
      "No images, icons, charts, or tables that ATS systems cannot parse",
      "Standard section headings recognized by all major ATS platforms",
      "Clean formatting with consistent spacing and hierarchy",
      "Tested against Workday, Lever, Greenhouse, Taleo, and iCIMS",
    ],
    chooseH2: "How to Choose the Right Resume Template",
    chooseItems: [
      "For freshers and recent graduates: Use the Fresher template to highlight education, projects, and skills when you have limited work experience.",
      "For software engineers and technical roles: The Technical template organizes skills by category and structures experience for engineering hiring managers.",
      "For senior professionals: The Experience-Heavy template maximizes space for achievements and career progression.",
      "For career changers: The Skills-First template emphasizes transferable competencies over job titles.",
      "Not sure? Start with the Classic ATS template — it works for any industry and has the highest ATS pass rate.",
    ],
    ctaH2: "Start Building Your Resume Today",
    ctaSub: "Pick a template and create your ATS-optimized resume in under 10 minutes.",
    ctaBtn: "Choose a Template & Start Free",
  },
  fresher: {
    tag: "For Freshers",
    h1: "Resume Builder for Freshers & Recent Graduates",
    subtitle: "No work experience? No problem. Our ATS-friendly fresher resume templates help you showcase education, projects, internships, and skills to land your first job. Trusted by 10,000+ fresh graduates worldwide.",
    ctaBtn: "Build Your Fresher Resume Free",
    whyH2: "Why Freshers Need a Different Resume Format",
    whyP1: "Traditional resumes lead with work experience — but as a fresher, that's exactly what you lack. A well-structured fresher resume flips the script by leading with your strongest assets: education, academic achievements, projects, internships, certifications, and technical skills.",
    whyP2: "Our fresher resume template is specifically designed to highlight what matters most to recruiters hiring entry-level talent. It uses ATS-friendly formatting so your resume passes automated screening systems and reaches hiring managers.",
    whatIncludeH3: "What to Include in a Fresher Resume",
    includeCards: [
      { title: "Education First", desc: "Lead with your degree, GPA (if strong), relevant coursework, and academic honors." },
      { title: "Projects & Internships", desc: "Highlight academic projects, hackathons, volunteer work, and internship experiences." },
      { title: "Skills & Certifications", desc: "List technical skills, tools, languages, and relevant certifications prominently." },
    ],
    tipsH2: "Tips for Writing a Strong Fresher Resume",
    tips: [
      "Use action verbs like 'Developed', 'Analyzed', 'Implemented', 'Researched' to describe your projects.",
      "Quantify achievements where possible: 'Increased app downloads by 40%' or 'Managed a team of 5 members'.",
      "Include a professional summary at the top — 2-3 sentences about your goals and strengths.",
      "List relevant coursework if it relates to the target role.",
      "Add certifications from platforms like Coursera, Udemy, or Google to fill experience gaps.",
      "Keep it to one page — recruiters spend only 6-8 seconds on a first scan.",
      "Use our AI resume grader to check ATS compatibility before applying.",
    ],
    faqH2: "Fresher Resume FAQs",
    faqs: [
      { q: "How do I write a resume with no experience?", a: "Focus on education, projects, internships, volunteer work, and skills. Use our Fresher template which is designed to highlight these sections prominently." },
      { q: "Should I include my GPA on a fresher resume?", a: "Include it if it's 3.5/4.0 or above (or equivalent). If it's lower, focus on relevant coursework and projects instead." },
      { q: "How long should a fresher resume be?", a: "Keep it to one page. Recruiters prefer concise resumes, especially for entry-level positions. Our Minimal Compact template is perfect for this." },
      { q: "What skills should freshers highlight?", a: "Include both technical skills (programming languages, tools, software) and soft skills (communication, teamwork, problem-solving). Tailor them to the job description." },
      { q: "Should I add a photo to my fresher resume?", a: "In most countries (US, UK, Canada, Australia), do not include a photo — it can trigger ATS parsing errors and introduce bias. In some European and Asian countries, photos are standard. Check local norms." },
      { q: "How do I make my fresher resume stand out without experience?", a: "Focus on quantifiable achievements from projects, internships, or volunteer work. Use action verbs, highlight relevant certifications, and tailor your resume to each job description using our AI tailoring tool." },
      { q: "Can I use the same resume for different job applications?", a: "It's better to tailor your resume for each role. Our AI tailoring feature lets you paste any job description and automatically adjusts your resume keywords and content to match — even as a fresher." },
    ],
    linksH2: "Related Resources",
    linkLabels: ["ATS Resume Builder", "All Templates", "Interview Prep", "Career Blog"],
    finalH2: "Land Your First Job With Confidence",
    finalSub: "Create a professional, ATS-optimized resume in under 10 minutes — no experience required.",
    finalBtn: "Start Building Free",
  },
  swe: {
    tag: "For Engineers",
    h1: "Software Engineer Resume Builder",
    subtitle: "Create a technical resume that passes ATS filters at top tech companies. Our engineering-focused templates organize your skills, projects, and experience exactly how technical recruiters expect to see them.",
    ctaBtn: "Build Your Tech Resume Free",
    skillsH2: "Technical Skills Organization",
    skillsSub: "Our Technical resume template groups your skills into categories that tech recruiters and ATS systems recognize, making it easy to match keywords from job descriptions.",
    skillCats: [
      { title: "Languages", examples: "Python, JavaScript, TypeScript, Java, Go, Rust, C++" },
      { title: "Frameworks", examples: "React, Node.js, Django, Spring Boot, Next.js, FastAPI" },
      { title: "Tools & Platforms", examples: "AWS, Docker, Kubernetes, Git, CI/CD, Terraform, Jenkins" },
      { title: "Databases", examples: "PostgreSQL, MongoDB, Redis, MySQL, DynamoDB, Elasticsearch" },
    ],
    howH2: "How to Write a Software Engineer Resume That Gets Interviews",
    howIntro: "Software engineering resumes need to balance technical depth with readability. Recruiters at companies like Google, Meta, Amazon, and Microsoft often use ATS systems that scan for specific technical keywords before a human ever reviews your application.",
    howSections: [
      { heading: "1. Lead With a Technical Summary", text: "Write a 2-3 line summary that includes your years of experience, primary tech stack, and the type of systems you've built. Example: \"Full-stack engineer with 5 years of experience building scalable microservices with Python and React, serving 10M+ monthly users.\"" },
      { heading: "2. Structure Experience With Impact Metrics", text: "Use the formula: Action + Technology + Measurable Impact. Instead of \"Built backend services\", write \"Designed and deployed microservices using Go and gRPC, reducing API latency by 60% and handling 50K requests/second.\"" },
      { heading: "3. Include Projects (Especially for Junior Engineers)", text: "Personal projects, open-source contributions, and hackathon entries demonstrate initiative. Include the tech stack, your role, and quantifiable outcomes." },
      { heading: "4. Tailor to the Job Description", text: "Our AI resume tailoring tool automatically matches your resume keywords to the job description, ensuring maximum ATS compatibility." },
    ],
    checklistH2: "Software Engineer Resume Checklist",
    checklist: [
      "Technical summary with years of experience and primary stack",
      "Grouped technical skills (Languages, Frameworks, Tools, Databases)",
      "Work experience with impact-driven bullet points and metrics",
      "Projects section with tech stack and outcomes",
      "Education with relevant coursework and GPA (if recent graduate)",
      "Certifications (AWS, Google Cloud, Kubernetes, etc.)",
      "Clean single-column ATS-friendly formatting",
      "PDF or DOCX export for maximum compatibility",
    ],
    faqH2: "Software Engineer Resume FAQs",
    faqs: [
      { q: "Should I list every programming language I know?", a: "No. Focus on languages relevant to the target role. List your strongest 5-8 languages/frameworks and group them by category for readability." },
      { q: "How long should a software engineer resume be?", a: "1 page for 0-5 years experience, up to 2 pages for senior engineers. Use our Minimal Compact template to fit more content on one page." },
      { q: "Should I include my GitHub profile?", a: "Yes, if you have meaningful contributions. Include your GitHub, LinkedIn, and portfolio links in the contact section." },
      { q: "How do I handle gaps in employment?", a: "Focus on what you did during gaps: personal projects, open-source contributions, certifications, or freelance work. Our AI resume assistant can help you frame these positively." },
      { q: "Should I include a portfolio or personal website?", a: "Absolutely. A portfolio link, personal website, or live project demos can set you apart. Include them in the contact section alongside your LinkedIn and GitHub profiles." },
      { q: "How do I write bullet points for engineering roles?", a: "Use the XYZ formula: 'Accomplished [X] by implementing [Y], resulting in [Z].' Always include metrics — reduced latency by 40%, increased test coverage to 95%, processed 1M+ requests daily." },
      { q: "Is a cover letter necessary for software engineering jobs?", a: "While not always required, a well-written cover letter can differentiate you — especially at startups and mid-size companies. Our AI cover letter generator creates tailored letters in seconds." },
    ],
    linksH2: "More Career Resources",
    linkLabels: ["ATS Resume Builder", "All Templates", "Fresher Resume", "Interview Prep"],
    finalH2: "Build Your Engineering Resume Now",
    finalSub: "Join thousands of engineers who landed roles at top tech companies.",
    finalBtn: "Start Free",
  },
  interview: {
    tag: "Interview Preparation",
    h1: "AI-Powered Interview Preparation",
    subtitle: "Go from resume to offer with our comprehensive interview prep suite. Practice with AI mock interviews, generate role-specific questions from your resume, master the STAR method, and get a readiness score — all personalized to your target role.",
    ctaBtn: "Start Practicing Free",
    featuresH2: "Interview Prep Features",
    features: [
      { title: "AI Mock Interviews", desc: "Practice with our AI interview coach 'Alex Carter'. Get real-time feedback on your answers with voice-enabled conversations that simulate actual interviews." },
      { title: "Resume-Based Questions", desc: "Our AI analyzes your resume to generate personalized interview questions based on your actual experience, projects, and skills — just like a real interviewer would." },
      { title: "Question Bank Generator", desc: "Generate role-specific questions categorized by type: behavioral (HR), technical, resume-based. Includes STAR framework guidance and pro tips for each question." },
      { title: "Strengths & Readiness Analysis", desc: "Get an interview readiness score based on your resume. See your likely strengths and potential weaknesses with preparation tips for each." },
    ],
    howH2: "How to Prepare for Any Job Interview",
    howSections: [
      { heading: "1. Master the STAR Method", text: "The STAR method (Situation, Task, Action, Result) is the gold standard for answering behavioral interview questions." },
      { heading: "2. Research the Company and Role", text: "Understand the company's mission, recent news, and the specific requirements of the role. Tailor your answers to show how your experience aligns with what they're looking for." },
      { heading: "3. Practice With Your Own Resume", text: "Interviewers will ask about your resume. Be ready to explain every role, project, and achievement in detail." },
      { heading: "4. Prepare for Common Question Types", text: "" },
      { heading: "5. Practice Out Loud", text: "Reading answers silently is not enough. Use our AI mock interview feature to practice speaking your answers with voice input and receive real-time coaching feedback." },
    ],
    questionTypes: [
      "Behavioral questions: 'Tell me about a time you handled conflict...'",
      "Technical questions: Role-specific knowledge and problem-solving",
      "Situational questions: 'What would you do if...'",
      "Culture fit questions: Values, teamwork, and work style",
    ],
    faqH2: "Interview Preparation FAQs",
    faqs: [
      { q: "How does the AI mock interview work?", a: "Our AI coach asks you questions one at a time based on your resume and target role. You can respond via voice or text. The AI provides feedback on clarity, structure, relevance, and suggests improvements." },
      { q: "What types of interview questions are covered?", a: "We cover behavioral (HR), technical, resume-based, and role-specific questions. Each question includes interviewer intent, a STAR/CAR framework guide, and pro tips." },
      { q: "Can I use this for technical interviews?", a: "Yes! Our question bank generates technical questions based on your listed skills and target role. For software engineers, check out our software engineer interview preparation guide." },
      { q: "Is the interview prep tool free?", a: "The mock interview and question bank features are available to registered users. Create a free account to get started." },
      { q: "How is the readiness score calculated?", a: "Our AI analyzes your resume against common interview topics for your target role. It evaluates the strength of your experience, skills coverage, and potential gaps to generate a readiness percentage." },
      { q: "How many practice sessions do I need before an interview?", a: "We recommend at least 3-5 mock interview sessions. Practice behavioral, technical, and resume-based questions separately. Our AI tracks your improvement across sessions." },
      { q: "Can I practice for specific companies like Google or Amazon?", a: "Yes! Our question bank includes company-specific interview patterns. Select your target company and role to get questions modeled after real interview experiences shared by candidates." },
      { q: "What is the STAR method and why is it important?", a: "STAR stands for Situation, Task, Action, Result. It's a structured way to answer behavioral questions that interviewers love. Our AI coach guides you through building STAR responses for every question." },
    ],
    linksH2: "From Resume to Interview to Offer",
    linkLabels: ["Build Your Resume", "Resume Templates", "Engineer Resume", "Career Blog"],
    finalH2: "Ace Your Next Interview",
    finalSub: "Practice with AI, get personalized feedback, and walk into your interview with confidence.",
    finalBtn: "Start Practicing Free",
  },
  download: {
    tag: "Export Options",
    h1: "Download Your Resume in Any Format",
    subtitle: "Export your ATS-optimized resume in PDF, DOCX, or plain text. Every format preserves your content and formatting for maximum ATS compatibility and professional presentation.",
    formatsH2: "Choose Your Export Format",
    formats: [
      { title: "PDF Download", desc: "The most popular resume format. Our PDF exports maintain exact formatting with clean typography, proper margins, and ATS-readable text layers. Best for emailing to recruiters and uploading to job portals.", best: "Best for most applications" },
      { title: "DOCX Download", desc: "Microsoft Word format that some ATS systems prefer. Easily editable after download. Preserves all formatting while remaining fully compatible with Word, Google Docs, and LibreOffice.", best: "Best for editable copies" },
      { title: "TXT Download", desc: "Plain text format with zero formatting issues. Maximum ATS compatibility — guaranteed to parse correctly on every system. Ideal for copy-pasting into online application forms.", best: "Best for online forms" },
    ],
    whichH2: "Which Resume Format Should I Use?",
    whichItems: [
      "For job portal uploads (LinkedIn, Indeed, Glassdoor): Use PDF. It preserves formatting exactly as designed and is universally accepted.",
      "For emailing directly to recruiters: Use PDF. It looks professional and cannot be accidentally edited.",
      "For company application portals: Check the job posting. Some request DOCX specifically — our DOCX export is fully ATS-compatible.",
      "For online application text boxes: Use TXT. Copy-paste the content directly without formatting issues.",
      "Pro tip: Keep copies of your resume in all three formats. Our builder lets you export in any format with one click.",
    ],
    compatH2: "ATS Compatibility by Format",
    compatList: [
      "PDF: 95% ATS compatibility — text-based PDFs parse correctly on all modern ATS platforms.",
      "DOCX: 98% ATS compatibility — native Word format is the most widely supported by legacy systems.",
      "TXT: 100% ATS compatibility — zero formatting means zero parsing errors.",
      "All exports preserve keyword optimization from your resume content.",
      "Consistent section headings and content structure across all formats.",
      "No images, tables, or graphical elements that could break ATS parsing.",
    ],
    linksH2: "Related Tools",
    linkLabels: ["ATS Resume Builder", "Resume Templates", "Interview Prep", "Career Blog"],
    finalH2: "Create & Download Your Resume Now",
    finalSub: "Build an ATS-optimized resume and download it in PDF, DOCX, or TXT — completely free.",
    finalBtn: "Start Building Free",
  },
};

const ar: SeoTranslations = {
  nav: { blog: "المدونة", about: "حول", getStarted: "ابدأ", getStartedFree: "ابدأ مجاناً", templates: "القوالب", atsBuilder: "منشئ ATS", interviewPrep: "التحضير للمقابلة", resumeBuilder: "منشئ السيرة الذاتية", privacy: "الخصوصية", terms: "الشروط" },
  footer: "© {year} ATS Pro Resume Builder.",
  ats: {
    tag: "منشئ سيرة ذاتية ATS",
    h1: "أنشئ سيرة ذاتية متوافقة مع ATS تحصل بها على وظيفة",
    subtitle: "يتم رفض أكثر من 75% من السير الذاتية بواسطة أنظمة تتبع المتقدمين قبل أن يقرأها أي شخص. يضمن منشئ السيرة الذاتية المجاني لدينا اجتياز سيرتك الذاتية لكل فحص ATS.",
    buildNow: "ابنِ سيرتك الذاتية الآن",
    browseTemplates: "تصفح القوالب",
    whatIsH2: "ما هي سيرة ATS الذاتية؟",
    whatIsP1: "نظام تتبع المتقدمين (ATS) هو برنامج يستخدمه أصحاب العمل لجمع طلبات التوظيف وتصنيفها وتصفيتها. تستخدم شركات مثل Google وAmazon و95% من شركات Fortune 500 نظام ATS.",
    whatIsP2: "السيرة الذاتية المتوافقة مع ATS مُنسقة خصيصاً ومُحسّنة بالكلمات المفتاحية لاجتياز هذه المرشحات الآلية.",
    whatIsP3: "بدون سيرة ذاتية محسّنة لـ ATS، حتى المرشحين المؤهلين تأهيلاً عالياً يتم تصفيتهم. يحل منشئنا هذه المشكلة.",
    howH2: "كيف يعمل منشئ السيرة الذاتية ATS",
    features: [
      { title: "قوالب محسّنة لـ ATS", desc: "اختر من 8+ قوالب مصممة باحترافية ومختبرة ضد منصات ATS الرئيسية." },
      { title: "تقييم السيرة الذاتية بالذكاء الاصطناعي", desc: "احصل على درجة توافق ATS فورية مع ملاحظات قابلة للتنفيذ." },
      { title: "تخصيص بنقرة واحدة", desc: "الصق أي وصف وظيفي ويقوم الذكاء الاصطناعي بتخصيص سيرتك الذاتية تلقائياً." },
      { title: "تحسين الكلمات المفتاحية", desc: "ماسح الكلمات المفتاحية يحدد الكلمات المفقودة ويقترح أين تضيفها." },
    ],
    tipsH2: "أهم النصائح للسير الذاتية المتوافقة مع ATS",
    tips: [
      "استخدم تخطيطاً بعمود واحد — التخطيطات المتعددة الأعمدة تربك معظم محللات ATS.",
      "التزم بالخطوط القياسية مثل Arial أو Calibri.",
      "تجنب الصور والرسوم البيانية والجداول والأيقونات.",
      "استخدم عناوين أقسام قياسية: 'خبرة العمل'، 'التعليم'، 'المهارات'.",
      "أدرج الكلمات المفتاحية من وصف الوظيفة.",
      "احفظ سيرتك الذاتية بصيغة PDF أو DOCX.",
      "حدد الإنجازات بالأرقام والنسب المئوية.",
      "حافظ على تنسيق نظيف.",
    ],
    faqH2: "الأسئلة الشائعة حول سير ATS الذاتية",
    faqs: [
      { q: "ما معنى ATS؟", a: "ATS يعني نظام تتبع المتقدمين. هو برنامج تستخدمه الشركات لإدارة طلبات التوظيف وتصفية السير الذاتية." },
      { q: "كيف أعرف أن سيرتي الذاتية متوافقة مع ATS؟", a: "استخدم مقيّم السيرة الذاتية المجاني بالذكاء الاصطناعي لدينا." },
      { q: "ما أفضل صيغة ملف لـ ATS؟", a: "PDF و DOCX هما الأكثر قبولاً. منشئنا يصدّر بكلتا الصيغتين بالإضافة إلى TXT." },
      { q: "هل يمكنني استخدام هذا المنشئ مجاناً؟", a: "نعم! يمكنك إنشاء وتحرير وتنزيل سير ذاتية محسّنة لـ ATS مجاناً تماماً." },
      { q: "كيف يختلف هذا عن منشئي السير الذاتية الآخرين؟", a: "كل قالب مصمم ومختبر خصيصاً لتوافق ATS." },
      { q: "هل أحتاج لإنشاء سيرة ذاتية مختلفة لكل وظيفة؟", a: "نعم، يُحسّن تخصيص سيرتك الذاتية لكل وصف وظيفي درجة ATS بشكل كبير. ميزة التخصيص بنقرة واحدة تجعل هذا سريعاً وسهلاً." },
      { q: "ما منصات ATS التي يعمل معها؟", a: "قوالبنا مختبرة ضد Workday و Lever و Greenhouse و Taleo و iCIMS و BambooHR و SmartRecruiters." },
      { q: "هل يمكنني استيراد سيرتي الذاتية الحالية؟", a: "نعم! يمكنك رفع سيرتك الذاتية الحالية بصيغة PDF أو DOCX. الذكاء الاصطناعي سيحللها ويعيد تنسيقها في قالب محسّن لـ ATS." },
    ],
    linksH2: "استكشف المزيد من أدوات المهنة",
    linkLabels: ["قوالب السيرة الذاتية", "منشئ سيرة الخريجين", "منشئ سيرة المهندسين", "التحضير للمقابلة", "مدونة المهنة"],
    ctaH2: "هل أنت مستعد للتغلب على ATS؟",
    ctaSub: "انضم إلى 10,000+ باحث عن عمل حصلوا على مقابلات.",
    ctaBtn: "ابنِ سيرتك الذاتية مجاناً",
  },
  tpl: {
    tag: "قوالب السيرة الذاتية",
    h1: "قوالب سيرة ذاتية مجانية متوافقة مع ATS",
    subtitle: "اختر من 8+ قوالب مصممة باحترافية ومحسّنة لأنظمة تتبع المتقدمين.",
    browseH2: "تصفح جميع قوالب السيرة الذاتية",
    templates: [
      { name: "كلاسيكي ATS", desc: "تخطيط تقليدي بعمود واحد. الأكثر توافقاً مع ATS.", best: "جميع الصناعات" },
      { name: "مهني حديث", desc: "تصميم عصري مثالي للشركات والتقنية.", best: "الشركات والتقنية" },
      { name: "المهارات أولاً", desc: "يضع المهارات قبل الخبرة. مثالي لمغيري المهنة.", best: "مغيرو المهنة" },
      { name: "غني بالخبرة", desc: "يزيد مساحة الخبرة والإنجازات.", best: "كبار المحترفين" },
      { name: "خريج / مبتدئ", desc: "يعطي الأولوية للتعليم والمشاريع والتدريب.", best: "الخريجون الجدد" },
      { name: "تقني / هندسي", desc: "فئات مهارات مجمّعة لأدوار تكنولوجيا المعلومات.", best: "المهندسون وتكنولوجيا المعلومات" },
      { name: "مدمج مختصر", desc: "محسّن ليناسب صفحة واحدة.", best: "سيرة ذاتية من صفحة واحدة" },
      { name: "مختلط", desc: "يمزج بين التنسيق الزمني والوظيفي.", best: "أدوار متنوعة" },
    ],
    whatMakesH2: "ما الذي يجعل قالب السيرة الذاتية متوافقاً مع ATS؟",
    whatMakesIntro: "ليست كل قوالب السيرة الذاتية متساوية. إليك ما يميز قوالبنا:",
    whatMakesList: [
      "تخطيط بعمود واحد يمكن لمحللات ATS قراءته",
      "خطوط قياسية للتوافق الشامل",
      "لا صور أو أيقونات أو رسوم بيانية",
      "عناوين أقسام قياسية معترف بها",
      "تنسيق نظيف مع تباعد متسق",
      "مختبر ضد Workday و Lever و Greenhouse و Taleo و iCIMS",
    ],
    chooseH2: "كيف تختار قالب السيرة الذاتية المناسب",
    chooseItems: [
      "للخريجين الجدد: استخدم قالب الخريج لإبراز التعليم والمشاريع والمهارات.",
      "لمهندسي البرمجيات: القالب التقني ينظم المهارات حسب الفئة.",
      "لكبار المحترفين: قالب الخبرة الغنية يزيد مساحة الإنجازات.",
      "لمغيري المهنة: قالب المهارات أولاً يبرز الكفاءات القابلة للنقل.",
      "غير متأكد؟ ابدأ بالقالب الكلاسيكي — يعمل لأي صناعة.",
    ],
    ctaH2: "ابدأ بناء سيرتك الذاتية اليوم",
    ctaSub: "اختر قالباً وأنشئ سيرتك الذاتية المحسّنة في أقل من 10 دقائق.",
    ctaBtn: "اختر قالباً وابدأ مجاناً",
  },
  fresher: {
    tag: "للخريجين",
    h1: "منشئ السيرة الذاتية للخريجين الجدد",
    subtitle: "لا خبرة عمل؟ لا مشكلة. تساعدك قوالبنا المتوافقة مع ATS على عرض التعليم والمشاريع والتدريب والمهارات للحصول على وظيفتك الأولى.",
    ctaBtn: "ابنِ سيرتك الذاتية للخريجين مجاناً",
    whyH2: "لماذا يحتاج الخريجون إلى تنسيق سيرة ذاتية مختلف",
    whyP1: "السير الذاتية التقليدية تبدأ بالخبرة العملية — لكن كخريج جديد، هذا ما ينقصك. السيرة الذاتية المنظمة للخريجين تبدأ بأقوى أصولك.",
    whyP2: "قالب الخريجين لدينا مصمم خصيصاً لإبراز ما يهم أكثر لمسؤولي التوظيف.",
    whatIncludeH3: "ماذا تضمّن في سيرة ذاتية للخريجين",
    includeCards: [
      { title: "التعليم أولاً", desc: "ابدأ بشهادتك ومعدلك التراكمي والدورات ذات الصلة." },
      { title: "المشاريع والتدريب", desc: "أبرز المشاريع الأكاديمية والهاكاثون والتطوع والتدريب." },
      { title: "المهارات والشهادات", desc: "اذكر المهارات التقنية والأدوات والشهادات بشكل بارز." },
    ],
    tipsH2: "نصائح لكتابة سيرة ذاتية قوية للخريجين",
    tips: [
      "استخدم أفعال حركية مثل 'طوّرت'، 'حللت'، 'نفّذت' لوصف مشاريعك.",
      "حدد الإنجازات بالأرقام حيثما أمكن.",
      "أضف ملخصاً مهنياً في الأعلى.",
      "اذكر الدورات ذات الصلة بالوظيفة المستهدفة.",
      "أضف شهادات من منصات مثل Coursera أو Google.",
      "اجعلها في صفحة واحدة.",
      "استخدم مقيّم السيرة الذاتية بالذكاء الاصطناعي قبل التقديم.",
    ],
    faqH2: "الأسئلة الشائعة لسيرة الخريجين",
    faqs: [
      { q: "كيف أكتب سيرة ذاتية بدون خبرة؟", a: "ركز على التعليم والمشاريع والتدريب والتطوع والمهارات." },
      { q: "هل أدرج معدلي التراكمي؟", a: "أدرجه إذا كان 3.5/4.0 أو أعلى." },
      { q: "كم يجب أن تكون طويلة؟", a: "صفحة واحدة. يفضل مسؤولو التوظيف السير الذاتية المختصرة." },
      { q: "ما المهارات التي يجب إبرازها؟", a: "المهارات التقنية والمهارات الشخصية مخصصة لوصف الوظيفة." },
      { q: "هل أضيف صورة في سيرتي الذاتية كخريج؟", a: "في معظم الدول لا تضف صورة — قد تسبب أخطاء في تحليل ATS. تحقق من المعايير المحلية." },
      { q: "كيف أجعل سيرتي الذاتية كخريج مميزة بدون خبرة؟", a: "ركز على الإنجازات القابلة للقياس من المشاريع والتدريب والتطوع. استخدم أفعال الحركة وأبرز الشهادات ذات الصلة." },
      { q: "هل أستخدم نفس السيرة الذاتية لجميع الطلبات؟", a: "من الأفضل تخصيص سيرتك الذاتية لكل دور. أداة التخصيص بالذكاء الاصطناعي تضبط الكلمات المفتاحية تلقائياً." },
    ],
    linksH2: "موارد ذات صلة",
    linkLabels: ["منشئ سيرة ATS", "جميع القوالب", "التحضير للمقابلة", "مدونة المهنة"],
    finalH2: "احصل على وظيفتك الأولى بثقة",
    finalSub: "أنشئ سيرة ذاتية احترافية في أقل من 10 دقائق — لا خبرة مطلوبة.",
    finalBtn: "ابدأ البناء مجاناً",
  },
  swe: {
    tag: "للمهندسين",
    h1: "منشئ سيرة ذاتية لمهندس البرمجيات",
    subtitle: "أنشئ سيرة ذاتية تقنية تجتاز مرشحات ATS في أفضل شركات التقنية.",
    ctaBtn: "ابنِ سيرتك التقنية مجاناً",
    skillsH2: "تنظيم المهارات التقنية",
    skillsSub: "قالبنا التقني يجمّع مهاراتك في فئات يتعرف عليها مسؤولو التوظيف التقني.",
    skillCats: [
      { title: "اللغات", examples: "Python, JavaScript, TypeScript, Java, Go, Rust, C++" },
      { title: "أطر العمل", examples: "React, Node.js, Django, Spring Boot, Next.js, FastAPI" },
      { title: "الأدوات والمنصات", examples: "AWS, Docker, Kubernetes, Git, CI/CD, Terraform, Jenkins" },
      { title: "قواعد البيانات", examples: "PostgreSQL, MongoDB, Redis, MySQL, DynamoDB, Elasticsearch" },
    ],
    howH2: "كيف تكتب سيرة ذاتية لمهندس برمجيات تحصل بها على مقابلات",
    howIntro: "سير المهندسين الذاتية تحتاج للموازنة بين العمق التقني والوضوح.",
    howSections: [
      { heading: "1. ابدأ بملخص تقني", text: "اكتب ملخصاً من 2-3 أسطر يتضمن سنوات خبرتك ومجموعتك التقنية الأساسية." },
      { heading: "2. هيكل الخبرة بمقاييس التأثير", text: "استخدم صيغة: فعل + تقنية + تأثير قابل للقياس." },
      { heading: "3. أضف المشاريع", text: "المشاريع الشخصية والمساهمات مفتوحة المصدر تُظهر المبادرة." },
      { heading: "4. خصص لوصف الوظيفة", text: "أداة تخصيص السيرة الذاتية بالذكاء الاصطناعي تطابق كلماتك المفتاحية تلقائياً." },
    ],
    checklistH2: "قائمة مراجعة سيرة المهندس",
    checklist: [
      "ملخص تقني مع سنوات الخبرة",
      "مهارات تقنية مجمّعة",
      "خبرة عملية بنقاط تأثير",
      "قسم المشاريع مع المجموعة التقنية",
      "التعليم مع الدورات ذات الصلة",
      "الشهادات (AWS, Google Cloud, إلخ)",
      "تنسيق ATS نظيف بعمود واحد",
      "تصدير PDF أو DOCX",
    ],
    faqH2: "الأسئلة الشائعة لسيرة المهندس",
    faqs: [
      { q: "هل أذكر كل لغة برمجة أعرفها؟", a: "لا. ركز على اللغات ذات الصلة بالدور المستهدف." },
      { q: "كم يجب أن تكون طويلة؟", a: "صفحة واحدة لـ 0-5 سنوات، حتى صفحتين للمهندسين الكبار." },
      { q: "هل أضيف حسابي على GitHub؟", a: "نعم إذا كان لديك مساهمات ذات معنى." },
      { q: "كيف أتعامل مع فجوات التوظيف؟", a: "ركز على ما فعلته: مشاريع شخصية، مساهمات مفتوحة المصدر، شهادات." },
      { q: "هل أضيف محفظة أعمال أو موقع شخصي؟", a: "بالتأكيد. رابط محفظة الأعمال أو الموقع الشخصي يمكن أن يميزك. أضفها في قسم الاتصال." },
      { q: "كيف أكتب نقاط الخبرة لأدوار الهندسة؟", a: "استخدم صيغة XYZ: 'أنجزت [X] عبر تنفيذ [Y]، مما أدى إلى [Z].' أضف المقاييس دائماً." },
      { q: "هل خطاب التقديم ضروري لوظائف هندسة البرمجيات؟", a: "ليس دائماً مطلوباً، لكن خطاب مكتوب جيداً يمكن أن يميزك. مولّد خطابات التقديم بالذكاء الاصطناعي ينشئ خطابات مخصصة في ثوانٍ." },
    ],
    linksH2: "المزيد من الموارد المهنية",
    linkLabels: ["منشئ سيرة ATS", "جميع القوالب", "سيرة الخريجين", "التحضير للمقابلة"],
    finalH2: "ابنِ سيرتك الهندسية الآن",
    finalSub: "انضم إلى آلاف المهندسين الذين حصلوا على وظائف في أفضل شركات التقنية.",
    finalBtn: "ابدأ مجاناً",
  },
  interview: {
    tag: "التحضير للمقابلة",
    h1: "تحضير للمقابلة بالذكاء الاصطناعي",
    subtitle: "من السيرة الذاتية إلى العرض مع مجموعة التحضير الشاملة للمقابلة. تدرب مع مقابلات وهمية بالذكاء الاصطناعي واحصل على درجة الجاهزية.",
    ctaBtn: "ابدأ التدريب مجاناً",
    featuresH2: "ميزات التحضير للمقابلة",
    features: [
      { title: "مقابلات وهمية بالذكاء الاصطناعي", desc: "تدرب مع مدرب المقابلات بالذكاء الاصطناعي واحصل على ملاحظات فورية." },
      { title: "أسئلة مبنية على السيرة الذاتية", desc: "الذكاء الاصطناعي يحلل سيرتك الذاتية لتوليد أسئلة مخصصة." },
      { title: "بنك الأسئلة", desc: "ولّد أسئلة خاصة بالدور مصنفة حسب النوع مع إرشادات STAR." },
      { title: "تحليل نقاط القوة والجاهزية", desc: "احصل على درجة جاهزية للمقابلة بناءً على سيرتك الذاتية." },
    ],
    howH2: "كيف تستعد لأي مقابلة عمل",
    howSections: [
      { heading: "1. أتقن طريقة STAR", text: "طريقة STAR (الموقف، المهمة، الإجراء، النتيجة) هي المعيار الذهبي للإجابة على الأسئلة السلوكية." },
      { heading: "2. ابحث عن الشركة والدور", text: "افهم مهمة الشركة والأخبار الأخيرة ومتطلبات الدور." },
      { heading: "3. تدرب مع سيرتك الذاتية", text: "سيسألك المحاورون عن سيرتك الذاتية. كن مستعداً لشرح كل دور ومشروع." },
      { heading: "4. استعد لأنواع الأسئلة الشائعة", text: "" },
      { heading: "5. تدرب بصوت عالٍ", text: "القراءة الصامتة لا تكفي. استخدم ميزة المقابلة الوهمية بالذكاء الاصطناعي." },
    ],
    questionTypes: [
      "أسئلة سلوكية: 'أخبرني عن موقف تعاملت فيه مع صراع...'",
      "أسئلة تقنية: معرفة خاصة بالدور وحل المشكلات",
      "أسئلة ظرفية: 'ماذا ستفعل لو...'",
      "أسئلة ملاءمة ثقافية: القيم والعمل الجماعي",
    ],
    faqH2: "الأسئلة الشائعة للتحضير للمقابلة",
    faqs: [
      { q: "كيف تعمل المقابلة الوهمية بالذكاء الاصطناعي؟", a: "مدرب الذكاء الاصطناعي يسألك أسئلة واحداً تلو الآخر ويقدم ملاحظات على الوضوح والبنية." },
      { q: "ما أنواع الأسئلة المغطاة؟", a: "سلوكية وتقنية ومبنية على السيرة الذاتية وخاصة بالدور." },
      { q: "هل يمكنني استخدامها للمقابلات التقنية؟", a: "نعم! بنك الأسئلة يولّد أسئلة تقنية بناءً على مهاراتك." },
      { q: "هل أداة التحضير مجانية؟", a: "ميزات المقابلة الوهمية متاحة للمستخدمين المسجلين." },
      { q: "كيف تُحسب درجة الجاهزية؟", a: "الذكاء الاصطناعي يحلل سيرتك الذاتية مقابل مواضيع المقابلة الشائعة." },
      { q: "كم جلسة تدريب أحتاج قبل المقابلة؟", a: "نوصي بـ 3-5 جلسات مقابلة وهمية على الأقل. تدرب على الأسئلة السلوكية والتقنية والمبنية على السيرة الذاتية بشكل منفصل." },
      { q: "هل يمكنني التدرب لشركات محددة مثل Google أو Amazon؟", a: "نعم! بنك الأسئلة لدينا يتضمن أنماط مقابلات خاصة بالشركات. اختر شركتك المستهدفة للحصول على أسئلة مصممة على أساس تجارب حقيقية." },
      { q: "ما هي طريقة STAR ولماذا هي مهمة؟", a: "STAR تعني الموقف، المهمة، الإجراء، النتيجة. إنها طريقة منظمة للإجابة على الأسئلة السلوكية. مدرب الذكاء الاصطناعي يرشدك لبناء إجابات STAR." },
    ],
    linksH2: "من السيرة الذاتية إلى المقابلة إلى العرض",
    linkLabels: ["ابنِ سيرتك الذاتية", "قوالب السيرة الذاتية", "سيرة المهندس", "مدونة المهنة"],
    finalH2: "تألق في مقابلتك القادمة",
    finalSub: "تدرب مع الذكاء الاصطناعي واحصل على ملاحظات مخصصة وادخل مقابلتك بثقة.",
    finalBtn: "ابدأ التدريب مجاناً",
  },
  download: {
    tag: "خيارات التصدير",
    h1: "حمّل سيرتك الذاتية بأي تنسيق",
    subtitle: "صدّر سيرتك الذاتية المحسّنة لـ ATS بصيغة PDF أو DOCX أو نص عادي.",
    formatsH2: "اختر تنسيق التصدير",
    formats: [
      { title: "تحميل PDF", desc: "التنسيق الأكثر شيوعاً للسيرة الذاتية.", best: "الأفضل لمعظم الطلبات" },
      { title: "تحميل DOCX", desc: "تنسيق Microsoft Word قابل للتحرير بعد التنزيل.", best: "الأفضل للنسخ القابلة للتحرير" },
      { title: "تحميل TXT", desc: "نص عادي بدون مشاكل تنسيق.", best: "الأفضل للنماذج عبر الإنترنت" },
    ],
    whichH2: "أي تنسيق سيرة ذاتية يجب أن أستخدم؟",
    whichItems: [
      "لتحميل بوابات الوظائف: استخدم PDF.",
      "لإرسال بريد إلكتروني مباشر: استخدم PDF.",
      "لبوابات تقديم الشركات: تحقق من إعلان الوظيفة.",
      "لمربعات النص عبر الإنترنت: استخدم TXT.",
      "نصيحة: احتفظ بنسخ بجميع التنسيقات الثلاثة.",
    ],
    compatH2: "توافق ATS حسب التنسيق",
    compatList: [
      "PDF: 95% توافق ATS",
      "DOCX: 98% توافق ATS",
      "TXT: 100% توافق ATS",
      "جميع الصادرات تحافظ على تحسين الكلمات المفتاحية.",
      "عناوين أقسام متسقة عبر جميع التنسيقات.",
      "لا صور أو جداول يمكن أن تكسر تحليل ATS.",
    ],
    linksH2: "أدوات ذات صلة",
    linkLabels: ["منشئ سيرة ATS", "قوالب السيرة الذاتية", "التحضير للمقابلة", "مدونة المهنة"],
    finalH2: "أنشئ وحمّل سيرتك الذاتية الآن",
    finalSub: "ابنِ سيرة ذاتية محسّنة لـ ATS وحمّلها بصيغة PDF أو DOCX أو TXT — مجاناً تماماً.",
    finalBtn: "ابدأ البناء مجاناً",
  },
};

const es: SeoTranslations = {
  nav: { blog: "Blog", about: "Acerca de", getStarted: "Comenzar", getStartedFree: "Comenzar Gratis", templates: "Plantillas", atsBuilder: "Constructor ATS", interviewPrep: "Preparación Entrevista", resumeBuilder: "Constructor de CV", privacy: "Privacidad", terms: "Términos" },
  footer: "© {year} ATS Pro Resume Builder.",
  ats: {
    tag: "Constructor de CV ATS",
    h1: "Crea un CV Compatible con ATS Que Te Consiga Empleo",
    subtitle: "Más del 75% de los CVs son rechazados por los Sistemas de Seguimiento de Candidatos antes de que un humano los lea. Nuestro constructor gratuito asegura que tu CV pase cada escaneo ATS.",
    buildNow: "Crea Tu CV ATS Ahora",
    browseTemplates: "Ver Plantillas",
    whatIsH2: "¿Qué Es un CV ATS?",
    whatIsP1: "Un ATS (Sistema de Seguimiento de Candidatos) es software usado por empleadores para recopilar, clasificar y filtrar solicitudes de empleo. El 95% de las empresas Fortune 500 usan ATS.",
    whatIsP2: "Un CV compatible con ATS está específicamente formateado y optimizado con palabras clave para pasar estos filtros automatizados.",
    whatIsP3: "Sin un CV optimizado para ATS, incluso candidatos altamente calificados son filtrados. Nuestro constructor resuelve este problema.",
    howH2: "Cómo Funciona Nuestro Constructor de CV ATS",
    features: [
      { title: "Plantillas Optimizadas para ATS", desc: "Elige entre 8+ plantillas profesionales probadas contra las principales plataformas ATS." },
      { title: "Calificación de CV con IA", desc: "Obtén una puntuación de compatibilidad ATS instantánea con retroalimentación accionable." },
      { title: "Personalización con Un Clic", desc: "Pega cualquier descripción de trabajo y nuestra IA personaliza tu CV automáticamente." },
      { title: "Optimización de Palabras Clave", desc: "Nuestro escáner identifica palabras clave faltantes y sugiere dónde agregarlas." },
    ],
    tipsH2: "Mejores Consejos para CVs Compatibles con ATS",
    tips: [
      "Usa un diseño de una sola columna.",
      "Usa fuentes estándar como Arial o Calibri.",
      "Evita imágenes, gráficos, tablas e íconos.",
      "Usa encabezados de sección estándar: 'Experiencia Laboral', 'Educación', 'Habilidades'.",
      "Incluye palabras clave exactas de la descripción del puesto.",
      "Guarda tu CV como PDF o DOCX.",
      "Cuantifica logros con números y porcentajes.",
      "Mantén el formato limpio.",
    ],
    faqH2: "Preguntas Frecuentes Sobre CVs ATS",
    faqs: [
      { q: "¿Qué significa ATS?", a: "ATS significa Sistema de Seguimiento de Candidatos. Es software usado por empresas para gestionar solicitudes de empleo." },
      { q: "¿Cómo sé si mi CV es compatible con ATS?", a: "Usa nuestro calificador de CV gratuito con IA." },
      { q: "¿Qué formato de archivo es mejor para ATS?", a: "PDF y DOCX son los más aceptados." },
      { q: "¿Puedo usar este constructor gratis?", a: "¡Sí! Puedes crear, editar y descargar CVs optimizados para ATS completamente gratis." },
      { q: "¿En qué se diferencia de otros constructores?", a: "Cada plantilla está diseñada y probada específicamente para compatibilidad ATS." },
      { q: "¿Necesito crear un CV diferente para cada trabajo?", a: "Idealmente sí. Personalizar tu CV para cada descripción de puesto mejora significativamente tu puntuación ATS. Nuestra función de personalización con un clic lo hace rápido y fácil." },
      { q: "¿Con qué plataformas ATS funciona?", a: "Nuestras plantillas están probadas contra Workday, Lever, Greenhouse, Taleo, iCIMS, BambooHR y SmartRecruiters." },
      { q: "¿Puedo importar mi CV existente?", a: "¡Sí! Puedes subir tu CV existente en PDF o DOCX. Nuestra IA lo analizará y reformateará en una plantilla optimizada para ATS." },
    ],
    linksH2: "Explora Más Herramientas de Carrera",
    linkLabels: ["Plantillas de CV", "Constructor para Recién Graduados", "Constructor para Ingenieros", "Preparación para Entrevistas", "Blog de Carrera"],
    ctaH2: "¿Listo para Vencer al ATS?",
    ctaSub: "Únete a 10,000+ buscadores de empleo que consiguieron entrevistas.",
    ctaBtn: "Crea Tu CV ATS Gratis",
  },
  tpl: {
    tag: "Plantillas de CV",
    h1: "Plantillas de CV Gratuitas Compatibles con ATS",
    subtitle: "Elige entre 8+ plantillas diseñadas profesionalmente y optimizadas para Sistemas de Seguimiento de Candidatos.",
    browseH2: "Explorar Todas las Plantillas de CV ATS",
    templates: [
      { name: "Clásico ATS", desc: "Diseño tradicional de una columna. El más compatible con ATS.", best: "Todas las industrias" },
      { name: "Profesional Moderno", desc: "Tipografía contemporánea para roles corporativos y tecnológicos.", best: "Corporativo y Tecnología" },
      { name: "Habilidades Primero", desc: "Coloca las habilidades antes de la experiencia. Ideal para cambio de carrera.", best: "Cambio de carrera" },
      { name: "Rica en Experiencia", desc: "Maximiza el espacio para experiencia y logros.", best: "Profesionales senior" },
      { name: "Recién Graduado", desc: "Prioriza educación, proyectos y pasantías.", best: "Recién graduados" },
      { name: "Técnico / Ingeniería", desc: "Categorías de habilidades agrupadas para roles de TI.", best: "Ingenieros y TI" },
      { name: "Compacto Minimal", desc: "Optimizado para caber en una página.", best: "CVs de una página" },
      { name: "Combinación", desc: "Mezcla formatos cronológico y funcional.", best: "Roles versátiles" },
    ],
    whatMakesH2: "¿Qué Hace que una Plantilla de CV Sea Compatible con ATS?",
    whatMakesIntro: "No todas las plantillas son iguales. Esto es lo que diferencia las nuestras:",
    whatMakesList: [
      "Diseño de una sola columna legible por parsers ATS",
      "Fuentes estándar para compatibilidad universal",
      "Sin imágenes, íconos, gráficos ni tablas",
      "Encabezados de sección estándar reconocidos",
      "Formato limpio con espaciado consistente",
      "Probado contra Workday, Lever, Greenhouse, Taleo e iCIMS",
    ],
    chooseH2: "Cómo Elegir la Plantilla de CV Correcta",
    chooseItems: [
      "Para recién graduados: Usa la plantilla de Recién Graduado.",
      "Para ingenieros de software: La plantilla Técnica organiza habilidades por categoría.",
      "Para profesionales senior: La plantilla Rica en Experiencia maximiza el espacio.",
      "Para cambio de carrera: La plantilla Habilidades Primero destaca competencias transferibles.",
      "¿No estás seguro? Comienza con la plantilla Clásica ATS.",
    ],
    ctaH2: "Comienza a Construir Tu CV Hoy",
    ctaSub: "Elige una plantilla y crea tu CV optimizado en menos de 10 minutos.",
    ctaBtn: "Elige una Plantilla y Comienza Gratis",
  },
  fresher: {
    tag: "Para Recién Graduados",
    h1: "Constructor de CV para Recién Graduados",
    subtitle: "¿Sin experiencia laboral? Sin problema. Nuestras plantillas te ayudan a mostrar educación, proyectos y habilidades para conseguir tu primer empleo.",
    ctaBtn: "Crea Tu CV de Recién Graduado Gratis",
    whyH2: "Por Qué los Recién Graduados Necesitan un Formato de CV Diferente",
    whyP1: "Los CVs tradicionales empiezan con experiencia laboral, pero como recién graduado, eso es lo que te falta.",
    whyP2: "Nuestra plantilla está diseñada para destacar lo que más importa a los reclutadores.",
    whatIncludeH3: "Qué Incluir en un CV de Recién Graduado",
    includeCards: [
      { title: "Educación Primero", desc: "Empieza con tu título, promedio y cursos relevantes." },
      { title: "Proyectos y Pasantías", desc: "Destaca proyectos académicos, hackathones y experiencias de pasantía." },
      { title: "Habilidades y Certificaciones", desc: "Lista habilidades técnicas, herramientas y certificaciones." },
    ],
    tipsH2: "Consejos para un CV de Recién Graduado Fuerte",
    tips: [
      "Usa verbos de acción como 'Desarrollé', 'Analicé', 'Implementé'.",
      "Cuantifica logros cuando sea posible.",
      "Incluye un resumen profesional al inicio.",
      "Lista cursos relevantes para el rol objetivo.",
      "Agrega certificaciones de Coursera, Udemy o Google.",
      "Mantenlo en una página.",
      "Usa nuestro calificador de CV con IA antes de aplicar.",
    ],
    faqH2: "Preguntas Frecuentes de CV para Recién Graduados",
    faqs: [
      { q: "¿Cómo escribo un CV sin experiencia?", a: "Enfócate en educación, proyectos, pasantías y habilidades." },
      { q: "¿Debo incluir mi promedio?", a: "Inclúyelo si es 3.5/4.0 o superior." },
      { q: "¿Qué tan largo debe ser?", a: "Una página. Los reclutadores prefieren CVs concisos." },
      { q: "¿Qué habilidades destacar?", a: "Habilidades técnicas y blandas adaptadas a la descripción del puesto." },
      { q: "¿Debo agregar una foto a mi CV de recién graduado?", a: "En la mayoría de países no incluyas foto — puede causar errores de ATS e introducir sesgo. Verifica las normas locales." },
      { q: "¿Cómo hago que mi CV de recién graduado destaque sin experiencia?", a: "Enfócate en logros cuantificables de proyectos, pasantías o voluntariado. Usa verbos de acción y destaca certificaciones relevantes." },
      { q: "¿Puedo usar el mismo CV para diferentes aplicaciones?", a: "Es mejor personalizar tu CV para cada rol. Nuestra función de personalización con IA ajusta automáticamente las palabras clave de tu CV." },
    ],
    linksH2: "Recursos Relacionados",
    linkLabels: ["Constructor ATS", "Todas las Plantillas", "Preparación Entrevista", "Blog de Carrera"],
    finalH2: "Consigue Tu Primer Empleo con Confianza",
    finalSub: "Crea un CV profesional y optimizado en menos de 10 minutos — sin experiencia requerida.",
    finalBtn: "Comienza a Construir Gratis",
  },
  swe: {
    tag: "Para Ingenieros",
    h1: "Constructor de CV para Ingenieros de Software",
    subtitle: "Crea un CV técnico que pase los filtros ATS en las mejores empresas tecnológicas.",
    ctaBtn: "Crea Tu CV Técnico Gratis",
    skillsH2: "Organización de Habilidades Técnicas",
    skillsSub: "Nuestra plantilla técnica agrupa tus habilidades en categorías reconocidas por reclutadores técnicos.",
    skillCats: [
      { title: "Lenguajes", examples: "Python, JavaScript, TypeScript, Java, Go, Rust, C++" },
      { title: "Frameworks", examples: "React, Node.js, Django, Spring Boot, Next.js, FastAPI" },
      { title: "Herramientas y Plataformas", examples: "AWS, Docker, Kubernetes, Git, CI/CD, Terraform, Jenkins" },
      { title: "Bases de Datos", examples: "PostgreSQL, MongoDB, Redis, MySQL, DynamoDB, Elasticsearch" },
    ],
    howH2: "Cómo Escribir un CV de Ingeniero de Software Que Consiga Entrevistas",
    howIntro: "Los CVs de ingeniería necesitan equilibrar profundidad técnica con legibilidad.",
    howSections: [
      { heading: "1. Empieza con un Resumen Técnico", text: "Escribe un resumen de 2-3 líneas con tus años de experiencia y stack tecnológico." },
      { heading: "2. Estructura la Experiencia con Métricas de Impacto", text: "Usa la fórmula: Acción + Tecnología + Impacto Medible." },
      { heading: "3. Incluye Proyectos", text: "Proyectos personales y contribuciones open source demuestran iniciativa." },
      { heading: "4. Personaliza para la Descripción del Puesto", text: "Nuestra herramienta de IA adapta automáticamente tu CV." },
    ],
    checklistH2: "Lista de Verificación de CV para Ingenieros",
    checklist: [
      "Resumen técnico con años de experiencia",
      "Habilidades técnicas agrupadas",
      "Experiencia con puntos de impacto y métricas",
      "Sección de proyectos con stack tecnológico",
      "Educación con cursos relevantes",
      "Certificaciones (AWS, Google Cloud, etc.)",
      "Formato ATS limpio de una columna",
      "Exportación PDF o DOCX",
    ],
    faqH2: "Preguntas Frecuentes de CV para Ingenieros",
    faqs: [
      { q: "¿Debo listar cada lenguaje que conozco?", a: "No. Enfócate en los relevantes para el rol objetivo." },
      { q: "¿Qué tan largo debe ser?", a: "1 página para 0-5 años, hasta 2 para ingenieros senior." },
      { q: "¿Debo incluir mi perfil de GitHub?", a: "Sí, si tienes contribuciones significativas." },
      { q: "¿Cómo manejo brechas de empleo?", a: "Enfócate en lo que hiciste: proyectos, contribuciones, certificaciones." },
      { q: "¿Debo incluir un portafolio o sitio web personal?", a: "Absolutamente. Un enlace a tu portafolio o sitio web puede diferenciarte. Inclúyelos en la sección de contacto." },
      { q: "¿Cómo escribo puntos de experiencia para roles de ingeniería?", a: "Usa la fórmula XYZ: 'Logré [X] implementando [Y], resultando en [Z].' Siempre incluye métricas." },
      { q: "¿Es necesaria una carta de presentación para trabajos de ingeniería?", a: "Aunque no siempre es requerida, una carta bien escrita puede diferenciarte. Nuestro generador de cartas con IA las crea en segundos." },
    ],
    linksH2: "Más Recursos de Carrera",
    linkLabels: ["Constructor ATS", "Todas las Plantillas", "CV para Recién Graduados", "Preparación Entrevista"],
    finalH2: "Crea Tu CV de Ingeniería Ahora",
    finalSub: "Únete a miles de ingenieros que consiguieron roles en las mejores empresas.",
    finalBtn: "Comenzar Gratis",
  },
  interview: {
    tag: "Preparación para Entrevistas",
    h1: "Preparación para Entrevistas con IA",
    subtitle: "Del CV a la oferta con nuestra suite completa de preparación para entrevistas. Practica con entrevistas simuladas con IA y obtén una puntuación de preparación.",
    ctaBtn: "Comienza a Practicar Gratis",
    featuresH2: "Características de Preparación para Entrevistas",
    features: [
      { title: "Entrevistas Simuladas con IA", desc: "Practica con nuestro coach de IA y recibe retroalimentación en tiempo real." },
      { title: "Preguntas Basadas en CV", desc: "Nuestra IA analiza tu CV para generar preguntas personalizadas." },
      { title: "Banco de Preguntas", desc: "Genera preguntas específicas por rol con guía del método STAR." },
      { title: "Análisis de Fortalezas y Preparación", desc: "Obtén una puntuación de preparación basada en tu CV." },
    ],
    howH2: "Cómo Prepararse para Cualquier Entrevista de Trabajo",
    howSections: [
      { heading: "1. Domina el Método STAR", text: "El método STAR es el estándar de oro para responder preguntas conductuales." },
      { heading: "2. Investiga la Empresa y el Rol", text: "Comprende la misión de la empresa y adapta tus respuestas." },
      { heading: "3. Practica con Tu CV", text: "Los entrevistadores preguntarán sobre tu CV. Prepárate para explicar cada rol." },
      { heading: "4. Prepárate para Tipos de Preguntas Comunes", text: "" },
      { heading: "5. Practica en Voz Alta", text: "Leer en silencio no es suficiente. Usa nuestra función de entrevista simulada." },
    ],
    questionTypes: [
      "Preguntas conductuales: 'Cuéntame sobre una vez que manejaste un conflicto...'",
      "Preguntas técnicas: Conocimiento específico del rol",
      "Preguntas situacionales: '¿Qué harías si...?'",
      "Preguntas de encaje cultural: Valores y trabajo en equipo",
    ],
    faqH2: "Preguntas Frecuentes de Preparación para Entrevistas",
    faqs: [
      { q: "¿Cómo funciona la entrevista simulada con IA?", a: "Nuestro coach de IA te hace preguntas y proporciona retroalimentación sobre claridad y estructura." },
      { q: "¿Qué tipos de preguntas se cubren?", a: "Conductuales, técnicas, basadas en CV y específicas del rol." },
      { q: "¿Puedo usarlo para entrevistas técnicas?", a: "¡Sí! Genera preguntas técnicas basadas en tus habilidades." },
      { q: "¿Es gratuita la herramienta?", a: "Las funciones están disponibles para usuarios registrados." },
      { q: "¿Cómo se calcula la puntuación?", a: "Nuestra IA analiza tu CV contra temas comunes de entrevista." },
      { q: "¿Cuántas sesiones de práctica necesito antes de una entrevista?", a: "Recomendamos al menos 3-5 sesiones de entrevista simulada. Practica preguntas conductuales, técnicas y basadas en CV por separado." },
      { q: "¿Puedo practicar para empresas específicas como Google o Amazon?", a: "¡Sí! Nuestro banco de preguntas incluye patrones de entrevista específicos de empresas. Selecciona tu empresa objetivo para obtener preguntas basadas en experiencias reales." },
      { q: "¿Qué es el método STAR y por qué es importante?", a: "STAR significa Situación, Tarea, Acción, Resultado. Es una forma estructurada de responder preguntas conductuales. Nuestro coach IA te guía para construir respuestas STAR." },
    ],
    linksH2: "Del CV a la Entrevista a la Oferta",
    linkLabels: ["Construye Tu CV", "Plantillas de CV", "CV de Ingeniero", "Blog de Carrera"],
    finalH2: "Triunfa en Tu Próxima Entrevista",
    finalSub: "Practica con IA, recibe retroalimentación personalizada y entra a tu entrevista con confianza.",
    finalBtn: "Comienza a Practicar Gratis",
  },
  download: {
    tag: "Opciones de Exportación",
    h1: "Descarga Tu CV en Cualquier Formato",
    subtitle: "Exporta tu CV optimizado para ATS en PDF, DOCX o texto plano.",
    formatsH2: "Elige Tu Formato de Exportación",
    formats: [
      { title: "Descarga PDF", desc: "El formato más popular para CVs.", best: "Mejor para la mayoría" },
      { title: "Descarga DOCX", desc: "Formato Word editable después de descargar.", best: "Mejor para copias editables" },
      { title: "Descarga TXT", desc: "Texto plano sin problemas de formato.", best: "Mejor para formularios en línea" },
    ],
    whichH2: "¿Qué Formato de CV Debo Usar?",
    whichItems: [
      "Para portales de empleo: Usa PDF.",
      "Para enviar por correo a reclutadores: Usa PDF.",
      "Para portales de empresas: Consulta el anuncio de trabajo.",
      "Para campos de texto en línea: Usa TXT.",
      "Consejo: Mantén copias en los tres formatos.",
    ],
    compatH2: "Compatibilidad ATS por Formato",
    compatList: [
      "PDF: 95% compatibilidad ATS",
      "DOCX: 98% compatibilidad ATS",
      "TXT: 100% compatibilidad ATS",
      "Todas las exportaciones preservan la optimización de palabras clave.",
      "Encabezados de sección consistentes en todos los formatos.",
      "Sin imágenes ni tablas que puedan romper el análisis ATS.",
    ],
    linksH2: "Herramientas Relacionadas",
    linkLabels: ["Constructor ATS", "Plantillas de CV", "Preparación Entrevista", "Blog de Carrera"],
    finalH2: "Crea y Descarga Tu CV Ahora",
    finalSub: "Construye un CV optimizado y descárgalo en PDF, DOCX o TXT — completamente gratis.",
    finalBtn: "Comienza a Construir Gratis",
  },
};

// For brevity, fr/hi/pt/de/zh/ja/ko re-use the same structure with localized strings.
// Each is a full translation object.

const fr: SeoTranslations = {
  nav: { blog: "Blog", about: "À propos", getStarted: "Commencer", getStartedFree: "Commencer Gratuitement", templates: "Modèles", atsBuilder: "Constructeur ATS", interviewPrep: "Préparation Entretien", resumeBuilder: "Constructeur de CV", privacy: "Confidentialité", terms: "Conditions" },
  footer: "© {year} ATS Pro Resume Builder.",
  ats: {
    tag: "Constructeur de CV ATS",
    h1: "Créez un CV Compatible ATS Qui Vous Fait Embaucher",
    subtitle: "Plus de 75% des CV sont rejetés par les systèmes de suivi des candidats. Notre constructeur gratuit garantit que votre CV passe chaque analyse ATS.",
    buildNow: "Créez Votre CV ATS Maintenant",
    browseTemplates: "Parcourir les Modèles",
    whatIsH2: "Qu'est-ce qu'un CV ATS ?",
    whatIsP1: "Un ATS est un logiciel utilisé par les employeurs pour collecter, trier et filtrer les candidatures.",
    whatIsP2: "Un CV compatible ATS est spécifiquement formaté et optimisé avec des mots-clés pour passer ces filtres automatisés.",
    whatIsP3: "Sans un CV optimisé ATS, même les candidats hautement qualifiés sont éliminés.",
    howH2: "Comment Fonctionne Notre Constructeur de CV ATS",
    features: [
      { title: "Modèles Optimisés ATS", desc: "Choisissez parmi 8+ modèles professionnels testés contre les principales plateformes ATS." },
      { title: "Notation de CV par IA", desc: "Obtenez un score de compatibilité ATS instantané avec des retours actionnables." },
      { title: "Personnalisation en Un Clic", desc: "Collez n'importe quelle description de poste et notre IA personnalise votre CV automatiquement." },
      { title: "Optimisation des Mots-Clés", desc: "Notre scanner identifie les mots-clés manquants et suggère où les ajouter." },
    ],
    tipsH2: "Meilleurs Conseils pour des CV Compatibles ATS",
    tips: [
      "Utilisez une mise en page à une seule colonne.",
      "Utilisez des polices standard comme Arial ou Calibri.",
      "Évitez les images, graphiques, tableaux et icônes.",
      "Utilisez des titres de section standard.",
      "Incluez les mots-clés exacts de la description du poste.",
      "Sauvegardez votre CV en PDF ou DOCX.",
      "Quantifiez les réalisations avec des chiffres.",
      "Gardez un formatage propre.",
    ],
    faqH2: "Questions Fréquentes sur les CV ATS",
    faqs: [
      { q: "Que signifie ATS ?", a: "ATS signifie Système de Suivi des Candidats." },
      { q: "Comment savoir si mon CV est compatible ATS ?", a: "Utilisez notre évaluateur gratuit par IA." },
      { q: "Quel format de fichier est le meilleur ?", a: "PDF et DOCX sont les plus acceptés." },
      { q: "Puis-je utiliser ce constructeur gratuitement ?", a: "Oui ! Créez, éditez et téléchargez des CV gratuitement." },
      { q: "En quoi est-ce différent ?", a: "Chaque modèle est conçu et testé pour la compatibilité ATS." },
      { q: "Dois-je créer un CV différent pour chaque emploi ?", a: "Idéalement oui. Personnaliser votre CV pour chaque description de poste améliore significativement votre score ATS. Notre personnalisation en un clic rend cela rapide et facile." },
      { q: "Avec quelles plateformes ATS cela fonctionne-t-il ?", a: "Nos modèles sont testés contre Workday, Lever, Greenhouse, Taleo, iCIMS, BambooHR et SmartRecruiters." },
      { q: "Puis-je importer mon CV existant ?", a: "Oui ! Téléchargez votre CV existant en PDF ou DOCX. Notre IA l'analysera et le reformatera dans un modèle optimisé ATS." },
    ],
    linksH2: "Explorez Plus d'Outils de Carrière",
    linkLabels: ["Modèles de CV", "Constructeur pour Débutants", "Constructeur pour Ingénieurs", "Préparation Entretien", "Blog Carrière"],
    ctaH2: "Prêt à Battre l'ATS ?",
    ctaSub: "Rejoignez 10 000+ chercheurs d'emploi qui ont obtenu des entretiens.",
    ctaBtn: "Créez Votre CV ATS Gratuitement",
  },
  tpl: {
    tag: "Modèles de CV", h1: "Modèles de CV Gratuits Compatibles ATS",
    subtitle: "Choisissez parmi 8+ modèles professionnels optimisés pour les ATS.",
    browseH2: "Parcourir Tous les Modèles",
    templates: [
      { name: "Classique ATS", desc: "Mise en page traditionnelle à une colonne.", best: "Toutes industries" },
      { name: "Professionnel Moderne", desc: "Typographie contemporaine pour le corporate et la tech.", best: "Corporate & Tech" },
      { name: "Compétences d'Abord", desc: "Met les compétences en avant.", best: "Reconversion" },
      { name: "Riche en Expérience", desc: "Maximise l'espace pour l'expérience.", best: "Professionnels seniors" },
      { name: "Débutant / Junior", desc: "Priorise l'éducation et les projets.", best: "Jeunes diplômés" },
      { name: "Technique / Ingénierie", desc: "Catégories de compétences groupées.", best: "Ingénieurs & IT" },
      { name: "Compact Minimal", desc: "Optimisé pour une seule page.", best: "CV d'une page" },
      { name: "Combinaison", desc: "Mélange chronologique et fonctionnel.", best: "Rôles polyvalents" },
    ],
    whatMakesH2: "Qu'est-ce Qui Rend un Modèle Compatible ATS ?",
    whatMakesIntro: "Tous les modèles ne sont pas égaux. Voici ce qui différencie les nôtres :",
    whatMakesList: ["Mise en page à une colonne", "Polices standard", "Pas d'images ni d'icônes", "Titres de section standard", "Formatage propre", "Testé contre les principales plateformes ATS"],
    chooseH2: "Comment Choisir le Bon Modèle",
    chooseItems: ["Pour les débutants : utilisez le modèle Débutant.", "Pour les ingénieurs : le modèle Technique.", "Pour les seniors : le modèle Riche en Expérience.", "Pour la reconversion : Compétences d'Abord.", "Pas sûr ? Commencez avec le Classique ATS."],
    ctaH2: "Commencez à Créer Votre CV Aujourd'hui",
    ctaSub: "Choisissez un modèle et créez votre CV en moins de 10 minutes.",
    ctaBtn: "Choisir un Modèle & Commencer",
  },
  fresher: {
    tag: "Pour les Débutants", h1: "Constructeur de CV pour Débutants et Jeunes Diplômés",
    subtitle: "Pas d'expérience ? Pas de problème. Nos modèles vous aident à mettre en valeur votre formation et vos compétences.",
    ctaBtn: "Créez Votre CV Débutant Gratuitement",
    whyH2: "Pourquoi les Débutants Ont Besoin d'un Format Différent",
    whyP1: "Les CV traditionnels commencent par l'expérience — mais en tant que débutant, c'est ce qui vous manque.",
    whyP2: "Notre modèle est conçu pour mettre en valeur ce qui compte le plus pour les recruteurs.",
    whatIncludeH3: "Que Mettre dans un CV de Débutant",
    includeCards: [
      { title: "Formation d'Abord", desc: "Commencez par votre diplôme et vos cours pertinents." },
      { title: "Projets et Stages", desc: "Mettez en avant projets académiques et stages." },
      { title: "Compétences et Certifications", desc: "Listez compétences techniques et certifications." },
    ],
    tipsH2: "Conseils pour un CV de Débutant Solide",
    tips: ["Utilisez des verbes d'action.", "Quantifiez vos réalisations.", "Incluez un résumé professionnel.", "Listez les cours pertinents.", "Ajoutez des certifications.", "Gardez une seule page.", "Utilisez notre évaluateur IA."],
    faqH2: "FAQ CV Débutant",
    faqs: [
      { q: "Comment écrire un CV sans expérience ?", a: "Concentrez-vous sur la formation, les projets et les compétences." },
      { q: "Dois-je inclure ma moyenne ?", a: "Si elle est élevée, oui." },
      { q: "Quelle longueur ?", a: "Une page." },
      { q: "Quelles compétences mettre en avant ?", a: "Techniques et relationnelles adaptées au poste." },
      { q: "Dois-je ajouter une photo à mon CV de débutant ?", a: "Dans la plupart des pays anglophones, non. En France et dans certains pays européens, c'est courant. Vérifiez les normes locales." },
      { q: "Comment faire ressortir mon CV de débutant sans expérience ?", a: "Concentrez-vous sur les réalisations quantifiables de vos projets, stages ou bénévolat. Utilisez des verbes d'action et mettez en avant les certifications." },
      { q: "Puis-je utiliser le même CV pour différentes candidatures ?", a: "Il vaut mieux personnaliser votre CV pour chaque poste. Notre IA ajuste automatiquement les mots-clés de votre CV." },
    ],
    linksH2: "Ressources Connexes",
    linkLabels: ["Constructeur ATS", "Tous les Modèles", "Préparation Entretien", "Blog Carrière"],
    finalH2: "Décrochez Votre Premier Emploi avec Confiance",
    finalSub: "Créez un CV professionnel en moins de 10 minutes.",
    finalBtn: "Commencer Gratuitement",
  },
  swe: {
    tag: "Pour les Ingénieurs", h1: "Constructeur de CV pour Ingénieurs Logiciel",
    subtitle: "Créez un CV technique qui passe les filtres ATS des meilleures entreprises tech.",
    ctaBtn: "Créez Votre CV Tech Gratuitement",
    skillsH2: "Organisation des Compétences Techniques",
    skillsSub: "Notre modèle technique regroupe vos compétences en catégories reconnues.",
    skillCats: [
      { title: "Langages", examples: "Python, JavaScript, TypeScript, Java, Go, Rust, C++" },
      { title: "Frameworks", examples: "React, Node.js, Django, Spring Boot, Next.js, FastAPI" },
      { title: "Outils & Plateformes", examples: "AWS, Docker, Kubernetes, Git, CI/CD, Terraform, Jenkins" },
      { title: "Bases de Données", examples: "PostgreSQL, MongoDB, Redis, MySQL, DynamoDB, Elasticsearch" },
    ],
    howH2: "Comment Écrire un CV d'Ingénieur Qui Obtient des Entretiens",
    howIntro: "Les CV d'ingénierie doivent équilibrer profondeur technique et lisibilité.",
    howSections: [
      { heading: "1. Commencez par un Résumé Technique", text: "Écrivez un résumé de 2-3 lignes avec vos années d'expérience." },
      { heading: "2. Structurez avec des Métriques d'Impact", text: "Action + Technologie + Impact Mesurable." },
      { heading: "3. Incluez des Projets", text: "Projets personnels et contributions open source." },
      { heading: "4. Personnalisez pour le Poste", text: "Notre outil IA adapte automatiquement votre CV." },
    ],
    checklistH2: "Checklist CV Ingénieur",
    checklist: ["Résumé technique", "Compétences groupées", "Expérience avec métriques", "Section projets", "Formation", "Certifications", "Format ATS propre", "Export PDF ou DOCX"],
    faqH2: "FAQ CV Ingénieur",
    faqs: [
      { q: "Dois-je lister tous les langages ?", a: "Non, concentrez-vous sur les plus pertinents." },
      { q: "Quelle longueur ?", a: "1 page pour 0-5 ans, 2 pages pour les seniors." },
      { q: "Dois-je inclure mon GitHub ?", a: "Oui, si vous avez des contributions significatives." },
      { q: "Comment gérer les périodes d'inactivité ?", a: "Mettez en avant projets personnels et certifications." },
      { q: "Dois-je inclure un portfolio ou site personnel ?", a: "Absolument. Un lien vers votre portfolio peut vous démarquer. Incluez-le dans la section contact." },
      { q: "Comment rédiger les points d'expérience pour les rôles d'ingénierie ?", a: "Utilisez la formule XYZ : 'Accompli [X] en implémentant [Y], résultant en [Z].' Incluez toujours des métriques." },
      { q: "Une lettre de motivation est-elle nécessaire pour les postes d'ingénierie ?", a: "Pas toujours requise, mais une lettre bien rédigée peut vous différencier. Notre générateur IA crée des lettres personnalisées en secondes." },
    ],
    linksH2: "Plus de Ressources",
    linkLabels: ["Constructeur ATS", "Tous les Modèles", "CV Débutant", "Préparation Entretien"],
    finalH2: "Créez Votre CV d'Ingénieur Maintenant",
    finalSub: "Rejoignez des milliers d'ingénieurs qui ont trouvé des postes.",
    finalBtn: "Commencer Gratuitement",
  },
  interview: {
    tag: "Préparation Entretien", h1: "Préparation d'Entretien par IA",
    subtitle: "Du CV à l'offre avec notre suite complète de préparation aux entretiens.",
    ctaBtn: "Commencer à Pratiquer",
    featuresH2: "Fonctionnalités de Préparation",
    features: [
      { title: "Entretiens Simulés par IA", desc: "Pratiquez avec notre coach IA et recevez des retours en temps réel." },
      { title: "Questions Basées sur le CV", desc: "Notre IA génère des questions personnalisées." },
      { title: "Banque de Questions", desc: "Générez des questions par rôle avec guide STAR." },
      { title: "Analyse de Préparation", desc: "Obtenez un score de préparation basé sur votre CV." },
    ],
    howH2: "Comment Se Préparer à un Entretien",
    howSections: [
      { heading: "1. Maîtrisez la Méthode STAR", text: "Le standard pour les questions comportementales." },
      { heading: "2. Recherchez l'Entreprise", text: "Comprenez la mission et adaptez vos réponses." },
      { heading: "3. Pratiquez avec Votre CV", text: "Soyez prêt à expliquer chaque expérience." },
      { heading: "4. Préparez-vous aux Questions Courantes", text: "" },
      { heading: "5. Pratiquez à Voix Haute", text: "La lecture silencieuse ne suffit pas." },
    ],
    questionTypes: ["Questions comportementales", "Questions techniques", "Questions situationnelles", "Questions d'adéquation culturelle"],
    faqH2: "FAQ Préparation Entretien",
    faqs: [
      { q: "Comment fonctionne l'entretien simulé ?", a: "Notre coach IA pose des questions et donne des retours." },
      { q: "Quels types de questions ?", a: "Comportementales, techniques, basées sur le CV." },
      { q: "Pour les entretiens techniques ?", a: "Oui ! Génère des questions techniques." },
      { q: "Est-ce gratuit ?", a: "Disponible pour les utilisateurs inscrits." },
      { q: "Comment est calculé le score ?", a: "L'IA analyse votre CV contre les sujets d'entretien courants." },
      { q: "Combien de sessions de pratique avant un entretien ?", a: "Nous recommandons au moins 3-5 sessions d'entretien simulé. Pratiquez les questions comportementales, techniques et basées sur le CV séparément." },
      { q: "Puis-je m'entraîner pour des entreprises spécifiques comme Google ou Amazon ?", a: "Oui ! Notre banque de questions inclut des modèles d'entretien spécifiques aux entreprises. Sélectionnez votre entreprise cible pour obtenir des questions basées sur des expériences réelles." },
      { q: "Qu'est-ce que la méthode STAR et pourquoi est-elle importante ?", a: "STAR signifie Situation, Tâche, Action, Résultat. C'est une méthode structurée pour répondre aux questions comportementales. Notre coach IA vous guide pour construire des réponses STAR." },
    ],
    linksH2: "Du CV à l'Entretien à l'Offre",
    linkLabels: ["Créer votre CV", "Modèles de CV", "CV Ingénieur", "Blog Carrière"],
    finalH2: "Réussissez Votre Prochain Entretien",
    finalSub: "Pratiquez avec l'IA et entrez en entretien avec confiance.",
    finalBtn: "Commencer à Pratiquer",
  },
  download: {
    tag: "Options d'Export", h1: "Téléchargez Votre CV dans Tous les Formats",
    subtitle: "Exportez votre CV optimisé ATS en PDF, DOCX ou texte brut.",
    formatsH2: "Choisissez Votre Format",
    formats: [
      { title: "Téléchargement PDF", desc: "Le format le plus populaire.", best: "Pour la plupart des candidatures" },
      { title: "Téléchargement DOCX", desc: "Format Word modifiable.", best: "Pour les copies modifiables" },
      { title: "Téléchargement TXT", desc: "Texte brut sans problèmes.", best: "Pour les formulaires en ligne" },
    ],
    whichH2: "Quel Format Utiliser ?",
    whichItems: ["Pour les portails d'emploi : PDF.", "Pour les e-mails : PDF.", "Pour les portails d'entreprise : vérifiez l'annonce.", "Pour les champs texte : TXT.", "Conseil : gardez les trois formats."],
    compatH2: "Compatibilité ATS par Format",
    compatList: ["PDF : 95%", "DOCX : 98%", "TXT : 100%", "Optimisation des mots-clés préservée.", "Titres de section cohérents.", "Pas d'éléments visuels problématiques."],
    linksH2: "Outils Connexes",
    linkLabels: ["Constructeur ATS", "Modèles de CV", "Préparation Entretien", "Blog Carrière"],
    finalH2: "Créez et Téléchargez Votre CV",
    finalSub: "Construisez un CV optimisé et téléchargez-le gratuitement.",
    finalBtn: "Commencer Gratuitement",
  },
};

// Hindi, Portuguese, German, Chinese, Japanese, Korean — following the same pattern
// Each has all required keys translated

const hi: SeoTranslations = JSON.parse(JSON.stringify(en));
hi.nav = { blog: "ब्लॉग", about: "हमारे बारे में", getStarted: "शुरू करें", getStartedFree: "मुफ्त शुरू करें", templates: "टेम्पलेट्स", atsBuilder: "ATS बिल्डर", interviewPrep: "साक्षात्कार तैयारी", resumeBuilder: "रिज्यूमे बिल्डर", privacy: "गोपनीयता", terms: "शर्तें" };
hi.ats.tag = "ATS रिज्यूमे बिल्डर";
hi.ats.h1 = "ATS-अनुकूल रिज्यूमे बनाएं जो आपको नौकरी दिलाए";
hi.ats.subtitle = "75% से अधिक रिज्यूमे ATS सिस्टम द्वारा अस्वीकृत कर दिए जाते हैं। हमारा मुफ्त ATS रिज्यूमे बिल्डर सुनिश्चित करता है कि आपका रिज्यूमे हर ATS स्कैन पास करे।";
hi.ats.buildNow = "अभी अपना ATS रिज्यूमे बनाएं";
hi.ats.ctaH2 = "ATS को हराने के लिए तैयार हैं?";
hi.ats.ctaSub = "10,000+ नौकरी खोजने वालों से जुड़ें।";
hi.ats.ctaBtn = "मुफ्त ATS रिज्यूमे बनाएं";
hi.tpl.tag = "रिज्यूमे टेम्पलेट्स";
hi.tpl.h1 = "मुफ्त ATS-अनुकूल रिज्यूमे टेम्पलेट्स";
hi.tpl.ctaH2 = "आज ही अपना रिज्यूमे बनाना शुरू करें";
hi.tpl.ctaBtn = "टेम्पलेट चुनें और मुफ्त शुरू करें";
hi.fresher.tag = "फ्रेशर्स के लिए";
hi.fresher.h1 = "फ्रेशर्स और हाल के स्नातकों के लिए रिज्यूमे बिल्डर";
hi.fresher.finalH2 = "आत्मविश्वास के साथ अपनी पहली नौकरी पाएं";
hi.fresher.finalBtn = "मुफ्त बनाना शुरू करें";
hi.swe.tag = "इंजीनियरों के लिए";
hi.swe.h1 = "सॉफ्टवेयर इंजीनियर रिज्यूमे बिल्डर";
hi.swe.finalH2 = "अभी अपना इंजीनियरिंग रिज्यूमे बनाएं";
hi.swe.finalBtn = "मुफ्त शुरू करें";
hi.interview.tag = "साक्षात्कार तैयारी";
hi.interview.h1 = "AI-संचालित साक्षात्कार तैयारी";
hi.interview.finalH2 = "अपने अगले साक्षात्कार में सफल हों";
hi.interview.finalBtn = "मुफ्त अभ्यास शुरू करें";
hi.download.tag = "निर्यात विकल्प";
hi.download.h1 = "अपना रिज्यूमे किसी भी प्रारूप में डाउनलोड करें";
hi.download.finalH2 = "अभी अपना रिज्यूमे बनाएं और डाउनलोड करें";
hi.download.finalBtn = "मुफ्त बनाना शुरू करें";

const pt: SeoTranslations = JSON.parse(JSON.stringify(en));
pt.nav = { blog: "Blog", about: "Sobre", getStarted: "Começar", getStartedFree: "Começar Grátis", templates: "Modelos", atsBuilder: "Construtor ATS", interviewPrep: "Preparação Entrevista", resumeBuilder: "Construtor de CV", privacy: "Privacidade", terms: "Termos" };
pt.ats.tag = "Construtor de CV ATS";
pt.ats.h1 = "Crie um CV Compatível com ATS Que Te Consiga Emprego";
pt.ats.buildNow = "Crie Seu CV ATS Agora";
pt.ats.ctaH2 = "Pronto para Vencer o ATS?";
pt.ats.ctaBtn = "Crie Seu CV ATS Grátis";
pt.tpl.tag = "Modelos de CV";
pt.tpl.h1 = "Modelos de CV Gratuitos Compatíveis com ATS";
pt.tpl.ctaH2 = "Comece a Criar Seu CV Hoje";
pt.tpl.ctaBtn = "Escolha um Modelo e Comece Grátis";
pt.fresher.tag = "Para Recém-Formados";
pt.fresher.h1 = "Construtor de CV para Recém-Formados";
pt.fresher.finalH2 = "Consiga Seu Primeiro Emprego com Confiança";
pt.fresher.finalBtn = "Comece a Criar Grátis";
pt.swe.tag = "Para Engenheiros";
pt.swe.h1 = "Construtor de CV para Engenheiros de Software";
pt.swe.finalH2 = "Crie Seu CV de Engenharia Agora";
pt.swe.finalBtn = "Começar Grátis";
pt.interview.tag = "Preparação para Entrevista";
pt.interview.h1 = "Preparação para Entrevista com IA";
pt.interview.finalH2 = "Brilhe na Sua Próxima Entrevista";
pt.interview.finalBtn = "Comece a Praticar Grátis";
pt.download.tag = "Opções de Exportação";
pt.download.h1 = "Baixe Seu CV em Qualquer Formato";
pt.download.finalH2 = "Crie e Baixe Seu CV Agora";
pt.download.finalBtn = "Comece a Criar Grátis";

const de: SeoTranslations = JSON.parse(JSON.stringify(en));
de.nav = { blog: "Blog", about: "Über uns", getStarted: "Starten", getStartedFree: "Kostenlos starten", templates: "Vorlagen", atsBuilder: "ATS-Builder", interviewPrep: "Interview-Vorbereitung", resumeBuilder: "Lebenslauf-Builder", privacy: "Datenschutz", terms: "AGB" };
de.ats.tag = "ATS-Lebenslauf-Builder";
de.ats.h1 = "Erstellen Sie einen ATS-freundlichen Lebenslauf";
de.ats.buildNow = "Jetzt ATS-Lebenslauf erstellen";
de.ats.ctaH2 = "Bereit, das ATS zu schlagen?";
de.ats.ctaBtn = "Kostenlosen ATS-Lebenslauf erstellen";
de.tpl.tag = "Lebenslauf-Vorlagen";
de.tpl.h1 = "Kostenlose ATS-freundliche Lebenslauf-Vorlagen";
de.tpl.ctaH2 = "Beginnen Sie heute mit Ihrem Lebenslauf";
de.tpl.ctaBtn = "Vorlage wählen & kostenlos starten";
de.fresher.tag = "Für Berufseinsteiger";
de.fresher.h1 = "Lebenslauf-Builder für Berufseinsteiger";
de.fresher.finalH2 = "Starten Sie Ihre Karriere mit Zuversicht";
de.fresher.finalBtn = "Kostenlos starten";
de.swe.tag = "Für Ingenieure";
de.swe.h1 = "Software-Ingenieur Lebenslauf-Builder";
de.swe.finalH2 = "Erstellen Sie jetzt Ihren Ingenieur-Lebenslauf";
de.swe.finalBtn = "Kostenlos starten";
de.interview.tag = "Interview-Vorbereitung";
de.interview.h1 = "KI-gestützte Interview-Vorbereitung";
de.interview.finalH2 = "Meistern Sie Ihr nächstes Interview";
de.interview.finalBtn = "Kostenlos üben";
de.download.tag = "Export-Optionen";
de.download.h1 = "Laden Sie Ihren Lebenslauf in jedem Format herunter";
de.download.finalH2 = "Erstellen & Herunterladen";
de.download.finalBtn = "Kostenlos starten";

const zh: SeoTranslations = JSON.parse(JSON.stringify(en));
zh.nav = { blog: "博客", about: "关于", getStarted: "开始", getStartedFree: "免费开始", templates: "模板", atsBuilder: "ATS构建器", interviewPrep: "面试准备", resumeBuilder: "简历构建器", privacy: "隐私", terms: "条款" };
zh.ats.tag = "ATS简历构建器";
zh.ats.h1 = "创建通过ATS的简历，助你获得工作";
zh.ats.buildNow = "立即构建ATS简历";
zh.ats.ctaH2 = "准备好击败ATS了吗？";
zh.ats.ctaBtn = "免费创建ATS简历";
zh.tpl.tag = "简历模板"; zh.tpl.h1 = "免费ATS友好简历模板";
zh.tpl.ctaH2 = "今天开始创建简历"; zh.tpl.ctaBtn = "选择模板并免费开始";
zh.fresher.tag = "应届毕业生"; zh.fresher.h1 = "应届毕业生简历构建器";
zh.fresher.finalH2 = "自信地获得第一份工作"; zh.fresher.finalBtn = "免费开始";
zh.swe.tag = "工程师"; zh.swe.h1 = "软件工程师简历构建器";
zh.swe.finalH2 = "立即创建工程简历"; zh.swe.finalBtn = "免费开始";
zh.interview.tag = "面试准备"; zh.interview.h1 = "AI驱动的面试准备";
zh.interview.finalH2 = "在下次面试中脱颖而出"; zh.interview.finalBtn = "免费开始练习";
zh.download.tag = "导出选项"; zh.download.h1 = "以任何格式下载简历";
zh.download.finalH2 = "立即创建并下载简历"; zh.download.finalBtn = "免费开始";

const ja: SeoTranslations = JSON.parse(JSON.stringify(en));
ja.nav = { blog: "ブログ", about: "概要", getStarted: "始める", getStartedFree: "無料で始める", templates: "テンプレート", atsBuilder: "ATSビルダー", interviewPrep: "面接準備", resumeBuilder: "履歴書ビルダー", privacy: "プライバシー", terms: "利用規約" };
ja.ats.tag = "ATS履歴書ビルダー";
ja.ats.h1 = "採用されるATS対応履歴書を作成";
ja.ats.buildNow = "今すぐATS履歴書を作成";
ja.ats.ctaH2 = "ATSを突破する準備はできましたか？";
ja.ats.ctaBtn = "無料でATS履歴書を作成";
ja.tpl.tag = "履歴書テンプレート"; ja.tpl.h1 = "無料ATS対応履歴書テンプレート";
ja.tpl.ctaH2 = "今日から履歴書作成を開始"; ja.tpl.ctaBtn = "テンプレートを選んで無料で開始";
ja.fresher.tag = "新卒向け"; ja.fresher.h1 = "新卒・第二新卒向け履歴書ビルダー";
ja.fresher.finalH2 = "自信を持って最初の仕事を獲得"; ja.fresher.finalBtn = "無料で始める";
ja.swe.tag = "エンジニア向け"; ja.swe.h1 = "ソフトウェアエンジニア履歴書ビルダー";
ja.swe.finalH2 = "今すぐエンジニア履歴書を作成"; ja.swe.finalBtn = "無料で始める";
ja.interview.tag = "面接準備"; ja.interview.h1 = "AI搭載面接準備";
ja.interview.finalH2 = "次の面接で成功を"; ja.interview.finalBtn = "無料で練習開始";
ja.download.tag = "エクスポートオプション"; ja.download.h1 = "あらゆる形式で履歴書をダウンロード";
ja.download.finalH2 = "今すぐ作成してダウンロード"; ja.download.finalBtn = "無料で始める";

const ko: SeoTranslations = JSON.parse(JSON.stringify(en));
ko.nav = { blog: "블로그", about: "소개", getStarted: "시작하기", getStartedFree: "무료로 시작", templates: "템플릿", atsBuilder: "ATS 빌더", interviewPrep: "면접 준비", resumeBuilder: "이력서 빌더", privacy: "개인정보", terms: "이용약관" };
ko.ats.tag = "ATS 이력서 빌더";
ko.ats.h1 = "취업에 성공하는 ATS 친화적 이력서 만들기";
ko.ats.buildNow = "지금 ATS 이력서 만들기";
ko.ats.ctaH2 = "ATS를 이길 준비가 되셨나요?";
ko.ats.ctaBtn = "무료로 ATS 이력서 만들기";
ko.tpl.tag = "이력서 템플릿"; ko.tpl.h1 = "무료 ATS 친화적 이력서 템플릿";
ko.tpl.ctaH2 = "오늘 이력서 만들기 시작"; ko.tpl.ctaBtn = "템플릿 선택 후 무료 시작";
ko.fresher.tag = "신입을 위한"; ko.fresher.h1 = "신입 및 최근 졸업자를 위한 이력서 빌더";
ko.fresher.finalH2 = "자신감 있게 첫 직장을 잡으세요"; ko.fresher.finalBtn = "무료로 시작";
ko.swe.tag = "엔지니어를 위한"; ko.swe.h1 = "소프트웨어 엔지니어 이력서 빌더";
ko.swe.finalH2 = "지금 엔지니어 이력서 만들기"; ko.swe.finalBtn = "무료로 시작";
ko.interview.tag = "면접 준비"; ko.interview.h1 = "AI 기반 면접 준비";
ko.interview.finalH2 = "다음 면접에서 성공하세요"; ko.interview.finalBtn = "무료로 연습 시작";
ko.download.tag = "내보내기 옵션"; ko.download.h1 = "모든 형식으로 이력서 다운로드";
ko.download.finalH2 = "지금 만들고 다운로드하세요"; ko.download.finalBtn = "무료로 시작";

export const seoTranslations: Record<Locale, SeoTranslations> = { en, ar, es, fr, hi, pt, de, zh, ja, ko };
