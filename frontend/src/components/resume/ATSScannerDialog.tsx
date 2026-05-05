import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScanSearch, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import type { ResumeData } from "@/components/resume/types";

function extractText(data: ResumeData): string {
  const parts: string[] = [];
  if (data.summary) parts.push(data.summary);
  if (data.skills?.length) parts.push(data.skills.join(" "));
  data.experience?.forEach((exp) => {
    if (exp.title) parts.push(exp.title);
    if (exp.company) parts.push(exp.company);
    if (exp.description) parts.push(exp.description);
    exp.bullets?.forEach((b) => parts.push(b));
  });
  data.education?.forEach((edu) => {
    if (edu.degree) parts.push(edu.degree);
    if (edu.school) parts.push(edu.school);
  });
  data.customSections?.forEach((s) => {
    if (s.title) parts.push(s.title);
    s.items?.forEach((i) => parts.push(i));
  });
  return parts.join(" ").toLowerCase();
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might", "can",
    "this", "that", "these", "those", "it", "its", "we", "our", "you", "your", "they",
    "their", "he", "she", "his", "her", "not", "no", "all", "each", "every", "both",
    "few", "more", "most", "other", "some", "such", "than", "too", "very", "just",
    "about", "above", "after", "again", "also", "any", "as", "because", "before",
    "between", "during", "into", "through", "under", "until", "up", "what", "when",
    "where", "which", "while", "who", "whom", "why", "how", "if", "then", "so",
    "work", "working", "worked", "experience", "role", "job", "position", "team",
    "company", "etc", "including", "using", "ability", "strong", "excellent",
    "required", "preferred", "must", "years", "minimum", "looking", "seeking",
    "responsible", "responsibilities", "requirements", "qualifications",
  ]);

  const words = text.toLowerCase().replace(/[^a-z0-9\s\-\+\#\.]/g, " ").split(/\s+/);
  const wordCount: Record<string, number> = {};

  words.forEach((w) => {
    const cleaned = w.trim();
    if (cleaned.length < 2 || stopWords.has(cleaned)) return;
    wordCount[cleaned] = (wordCount[cleaned] || 0) + 1;
  });

  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`.trim();
    if (phrase.length > 4 && !stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
      wordCount[phrase] = (wordCount[phrase] || 0) + 1;
    }
  }

  return Object.entries(wordCount)
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([word]) => word);
}

interface ATSScannerDialogProps {
  resumeData: ResumeData;
}

export default function ATSScannerDialog({ resumeData }: ATSScannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<{
    matched: string[];
    missing: string[];
    score: number;
  } | null>(null);

  const scan = () => {
    const resumeText = extractText(resumeData);
    const jdKeywords = extractKeywords(jobDescription);

    const matched: string[] = [];
    const missing: string[] = [];

    jdKeywords.forEach((kw) => {
      if (resumeText.includes(kw)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const score = jdKeywords.length > 0 ? Math.round((matched.length / jdKeywords.length) * 100) : 0;
    setResults({ matched, missing, score });
  };

  const scoreColor = results
    ? results.score >= 70 ? "text-green-600" : results.score >= 40 ? "text-yellow-600" : "text-destructive"
    : "";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResults(null); setJobDescription(""); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ScanSearch className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">ATS Scan</span>
          <span className="sm:hidden">ATS</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-primary" /> ATS Keyword Scanner
          </DialogTitle>
          <DialogDescription>
            Paste a job description to find missing keywords in your resume.
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4">
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={6}
              className="min-h-[150px]"
            />
            <Button onClick={scan} disabled={!jobDescription.trim()} className="w-full gap-2">
              <ScanSearch className="h-4 w-4" /> Scan Keywords
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Match Score</span>
                  <span className={`text-3xl font-bold font-mono ${scoreColor}`}>{results.score}%</span>
                </CardTitle>
                <CardDescription>
                  {results.score >= 70
                    ? "Great match! Your resume aligns well."
                    : results.score >= 40
                    ? "Fair match. Consider adding missing keywords."
                    : "Low match. Your resume may be filtered by ATS."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={results.score} className="h-2.5" />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" /> Matched ({results.matched.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {results.matched.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                      {kw}
                    </Badge>
                  ))}
                  {results.matched.length === 0 && (
                    <p className="text-xs text-muted-foreground">No matching keywords found.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" /> Missing ({results.missing.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {results.missing.slice(0, 30).map((kw) => (
                    <Badge key={kw} variant="outline" className="text-xs border-destructive/30 text-destructive">
                      {kw}
                    </Badge>
                  ))}
                  {results.missing.length === 0 && (
                    <p className="text-xs text-muted-foreground">All keywords matched! 🎉</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {results.score < 70 && (
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tip: Improve your match score</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add the missing keywords into your summary, skills, or experience bullets. Use "Tailor to Job" for AI-powered optimization.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={() => setResults(null)} className="w-full">
              Scan Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
