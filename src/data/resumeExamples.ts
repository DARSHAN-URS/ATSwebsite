export interface ResumeExampleData {
  slug: string;
  jobTitle: string;
  category: string;
  summaryExample: string;
  skills: string[];
  experienceExample: {
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  };
  educationExample: {
    degree: string;
    school: string;
    year: string;
  };
  intro: string;
  tips: string[];
}

const RESUME_EXAMPLES: ResumeExampleData[] = [
  {
    slug: "software-engineer",
    jobTitle: "Software Engineer",
    category: "Technology",
    intro: "Software engineers are in high demand, but competition is fierce. An ATS-friendly resume ensures your application passes automated screening systems used by companies like Google, Amazon, and Microsoft. Your resume must highlight technical proficiency, problem-solving abilities, and measurable impact. Focus on clean formatting, relevant keywords from the job description, and quantified achievements. Avoid graphics, tables, or columns that confuse ATS parsers. Use standard section headings and a reverse-chronological format to maximize readability for both machines and human recruiters.",
    summaryExample: "Results-driven Software Engineer with 5+ years of experience designing, developing, and deploying scalable web applications. Proficient in React, TypeScript, Node.js, and cloud-native architectures on AWS. Led a team of 4 engineers to deliver a microservices platform that reduced API latency by 40% and increased throughput by 3x. Passionate about clean code, test-driven development, and continuous integration practices.",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "CI/CD", "REST APIs", "GraphQL", "SQL", "PostgreSQL", "MongoDB", "Git", "Agile/Scrum", "Microservices", "Test-Driven Development"],
    experienceExample: { title: "Senior Software Engineer", company: "TechCorp Inc.", duration: "Jan 2021 – Present", bullets: ["Architected and built a real-time data pipeline using Node.js and AWS Lambda, processing 2M+ events daily with 99.9% uptime", "Led migration from monolithic architecture to microservices, reducing deployment time by 60% and enabling independent team releases", "Mentored 3 junior developers through code reviews and pair programming, improving team velocity by 25%", "Implemented comprehensive CI/CD pipeline with GitHub Actions, achieving 95% test coverage across 200+ endpoints"] },
    educationExample: { degree: "B.S. in Computer Science", school: "University of California, Berkeley", year: "2018" },
    tips: ["Use keywords from the job description verbatim — ATS systems match exact phrases", "Quantify achievements with numbers, percentages, and dollar amounts", "Use standard section headings: Summary, Experience, Skills, Education", "Avoid headers/footers, text boxes, and multi-column layouts", "Save as PDF unless the job posting requests .docx format", "Include both spelled-out terms and acronyms (e.g., 'Continuous Integration/Continuous Deployment (CI/CD)')"]
  },
  {
    slug: "data-analyst",
    jobTitle: "Data Analyst",
    category: "Data & Analytics",
    intro: "Data analysts transform raw data into actionable business insights. Your ATS-friendly resume should emphasize analytical tools, statistical methods, and real business outcomes. Hiring managers look for proficiency in SQL, Python, and visualization tools like Tableau or Power BI. Structure your resume with clear sections, avoid fancy formatting, and weave in industry-specific keywords naturally. Demonstrating how your analysis drove revenue, reduced costs, or improved decision-making will set you apart from other candidates.",
    summaryExample: "Detail-oriented Data Analyst with 4+ years of experience transforming complex datasets into actionable business insights. Expert in SQL, Python, Tableau, and statistical analysis. Developed automated reporting dashboards that saved 15 hours per week in manual reporting. Collaborated with cross-functional teams to deliver data-driven recommendations that increased customer retention by 18%.",
    skills: ["SQL", "Python", "R", "Tableau", "Power BI", "Excel", "Statistical Analysis", "Data Visualization", "ETL", "Pandas", "NumPy", "Machine Learning", "A/B Testing", "Data Cleaning", "BigQuery", "Jupyter Notebooks"],
    experienceExample: { title: "Data Analyst", company: "DataDriven Solutions", duration: "Mar 2020 – Present", bullets: ["Built and maintained 15+ Tableau dashboards tracking KPIs for executive leadership, reducing report generation time by 70%", "Conducted A/B tests on pricing strategies that resulted in a 12% increase in conversion rates", "Developed Python scripts to automate ETL processes, reducing data processing time from 8 hours to 45 minutes", "Analyzed customer churn patterns using logistic regression, enabling targeted retention campaigns that saved $2.1M annually"] },
    educationExample: { degree: "B.S. in Statistics", school: "University of Michigan", year: "2019" },
    tips: ["Highlight specific tools and technologies you've used (SQL, Python, Tableau)", "Include metrics showing the business impact of your analysis", "Use ATS-friendly section headings like 'Technical Skills' and 'Professional Experience'", "Mention the size of datasets you've worked with to show scale", "Include certifications like Google Data Analytics or IBM Data Science", "Tailor your skills section to match the exact tools mentioned in the job posting"]
  },
  {
    slug: "product-manager",
    jobTitle: "Product Manager",
    category: "Product & Strategy",
    intro: "Product managers sit at the intersection of business, technology, and user experience. Your resume must demonstrate strategic thinking, cross-functional leadership, and measurable product outcomes. ATS systems screen for keywords like product roadmap, user research, agile, and KPIs. Use a clean, single-column format with standard headings. Focus on demonstrating how you identified user needs, prioritized features, and delivered products that drove business growth.",
    summaryExample: "Strategic Product Manager with 6+ years of experience leading cross-functional teams to deliver B2B SaaS products from ideation to launch. Expert in user research, product roadmapping, and agile methodologies. Successfully launched 3 products generating $8M+ in ARR. Skilled at translating complex technical capabilities into compelling product narratives for stakeholders and customers.",
    skills: ["Product Roadmap", "Agile", "Scrum", "User Research", "A/B Testing", "Jira", "Figma", "Data Analysis", "Stakeholder Management", "Go-to-Market Strategy", "Competitive Analysis", "PRD Writing", "OKRs", "Customer Discovery", "SQL", "Wireframing"],
    experienceExample: { title: "Senior Product Manager", company: "SaaS Platform Co.", duration: "Jun 2020 – Present", bullets: ["Defined and executed product roadmap for a B2B analytics platform, growing ARR from $2M to $5.5M in 18 months", "Led discovery process with 50+ customer interviews, identifying 3 critical feature gaps that became top revenue drivers", "Managed backlog of 200+ user stories across 2 engineering squads using Jira and agile sprints", "Reduced customer onboarding time by 40% through redesigned user flow validated by A/B testing with 10K+ users"] },
    educationExample: { degree: "MBA", school: "Stanford Graduate School of Business", year: "2019" },
    tips: ["Emphasize business outcomes: revenue growth, user acquisition, retention improvements", "Include both technical and soft skills — PMs need both", "Show cross-functional collaboration with engineering, design, and marketing", "Use action verbs like 'launched', 'defined', 'prioritized', 'scaled'", "Mention specific methodologies: Agile, Scrum, Design Thinking, Lean", "Keep your resume to one page if you have less than 10 years of experience"]
  },
  {
    slug: "marketing-manager",
    jobTitle: "Marketing Manager",
    category: "Marketing",
    intro: "Marketing managers drive brand growth and customer acquisition through multi-channel campaigns. An ATS-optimized resume should highlight your expertise in digital marketing, analytics, and campaign management. Include keywords like SEO, content strategy, Google Analytics, and ROI. Structure your resume to show how you've grown audiences, increased engagement, and driven revenue through data-informed marketing strategies.",
    summaryExample: "Dynamic Marketing Manager with 5+ years of experience leading integrated marketing campaigns across digital and traditional channels. Expertise in SEO, content marketing, paid media, and marketing automation. Increased organic traffic by 150% and generated $3.2M in pipeline through inbound marketing strategies. Skilled at building high-performing teams and managing budgets up to $500K.",
    skills: ["SEO", "Google Analytics", "Content Strategy", "Social Media Marketing", "Email Marketing", "HubSpot", "PPC", "Brand Strategy", "Copywriting", "Marketing Automation", "CRM", "A/B Testing", "Google Ads", "Facebook Ads", "Conversion Rate Optimization"],
    experienceExample: { title: "Marketing Manager", company: "GrowthBrand Inc.", duration: "Feb 2020 – Present", bullets: ["Developed and executed content marketing strategy that increased organic traffic by 150% in 12 months", "Managed $400K annual ad budget across Google Ads and Meta platforms, achieving 4.2x ROAS", "Built and nurtured email list of 50K+ subscribers with 32% open rate through segmented campaigns", "Led rebranding initiative that improved brand recognition by 45% measured through aided recall surveys"] },
    educationExample: { degree: "B.A. in Marketing", school: "University of Texas at Austin", year: "2018" },
    tips: ["Include specific campaign metrics: CTR, ROAS, conversion rates, traffic growth", "List marketing tools and platforms you're proficient in", "Show progression from tactical execution to strategic leadership", "Mention budget sizes you've managed to demonstrate scope", "Include both B2B and B2C experience if applicable", "Add certifications like Google Analytics, HubSpot, or Facebook Blueprint"]
  },
  {
    slug: "graphic-designer",
    jobTitle: "Graphic Designer",
    category: "Design & Creative",
    intro: "Graphic designers create visual content that communicates messages effectively. While your portfolio showcases your creativity, your resume needs to pass ATS screening first. Use a clean, text-based format with standard sections. Highlight your proficiency in design tools, your understanding of brand guidelines, and the business impact of your designs. Save the creative formatting for your portfolio — your resume should be optimized for machine readability.",
    summaryExample: "Creative Graphic Designer with 4+ years of experience delivering compelling visual solutions for digital and print media. Proficient in Adobe Creative Suite, Figma, and motion graphics. Designed brand identities for 20+ clients, increasing their social media engagement by an average of 65%. Strong understanding of typography, color theory, and UX principles.",
    skills: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Figma", "After Effects", "Typography", "Brand Identity", "UI Design", "Print Design", "Motion Graphics", "Color Theory", "Layout Design", "Canva", "Sketch", "Design Systems"],
    experienceExample: { title: "Graphic Designer", company: "Creative Agency Co.", duration: "May 2020 – Present", bullets: ["Designed comprehensive brand identity packages for 15+ clients including logos, style guides, and marketing collateral", "Created social media content that increased client engagement rates by 65% average across platforms", "Produced marketing materials for product launches generating $1.2M in first-quarter sales", "Collaborated with UX team to redesign website interface, improving user satisfaction scores by 30%"] },
    educationExample: { degree: "B.F.A. in Graphic Design", school: "Rhode Island School of Design", year: "2019" },
    tips: ["Keep your resume format simple — save creativity for your portfolio", "Link to your portfolio website prominently in the header", "List specific design software and tools with proficiency levels", "Include metrics showing the business impact of your designs", "Mention both digital and print experience if applicable", "Use standard fonts and avoid embedded graphics in the resume file"]
  },
  {
    slug: "sales-manager",
    jobTitle: "Sales Manager",
    category: "Sales",
    intro: "Sales managers drive revenue and lead sales teams to exceed targets. Your ATS-friendly resume should be packed with revenue numbers, team sizes, and growth percentages. Recruiters and ATS systems look for keywords like quota attainment, pipeline management, CRM, and B2B sales. Use a results-focused format that clearly demonstrates your ability to build relationships, close deals, and develop high-performing sales teams.",
    summaryExample: "High-performing Sales Manager with 7+ years of experience leading B2B sales teams and consistently exceeding revenue targets. Managed a team of 12 account executives generating $15M+ in annual revenue. Expert in consultative selling, pipeline management, and CRM optimization. Track record of 120%+ quota attainment for 5 consecutive years.",
    skills: ["B2B Sales", "Salesforce", "HubSpot CRM", "Pipeline Management", "Lead Generation", "Negotiation", "Account Management", "Sales Forecasting", "Cold Outreach", "Consultative Selling", "Team Leadership", "Revenue Growth", "Client Retention", "Territory Management", "Quota Attainment"],
    experienceExample: { title: "Sales Manager", company: "Enterprise Solutions Ltd.", duration: "Jan 2019 – Present", bullets: ["Led team of 12 account executives to achieve $15M in annual revenue, surpassing target by 125%", "Developed and implemented new sales methodology that shortened average sales cycle by 20%", "Grew enterprise client base by 40% through strategic account development and referral programs", "Recruited, trained, and mentored 8 new sales representatives, with 6 achieving quota within first quarter"] },
    educationExample: { degree: "B.B.A. in Business Administration", school: "University of Pennsylvania", year: "2016" },
    tips: ["Lead with revenue numbers — always include dollar amounts and percentages", "Show team management experience with specific team sizes", "Include quota attainment percentages and rankings", "List CRM systems and sales tools you've mastered", "Demonstrate progression from individual contributor to manager", "Mention specific industries and deal sizes you've worked with"]
  },
  {
    slug: "customer-service-representative",
    jobTitle: "Customer Service Representative",
    category: "Customer Support",
    intro: "Customer service representatives are the frontline of any company. Your ATS-friendly resume should highlight communication skills, problem-solving abilities, and metrics like customer satisfaction scores and resolution rates. Use keywords from the job posting such as CRM, ticketing systems, and customer retention. Focus on demonstrating how you've improved customer experiences and resolved issues efficiently.",
    summaryExample: "Dedicated Customer Service Representative with 3+ years of experience delivering exceptional support across phone, email, and chat channels. Maintained a 98% customer satisfaction rating while handling 80+ interactions daily. Skilled in CRM platforms, conflict resolution, and upselling. Recognized as Employee of the Quarter for consistently exceeding KPIs.",
    skills: ["Customer Support", "CRM Software", "Zendesk", "Salesforce", "Conflict Resolution", "Phone Support", "Email Support", "Live Chat", "Problem Solving", "Upselling", "Active Listening", "Data Entry", "Ticketing Systems", "Multi-tasking", "Product Knowledge"],
    experienceExample: { title: "Customer Service Representative", company: "ServiceFirst Corp.", duration: "Aug 2021 – Present", bullets: ["Handled 80+ customer interactions daily across phone, email, and chat with 98% satisfaction rating", "Resolved escalated complaints within 24 hours, reducing churn rate by 15% in assigned accounts", "Identified upselling opportunities resulting in $120K in additional annual revenue", "Trained 5 new team members on CRM workflows and company policies, reducing onboarding time by 30%"] },
    educationExample: { degree: "A.S. in Business Administration", school: "Community College of Denver", year: "2020" },
    tips: ["Include customer satisfaction metrics (CSAT, NPS scores)", "List all communication channels you've worked across", "Mention specific CRM and ticketing tools by name", "Quantify your daily interaction volume", "Show examples of problem-solving and conflict resolution", "Include any awards or recognition for service excellence"]
  },
  {
    slug: "hr-manager",
    jobTitle: "HR Manager",
    category: "Human Resources",
    intro: "HR managers shape organizational culture and manage the employee lifecycle. Your ATS-optimized resume should demonstrate expertise in talent acquisition, employee relations, compliance, and HR technology. Include keywords like HRIS, performance management, and employment law. Show how your initiatives improved retention, engagement, or operational efficiency.",
    summaryExample: "Strategic HR Manager with 6+ years of experience leading HR operations for organizations with 500+ employees. Expert in talent acquisition, employee relations, and HRIS implementation. Reduced employee turnover by 25% through engagement programs and streamlined hiring processes. SHRM-CP certified with deep knowledge of employment law and compliance.",
    skills: ["Talent Acquisition", "Employee Relations", "HRIS", "Workday", "Performance Management", "Onboarding", "Employment Law", "Benefits Administration", "Recruiting", "ATS Systems", "Training & Development", "Compensation Planning", "Diversity & Inclusion", "SHRM-CP", "Compliance"],
    experienceExample: { title: "HR Manager", company: "PeopleFirst Corporation", duration: "Apr 2019 – Present", bullets: ["Managed full-cycle HR operations for 500+ employee organization across 3 office locations", "Implemented new HRIS system (Workday), reducing administrative tasks by 40% and improving data accuracy", "Designed employee engagement program that increased retention rate from 75% to 93% over 2 years", "Led diversity and inclusion initiative resulting in 35% increase in underrepresented group hiring"] },
    educationExample: { degree: "M.S. in Human Resource Management", school: "Cornell University", year: "2018" },
    tips: ["Include HR certifications (SHRM-CP, SHRM-SCP, PHR)", "Quantify the size of organizations you've supported", "Show expertise across the full employee lifecycle", "Mention specific HRIS platforms and ATS systems", "Include metrics on retention, time-to-hire, and engagement scores", "Demonstrate compliance knowledge with relevant regulations"]
  },
  {
    slug: "registered-nurse",
    jobTitle: "Registered Nurse",
    category: "Healthcare",
    intro: "Registered nurses provide critical patient care in diverse healthcare settings. Your ATS-friendly resume should highlight clinical skills, certifications, and patient outcomes. Healthcare ATS systems scan for keywords like patient assessment, EHR/EMR, HIPAA compliance, and specific certifications. Use a clean format with standard headings and focus on quantifiable patient care metrics.",
    summaryExample: "Compassionate Registered Nurse (RN) with 5+ years of experience in acute care and emergency medicine. Proficient in patient assessment, medication administration, and EHR documentation using Epic. Managed care for 6-8 patients per shift with zero medication errors. BLS, ACLS, and PALS certified with expertise in trauma and critical care nursing.",
    skills: ["Patient Assessment", "Medication Administration", "EHR/EMR (Epic)", "HIPAA Compliance", "IV Therapy", "Wound Care", "Patient Education", "Care Coordination", "Vital Signs Monitoring", "BLS/ACLS/PALS", "Infection Control", "Clinical Documentation", "Triage", "Team Collaboration", "Critical Thinking"],
    experienceExample: { title: "Registered Nurse – Emergency Department", company: "City General Hospital", duration: "Jun 2019 – Present", bullets: ["Provided comprehensive nursing care for 6-8 patients per shift in a Level I Trauma Center with 60K+ annual visits", "Maintained zero medication errors over 3+ years through rigorous verification protocols", "Collaborated with interdisciplinary team to develop care plans reducing average patient stay by 12 hours", "Precepted 10+ new graduate nurses, all achieving independent practice within 8-week orientation period"] },
    educationExample: { degree: "B.S.N. in Nursing", school: "Johns Hopkins University School of Nursing", year: "2019" },
    tips: ["List all active licenses and certifications with expiration dates", "Include specific EHR/EMR systems you've used (Epic, Cerner, Meditech)", "Mention patient-to-nurse ratios to show your capacity", "Highlight specialty areas and unit types", "Include continuing education and professional development", "Use clinical terminology that ATS systems recognize"]
  },
  {
    slug: "teacher",
    jobTitle: "Teacher",
    category: "Education",
    intro: "Teachers shape future generations through effective instruction and classroom management. Your ATS-friendly resume should highlight your teaching certifications, subject expertise, and measurable student outcomes. School districts use ATS systems that scan for keywords like differentiated instruction, curriculum development, and classroom management. Focus on student achievement data and innovative teaching methods.",
    summaryExample: "Passionate and certified K-12 Teacher with 5+ years of experience in curriculum development, differentiated instruction, and classroom management. Improved student test scores by 20% through data-driven instruction strategies. Proficient in Google Classroom, educational technology integration, and project-based learning. Committed to creating inclusive learning environments.",
    skills: ["Curriculum Development", "Differentiated Instruction", "Classroom Management", "Assessment Design", "Google Classroom", "IEP Development", "Parent Communication", "EdTech Integration", "Project-Based Learning", "Student Assessment", "Special Education", "Data-Driven Instruction", "STEM Education", "Collaborative Learning"],
    experienceExample: { title: "5th Grade Teacher", company: "Lincoln Elementary School", duration: "Aug 2019 – Present", bullets: ["Developed and implemented curriculum for 28-student classroom, improving state test scores by 20%", "Integrated technology into daily lessons using Google Classroom and educational apps, increasing student engagement by 35%", "Collaborated with special education team to create individualized education plans (IEPs) for 6 students", "Led after-school STEM program for 40+ students, resulting in 3 district science fair winners"] },
    educationExample: { degree: "M.Ed. in Curriculum & Instruction", school: "University of Virginia", year: "2019" },
    tips: ["Include your teaching certifications and subject area endorsements", "Quantify student achievement improvements with test scores and grades", "List educational technology tools and platforms you use", "Mention grade levels and subjects you're certified to teach", "Include extracurricular activities and leadership roles", "Show professional development and continuing education"]
  },
  {
    slug: "business-analyst",
    jobTitle: "Business Analyst",
    category: "Business & Operations",
    intro: "Business analysts bridge the gap between IT and business stakeholders by translating requirements into solutions. Your ATS-friendly resume should highlight analytical skills, requirements gathering, and process improvement. Include keywords like business requirements, stakeholder management, and process mapping. Demonstrate how your analysis led to measurable business improvements.",
    summaryExample: "Results-oriented Business Analyst with 5+ years of experience in requirements gathering, process optimization, and stakeholder management. Expert in translating complex business needs into technical specifications. Led process improvement initiatives that saved $1.5M annually. Proficient in SQL, Jira, and Agile methodologies.",
    skills: ["Requirements Gathering", "Business Process Mapping", "SQL", "Jira", "Agile", "Stakeholder Management", "Data Analysis", "User Stories", "UAT", "Wireframing", "Process Improvement", "Visio", "Tableau", "Documentation", "Gap Analysis", "Change Management"],
    experienceExample: { title: "Senior Business Analyst", company: "ConsultPro Group", duration: "Mar 2020 – Present", bullets: ["Gathered and documented business requirements for 10+ enterprise projects with budgets up to $5M", "Led process mapping workshops that identified inefficiencies, resulting in $1.5M annual cost savings", "Created 50+ user stories and acceptance criteria for agile development teams across 3 simultaneous sprints", "Facilitated UAT sessions with 30+ stakeholders, achieving 95% first-pass approval rate"] },
    educationExample: { degree: "B.S. in Information Systems", school: "Georgia Institute of Technology", year: "2018" },
    tips: ["Show experience with both agile and waterfall methodologies", "Include specific tools: Jira, Confluence, Visio, Lucidchart", "Quantify the scale and budget of projects you've supported", "Demonstrate stakeholder management across different levels", "Include certifications like CBAP, PMI-PBA, or CCBA", "Show both technical and communication skills"]
  },
  {
    slug: "project-manager",
    jobTitle: "Project Manager",
    category: "Business & Operations",
    intro: "Project managers ensure projects are delivered on time, within scope, and on budget. Your ATS-optimized resume should showcase leadership, planning, and risk management skills. Keywords like PMP, Agile, Scrum, budget management, and cross-functional teams are critical for ATS screening. Focus on demonstrating successful project delivery with quantifiable outcomes.",
    summaryExample: "PMP-certified Project Manager with 7+ years of experience delivering complex projects across technology, construction, and healthcare industries. Managed portfolios worth $20M+ with cross-functional teams of up to 30 members. Consistently delivered projects on time and under budget. Expert in Agile, Waterfall, and hybrid methodologies.",
    skills: ["PMP", "Agile", "Scrum", "Waterfall", "Risk Management", "Budget Management", "MS Project", "Jira", "Stakeholder Management", "Resource Planning", "Change Management", "Cross-functional Leadership", "Gantt Charts", "Sprint Planning", "Quality Assurance"],
    experienceExample: { title: "Senior Project Manager", company: "GlobalTech Solutions", duration: "Jan 2019 – Present", bullets: ["Managed portfolio of 8+ concurrent projects with combined budget of $12M and teams of 15-30 members", "Delivered 95% of projects on time and 100% within budget through proactive risk management", "Implemented Agile transformation across 3 departments, improving delivery speed by 35%", "Reduced project overhead costs by 20% through optimized resource allocation and vendor negotiations"] },
    educationExample: { degree: "M.B.A. in Operations Management", school: "Northwestern University", year: "2017" },
    tips: ["Lead with your PMP or other PM certifications", "Include project budgets and team sizes to show scale", "Show experience with multiple methodologies (Agile, Waterfall, Hybrid)", "Quantify on-time and on-budget delivery rates", "List specific PM tools: MS Project, Jira, Asana, Monday.com", "Demonstrate experience across different industries if applicable"]
  },
  {
    slug: "accountant",
    jobTitle: "Accountant",
    category: "Finance",
    intro: "Accountants ensure financial accuracy and regulatory compliance for organizations. Your ATS-friendly resume should highlight technical accounting skills, software proficiency, and attention to detail. Include keywords like GAAP, financial reporting, tax preparation, and reconciliation. Demonstrate your ability to manage financial records accurately and identify cost-saving opportunities.",
    summaryExample: "Detail-oriented CPA-certified Accountant with 5+ years of experience in financial reporting, tax preparation, and audit support. Managed month-end close for $50M revenue company, consistently meeting deadlines. Proficient in QuickBooks, SAP, and advanced Excel. Identified $200K in cost savings through expense analysis and process improvements.",
    skills: ["GAAP", "Financial Reporting", "Tax Preparation", "QuickBooks", "SAP", "Excel (Advanced)", "Accounts Payable/Receivable", "Bank Reconciliation", "Audit Support", "Budgeting", "General Ledger", "Month-End Close", "Payroll", "CPA", "Financial Analysis"],
    experienceExample: { title: "Staff Accountant", company: "AccountRight Firm", duration: "Jun 2019 – Present", bullets: ["Managed month-end close process for $50M revenue company, consistently completing within 5 business days", "Prepared and filed quarterly and annual tax returns for 100+ clients with zero compliance issues", "Reconciled 200+ accounts monthly and identified $200K in expense reduction opportunities", "Supported annual audit process by preparing documentation, resulting in clean audit opinions for 3 consecutive years"] },
    educationExample: { degree: "B.S. in Accounting", school: "University of Illinois at Urbana-Champaign", year: "2019" },
    tips: ["Include CPA or CMA certification prominently", "List specific accounting software: QuickBooks, SAP, NetSuite, Xero", "Quantify the scale of financials you manage (revenue, accounts, clients)", "Show expertise in both GAAP and IFRS if applicable", "Include audit experience and compliance track record", "Mention industry-specific accounting experience (healthcare, manufacturing, etc.)"]
  },
  {
    slug: "mechanical-engineer",
    jobTitle: "Mechanical Engineer",
    category: "Engineering",
    intro: "Mechanical engineers design and develop mechanical systems that power industries worldwide. Your ATS-friendly resume should highlight CAD proficiency, engineering analysis, and manufacturing experience. Keywords like SolidWorks, FEA, GD&T, and lean manufacturing are critical. Focus on projects where your engineering solutions reduced costs, improved efficiency, or solved complex technical challenges.",
    summaryExample: "Licensed Mechanical Engineer (PE) with 6+ years of experience in product design, thermal analysis, and manufacturing optimization. Proficient in SolidWorks, ANSYS, and MATLAB. Led design of a new HVAC system that reduced energy consumption by 30%. Experienced in GD&T, FEA, and lean manufacturing principles.",
    skills: ["SolidWorks", "AutoCAD", "ANSYS", "MATLAB", "FEA", "CFD", "GD&T", "3D Printing", "Lean Manufacturing", "Six Sigma", "Thermal Analysis", "Product Design", "Prototyping", "Root Cause Analysis", "Technical Documentation"],
    experienceExample: { title: "Mechanical Engineer", company: "InnovateTech Engineering", duration: "Jul 2019 – Present", bullets: ["Designed and validated new HVAC compressor system using SolidWorks and ANSYS FEA, reducing energy use by 30%", "Led 5-member engineering team in product development cycle from concept to production for 3 product lines", "Implemented lean manufacturing processes that reduced waste by 25% and shortened production cycle by 2 weeks", "Conducted root cause analysis on field failures, developing solutions that reduced warranty claims by 40%"] },
    educationExample: { degree: "B.S. in Mechanical Engineering", school: "Georgia Institute of Technology", year: "2018" },
    tips: ["List specific CAD and simulation software prominently", "Include your PE license if applicable", "Quantify cost savings and efficiency improvements", "Mention manufacturing processes you're experienced with", "Include Six Sigma or lean manufacturing certifications", "Show experience with industry standards (ASME, ISO, etc.)"]
  },
  {
    slug: "civil-engineer",
    jobTitle: "Civil Engineer",
    category: "Engineering",
    intro: "Civil engineers design and oversee infrastructure projects that shape communities. Your ATS-optimized resume should highlight project management, design software proficiency, and regulatory compliance. Include keywords like AutoCAD, Civil 3D, structural analysis, and permitting. Focus on project scale, budget management, and successful delivery of infrastructure projects.",
    summaryExample: "Licensed Professional Engineer (PE) in Civil Engineering with 6+ years of experience in structural design, site development, and transportation projects. Managed $10M+ infrastructure projects from design through construction. Proficient in AutoCAD Civil 3D, Revit, and HEC-RAS. Expert in building codes, permitting processes, and environmental compliance.",
    skills: ["AutoCAD Civil 3D", "Revit", "Structural Analysis", "Site Development", "Permitting", "Stormwater Management", "HEC-RAS", "Geotechnical Analysis", "Transportation Design", "Environmental Compliance", "Project Management", "Building Codes", "Cost Estimation", "ArcGIS", "Construction Management"],
    experienceExample: { title: "Civil Engineer", company: "BuildRight Engineering", duration: "Aug 2019 – Present", bullets: ["Managed design and permitting for $10M commercial development project, meeting all deadlines and code requirements", "Designed stormwater management systems for 15+ residential developments, ensuring EPA compliance", "Performed structural analysis for bridge rehabilitation project, identifying solutions that saved $500K in construction costs", "Coordinated with 4 subcontractor teams and municipal agencies to deliver transportation improvement project on schedule"] },
    educationExample: { degree: "B.S. in Civil Engineering", school: "Purdue University", year: "2018" },
    tips: ["Include your PE license and EIT certification", "List specific engineering software: AutoCAD Civil 3D, Revit, STAAD", "Quantify project budgets and team sizes", "Mention regulatory and compliance experience", "Show expertise in specific civil disciplines (structural, transportation, environmental)", "Include field and construction oversight experience"]
  },
  {
    slug: "ui-ux-designer",
    jobTitle: "UI/UX Designer",
    category: "Design & Creative",
    intro: "UI/UX designers create intuitive digital experiences that delight users and achieve business goals. Your ATS-friendly resume should demonstrate expertise in user research, prototyping, and design systems. Include keywords like wireframing, usability testing, Figma, and interaction design. Focus on how your designs improved user metrics like conversion rates, task completion, and satisfaction scores.",
    summaryExample: "User-centered UI/UX Designer with 5+ years of experience creating intuitive digital products for web and mobile platforms. Expert in Figma, user research, and design systems. Redesigned e-commerce checkout flow, increasing conversion rate by 28%. Passionate about accessibility, data-driven design, and creating seamless user experiences.",
    skills: ["Figma", "Sketch", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Usability Testing", "Design Systems", "Interaction Design", "Information Architecture", "Accessibility (WCAG)", "Responsive Design", "User Personas", "Journey Mapping", "A/B Testing"],
    experienceExample: { title: "Senior UI/UX Designer", company: "DigitalCraft Studio", duration: "Apr 2020 – Present", bullets: ["Redesigned e-commerce checkout flow for 2M+ monthly users, increasing conversion rate by 28%", "Built and maintained design system with 100+ reusable components, reducing design-to-development handoff time by 50%", "Conducted 40+ user interviews and usability tests to validate design decisions and prioritize features", "Led accessibility audit bringing platform to WCAG 2.1 AA compliance, expanding addressable market by 15%"] },
    educationExample: { degree: "B.A. in Human-Computer Interaction", school: "Carnegie Mellon University", year: "2019" },
    tips: ["Include a link to your portfolio or case studies in the header", "Show both research skills (interviews, testing) and design skills (visual, interaction)", "Quantify design impact with conversion rates and user metrics", "List all design tools with proficiency levels", "Mention design systems and component libraries you've built or maintained", "Include accessibility and responsive design experience"]
  },
  {
    slug: "devops-engineer",
    jobTitle: "DevOps Engineer",
    category: "Technology",
    intro: "DevOps engineers bridge development and operations to enable faster, more reliable software delivery. Your ATS-friendly resume should highlight CI/CD expertise, cloud infrastructure, and automation skills. Keywords like Kubernetes, Docker, Terraform, and Jenkins are essential for ATS screening. Focus on demonstrating how you've improved deployment frequency, reduced downtime, and automated manual processes.",
    summaryExample: "DevOps Engineer with 5+ years of experience building and maintaining CI/CD pipelines, cloud infrastructure, and container orchestration systems. Expert in AWS, Kubernetes, Docker, and Terraform. Reduced deployment time from 2 hours to 15 minutes through automated pipelines. Maintained 99.99% uptime for production systems serving 10M+ monthly users.",
    skills: ["AWS", "Azure", "Kubernetes", "Docker", "Terraform", "Jenkins", "GitHub Actions", "CI/CD", "Linux", "Bash", "Python", "Monitoring (Datadog, Prometheus)", "Helm", "Ansible", "Infrastructure as Code", "GitOps"],
    experienceExample: { title: "Senior DevOps Engineer", company: "CloudScale Inc.", duration: "Jan 2020 – Present", bullets: ["Architected and maintained Kubernetes clusters running 200+ microservices serving 10M+ monthly users", "Built CI/CD pipelines using GitHub Actions and ArgoCD, reducing deployment time from 2 hours to 15 minutes", "Implemented Infrastructure as Code using Terraform, managing 500+ AWS resources across 3 environments", "Designed monitoring and alerting system with Datadog, reducing mean time to resolution (MTTR) by 60%"] },
    educationExample: { degree: "B.S. in Computer Science", school: "University of Washington", year: "2018" },
    tips: ["List cloud platforms and certifications (AWS, Azure, GCP)", "Quantify deployment frequency and uptime improvements", "Include specific CI/CD tools and orchestration platforms", "Show experience with Infrastructure as Code tools", "Mention monitoring and observability tools", "Include scripting languages (Bash, Python, Go)"]
  },
  {
    slug: "cybersecurity-analyst",
    jobTitle: "Cybersecurity Analyst",
    category: "Technology",
    intro: "Cybersecurity analysts protect organizations from digital threats and ensure compliance with security standards. Your ATS-friendly resume should highlight security tools, frameworks, and incident response experience. Keywords like SIEM, penetration testing, NIST, and vulnerability assessment are critical. Demonstrate how you've reduced security risks and responded to threats effectively.",
    summaryExample: "Cybersecurity Analyst with 4+ years of experience in threat detection, incident response, and vulnerability management. Expert in SIEM tools (Splunk, QRadar), penetration testing, and security frameworks (NIST, ISO 27001). Reduced security incidents by 45% through proactive monitoring and employee training programs. CompTIA Security+ and CISSP certified.",
    skills: ["SIEM (Splunk, QRadar)", "Penetration Testing", "Vulnerability Assessment", "Incident Response", "Network Security", "Firewall Management", "NIST Framework", "ISO 27001", "IAM", "Threat Intelligence", "SOC Operations", "Encryption", "Endpoint Security", "Risk Assessment", "Compliance"],
    experienceExample: { title: "Cybersecurity Analyst", company: "SecureNet Technologies", duration: "May 2020 – Present", bullets: ["Monitored and analyzed 10K+ daily security events using Splunk SIEM, identifying and responding to threats in real-time", "Conducted quarterly penetration tests and vulnerability assessments, identifying and remediating 200+ critical vulnerabilities", "Developed incident response procedures that reduced mean time to containment from 4 hours to 45 minutes", "Led security awareness training for 500+ employees, reducing phishing susceptibility rate from 30% to 5%"] },
    educationExample: { degree: "B.S. in Cybersecurity", school: "University of Maryland", year: "2019" },
    tips: ["Include security certifications: CISSP, CompTIA Security+, CEH, OSCP", "List specific SIEM and security tools you've used", "Quantify threat detection and response metrics", "Mention compliance frameworks you've worked with", "Show experience with both offensive and defensive security", "Include security clearance level if applicable"]
  },
  {
    slug: "digital-marketing-specialist",
    jobTitle: "Digital Marketing Specialist",
    category: "Marketing",
    intro: "Digital marketing specialists drive online growth through SEO, paid media, social media, and email campaigns. Your ATS-optimized resume should highlight specific channel expertise, analytics skills, and ROI-driven results. Include keywords like SEO, Google Analytics, PPC, conversion optimization, and content marketing. Show how your campaigns directly contributed to business growth.",
    summaryExample: "Data-driven Digital Marketing Specialist with 4+ years of experience in SEO, PPC, email marketing, and social media management. Increased organic traffic by 200% and generated $1.5M in attributed revenue through multi-channel campaigns. Google Analytics and Google Ads certified. Expert in marketing automation and conversion rate optimization.",
    skills: ["SEO", "Google Analytics", "Google Ads", "Facebook/Meta Ads", "Email Marketing", "Content Marketing", "Social Media Management", "Marketing Automation", "Conversion Rate Optimization", "Copywriting", "WordPress", "Mailchimp", "HubSpot", "A/B Testing", "Landing Page Optimization"],
    experienceExample: { title: "Digital Marketing Specialist", company: "GrowthHack Agency", duration: "Jun 2020 – Present", bullets: ["Managed $200K monthly ad budget across Google Ads and Meta platforms, achieving average 3.5x ROAS", "Developed SEO strategy that increased organic traffic by 200% and first-page rankings for 50+ target keywords", "Created and optimized email drip campaigns for 30K+ subscribers, achieving 35% open rate and 8% click-through rate", "Designed and A/B tested 50+ landing pages, improving average conversion rate from 2.5% to 6.8%"] },
    educationExample: { degree: "B.S. in Marketing", school: "Arizona State University", year: "2019" },
    tips: ["Include specific channel metrics: traffic, CTR, ROAS, conversion rates", "List all marketing platforms and tools you're certified in", "Show experience across multiple digital channels", "Quantify budget sizes you've managed", "Include Google Analytics, Google Ads, and HubSpot certifications", "Demonstrate data analysis skills alongside creative abilities"]
  },
  {
    slug: "financial-analyst",
    jobTitle: "Financial Analyst",
    category: "Finance",
    intro: "Financial analysts provide insights that drive investment decisions and corporate strategy. Your ATS-friendly resume should highlight financial modeling, data analysis, and presentation skills. Keywords like DCF, financial forecasting, Excel, and Bloomberg are essential. Demonstrate how your analysis informed decisions that improved profitability or reduced financial risk.",
    summaryExample: "Analytical Financial Analyst with 4+ years of experience in financial modeling, forecasting, and investment analysis. Expert in Excel (VBA), Bloomberg Terminal, and SQL. Built financial models that informed $50M+ in investment decisions. CFA Level II candidate with strong presentation and stakeholder communication skills.",
    skills: ["Financial Modeling", "Excel (VBA)", "SQL", "Bloomberg Terminal", "DCF Analysis", "Financial Forecasting", "Budgeting", "Variance Analysis", "PowerPoint", "Tableau", "SAP", "Valuation", "Risk Analysis", "FP&A", "Investment Analysis"],
    experienceExample: { title: "Financial Analyst", company: "CapitalGroup Advisors", duration: "Sep 2020 – Present", bullets: ["Built DCF and comparable company models that informed $50M+ in investment decisions with 85% accuracy", "Prepared monthly financial reports and variance analysis for C-suite executives, identifying $3M in cost reduction opportunities", "Automated financial reporting using Excel VBA macros, reducing monthly reporting time by 60%", "Collaborated with FP&A team to develop annual budget for $200M business unit with 2% variance from actuals"] },
    educationExample: { degree: "B.S. in Finance", school: "New York University, Stern School of Business", year: "2019" },
    tips: ["Include CFA, CPA, or FRM certifications", "List specific financial software and tools", "Quantify the scale of financial decisions you've supported", "Show proficiency in Excel including VBA and macros", "Demonstrate both analytical and communication skills", "Include industry-specific financial experience"]
  },
  // ── 30 more job titles ──────────────────────────────────────────────
  {
    slug: "full-stack-developer",
    jobTitle: "Full Stack Developer",
    category: "Technology",
    intro: "Full stack developers build complete web applications from front to back. Your ATS resume should showcase expertise in both front-end frameworks and back-end technologies, plus deployment and database management skills.",
    summaryExample: "Versatile Full Stack Developer with 5+ years of experience building scalable web applications using React, Node.js, and PostgreSQL. Delivered 10+ production applications with 99.9% uptime. Expert in RESTful API design, cloud deployment, and test-driven development.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "Express.js", "Next.js", "REST APIs", "GraphQL", "AWS", "Docker", "Redis", "Git", "Webpack", "Jest"],
    experienceExample: { title: "Full Stack Developer", company: "WebCraft Studio", duration: "Mar 2020 – Present", bullets: ["Built and maintained 5 production web applications serving 500K+ monthly active users", "Designed RESTful APIs handling 1M+ daily requests with sub-100ms response times", "Implemented real-time features using WebSockets, improving user engagement by 40%", "Led migration from legacy PHP stack to React/Node.js, reducing page load time by 65%"] },
    educationExample: { degree: "B.S. in Computer Science", school: "University of Texas at Austin", year: "2018" },
    tips: ["Show proficiency in both front-end and back-end technologies", "Include deployment and DevOps experience", "Quantify application performance metrics", "Mention database design and optimization", "Include both SQL and NoSQL experience", "Show testing and code quality practices"]
  },
  {
    slug: "data-scientist",
    jobTitle: "Data Scientist",
    category: "Data & Analytics",
    intro: "Data scientists extract insights from complex datasets using machine learning and statistical methods. Your ATS resume should highlight Python, ML frameworks, and business-impact metrics.",
    summaryExample: "Data Scientist with 4+ years of experience building machine learning models that drive business decisions. Expert in Python, TensorFlow, and statistical analysis. Developed predictive models that increased revenue forecasting accuracy by 35% and reduced customer churn by 20%.",
    skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "SQL", "R", "NLP", "Deep Learning", "Feature Engineering", "A/B Testing", "Spark", "Jupyter", "Data Visualization", "Statistics", "Machine Learning"],
    experienceExample: { title: "Data Scientist", company: "AI Insights Corp.", duration: "Jan 2021 – Present", bullets: ["Developed customer churn prediction model with 92% accuracy, enabling targeted retention saving $5M annually", "Built NLP pipeline for sentiment analysis processing 100K+ customer reviews with 88% classification accuracy", "Designed A/B testing framework used across 3 product teams, standardizing experimentation practices", "Created real-time recommendation engine that increased average order value by 25%"] },
    educationExample: { degree: "M.S. in Data Science", school: "Columbia University", year: "2020" },
    tips: ["Highlight specific ML models and techniques you've used", "Include both research and production deployment experience", "Quantify model performance metrics (accuracy, AUC, F1)", "Show business impact of your models", "List relevant publications or kaggle competitions", "Include cloud ML platforms (SageMaker, Vertex AI)"]
  },
  {
    slug: "operations-manager",
    jobTitle: "Operations Manager",
    category: "Business & Operations",
    intro: "Operations managers optimize processes and drive organizational efficiency. Highlight supply chain management, process improvement, and team leadership in your ATS resume.",
    summaryExample: "Results-driven Operations Manager with 7+ years of experience optimizing business processes and leading teams of 50+ employees. Implemented lean methodologies that reduced operational costs by 25% and improved delivery time by 30%. Six Sigma Green Belt certified.",
    skills: ["Operations Management", "Lean Manufacturing", "Six Sigma", "Supply Chain Management", "Process Improvement", "Budget Management", "Inventory Management", "ERP Systems", "Vendor Management", "Quality Assurance", "KPI Tracking", "Team Leadership", "Logistics", "Compliance", "SAP"],
    experienceExample: { title: "Operations Manager", company: "LogiPrime Corp.", duration: "Feb 2019 – Present", bullets: ["Managed daily operations for facility with 60+ employees and $15M annual budget", "Implemented lean processes reducing waste by 30% and saving $2M annually", "Optimized supply chain logistics reducing delivery time from 5 days to 3 days", "Achieved 99.5% order accuracy through quality control improvements"] },
    educationExample: { degree: "B.S. in Industrial Engineering", school: "Penn State University", year: "2016" },
    tips: ["Quantify operational improvements with percentages and dollars", "Include Six Sigma or lean certifications", "Show budget and team management scale", "List ERP and operations software", "Demonstrate cross-functional collaboration", "Include compliance and safety metrics"]
  },
  {
    slug: "content-writer",
    jobTitle: "Content Writer",
    category: "Marketing",
    intro: "Content writers create compelling written content that drives traffic and engagement. Your ATS resume should highlight SEO writing skills, content strategy, and measurable content performance.",
    summaryExample: "Creative Content Writer with 4+ years producing SEO-optimized content for B2B and B2C brands. Published 500+ articles generating 2M+ organic page views annually. Expert in content strategy, keyword research, and brand voice development.",
    skills: ["SEO Writing", "Content Strategy", "Copywriting", "Blog Writing", "Keyword Research", "WordPress", "Social Media Content", "Email Copy", "Brand Voice", "AP Style", "Proofreading", "CMS Platforms", "Google Analytics", "Content Calendar Management"],
    experienceExample: { title: "Senior Content Writer", company: "ContentPro Agency", duration: "Apr 2020 – Present", bullets: ["Produced 20+ SEO articles monthly generating 200K+ organic page views", "Developed content strategy that increased blog traffic by 180% in 12 months", "Wrote product copy for 50+ landing pages with average 5.2% conversion rate", "Managed content calendar and editorial workflow for team of 5 writers"] },
    educationExample: { degree: "B.A. in English", school: "University of Iowa", year: "2019" },
    tips: ["Include portfolio links showing diverse writing samples", "Quantify content performance: traffic, engagement, conversions", "List CMS platforms and SEO tools you use", "Show ability to write across different formats and tones", "Mention editorial or content strategy experience", "Include any industry-specific writing expertise"]
  },
  {
    slug: "supply-chain-manager",
    jobTitle: "Supply Chain Manager",
    category: "Business & Operations",
    intro: "Supply chain managers oversee the flow of goods from procurement to delivery. Highlight logistics expertise, vendor management, and cost optimization in your ATS-friendly resume.",
    summaryExample: "Strategic Supply Chain Manager with 6+ years of experience in procurement, logistics, and inventory management. Reduced supply chain costs by 20% through vendor consolidation and process optimization. Managed $30M+ annual procurement budget across global suppliers.",
    skills: ["Supply Chain Management", "Procurement", "Logistics", "Inventory Management", "Vendor Management", "SAP", "Oracle SCM", "Demand Forecasting", "Lean", "Six Sigma", "Contract Negotiation", "Warehouse Management", "ERP Systems", "Cost Reduction", "Global Sourcing"],
    experienceExample: { title: "Supply Chain Manager", company: "GlobalLogistics Inc.", duration: "Jan 2019 – Present", bullets: ["Managed $30M annual procurement budget across 50+ global suppliers", "Reduced supply chain costs by 20% through vendor consolidation and renegotiation", "Implemented demand forecasting model reducing inventory holding costs by 15%", "Led cross-functional team to resolve supply disruptions, maintaining 98% on-time delivery"] },
    educationExample: { degree: "M.B.A. in Supply Chain Management", school: "Michigan State University", year: "2018" },
    tips: ["Quantify budget and cost savings achieved", "Include ERP and supply chain software", "Show global sourcing and logistics experience", "Mention certifications: CSCP, CPIM, CPSM", "Demonstrate risk management capabilities", "Include vendor management and negotiation metrics"]
  },
  {
    slug: "social-media-manager",
    jobTitle: "Social Media Manager",
    category: "Marketing",
    intro: "Social media managers build brand presence and engagement across digital platforms. Your ATS resume should highlight platform expertise, content creation, and audience growth metrics.",
    summaryExample: "Creative Social Media Manager with 4+ years growing brand communities across Instagram, TikTok, LinkedIn, and Twitter. Grew combined following from 10K to 500K+ with 5.2% average engagement rate. Expert in content strategy, influencer partnerships, and social analytics.",
    skills: ["Social Media Strategy", "Instagram", "TikTok", "LinkedIn", "Twitter/X", "Content Creation", "Community Management", "Influencer Marketing", "Social Analytics", "Hootsuite", "Sprout Social", "Paid Social", "Video Production", "Brand Voice", "Crisis Communication"],
    experienceExample: { title: "Social Media Manager", company: "BrandBoost Agency", duration: "Jun 2020 – Present", bullets: ["Grew brand social following from 10K to 500K+ across 4 platforms in 2 years", "Created viral TikTok campaign generating 5M+ views and 50K new followers in one month", "Managed $100K monthly paid social budget achieving 4x average ROAS", "Developed influencer partnership program with 30+ creators driving $800K in attributed sales"] },
    educationExample: { degree: "B.A. in Communications", school: "USC Annenberg", year: "2019" },
    tips: ["Quantify follower growth and engagement rates", "List all platforms with specific experience", "Include paid social advertising experience", "Show content creation skills (photo, video, copy)", "Mention social media management tools", "Include influencer marketing and partnership experience"]
  },
  {
    slug: "executive-assistant",
    jobTitle: "Executive Assistant",
    category: "Administrative",
    intro: "Executive assistants provide high-level support to senior leadership. Your ATS resume should highlight organizational skills, discretion, and the ability to manage complex schedules and communications.",
    summaryExample: "Highly organized Executive Assistant with 5+ years supporting C-suite executives in fast-paced environments. Managed complex calendars, coordinated international travel, and organized 50+ board meetings. Expert in Microsoft Office Suite, project coordination, and confidential document management.",
    skills: ["Calendar Management", "Travel Coordination", "Microsoft Office Suite", "Meeting Coordination", "Document Management", "Executive Communication", "Event Planning", "Expense Reporting", "Confidentiality", "Project Coordination", "CRM", "Presentation Preparation", "Scheduling", "Stakeholder Communication"],
    experienceExample: { title: "Executive Assistant to CEO", company: "Fortune 500 Company", duration: "Mar 2019 – Present", bullets: ["Managed daily calendar and communications for CEO of 5,000-employee organization", "Coordinated 50+ board meetings and quarterly town halls with flawless logistics", "Arranged international travel for executive team, optimizing costs by 20%", "Prepared executive presentations and reports for board of directors and investor meetings"] },
    educationExample: { degree: "B.A. in Business Administration", school: "Loyola Marymount University", year: "2018" },
    tips: ["Highlight the level of executives you've supported", "Include specific software and tools proficiency", "Show event planning and coordination experience", "Demonstrate discretion and confidentiality handling", "Quantify cost savings and efficiency improvements", "Include any certifications like CAP or PACE"]
  },
  {
    slug: "pharmacist",
    jobTitle: "Pharmacist",
    category: "Healthcare",
    intro: "Pharmacists play a critical role in patient care through medication management and counseling. Your ATS resume should highlight licensure, clinical knowledge, and patient safety metrics.",
    summaryExample: "Licensed Pharmacist (PharmD) with 5+ years of clinical and retail pharmacy experience. Managed prescription verification for 300+ daily prescriptions with zero dispensing errors. Expert in medication therapy management, patient counseling, and pharmacy operations. Immunization certified.",
    skills: ["Medication Dispensing", "Patient Counseling", "Medication Therapy Management", "Pharmacy Operations", "Drug Interactions", "Immunizations", "HIPAA Compliance", "Prescription Verification", "Clinical Pharmacy", "Inventory Management", "Insurance Billing", "Compounding", "EHR Systems", "Pharmacovigilance"],
    experienceExample: { title: "Staff Pharmacist", company: "HealthMart Pharmacy", duration: "Jul 2019 – Present", bullets: ["Verified and dispensed 300+ prescriptions daily with zero dispensing errors", "Conducted medication therapy management consultations for 50+ chronic disease patients monthly", "Administered 1,000+ immunizations annually including COVID-19, flu, and shingles vaccines", "Implemented inventory management system reducing medication waste by 25% and saving $100K annually"] },
    educationExample: { degree: "Doctor of Pharmacy (PharmD)", school: "University of North Carolina at Chapel Hill", year: "2019" },
    tips: ["Include pharmacy license number and state(s)", "List all certifications and immunization credentials", "Quantify prescription volume and accuracy metrics", "Show clinical consultation and patient education experience", "Include specific pharmacy software systems", "Mention specialty pharmacy experience if applicable"]
  },
  {
    slug: "electrical-engineer",
    jobTitle: "Electrical Engineer",
    category: "Engineering",
    intro: "Electrical engineers design and develop electrical systems and components. Your ATS resume should highlight circuit design, power systems, and relevant engineering software proficiency.",
    summaryExample: "Licensed Electrical Engineer (PE) with 5+ years of experience in circuit design, power systems, and embedded systems. Proficient in MATLAB, Simulink, and Altium Designer. Led design of power distribution system that improved energy efficiency by 20%. Experienced in both analog and digital electronics.",
    skills: ["Circuit Design", "MATLAB", "Simulink", "Altium Designer", "Power Systems", "Embedded Systems", "PCB Design", "PLC Programming", "AutoCAD Electrical", "SPICE", "Signal Processing", "Control Systems", "VHDL/Verilog", "Testing & Validation", "NEC Compliance"],
    experienceExample: { title: "Electrical Engineer", company: "PowerTech Solutions", duration: "Sep 2019 – Present", bullets: ["Designed power distribution system for commercial facility, improving energy efficiency by 20%", "Developed embedded firmware for IoT devices deployed across 10K+ installations", "Created PCB layouts for 8 product iterations using Altium Designer with first-pass success rate of 95%", "Conducted testing and validation ensuring compliance with UL, CE, and FCC standards"] },
    educationExample: { degree: "B.S. in Electrical Engineering", school: "Virginia Tech", year: "2018" },
    tips: ["Include PE license and other certifications", "List specific EDA and simulation software", "Quantify design improvements and efficiency gains", "Mention standards compliance experience (UL, CE, FCC)", "Include both hardware and software skills", "Show experience with testing and validation procedures"]
  },
  {
    slug: "web-developer",
    jobTitle: "Web Developer",
    category: "Technology",
    intro: "Web developers build and maintain websites and web applications. Emphasize front-end frameworks, responsive design, and performance optimization in your ATS resume.",
    summaryExample: "Creative Web Developer with 4+ years building responsive, high-performance websites. Proficient in HTML5, CSS3, JavaScript, React, and WordPress. Developed 30+ websites with average 95+ Lighthouse performance scores. Expert in SEO best practices and cross-browser compatibility.",
    skills: ["HTML5", "CSS3", "JavaScript", "React", "WordPress", "Responsive Design", "SEO", "Git", "Sass/SCSS", "Tailwind CSS", "PHP", "MySQL", "Performance Optimization", "Cross-Browser Compatibility", "Accessibility"],
    experienceExample: { title: "Web Developer", company: "PixelPerfect Digital", duration: "May 2020 – Present", bullets: ["Built 30+ responsive websites with average 95+ Google Lighthouse performance scores", "Developed custom WordPress themes and plugins for enterprise clients, reducing development time by 40%", "Optimized site performance achieving sub-2-second load times, improving SEO rankings by 30%", "Implemented accessibility standards (WCAG 2.1) across all new projects"] },
    educationExample: { degree: "B.S. in Web Development", school: "Full Sail University", year: "2019" },
    tips: ["Include a portfolio link showcasing your best work", "List front-end frameworks and CMS experience", "Quantify performance metrics and SEO improvements", "Show responsive and mobile-first design experience", "Include accessibility and web standards knowledge", "Mention version control and deployment workflows"]
  },
  {
    slug: "physical-therapist",
    jobTitle: "Physical Therapist",
    category: "Healthcare",
    intro: "Physical therapists help patients recover mobility and manage pain. Your ATS resume should highlight clinical expertise, patient outcomes, and relevant certifications.",
    summaryExample: "Licensed Physical Therapist (DPT) with 5+ years of experience in orthopedic and sports rehabilitation. Treated 25+ patients weekly with 95% achieving functional goals within projected timelines. Expert in manual therapy, therapeutic exercise, and evidence-based treatment planning.",
    skills: ["Manual Therapy", "Therapeutic Exercise", "Patient Assessment", "Treatment Planning", "Orthopedic Rehabilitation", "Sports Medicine", "Neurological Rehabilitation", "Pain Management", "Patient Education", "Documentation", "EHR (WebPT)", "Gait Analysis", "Modalities", "Dry Needling"],
    experienceExample: { title: "Physical Therapist", company: "RehabFirst Clinic", duration: "Aug 2019 – Present", bullets: ["Managed caseload of 25+ patients weekly across orthopedic and sports rehabilitation", "Achieved 95% patient goal attainment rate within projected treatment timelines", "Developed specialized return-to-sport protocols reducing reinjury rates by 30%", "Mentored 4 physical therapy students during clinical rotations"] },
    educationExample: { degree: "Doctor of Physical Therapy (DPT)", school: "Emory University", year: "2019" },
    tips: ["Include state license and specialty certifications", "Quantify patient outcomes and caseload volumes", "List specialty areas and treatment techniques", "Include evidence-based practice experience", "Mention EHR systems and documentation proficiency", "Show continuing education and certifications"]
  },
  {
    slug: "real-estate-agent",
    jobTitle: "Real Estate Agent",
    category: "Sales",
    intro: "Real estate agents guide clients through property transactions. Your ATS resume should highlight sales volume, client satisfaction, and market expertise.",
    summaryExample: "Licensed Real Estate Agent with 5+ years closing $30M+ in residential property sales. Maintained 98% client satisfaction rating and consistently ranked in top 5% of brokerage. Expert in market analysis, negotiation, and digital marketing for real estate.",
    skills: ["Property Sales", "Client Relations", "Market Analysis", "Contract Negotiation", "MLS", "CRM (Zillow, Realtor.com)", "Property Valuation", "Open Houses", "Digital Marketing", "Lead Generation", "Closing", "First-Time Homebuyers", "Investment Properties", "Staging Consultation"],
    experienceExample: { title: "Real Estate Agent", company: "Premier Properties Realty", duration: "Jan 2020 – Present", bullets: ["Closed $30M+ in residential property sales across 80+ transactions", "Maintained 98% client satisfaction rating and 60% referral rate", "Developed digital marketing strategy generating 100+ qualified leads monthly", "Negotiated purchase terms saving clients an average of $15K per transaction"] },
    educationExample: { degree: "Real Estate License", school: "State Board of Real Estate", year: "2019" },
    tips: ["Include your real estate license and designations (CRS, ABR)", "Quantify total sales volume and transaction count", "Show marketing and lead generation skills", "Include client satisfaction metrics", "Mention specific property types and market expertise", "List real estate technology and CRM platforms"]
  },
  {
    slug: "quality-assurance-engineer",
    jobTitle: "Quality Assurance Engineer",
    category: "Technology",
    intro: "QA engineers ensure software quality through testing and automation. Your ATS resume should highlight testing methodologies, automation tools, and defect prevention metrics.",
    summaryExample: "Detail-oriented QA Engineer with 5+ years of experience in manual and automated testing. Expert in Selenium, Cypress, and API testing. Built automation framework that reduced regression testing time by 70%. Maintained 99.5% defect detection rate across 3 major product releases.",
    skills: ["Selenium", "Cypress", "API Testing", "Postman", "Test Automation", "Manual Testing", "JIRA", "Agile Testing", "CI/CD Integration", "Performance Testing", "Load Testing", "SQL", "Python", "Test Planning", "Bug Tracking", "Regression Testing"],
    experienceExample: { title: "Senior QA Engineer", company: "QualityFirst Software", duration: "Apr 2020 – Present", bullets: ["Built and maintained Selenium/Cypress automation framework covering 2,000+ test cases", "Reduced regression testing time by 70% through automated test suite integration with CI/CD pipeline", "Identified 500+ defects pre-release, maintaining 99.5% customer-facing defect detection rate", "Led QA process for 3 major product launches serving 1M+ users each"] },
    educationExample: { degree: "B.S. in Computer Science", school: "San Jose State University", year: "2018" },
    tips: ["List specific testing tools and frameworks", "Quantify automation coverage and time savings", "Show both manual and automated testing experience", "Include API and performance testing skills", "Mention CI/CD integration experience", "Demonstrate understanding of SDLC and Agile methodologies"]
  },
  {
    slug: "machine-learning-engineer",
    jobTitle: "Machine Learning Engineer",
    category: "Technology",
    intro: "ML engineers build and deploy machine learning systems at scale. Your ATS resume should highlight model development, MLOps, and production deployment experience.",
    summaryExample: "Machine Learning Engineer with 4+ years building and deploying ML models at scale. Expert in Python, TensorFlow, PyTorch, and MLOps. Deployed recommendation system serving 5M+ daily predictions with sub-50ms latency. Experienced in NLP, computer vision, and reinforcement learning.",
    skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "MLOps", "AWS SageMaker", "Docker", "Kubernetes", "NLP", "Computer Vision", "Feature Engineering", "Model Optimization", "Spark", "SQL", "A/B Testing", "Data Pipelines"],
    experienceExample: { title: "Machine Learning Engineer", company: "AI Scale Inc.", duration: "Feb 2021 – Present", bullets: ["Deployed recommendation system serving 5M+ daily predictions with sub-50ms P99 latency", "Built end-to-end ML pipeline from data ingestion to model serving using SageMaker and Kubernetes", "Improved search relevance by 35% using transformer-based NLP model fine-tuned on domain data", "Reduced model training costs by 40% through distributed training and hyperparameter optimization"] },
    educationExample: { degree: "M.S. in Machine Learning", school: "Carnegie Mellon University", year: "2020" },
    tips: ["Highlight both model development and production deployment", "Include specific ML frameworks and cloud platforms", "Quantify model performance and business impact", "Show MLOps and infrastructure experience", "Mention research publications if applicable", "Include data engineering and pipeline skills"]
  },
  {
    slug: "construction-manager",
    jobTitle: "Construction Manager",
    category: "Engineering",
    intro: "Construction managers oversee building projects from planning to completion. Your ATS resume should highlight project scale, budget management, and safety compliance.",
    summaryExample: "Experienced Construction Manager with 8+ years overseeing residential and commercial projects valued at $50M+. Expert in project scheduling, budget management, and OSHA compliance. Delivered 95% of projects on time with zero safety incidents. Proficient in Procore, MS Project, and BIM software.",
    skills: ["Construction Management", "Project Scheduling", "Budget Management", "OSHA Compliance", "Procore", "MS Project", "BIM", "Subcontractor Management", "Quality Control", "Permitting", "Blueprint Reading", "Safety Management", "Cost Estimation", "Risk Management", "Inspection"],
    experienceExample: { title: "Construction Manager", company: "BuildPro Construction", duration: "Jan 2018 – Present", bullets: ["Managed 10+ commercial construction projects with combined value of $50M+", "Maintained zero OSHA recordable incidents across 500K+ labor hours", "Delivered 95% of projects on time through proactive scheduling and risk management", "Reduced project costs by 12% through value engineering and strategic subcontractor negotiations"] },
    educationExample: { degree: "B.S. in Construction Management", school: "Clemson University", year: "2016" },
    tips: ["Quantify project values and sizes managed", "Include safety record and OSHA compliance metrics", "List construction management software proficiency", "Show experience across project types", "Include relevant certifications (PMP, CCM, OSHA 30)", "Demonstrate subcontractor and vendor management"]
  },
  {
    slug: "dental-hygienist",
    jobTitle: "Dental Hygienist",
    category: "Healthcare",
    intro: "Dental hygienists provide preventive dental care and patient education. Your ATS resume should highlight clinical skills, patient care metrics, and relevant licensure.",
    summaryExample: "Licensed Dental Hygienist (RDH) with 4+ years providing comprehensive preventive dental care. Treated 10+ patients daily while maintaining 99% patient satisfaction. Expert in periodontal therapy, digital radiography, and patient education. Experienced with Dentrix and Eaglesoft practice management systems.",
    skills: ["Dental Cleanings", "Periodontal Therapy", "Digital Radiography", "Patient Education", "Infection Control", "Dental Sealants", "Fluoride Treatment", "Oral Cancer Screening", "Dentrix", "Eaglesoft", "Charting", "Local Anesthesia", "Scaling & Root Planing"],
    experienceExample: { title: "Dental Hygienist", company: "SmileCare Dental", duration: "Jun 2020 – Present", bullets: ["Provided comprehensive dental hygiene care for 10+ patients daily across preventive and periodontal services", "Maintained 99% patient satisfaction rating and 85% reappointment rate", "Performed digital radiography and oral cancer screenings identifying 5 early-stage cases for referral", "Educated 1,000+ patients annually on oral health practices, reducing periodontal disease recurrence by 20%"] },
    educationExample: { degree: "A.S. in Dental Hygiene", school: "University of Southern California", year: "2019" },
    tips: ["Include dental hygiene license and CPR certification", "Quantify patient volume and satisfaction metrics", "List specific dental technologies and software", "Show continuing education and specialty certifications", "Include local anesthesia licensure if applicable", "Mention patient education and communication skills"]
  },
  {
    slug: "cloud-architect",
    jobTitle: "Cloud Architect",
    category: "Technology",
    intro: "Cloud architects design and implement cloud infrastructure solutions. Your ATS resume should highlight cloud platform expertise, architecture design, and cost optimization achievements.",
    summaryExample: "AWS-certified Cloud Architect with 6+ years designing and implementing enterprise cloud solutions. Migrated 50+ applications to AWS, reducing infrastructure costs by 40%. Expert in multi-cloud strategies, serverless architectures, and security best practices.",
    skills: ["AWS", "Azure", "GCP", "Cloud Architecture", "Serverless", "Terraform", "CloudFormation", "Microservices", "Kubernetes", "Security Architecture", "Cost Optimization", "Migration Planning", "Well-Architected Framework", "Networking", "Disaster Recovery"],
    experienceExample: { title: "Senior Cloud Architect", company: "CloudFirst Solutions", duration: "Mar 2019 – Present", bullets: ["Designed cloud architecture for Fortune 500 company serving 20M+ users with 99.99% availability", "Led migration of 50+ legacy applications to AWS, reducing infrastructure costs by 40%", "Implemented multi-region disaster recovery achieving RPO < 1 minute and RTO < 5 minutes", "Established cloud governance framework reducing security incidents by 80%"] },
    educationExample: { degree: "B.S. in Computer Engineering", school: "MIT", year: "2017" },
    tips: ["Include cloud certifications (AWS SAA/SAP, Azure Solutions Architect)", "Quantify cost savings and performance improvements", "Show multi-cloud or hybrid cloud experience", "Include security and compliance architecture", "Mention migration methodology experience", "Demonstrate infrastructure as code skills"]
  },
  {
    slug: "legal-assistant",
    jobTitle: "Legal Assistant",
    category: "Legal",
    intro: "Legal assistants support attorneys with research, documentation, and case management. Your ATS resume should highlight legal knowledge, organizational skills, and technology proficiency.",
    summaryExample: "Detail-oriented Legal Assistant with 4+ years supporting litigation and corporate law attorneys. Managed 50+ active case files with 100% deadline compliance. Proficient in Westlaw, LexisNexis, and e-filing systems. Expert in legal research, document preparation, and client communication.",
    skills: ["Legal Research", "Westlaw", "LexisNexis", "Document Preparation", "Case Management", "E-Filing", "Client Communication", "Litigation Support", "Contract Review", "Calendaring", "Discovery", "Court Filings", "Legal Correspondence", "Notary Public"],
    experienceExample: { title: "Legal Assistant", company: "Smith & Associates Law Firm", duration: "Aug 2020 – Present", bullets: ["Managed 50+ active case files simultaneously with 100% deadline compliance", "Conducted legal research using Westlaw and LexisNexis supporting 5 senior attorneys", "Prepared and filed 200+ court documents annually with zero rejection rate", "Coordinated discovery process for complex litigation cases involving 10K+ documents"] },
    educationExample: { degree: "B.A. in Legal Studies", school: "University of Florida", year: "2019" },
    tips: ["Include paralegal certification if applicable", "List specific legal research databases and software", "Show experience across practice areas", "Quantify case volume and filing accuracy", "Include e-filing and court system experience", "Mention notary public or other relevant certifications"]
  },
  {
    slug: "business-development-manager",
    jobTitle: "Business Development Manager",
    category: "Sales",
    intro: "Business development managers identify growth opportunities and build strategic partnerships. Your ATS resume should highlight revenue generation, partnership development, and strategic planning skills.",
    summaryExample: "Strategic Business Development Manager with 6+ years driving revenue growth through partnership development and market expansion. Generated $10M+ in new business through strategic alliances and consultative selling. Expert in market analysis, proposal development, and C-suite relationship building.",
    skills: ["Business Development", "Strategic Partnerships", "Revenue Growth", "Market Analysis", "CRM", "Consultative Selling", "Proposal Development", "Contract Negotiation", "Pipeline Management", "Lead Generation", "Market Expansion", "Account Management", "Presentation Skills", "ROI Analysis"],
    experienceExample: { title: "Business Development Manager", company: "GrowthPartners Inc.", duration: "Jan 2019 – Present", bullets: ["Generated $10M+ in new revenue through 25+ strategic partnerships and channel relationships", "Expanded into 3 new markets, contributing to 40% overall company revenue growth", "Built and managed pipeline of $20M+ qualified opportunities using Salesforce", "Developed and delivered 50+ C-suite presentations with 60% close rate"] },
    educationExample: { degree: "M.B.A.", school: "Duke University, Fuqua School of Business", year: "2018" },
    tips: ["Lead with revenue generation metrics", "Show strategic thinking and market expansion", "Include CRM and sales technology proficiency", "Demonstrate partnership development skills", "Quantify pipeline and close rates", "Include both hunting and farming experience"]
  },
  {
    slug: "front-end-developer",
    jobTitle: "Front End Developer",
    category: "Technology",
    intro: "Front-end developers create the user-facing side of web applications. Your ATS resume should highlight JavaScript frameworks, responsive design, and performance optimization.",
    summaryExample: "Creative Front End Developer with 4+ years building responsive, accessible web interfaces. Expert in React, TypeScript, and CSS frameworks. Achieved 98+ Lighthouse performance scores across 20+ production websites. Passionate about pixel-perfect implementation and smooth user experiences.",
    skills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Next.js", "Vue.js", "Responsive Design", "Accessibility (WCAG)", "Performance Optimization", "Webpack", "Git", "Testing (Jest/Cypress)", "Design Systems"],
    experienceExample: { title: "Front End Developer", company: "UIForge Studio", duration: "Jun 2020 – Present", bullets: ["Built responsive UI components for SaaS platform serving 200K+ monthly active users", "Achieved 98+ Lighthouse scores through performance optimization and lazy loading strategies", "Created shared component library with 60+ reusable components reducing development time by 40%", "Implemented accessibility standards achieving WCAG 2.1 AA compliance across all interfaces"] },
    educationExample: { degree: "B.S. in Computer Science", school: "University of California, San Diego", year: "2019" },
    tips: ["Include portfolio showcasing live projects", "List JavaScript frameworks and CSS tools", "Show performance optimization experience", "Include accessibility and testing practices", "Mention design system experience", "Quantify user-facing metrics and improvements"]
  },
  {
    slug: "back-end-developer",
    jobTitle: "Back End Developer",
    category: "Technology",
    intro: "Back-end developers build server-side logic, APIs, and database systems. Your ATS resume should highlight programming languages, database management, and system architecture.",
    summaryExample: "Experienced Back End Developer with 5+ years building scalable APIs and microservices. Expert in Python, Java, and cloud-native architectures. Designed systems handling 10M+ daily API calls with 99.99% uptime. Proficient in PostgreSQL, Redis, and message queue architectures.",
    skills: ["Python", "Java", "Node.js", "PostgreSQL", "MySQL", "Redis", "REST APIs", "GraphQL", "Microservices", "AWS", "Docker", "Message Queues (RabbitMQ/Kafka)", "System Design", "Security", "Performance Tuning"],
    experienceExample: { title: "Senior Back End Developer", company: "APICore Technologies", duration: "Apr 2019 – Present", bullets: ["Designed and maintained RESTful APIs handling 10M+ daily requests with 99.99% uptime", "Architected event-driven microservices using Kafka reducing system coupling and improving scalability", "Optimized database queries reducing average response time from 500ms to 50ms", "Implemented OAuth 2.0 and JWT authentication securing 500K+ user accounts"] },
    educationExample: { degree: "M.S. in Computer Science", school: "Stanford University", year: "2018" },
    tips: ["List programming languages with experience levels", "Include database and caching technologies", "Show system design and architecture experience", "Quantify API performance and uptime metrics", "Include security and authentication implementation", "Mention microservices and distributed systems experience"]
  },
  {
    slug: "research-scientist",
    jobTitle: "Research Scientist",
    category: "Science & Research",
    intro: "Research scientists advance knowledge through experimentation and analysis. Your ATS resume should highlight publications, methodologies, and grant funding experience.",
    summaryExample: "Published Research Scientist with 5+ years of experience in molecular biology and genomics. Lead author on 8 peer-reviewed publications with 200+ citations. Secured $500K+ in grant funding. Expert in CRISPR, next-generation sequencing, and bioinformatics.",
    skills: ["Research Methodology", "Data Analysis", "Scientific Writing", "Grant Writing", "Peer Review", "Statistical Analysis", "Lab Management", "Bioinformatics", "CRISPR", "NGS", "PCR", "Cell Culture", "Python/R", "Presentations"],
    experienceExample: { title: "Research Scientist", company: "BioResearch Institute", duration: "Sep 2019 – Present", bullets: ["Led research team of 5 investigating genetic markers for neurodegenerative diseases", "Published 8 peer-reviewed papers in high-impact journals with 200+ combined citations", "Secured $500K+ in NIH and NSF grant funding as principal investigator", "Developed novel CRISPR protocol reducing experimental timeline by 40%"] },
    educationExample: { degree: "Ph.D. in Molecular Biology", school: "Harvard University", year: "2019" },
    tips: ["Include publications with citation counts", "List grant funding secured with amounts", "Show specific research techniques and methodologies", "Include conference presentations and invited talks", "Mention mentorship of junior researchers", "List relevant software and programming skills"]
  },
  {
    slug: "event-planner",
    jobTitle: "Event Planner",
    category: "Administrative",
    intro: "Event planners coordinate memorable events from corporate conferences to weddings. Your ATS resume should highlight budget management, vendor coordination, and successful event execution.",
    summaryExample: "Creative Event Planner with 5+ years organizing corporate and social events for 50 to 5,000+ attendees. Managed $2M+ annual event budget with consistent under-budget delivery. Expert in vendor management, logistics, and hybrid/virtual event production.",
    skills: ["Event Planning", "Budget Management", "Vendor Management", "Logistics Coordination", "Contract Negotiation", "Venue Selection", "Catering Management", "Virtual Events", "Hybrid Events", "Cvent", "Eventbrite", "Marketing Collateral", "Sponsor Relations", "Timeline Management"],
    experienceExample: { title: "Senior Event Planner", company: "EventPro Management", duration: "Mar 2019 – Present", bullets: ["Planned and executed 40+ events annually ranging from 50 to 5,000 attendees", "Managed $2M annual event budget consistently delivering 10% under budget", "Coordinated with 100+ vendors ensuring seamless event logistics and quality", "Produced 15 hybrid virtual/in-person events during pandemic with 95% attendee satisfaction"] },
    educationExample: { degree: "B.A. in Hospitality Management", school: "Cornell University", year: "2018" },
    tips: ["Quantify event sizes and budgets managed", "Show both in-person and virtual event experience", "Include vendor and sponsor management skills", "List event technology platforms", "Demonstrate budget management and cost savings", "Include client satisfaction metrics"]
  },
  {
    slug: "architect",
    jobTitle: "Architect",
    category: "Engineering",
    intro: "Architects design buildings and spaces that shape how people live and work. Your ATS resume should highlight design software proficiency, project management, and sustainable design experience.",
    summaryExample: "Licensed Architect (AIA) with 7+ years designing commercial and residential projects. Led design of $30M+ mixed-use development projects. Expert in Revit, AutoCAD, and sustainable design (LEED). Managed projects from schematic design through construction administration.",
    skills: ["Revit", "AutoCAD", "SketchUp", "Rhino", "Adobe Creative Suite", "LEED", "Building Codes", "Construction Documents", "Schematic Design", "Design Development", "Project Management", "3D Visualization", "BIM", "Sustainable Design", "Client Presentations"],
    experienceExample: { title: "Project Architect", company: "DesignStudio Architecture", duration: "May 2018 – Present", bullets: ["Led design of $30M mixed-use development spanning 200K sq ft across 3 buildings", "Managed team of 6 architects through all project phases from concept to construction administration", "Achieved LEED Gold certification on 5 projects through sustainable design strategies", "Reduced construction change orders by 35% through detailed BIM coordination and clash detection"] },
    educationExample: { degree: "M.Arch in Architecture", school: "Yale School of Architecture", year: "2017" },
    tips: ["Include architecture license (RA) and AIA membership", "List design and BIM software proficiency", "Quantify project values and building sizes", "Show sustainability and LEED experience", "Include experience across project phases", "Demonstrate code compliance and permitting knowledge"]
  },
  {
    slug: "technical-writer",
    jobTitle: "Technical Writer",
    category: "Technology",
    intro: "Technical writers translate complex information into clear documentation. Your ATS resume should highlight documentation tools, subject matter expertise, and user-focused writing.",
    summaryExample: "Technical Writer with 5+ years creating developer documentation, API guides, and user manuals for SaaS products. Reduced support tickets by 30% through improved documentation. Proficient in Markdown, Git, DITA, and docs-as-code workflows.",
    skills: ["Technical Documentation", "API Documentation", "Markdown", "DITA", "Git", "Confluence", "Swagger/OpenAPI", "User Guides", "Release Notes", "Style Guides", "Information Architecture", "Content Strategy", "Docs-as-Code", "Visual Documentation"],
    experienceExample: { title: "Senior Technical Writer", company: "DocuTech Solutions", duration: "Jun 2019 – Present", bullets: ["Created and maintained documentation for SaaS platform with 50K+ developer users", "Reduced customer support tickets by 30% through comprehensive knowledge base of 200+ articles", "Developed API documentation using Swagger/OpenAPI covering 150+ endpoints", "Established docs-as-code workflow using Git and CI/CD reducing publication time by 60%"] },
    educationExample: { degree: "B.A. in English & Computer Science", school: "Northeastern University", year: "2018" },
    tips: ["Include portfolio links to published documentation", "List documentation tools and platforms", "Show experience with different documentation types", "Quantify impact on support ticket reduction", "Include docs-as-code and version control skills", "Demonstrate ability to work with engineers and SMEs"]
  },
  {
    slug: "scrum-master",
    jobTitle: "Scrum Master",
    category: "Business & Operations",
    intro: "Scrum Masters facilitate agile ceremonies and remove blockers for development teams. Your ATS resume should highlight agile methodologies, team coaching, and delivery metrics.",
    summaryExample: "Certified Scrum Master (CSM) with 5+ years facilitating agile transformation for development teams of 5-30 members. Improved team velocity by 40% and sprint goal achievement from 60% to 95%. Expert in Scrum, Kanban, and SAFe frameworks.",
    skills: ["Scrum", "Kanban", "SAFe", "Agile Coaching", "Sprint Planning", "Retrospectives", "Jira", "Confluence", "Team Facilitation", "Impediment Removal", "Stakeholder Management", "Velocity Tracking", "Release Planning", "Continuous Improvement"],
    experienceExample: { title: "Senior Scrum Master", company: "AgileTech Corp.", duration: "Jan 2020 – Present", bullets: ["Facilitated agile ceremonies for 3 cross-functional teams of 8-12 members each", "Improved sprint goal achievement rate from 60% to 95% through better estimation and planning", "Led agile transformation for organization of 200+ developers transitioning from waterfall", "Reduced average cycle time by 35% through process optimization and impediment removal"] },
    educationExample: { degree: "B.S. in Information Technology", school: "Rochester Institute of Technology", year: "2018" },
    tips: ["Include Scrum and Agile certifications (CSM, PSM, SAFe)", "Quantify team performance improvements", "Show experience with multiple agile frameworks", "Demonstrate coaching and facilitation skills", "Include organizational transformation experience", "List agile project management tools"]
  },
  {
    slug: "network-engineer",
    jobTitle: "Network Engineer",
    category: "Technology",
    intro: "Network engineers design, implement, and maintain computer networks. Your ATS resume should highlight networking protocols, security, and infrastructure management.",
    summaryExample: "CCNP-certified Network Engineer with 5+ years designing and managing enterprise networks. Maintained 99.99% network uptime for 10K+ user environment. Expert in Cisco, Juniper, and cloud networking. Experienced in network security, SD-WAN, and wireless architecture.",
    skills: ["Cisco", "Juniper", "TCP/IP", "BGP/OSPF", "MPLS", "SD-WAN", "Firewall Management", "VPN", "Network Security", "Wireless (Wi-Fi 6)", "Load Balancing", "DNS/DHCP", "Network Monitoring", "Wireshark", "Cloud Networking"],
    experienceExample: { title: "Network Engineer", company: "NetSecure Solutions", duration: "Mar 2019 – Present", bullets: ["Designed and maintained enterprise network infrastructure for 10K+ user organization", "Achieved 99.99% network uptime through redundant architecture and proactive monitoring", "Implemented SD-WAN solution across 20 offices reducing WAN costs by 35%", "Deployed next-gen firewall and IPS reducing network security incidents by 60%"] },
    educationExample: { degree: "B.S. in Network Engineering", school: "WPI", year: "2018" },
    tips: ["Include networking certifications (CCNP, CCNA, JNCIA)", "Quantify network size and uptime metrics", "List networking platforms and protocols", "Show security implementation experience", "Include cloud networking skills (AWS VPC, Azure VNet)", "Demonstrate troubleshooting and documentation skills"]
  },
  {
    slug: "data-engineer",
    jobTitle: "Data Engineer",
    category: "Data & Analytics",
    intro: "Data engineers build the infrastructure that enables data-driven decisions. Your ATS resume should highlight ETL pipelines, data warehouse design, and big data technologies.",
    summaryExample: "Data Engineer with 5+ years building and optimizing data pipelines processing 10TB+ daily. Expert in Python, Spark, Airflow, and cloud data platforms. Designed data warehouse architecture reducing query time by 80%. Experienced in both batch and real-time data processing.",
    skills: ["Python", "SQL", "Apache Spark", "Airflow", "AWS (Redshift, S3, Glue)", "Snowflake", "Kafka", "dbt", "ETL/ELT", "Data Modeling", "Hadoop", "Docker", "Terraform", "Data Quality", "Data Governance"],
    experienceExample: { title: "Senior Data Engineer", company: "DataPipe Analytics", duration: "Feb 2020 – Present", bullets: ["Designed and maintained data pipelines processing 10TB+ daily with 99.9% reliability", "Built Snowflake data warehouse reducing average query time from 30 seconds to 5 seconds", "Implemented real-time streaming pipeline using Kafka processing 1M+ events per minute", "Developed data quality framework catching 95% of data anomalies before downstream impact"] },
    educationExample: { degree: "M.S. in Computer Science", school: "University of Wisconsin-Madison", year: "2019" },
    tips: ["List specific data technologies and cloud platforms", "Quantify data volumes and pipeline performance", "Show both batch and streaming experience", "Include data modeling and warehouse design", "Mention data quality and governance practices", "Include orchestration and monitoring tools"]
  },
  {
    slug: "product-designer",
    jobTitle: "Product Designer",
    category: "Design & Creative",
    intro: "Product designers create end-to-end user experiences for digital products. Your ATS resume should highlight design thinking, prototyping, and user research skills.",
    summaryExample: "Product Designer with 5+ years crafting user-centered digital experiences for mobile and web platforms. Led design for products used by 2M+ users. Expert in Figma, design systems, and data-driven design decisions. Passionate about accessibility and inclusive design.",
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Wireframing", "Interaction Design", "Visual Design", "Accessibility", "Design Thinking", "A/B Testing", "Information Architecture", "Motion Design", "Responsive Design", "Miro", "FigJam"],
    experienceExample: { title: "Senior Product Designer", company: "ProductCraft Inc.", duration: "Apr 2020 – Present", bullets: ["Led end-to-end design for mobile app serving 2M+ monthly active users", "Built and maintained design system with 150+ components used across 3 product teams", "Conducted 60+ user research sessions informing product roadmap and design decisions", "Redesigned onboarding flow increasing user activation rate from 35% to 62%"] },
    educationExample: { degree: "B.F.A. in Industrial Design", school: "Pratt Institute", year: "2019" },
    tips: ["Include portfolio link with detailed case studies", "Show end-to-end design process experience", "Quantify design impact on business metrics", "List design tools and collaboration platforms", "Include user research methodology experience", "Demonstrate cross-functional collaboration skills"]
  },
  {
    slug: "logistics-coordinator",
    jobTitle: "Logistics Coordinator",
    category: "Business & Operations",
    intro: "Logistics coordinators manage the movement of goods and materials. Your ATS resume should highlight supply chain coordination, vendor management, and operational efficiency.",
    summaryExample: "Organized Logistics Coordinator with 4+ years managing domestic and international shipments for $20M+ in annual freight. Reduced shipping costs by 18% through carrier optimization. Expert in TMS, WMS, and customs compliance.",
    skills: ["Logistics Management", "Supply Chain Coordination", "Freight Management", "TMS", "WMS", "Customs Compliance", "Vendor Relations", "Inventory Tracking", "Route Optimization", "Import/Export", "Shipping Documentation", "Cost Analysis", "Excel", "SAP", "ERP Systems"],
    experienceExample: { title: "Logistics Coordinator", company: "FreightFlow Logistics", duration: "Jul 2020 – Present", bullets: ["Coordinated 500+ monthly shipments across domestic and international routes", "Reduced shipping costs by 18% through carrier negotiation and route optimization", "Managed customs documentation for international shipments ensuring 100% compliance", "Implemented WMS system improving warehouse efficiency by 25%"] },
    educationExample: { degree: "B.S. in Supply Chain Management", school: "Penn State University", year: "2019" },
    tips: ["Quantify shipment volumes and cost savings", "Include TMS, WMS, and ERP system experience", "Show international logistics and customs knowledge", "List carrier management and negotiation skills", "Include certifications (APICS, CLTD)", "Demonstrate problem-solving with logistics challenges"]
  },
  {
    slug: "ux-researcher",
    jobTitle: "UX Researcher",
    category: "Design & Creative",
    intro: "UX researchers uncover user insights that guide product design decisions. Your ATS resume should highlight research methodologies, synthesis skills, and impact on product strategy.",
    summaryExample: "UX Researcher with 4+ years conducting qualitative and quantitative research for consumer and enterprise products. Led 100+ research studies informing product decisions for 5M+ user platform. Expert in usability testing, surveys, and ethnographic research. Skilled at translating complex findings into actionable design recommendations.",
    skills: ["Usability Testing", "User Interviews", "Surveys", "A/B Testing", "Ethnographic Research", "Card Sorting", "Tree Testing", "Research Synthesis", "Personas", "Journey Mapping", "UserTesting", "Dovetail", "Optimal Workshop", "Research Planning", "Stakeholder Presentations"],
    experienceExample: { title: "Senior UX Researcher", company: "ResearchFirst Design", duration: "May 2020 – Present", bullets: ["Led 100+ research studies across usability testing, interviews, and surveys for 5M+ user platform", "Identified critical usability issues in checkout flow, leading to redesign that increased conversions by 25%", "Established research operations framework reducing study setup time from 2 weeks to 3 days", "Presented research findings to C-suite stakeholders, directly influencing $5M product roadmap decisions"] },
    educationExample: { degree: "M.S. in Human-Computer Interaction", school: "University of Michigan", year: "2019" },
    tips: ["Show range of research methods (qualitative and quantitative)", "Quantify research impact on product metrics", "Include research tools and platforms", "Demonstrate research operations experience", "Show stakeholder communication skills", "Include publications or conference presentations"]
  },
  {
    slug: "database-administrator",
    jobTitle: "Database Administrator",
    category: "Technology",
    intro: "Database administrators ensure data availability, performance, and security. Your ATS resume should highlight database platforms, performance tuning, and disaster recovery experience.",
    summaryExample: "Oracle and PostgreSQL certified Database Administrator with 6+ years managing enterprise databases with 99.99% uptime. Administered 50+ production databases totaling 20TB+. Expert in performance tuning, backup/recovery, and database security. Reduced query response times by 70% through optimization.",
    skills: ["Oracle", "PostgreSQL", "MySQL", "SQL Server", "Database Performance Tuning", "Backup & Recovery", "Replication", "High Availability", "Database Security", "Shell Scripting", "PL/SQL", "Monitoring", "Migration", "Data Modeling", "Disaster Recovery"],
    experienceExample: { title: "Senior Database Administrator", company: "DataGuard Systems", duration: "Jan 2019 – Present", bullets: ["Administered 50+ production databases totaling 20TB+ with 99.99% uptime", "Optimized database performance reducing average query response time by 70%", "Implemented automated backup and disaster recovery procedures with RPO < 15 minutes", "Led migration of 30+ databases from on-premise to cloud with zero data loss and minimal downtime"] },
    educationExample: { degree: "B.S. in Information Technology", school: "Georgia State University", year: "2017" },
    tips: ["List specific database platforms with versions", "Include certifications (OCP, MCDBA)", "Quantify database sizes and uptime metrics", "Show performance tuning achievements", "Include disaster recovery and high availability experience", "Mention cloud database platforms (RDS, Cloud SQL)"]
  },
  {
    slug: "interior-designer",
    jobTitle: "Interior Designer",
    category: "Design & Creative",
    intro: "Interior designers create functional and aesthetically pleasing indoor spaces. Your ATS resume should highlight design software, client management, and project completion metrics.",
    summaryExample: "Licensed Interior Designer (NCIDQ) with 5+ years creating residential and commercial spaces. Completed 40+ projects with budgets up to $500K. Expert in AutoCAD, SketchUp, and sustainable design. Specialized in hospitality and corporate office design.",
    skills: ["AutoCAD", "SketchUp", "Revit", "Adobe Creative Suite", "Space Planning", "FF&E Selection", "Color Theory", "Lighting Design", "Building Codes", "Sustainable Design", "Client Presentations", "Budget Management", "3D Rendering", "Material Sourcing"],
    experienceExample: { title: "Interior Designer", company: "DesignSpace Studio", duration: "Apr 2019 – Present", bullets: ["Designed 40+ residential and commercial interiors with budgets ranging from $50K to $500K", "Managed FF&E procurement for 15 hospitality projects totaling $2M in furnishing budgets", "Created 3D renderings and presentations achieving 90% first-presentation client approval rate", "Implemented sustainable material selections reducing project environmental impact by 25%"] },
    educationExample: { degree: "B.F.A. in Interior Design", school: "Parsons School of Design", year: "2018" },
    tips: ["Include NCIDQ certification and state license", "List design software and visualization tools", "Quantify project budgets and client satisfaction", "Show experience across design specialties", "Include sustainable and accessibility design knowledge", "Link to portfolio with project photos"]
  },
  {
    slug: "mobile-app-developer",
    jobTitle: "Mobile App Developer",
    category: "Technology",
    intro: "Mobile app developers create applications for iOS and Android platforms. Your ATS resume should highlight native and cross-platform development skills, app performance, and user engagement metrics.",
    summaryExample: "Mobile App Developer with 4+ years building iOS and Android applications downloaded 2M+ times. Expert in React Native, Swift, and Kotlin. Published 10+ apps on App Store and Google Play with average 4.7-star rating. Experienced in app performance optimization and push notification systems.",
    skills: ["React Native", "Swift", "Kotlin", "Flutter", "iOS Development", "Android Development", "REST APIs", "Firebase", "Push Notifications", "App Store Optimization", "Mobile UI/UX", "SQLite", "Redux", "Unit Testing", "CI/CD for Mobile"],
    experienceExample: { title: "Senior Mobile App Developer", company: "AppForge Studio", duration: "Jun 2020 – Present", bullets: ["Developed 5 production mobile apps with combined 2M+ downloads and 4.7 average store rating", "Built cross-platform app using React Native reducing development time by 50% compared to native", "Optimized app performance reducing crash rate from 2% to 0.1% and improving startup time by 40%", "Implemented real-time push notification system with 85% opt-in rate and 15% engagement rate"] },
    educationExample: { degree: "B.S. in Software Engineering", school: "San Jose State University", year: "2019" },
    tips: ["Include App Store/Play Store links to published apps", "List both native and cross-platform frameworks", "Quantify downloads, ratings, and engagement metrics", "Show app performance optimization experience", "Include testing and CI/CD for mobile", "Mention monetization or growth experience"]
  },
  {
    slug: "human-resources-coordinator",
    jobTitle: "Human Resources Coordinator",
    category: "Human Resources",
    intro: "HR coordinators support daily HR operations including recruitment, onboarding, and benefits administration. Your ATS resume should highlight organizational skills, HR systems, and employee support metrics.",
    summaryExample: "Organized HR Coordinator with 3+ years supporting full-cycle HR operations for 300+ employee organization. Managed onboarding for 100+ new hires annually with 95% satisfaction rate. Proficient in Workday, ADP, and applicant tracking systems.",
    skills: ["HRIS (Workday, ADP)", "Applicant Tracking Systems", "Onboarding", "Benefits Administration", "Payroll Support", "Employee Records", "Recruitment Coordination", "Compliance", "I-9 Verification", "Background Checks", "New Hire Orientation", "Employee Relations", "Microsoft Office", "Data Entry"],
    experienceExample: { title: "HR Coordinator", company: "TalentBridge Corp.", duration: "Aug 2021 – Present", bullets: ["Coordinated onboarding for 100+ new hires annually with 95% satisfaction rating", "Managed HRIS data for 300+ employees ensuring 100% accuracy in records and compliance", "Screened 500+ resumes monthly and scheduled interviews for 10+ hiring managers", "Administered benefits enrollment and changes for open enrollment serving 300+ employees"] },
    educationExample: { degree: "B.S. in Human Resources", school: "Temple University", year: "2020" },
    tips: ["List specific HRIS and ATS platforms", "Quantify employee count and hiring volume", "Show experience across HR functions", "Include compliance and regulatory knowledge", "Demonstrate organizational and multitasking skills", "Mention HR certifications (aPHR, SHRM-CP)"]
  },
  {
    slug: "copywriter",
    jobTitle: "Copywriter",
    category: "Marketing",
    intro: "Copywriters craft persuasive content that drives action. Your ATS resume should highlight conversion-focused writing, brand voice expertise, and measurable campaign results.",
    summaryExample: "Conversion-focused Copywriter with 4+ years writing for digital advertising, email, and web. Generated $5M+ in attributed revenue through direct response copy. Expert in A/B testing, brand storytelling, and SEO copywriting. Clients include Fortune 500 brands and high-growth startups.",
    skills: ["Copywriting", "Direct Response", "Brand Storytelling", "SEO Copy", "Email Copy", "Ad Copy", "Landing Pages", "A/B Testing", "Tone of Voice", "Content Strategy", "Social Media Copy", "Product Descriptions", "Headlines", "CTAs"],
    experienceExample: { title: "Senior Copywriter", company: "ConvertCopy Agency", duration: "Mar 2020 – Present", bullets: ["Wrote direct response copy generating $5M+ in attributed revenue across email and paid channels", "Created landing page copy for 30+ campaigns with average conversion rate of 7.2%", "Developed brand voice guidelines adopted across 5 product lines for Fortune 500 client", "A/B tested 100+ headlines improving average CTR by 35%"] },
    educationExample: { degree: "B.A. in Communications", school: "Boston University", year: "2019" },
    tips: ["Include portfolio with conversion-focused examples", "Quantify revenue and conversion metrics from copy", "Show A/B testing and optimization experience", "List different copy formats you've written", "Demonstrate brand voice adaptability", "Include industry-specific writing experience"]
  },
  {
    slug: "systems-administrator",
    jobTitle: "Systems Administrator",
    category: "Technology",
    intro: "Systems administrators maintain IT infrastructure and ensure system reliability. Your ATS resume should highlight OS expertise, virtualization, and security management.",
    summaryExample: "Systems Administrator with 5+ years managing Windows and Linux server environments for 1,000+ user organizations. Maintained 99.99% uptime across 200+ servers. Expert in VMware, Active Directory, and cloud infrastructure. Reduced IT incidents by 40% through proactive monitoring and automation.",
    skills: ["Windows Server", "Linux (RHEL/Ubuntu)", "VMware", "Active Directory", "Azure AD", "PowerShell", "Bash", "Network Administration", "Backup & Recovery", "Patch Management", "Security Hardening", "Monitoring (Nagios/Zabbix)", "DNS/DHCP", "Office 365", "Ticketing Systems"],
    experienceExample: { title: "Senior Systems Administrator", company: "ITOps Solutions", duration: "Feb 2019 – Present", bullets: ["Managed 200+ Windows and Linux servers supporting 1,000+ users with 99.99% uptime", "Automated server provisioning and patch management using PowerShell reducing manual effort by 60%", "Implemented monitoring and alerting system reducing incident response time from 2 hours to 15 minutes", "Led migration of on-premise Exchange to Office 365 for 1,000+ mailboxes with zero downtime"] },
    educationExample: { degree: "B.S. in Information Technology", school: "WGU", year: "2017" },
    tips: ["Include certifications (MCSA, CompTIA Server+, RHCSA)", "Quantify server count and uptime metrics", "Show both Windows and Linux experience", "Include automation and scripting skills", "Demonstrate monitoring and incident response", "List virtualization and cloud platforms"]
  },
];

export default RESUME_EXAMPLES;

export function getResumeExampleBySlug(slug: string): ResumeExampleData | undefined {
  return RESUME_EXAMPLES.find((r) => r.slug === slug);
}

export function getAllSlugs(): string[] {
  return RESUME_EXAMPLES.map((r) => r.slug);
}

export function getRelatedExamples(currentSlug: string, count = 6): ResumeExampleData[] {
  const current = getResumeExampleBySlug(currentSlug);
  if (!current) return RESUME_EXAMPLES.slice(0, count);
  // Same category first, then others
  const sameCategory = RESUME_EXAMPLES.filter((r) => r.slug !== currentSlug && r.category === current.category);
  const others = RESUME_EXAMPLES.filter((r) => r.slug !== currentSlug && r.category !== current.category);
  return [...sameCategory, ...others].slice(0, count);
}
