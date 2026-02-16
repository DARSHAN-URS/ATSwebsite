import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ScanSearch, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import type { Tables } from "@/integrations/supabase/types";
import type { ResumeData } from "@/components/resume/types";

type Resume = Tables<"resumes">;

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
  // Common stop words to filter out
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

  // Also extract 2-word phrases
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

export default function ATSKeywordScanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<{
    matched: string[];
    missing: string[];
    score: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("resumes").select("*").then(({ data }) => {
      if (data) setResumes(data);
    });
  }, [user]);

  const scan = () => {
    const resume = resumes.find((r) => r.id === selectedResumeId);
    if (!resume || !jobDescription.trim()) return;

    const resumeData = resume.resume_data as unknown as ResumeData;
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
    ? results.score >= 70 ? "text-success" : results.score >= 40 ? "text-warning" : "text-destructive"
    : "";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <SEOHead title="ATS Keyword Scanner — ATS Pro Resume Builder" description="Compare your resume keywords against a job description." noindex />
      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ScanSearch className="h-6 w-6 text-primary" /> ATS Keyword Scanner
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Compare your resume against a job description to find missing keywords.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a resume..." />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={5}
            />
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={scan}
        disabled={!selectedResumeId || !jobDescription.trim()}
        className="w-full md:w-auto gap-2"
      >
        <ScanSearch className="h-4 w-4" /> Scan Keywords
      </Button>

      {results && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Keyword Match Score</span>
                <span className={`text-3xl font-bold font-mono ${scoreColor}`}>{results.score}%</span>
              </CardTitle>
              <CardDescription>
                {results.score >= 70
                  ? "Great match! Your resume aligns well with this job."
                  : results.score >= 40
                  ? "Fair match. Consider adding some missing keywords."
                  : "Low match. Your resume may be filtered by ATS systems."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={results.score} className="h-2.5" />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" /> Matched ({results.matched.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {results.matched.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
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
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tip: Improve your match score</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adding the missing keywords naturally into your resume summary, skills section, or experience bullet points. Use the "Tailor to Job" feature for AI-powered optimization.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate("/resumes")}>
                    Go to Resume Editor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
