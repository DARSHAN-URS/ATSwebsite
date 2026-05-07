import { useMemo } from "react";
import { Zap, Plus } from "lucide-react";

interface Props {
  jobTitle: string;
  currentSkills: string[];
  onAdd: (skill: string) => void;
}

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  "software": ["React", "TypeScript", "Node.js", "REST APIs", "CI/CD", "Docker", "AWS", "Git", "Agile", "SQL", "Microservices", "GraphQL"],
  "data": ["Python", "SQL", "Tableau", "Power BI", "Machine Learning", "Pandas", "NumPy", "Data Visualization", "ETL", "Statistics", "Excel", "R"],
  "product": ["Product Roadmap", "Agile", "Scrum", "User Research", "A/B Testing", "KPIs", "Stakeholder Management", "Jira", "Wireframing", "Figma"],
  "design": ["Figma", "UI/UX", "Prototyping", "User Research", "Wireframing", "Adobe XD", "Design Systems", "Accessibility", "Motion Design"],
  "marketing": ["SEO", "Google Analytics", "Content Strategy", "Social Media", "Email Marketing", "HubSpot", "Copywriting", "PPC", "Brand Strategy", "CRM"],
  "sales": ["CRM", "Salesforce", "Lead Generation", "Negotiation", "Account Management", "Pipeline Management", "B2B Sales", "Cold Outreach", "HubSpot"],
  "finance": ["Financial Modeling", "Excel", "SQL", "Bloomberg", "Valuation", "Due Diligence", "Risk Analysis", "Budgeting", "FP&A", "QuickBooks"],
  "hr": ["Recruiting", "HRIS", "Talent Acquisition", "Employee Relations", "Performance Management", "Onboarding", "Workday", "ATS", "Employment Law"],
  "project": ["PMP", "Agile", "Scrum", "Risk Management", "MS Project", "Stakeholder Management", "Budgeting", "Jira", "Cross-functional Teams"],
  "healthcare": ["HIPAA", "EHR/EMR", "Patient Care", "Clinical Documentation", "Epic", "ICD-10", "Care Coordination", "FHIR"],
  "teacher": ["Curriculum Development", "Classroom Management", "Differentiated Instruction", "Assessment Design", "Google Classroom", "EdTech"],
  "accountant": ["GAAP", "QuickBooks", "Tax Preparation", "Financial Reporting", "Audit", "Excel", "SAP", "Balance Sheet", "Reconciliation"],
  "manager": ["Team Leadership", "P&L Management", "Strategic Planning", "KPIs", "Coaching", "Budget Management", "Change Management", "OKRs"],
  "devops": ["Kubernetes", "Docker", "Terraform", "CI/CD", "Jenkins", "AWS", "Linux", "Monitoring", "Bash", "Helm", "GitOps"],
  "cybersecurity": ["SIEM", "Penetration Testing", "SOC", "OWASP", "Network Security", "IAM", "CISSP", "Incident Response", "Vulnerability Assessment"],
};

function matchIndustry(jobTitle: string): string[] {
  const lower = jobTitle.toLowerCase();
  for (const [key, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (lower.includes(key)) return keywords;
  }
  // Fallback keyword groups
  if (lower.includes("engineer") || lower.includes("developer") || lower.includes("frontend") || lower.includes("backend") || lower.includes("full")) {
    return INDUSTRY_KEYWORDS["software"];
  }
  if (lower.includes("analyst") || lower.includes("scientist") || lower.includes("data")) {
    return INDUSTRY_KEYWORDS["data"];
  }
  if (lower.includes("manag")) return INDUSTRY_KEYWORDS["manager"];
  if (lower.includes("market")) return INDUSTRY_KEYWORDS["marketing"];
  if (lower.includes("design")) return INDUSTRY_KEYWORDS["design"];
  if (lower.includes("product")) return INDUSTRY_KEYWORDS["product"];
  return [];
}

export default function IndustryKeywords({ jobTitle, currentSkills, onAdd }: Props) {
  const suggestions = useMemo(() => {
    if (!jobTitle?.trim()) return [];
    const matched = matchIndustry(jobTitle);
    const lowerCurrent = currentSkills.map(s => s.toLowerCase());
    return matched.filter(k => !lowerCurrent.includes(k.toLowerCase())).slice(0, 10);
  }, [jobTitle, currentSkills]);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold text-primary">Trending keywords for <span className="italic">{jobTitle}</span></p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((kw) => (
          <button
            key={kw}
            onClick={() => onAdd(kw)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
          >
            <Plus className="h-2.5 w-2.5" />
            {kw}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">Click to add to your skills</p>
    </div>
  );
}
