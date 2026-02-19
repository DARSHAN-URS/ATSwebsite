import { useMemo } from "react";
import type { ResumeData } from "./types";
import { CheckCircle2, Circle, AlertCircle, ChevronRight } from "lucide-react";

interface Props {
  resumeData: ResumeData;
  title: string;
}

interface SectionCheck {
  label: string;
  done: boolean;
  hint: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? "hsl(var(--primary))" :
    score >= 50 ? "hsl(38 92% 50%)" :
    "hsl(0 72% 56%)";

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="rotate-[-90deg]">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
      <circle
        cx="44" cy="44" r={radius} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export default function ResumeCompletionScore({ resumeData, title }: Props) {
  const { score, checks } = useMemo(() => {
    const pi = resumeData.personalInfo || {};
    const checks: SectionCheck[] = [
      {
        label: "Resume title",
        done: !!title && title !== "Untitled Resume",
        hint: "Give your resume a meaningful name",
      },
      {
        label: "Full name",
        done: !!pi.fullName?.trim(),
        hint: "Add your full name",
      },
      {
        label: "Contact info",
        done: !!(pi.email?.trim() && pi.phone?.trim()),
        hint: "Add email and phone number",
      },
      {
        label: "Location",
        done: !!(pi.location?.trim()),
        hint: "Add your city or location",
      },
      {
        label: "Professional summary",
        done: !!(resumeData.summary?.trim() && resumeData.summary.length > 50),
        hint: "Write at least 2–3 sentences",
      },
      {
        label: "Skills (5+)",
        done: (resumeData.skills || []).length >= 5,
        hint: "Add at least 5 relevant skills",
      },
      {
        label: "Work experience",
        done: (resumeData.experience || []).length > 0,
        hint: "Add at least one job position",
      },
      {
        label: "Experience bullets",
        done: (resumeData.experience || []).some(e => e.bullets && e.bullets.length >= 2),
        hint: "Add 2+ bullet points to a job",
      },
      {
        label: "Education",
        done: (resumeData.education || []).length > 0,
        hint: "Add your highest education",
      },
      {
        label: "LinkedIn / Portfolio",
        done: !!(pi.linkedin?.trim() || pi.portfolio?.trim()),
        hint: "Add a LinkedIn profile or portfolio URL",
      },
    ];

    const doneCount = checks.filter(c => c.done).length;
    const score = Math.round((doneCount / checks.length) * 100);
    return { score, checks };
  }, [resumeData, title]);

  const label =
    score >= 85 ? "Excellent" :
    score >= 65 ? "Good" :
    score >= 40 ? "Fair" :
    "Needs Work";

  const labelColor =
    score >= 85 ? "text-primary" :
    score >= 65 ? "text-yellow-600 dark:text-yellow-400" :
    "text-destructive";

  const incomplete = checks.filter(c => !c.done);

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume Score</p>
          <p className={`text-2xl font-bold ${labelColor}`}>{score}% <span className="text-sm font-medium">{label}</span></p>
        </div>
        <div className="relative">
          <ScoreRing score={score} />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold rotate-[90deg]">{score}</span>
        </div>
      </div>

      {/* Progress checks */}
      <div className="space-y-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            {c.done
              ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              : <Circle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
            <span className={c.done ? "text-foreground" : "text-muted-foreground line-through decoration-muted-foreground/40"}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Next action */}
      {incomplete.length > 0 && (
        <div className="rounded-lg bg-muted/50 border border-border/50 p-2.5 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">Next step</p>
            <p className="text-xs text-muted-foreground">{incomplete[0].hint}</p>
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
        </div>
      )}
    </div>
  );
}
