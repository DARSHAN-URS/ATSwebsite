import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Languages } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LanguageItem } from "./types";

interface Props {
  languages: LanguageItem[];
  onChange: (languages: LanguageItem[]) => void;
}

const proficiencyLevels = ["native", "fluent", "advanced", "intermediate", "beginner"] as const;

export default function LanguagesEditor({ languages, onChange }: Props) {
  const { t } = useLanguage();

  const addLanguage = () => {
    onChange([...languages, { name: "", proficiency: "intermediate" }]);
  };

  const update = (index: number, field: keyof LanguageItem, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const remove = (index: number) => {
    onChange(languages.filter((_, i) => i !== index));
  };

  const proficiencyLabel = (level: string) => {
    const map: Record<string, string> = {
      native: t.resumes.native,
      fluent: t.resumes.fluent,
      advanced: t.resumes.advanced,
      intermediate: t.resumes.intermediate,
      beginner: t.resumes.beginner,
    };
    return map[level] || level;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {t.resumes.languages}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {languages.map((lang, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={lang.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder={t.resumes.language}
                className="h-8 text-sm"
              />
            </div>
            <Select value={lang.proficiency} onValueChange={(v) => update(i, "proficiency", v)}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {proficiencyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {proficiencyLabel(level)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => remove(i)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addLanguage} className="text-xs">
          <Plus className="h-3 w-3 mr-1" />{t.resumes.addLanguage}
        </Button>
      </CardContent>
    </Card>
  );
}
