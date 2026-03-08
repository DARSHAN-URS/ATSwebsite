export interface ResumeGuideData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: { heading: string; content: string }[];
  faqs: { question: string; answer: string }[];
}

const RESUME_GUIDES: ResumeGuideData[] = [
  {
    slug: "how-to-make-ats-friendly-resume",
    title: "How to Make an ATS-Friendly Resume",
    metaTitle: "How to Make an ATS-Friendly Resume (2026 Guide) | ATS Pro",
    metaDescription: "Complete guide to building ATS-friendly resumes that pass applicant tracking systems. Learn formatting, keywords, and structure tips to get more interviews.",
    intro: "Over 98% of Fortune 500 companies use Applicant Tracking Systems (ATS) to screen resumes before a human ever sees them. If your resume isn't ATS-friendly, it could be rejected regardless of your qualifications. This comprehensive guide teaches you exactly how to format, structure, and optimize your resume to pass ATS scanners and land more interviews.",
    sections: [
      { heading: "What Is an ATS and How Does It Work?", content: "An Applicant Tracking System is software that automates the recruitment process. It scans resumes for keywords, ranks candidates based on match scores, and filters out applications that don't meet minimum criteria. Understanding how ATS works is the first step to beating it. Most ATS software parses your resume into structured data — extracting your name, contact info, work history, education, and skills. If the parser can't read your resume correctly, your information gets lost or misinterpreted." },
      { heading: "Use Standard Section Headings", content: "ATS parsers look for standard headings to categorize your information. Always use conventional labels: 'Professional Summary' or 'Summary', 'Work Experience' or 'Experience', 'Skills', 'Education', and 'Certifications'. Creative headings like 'My Journey' or 'What I Bring' confuse the parser and can result in your experience being placed in the wrong category — or ignored entirely." },
      { heading: "Choose an ATS-Safe Format", content: "Use a single-column layout with clear hierarchy. Avoid tables, text boxes, headers/footers, columns, and graphics. These elements are invisible to most ATS parsers. Save your resume as a .docx or PDF (check the job posting for format preferences). Use standard fonts like Arial, Calibri, or Times New Roman at 10-12pt. Maintain consistent formatting throughout." },
      { heading: "Optimize Keywords Strategically", content: "ATS systems match keywords from your resume against the job description. Include both the full term and acronym (e.g., 'Search Engine Optimization (SEO)'). Mirror the exact phrases used in the job posting. Place keywords naturally throughout your summary, skills, and experience sections rather than keyword-stuffing a single section." },
      { heading: "Quantify Your Achievements", content: "Numbers stand out to both ATS and human reviewers. Instead of 'Managed a team', write 'Managed a team of 12 engineers, increasing sprint velocity by 30%'. Quantified achievements demonstrate impact and make your resume more compelling once it passes the ATS filter." },
      { heading: "Tailor Your Resume for Each Application", content: "Generic resumes score lower in ATS systems. For each application, read the job description carefully, identify the top 10-15 keywords, and naturally incorporate them. Adjust your professional summary, skills section, and experience bullets to align with the specific role. This can increase your ATS score by 30-50%." },
      { heading: "Common ATS Mistakes to Avoid", content: "Don't embed your contact information in headers or footers — many ATS can't read them. Don't use images for text content. Don't submit in uncommon formats like .pages or .odt. Don't use creative resume designs with multiple columns, graphics, or icons. Don't abbreviate job titles inconsistently. Always spell out acronyms at least once." },
      { heading: "Test Your Resume Before Submitting", content: "Use an ATS resume checker tool to scan your resume before applying. Look for your ATS compatibility score, missing keywords, formatting issues, and section completeness. Our free ATS Resume Checker can analyze your resume in seconds and provide specific improvement suggestions." },
    ],
    faqs: [
      { question: "What is the best file format for ATS resumes?", answer: "PDF and .docx are the most ATS-compatible formats. Check the job posting for specific requirements. If no format is specified, PDF is generally the safest choice as it preserves formatting across devices." },
      { question: "Should I use a resume template for ATS?", answer: "Yes, but choose a simple, single-column template without graphics, tables, or text boxes. ATS-optimized templates ensure your content is parsed correctly while still looking professional to human reviewers." },
      { question: "How many keywords should my resume have?", answer: "Aim to include the top 15-20 relevant keywords from the job description. Distribute them naturally across your summary, skills, and experience sections. Don't keyword-stuff — ATS and recruiters can both detect this." },
      { question: "Can I pass ATS with a creative resume design?", answer: "Most creative designs fail ATS parsing due to graphics, columns, and non-standard formatting. Save creative design for your portfolio. Your resume should prioritize readability for both machines and humans." },
      { question: "How do I know if my resume passed the ATS?", answer: "If you receive an email confirmation, your resume was at least parsed by the ATS. To check before submitting, use an ATS resume checker tool to estimate your compatibility score and identify issues." },
    ],
  },
  {
    slug: "resume-summary-examples",
    title: "How to Write a Powerful Resume Summary",
    metaTitle: "Resume Summary Examples & Tips (2026) | ATS Pro",
    metaDescription: "Learn to write a compelling resume summary with 20+ examples. Get tips for writing ATS-friendly professional summaries that grab recruiter attention in 6 seconds.",
    intro: "Recruiters spend an average of 6-7 seconds on an initial resume scan. Your professional summary is the first thing they read — and it determines whether they keep reading. A strong summary combines your value proposition, key skills, and quantified achievements into 3-4 impactful sentences. Here's how to write one that captures attention for every career level.",
    sections: [
      { heading: "What Makes a Great Resume Summary?", content: "An effective summary answers three questions: Who are you professionally? What do you bring? What have you achieved? It should be 3-4 sentences (50-80 words) tailored to the specific role. Include your years of experience, key specializations, 2-3 headline achievements, and the value you bring to the employer. Avoid first-person pronouns and generic adjectives like 'hardworking' or 'team player'." },
      { heading: "Resume Summary vs. Resume Objective", content: "A summary highlights your experience and achievements — ideal for experienced professionals. An objective states your career goals — better for career changers or recent graduates. In most cases, summaries are preferred because they show value to the employer rather than focusing on what you want." },
      { heading: "Entry-Level Summary Examples", content: "For entry-level candidates, focus on education, relevant coursework, internships, and transferable skills. Example: 'Recent Computer Science graduate from UC Berkeley with internship experience at Google. Developed a data analysis tool used by 50+ analysts. Proficient in Python, SQL, and machine learning. Dean's List with 3.8 GPA.'" },
      { heading: "Mid-Career Summary Examples", content: "Mid-career professionals should emphasize career progression and impactful achievements. Example: 'Marketing Manager with 5+ years scaling B2B SaaS growth from startup to Series C. Grew MRR from $200K to $2M through content-led acquisition and paid campaigns. Expert in HubSpot, Google Analytics, and conversion optimization.'" },
      { heading: "Executive Summary Examples", content: "Executives should demonstrate leadership scope and strategic impact. Example: 'C-level technology executive with 15+ years driving digital transformation for Fortune 500 organizations. Led 3,000+ person engineering organization. Delivered $500M+ in revenue growth through platform modernization. Board advisor for 2 publicly traded companies.'" },
      { heading: "Tips for ATS Optimization", content: "Include role-specific keywords in your summary to boost ATS scores. Use the exact job title from the posting. Mention industry-specific tools and methodologies. Mirror language from the job description. The summary is prime real estate for keywords because it appears at the top of your resume." },
    ],
    faqs: [
      { question: "How long should a resume summary be?", answer: "Keep it to 3-4 sentences or 50-80 words. It should be concise enough to read in 6 seconds but impactful enough to compel the reader to continue." },
      { question: "Should I include a summary on my resume?", answer: "Yes, a well-written summary is one of the most impactful resume sections. It provides context for your experience and helps both ATS and recruiters quickly understand your value proposition." },
      { question: "What should I avoid in a resume summary?", answer: "Avoid generic phrases ('hardworking team player'), first-person pronouns ('I am'), and unquantified claims ('extensive experience'). Be specific, quantify achievements, and tailor to each job." },
    ],
  },
  {
    slug: "resume-action-verbs",
    title: "200+ Resume Action Verbs That Get Results",
    metaTitle: "200+ Strong Resume Action Verbs (2026 List) | ATS Pro",
    metaDescription: "Complete list of powerful resume action verbs organized by skill category. Replace weak words to make your resume stand out to ATS and recruiters.",
    intro: "The verbs you use on your resume directly impact how recruiters perceive your achievements. Weak verbs like 'responsible for' or 'helped with' dilute your impact. Strong action verbs like 'spearheaded', 'optimized', or 'delivered' demonstrate leadership and results. This guide provides 200+ categorized action verbs to transform every bullet point.",
    sections: [
      { heading: "Leadership & Management Verbs", content: "Directed, Led, Managed, Supervised, Oversaw, Orchestrated, Spearheaded, Championed, Mentored, Coached, Delegated, Facilitated, Coordinated, Mobilized, United. These verbs demonstrate authority and initiative. Use them for management roles, team leadership, and project oversight." },
      { heading: "Achievement & Results Verbs", content: "Achieved, Delivered, Exceeded, Surpassed, Outperformed, Accomplished, Attained, Earned, Generated, Produced, Secured, Won, Captured, Maximized, Improved. These verbs pair perfectly with quantified results to show impact." },
      { heading: "Technical & Analytical Verbs", content: "Engineered, Developed, Architected, Built, Programmed, Automated, Debugged, Deployed, Integrated, Optimized, Analyzed, Calculated, Measured, Evaluated, Modeled. Use these for technical roles to demonstrate hands-on expertise." },
      { heading: "Creative & Communication Verbs", content: "Designed, Created, Crafted, Authored, Published, Presented, Communicated, Persuaded, Negotiated, Influenced, Branded, Conceptualized, Illustrated, Produced, Curated." },
      { heading: "Efficiency & Process Verbs", content: "Streamlined, Reduced, Eliminated, Consolidated, Simplified, Accelerated, Transformed, Revamped, Restructured, Modernized, Standardized, Systemized, Expedited." },
      { heading: "How to Use Action Verbs Effectively", content: "Start every bullet point with a strong action verb. Vary your verbs — don't repeat the same one. Match verb intensity to achievement scale. Pair verbs with specific metrics: 'Reduced costs by 30%' is stronger than 'Reduced costs'. Use past tense for previous roles and present tense for current roles." },
    ],
    faqs: [
      { question: "What are the strongest resume action verbs?", answer: "The strongest verbs are specific, quantifiable, and active: 'spearheaded', 'delivered', 'generated', 'architected', 'transformed'. Avoid passive or weak verbs like 'assisted', 'helped', 'was responsible for'." },
      { question: "Should I start every bullet with an action verb?", answer: "Yes, starting every experience bullet with a strong action verb creates consistency and impact. It immediately shows what you did rather than what your role was." },
    ],
  },
  {
    slug: "how-to-write-resume-with-no-experience",
    title: "How to Write a Resume With No Experience",
    metaTitle: "How to Write a Resume With No Experience (2026 Guide) | ATS Pro",
    metaDescription: "Write a professional resume with no work experience. Learn how to highlight education, projects, volunteering, and transferable skills to land your first job.",
    intro: "Writing a resume without professional experience feels daunting, but everyone starts somewhere. The key is repositioning what you do have — education, projects, volunteering, skills, and extracurriculars — into a compelling narrative. This guide shows you exactly how to build a resume that lands interviews even without traditional work experience.",
    sections: [
      { heading: "Lead With Education", content: "Without work experience, your education section becomes your strongest asset. Include your degree, GPA (if 3.0+), relevant coursework, academic projects, honors, and study abroad experience. Place education near the top of your resume, below your summary. Include capstone projects, research assistantships, and thesis work as demonstrable experience." },
      { heading: "Highlight Projects and Portfolios", content: "Personal, academic, or open-source projects demonstrate real skills. Create a 'Projects' section listing 2-4 relevant projects with descriptions, technologies used, and outcomes. For example: 'Built a full-stack e-commerce app using React and Node.js, deployed on AWS with 500+ test users.'" },
      { heading: "Leverage Volunteering and Extracurriculars", content: "Volunteer work, student organizations, and extracurriculars build transferable skills. Led a student organization? That's leadership. Volunteered at a food bank? That's operations and teamwork. Frame these experiences using the same action verb + metric format as work experience." },
      { heading: "Emphasize Transferable Skills", content: "Skills like communication, problem-solving, data analysis, and project management apply to any role. Create a strong skills section with both hard and soft skills relevant to your target job. Include technical skills, tools, and certifications earned through online courses." },
      { heading: "Use a Functional or Hybrid Format", content: "A functional resume format groups experience by skill rather than chronology, which can help when you lack traditional work history. A hybrid format combines skills and chronological sections. Both are effective for early-career candidates." },
      { heading: "Get Certifications and Online Courses", content: "Free certifications from Google, HubSpot, Coursera, and freeCodeCamp add credibility. List these in a 'Certifications' section. They show initiative and demonstrate relevant knowledge even without employer-based experience." },
    ],
    faqs: [
      { question: "Can I get a job with no experience?", answer: "Absolutely. Many entry-level roles don't require experience. Focus on transferable skills, education, projects, and certifications to demonstrate your capabilities and eagerness to learn." },
      { question: "Should I include a resume objective or summary?", answer: "For no-experience resumes, an objective statement is appropriate. Focus on what you want to achieve and what skills you bring: 'Motivated Computer Science graduate seeking entry-level development role with strong Python and data analysis skills.'" },
      { question: "How long should a no-experience resume be?", answer: "One page is ideal. Fill it with education, projects, volunteering, skills, and certifications. Quality content on one page is better than padding to fill space." },
    ],
  },
  {
    slug: "resume-keywords-guide",
    title: "ATS Resume Keywords: The Complete Guide",
    metaTitle: "ATS Resume Keywords Guide (2026): Find & Use the Right Keywords | ATS Pro",
    metaDescription: "Master ATS resume keywords. Learn how to find, place, and optimize keywords so your resume passes applicant tracking systems and reaches recruiters.",
    intro: "Keywords are the single most important factor in passing ATS screening. These are the specific skills, tools, job titles, and industry terms that ATS software scans for when ranking candidates. Using the right keywords — in the right places — can be the difference between getting an interview and getting filtered out. Here's your complete guide to ATS keyword optimization.",
    sections: [
      { heading: "Where to Find the Right Keywords", content: "The job description is your primary keyword source. Read it carefully and highlight repeated terms, required skills, tools, and qualifications. Also check: similar job postings for the same role, LinkedIn profiles of people in the role, industry-specific keyword lists, and the company's own career page language." },
      { heading: "Types of Resume Keywords", content: "Hard skills: Specific technical abilities like 'Python', 'Salesforce', 'SEO'. Soft skills: Interpersonal abilities like 'leadership', 'communication'. Tools & platforms: Software like 'Jira', 'Tableau', 'HubSpot'. Certifications: 'PMP', 'CPA', 'AWS Solutions Architect'. Industry terms: 'agile methodology', 'HIPAA compliance'. Job titles: 'Project Manager', 'Data Analyst'." },
      { heading: "Where to Place Keywords", content: "Distribute keywords across multiple sections for maximum impact. Professional Summary (highest priority), Skills section, Work experience bullet points, Education and certifications. Don't concentrate all keywords in one section — ATS algorithms look for natural distribution. Include both the acronym and full term: 'Search Engine Optimization (SEO)'." },
      { heading: "Keyword Density and Natural Usage", content: "Mention critical keywords 2-3 times across different sections. Don't keyword-stuff — it looks unnatural to recruiters. Weave keywords into achievement statements: 'Led Agile sprints for 3 cross-functional teams' naturally includes 'Agile' and 'cross-functional' without stuffing." },
      { heading: "Industry-Specific Keywords", content: "Each industry has its own vocabulary. Technology: 'microservices', 'CI/CD', 'cloud-native'. Finance: 'financial modeling', 'GAAP', 'risk assessment'. Healthcare: 'patient care', 'HIPAA', 'EHR'. Marketing: 'ROI', 'conversion rate', 'content strategy'. Match the vocabulary of your target industry." },
      { heading: "Using Our Resume Keyword Optimizer", content: "Our free Resume Keyword Optimizer tool extracts ATS keywords from any job description and compares them against your resume. It identifies missing keywords, suggests optimal placement, and calculates your keyword match score. Use it before every application to maximize your ATS compatibility." },
    ],
    faqs: [
      { question: "How many keywords should a resume have?", answer: "Aim for 15-25 relevant keywords spread naturally across your resume. Focus on the ones that appear most frequently in the job description, as these carry the most weight in ATS ranking." },
      { question: "Should I use the exact keywords from the job posting?", answer: "Yes, use exact phrases when possible. ATS systems often perform exact-match scanning. If the posting says 'project management', use that exact phrase rather than 'managing projects'." },
      { question: "Can I use keywords I don't actually have experience with?", answer: "Never list skills you don't possess. This will be exposed during interviews and damage your credibility. Focus on keywords that genuinely match your experience and skills." },
    ],
  },
  {
    slug: "one-page-resume-tips",
    title: "How to Fit Your Resume on One Page",
    metaTitle: "One-Page Resume Tips: How to Fit Everything (2026) | ATS Pro",
    metaDescription: "Learn expert techniques to condense your resume to one page without losing impact. Tips for formatting, content editing, and prioritizing the right information.",
    intro: "The one-page resume is the standard for candidates with less than 10 years of experience. But fitting all your achievements on one page requires strategic thinking about what to include, what to cut, and how to format efficiently. This guide provides actionable techniques to create a powerful one-page resume.",
    sections: [
      { heading: "Who Needs a One-Page Resume?", content: "Candidates with less than 10 years of experience should aim for one page. Recent graduates, career changers, and early to mid-career professionals benefit from the focused narrative a single page provides. Senior executives with 15+ years may justify a two-page resume, but even then, conciseness is valued." },
      { heading: "Formatting Tricks That Save Space", content: "Reduce margins to 0.5 inches (don't go below). Use a 10-11pt font size. Use single spacing with 6pt paragraph spacing. Combine related sections. Use a compact header with name and contact info on 1-2 lines. Eliminate unnecessary labels like 'Phone:' or 'Email:' — just list the information." },
      { heading: "Content Prioritization Strategy", content: "Include only your most recent 10-15 years of experience. Limit each role to 3-4 impactful bullet points. Remove redundant skills — if you list React, you don't need to list HTML/CSS separately. Cut old or irrelevant positions. Focus on achievements, not responsibilities." },
      { heading: "What to Remove", content: "Objective statements (use a summary instead). References or 'References available upon request'. Irrelevant hobbies or interests. Multiple contact methods (one phone, one email suffices). Positions older than 15 years. Skills that are assumed (like Microsoft Word or email)." },
      { heading: "Power Editing Techniques", content: "Replace long bullet points with concise impact statements. Remove articles ('a', 'the') from bullet points. Use numbers instead of words (12 instead of twelve). Eliminate adverbs and filler words. Combine related achievements into single powerful statements." },
    ],
    faqs: [
      { question: "Is a two-page resume ever acceptable?", answer: "Yes, for senior professionals with 10+ years of relevant experience, or for academic CVs. However, every line must earn its place. If you can tell your story on one page without sacrificing key achievements, one page is always better." },
      { question: "What font is best for saving space?", answer: "Calibri, Arial Narrow, and Garamond are excellent space-efficient fonts that remain readable. Use 10-11pt for body text and 12-14pt for your name. Avoid fonts smaller than 10pt." },
    ],
  },
];

export default RESUME_GUIDES;

export function getGuideBySlug(slug: string): ResumeGuideData | undefined {
  return RESUME_GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return RESUME_GUIDES.map((g) => g.slug);
}
