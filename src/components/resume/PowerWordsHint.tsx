import { useMemo } from "react";
import { Flame } from "lucide-react";

interface Props {
  bullets: string[];
}

const WEAK_WORDS = ["helped", "worked on", "assisted", "was responsible for", "involved in", "participated in", "did", "made", "did work", "contributed to", "was part of", "did tasks", "handled", "was in charge of"];

const POWER_REPLACEMENTS: Record<string, string[]> = {
  "helped": ["Collaborated", "Supported", "Facilitated", "Enabled"],
  "worked on": ["Engineered", "Built", "Developed", "Executed"],
  "assisted": ["Spearheaded", "Coordinated", "Drove", "Championed"],
  "was responsible for": ["Led", "Managed", "Owned", "Oversaw"],
  "involved in": ["Delivered", "Launched", "Executed", "Drove"],
  "participated in": ["Contributed to", "Collaborated on", "Led", "Shaped"],
  "did": ["Built", "Created", "Developed", "Delivered"],
  "made": ["Engineered", "Designed", "Created", "Developed"],
  "handled": ["Managed", "Oversaw", "Directed", "Coordinated"],
  "was in charge of": ["Directed", "Led", "Managed", "Spearheaded"],
  "contributed to": ["Spearheaded", "Accelerated", "Drove", "Propelled"],
};

const POWER_STARTERS = [
  "Achieved", "Built", "Created", "Delivered", "Designed", "Developed", "Directed", "Drove", "Engineered",
  "Established", "Executed", "Generated", "Grew", "Implemented", "Improved", "Increased", "Launched",
  "Led", "Managed", "Optimized", "Orchestrated", "Reduced", "Scaled", "Shipped", "Spearheaded", "Streamlined",
];

export default function PowerWordsHint({ bullets }: Props) {
  const { weakFound, missingPower } = useMemo(() => {
    const allText = bullets.join(" ").toLowerCase();
    const weakFound = WEAK_WORDS.filter(w => allText.includes(w));

    const starterRegex = /^([A-Za-z]+)/;
    const usedStarters = bullets
      .map(b => b.trim())
      .filter(Boolean)
      .map(b => {
        const m = b.match(starterRegex);
        return m ? m[1].toLowerCase() : "";
      });

    const missingPower = bullets.length > 0 && !usedStarters.some(s =>
      POWER_STARTERS.map(p => p.toLowerCase()).includes(s)
    );

    return { weakFound, missingPower };
  }, [bullets]);

  if (weakFound.length === 0 && !missingPower) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-primary">
        <Flame className="h-3 w-3" />
        <span>Strong action verbs detected! Great work.</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-yellow-500" />
        <p className="text-xs font-semibold text-foreground">Power Words Check</p>
      </div>
      {weakFound.length > 0 && (
        <div className="space-y-1">
          {weakFound.slice(0, 2).map(w => (
            <p key={w} className="text-xs text-muted-foreground">
              ⚠ Replace <span className="font-medium italic text-foreground">"{w}"</span> →{" "}
              <span className="font-medium text-primary">{(POWER_REPLACEMENTS[w] || ["Led", "Drove", "Delivered"]).slice(0, 3).join(", ")}</span>
            </p>
          ))}
        </div>
      )}
      {missingPower && weakFound.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Start bullets with action verbs like <span className="font-medium text-primary">Led, Built, Drove, Scaled</span>
        </p>
      )}
    </div>
  );
}
