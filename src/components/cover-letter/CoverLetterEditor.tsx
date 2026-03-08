import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CoverLetterData } from "@/pages/CoverLetters";
import CoverLetterPreview from "./CoverLetterPreview";
import { generateCoverLetterPDF } from "./generateCoverLetterPDF";

interface Props {
  title: string;
  editData: CoverLetterData;
  setEditData: (data: CoverLetterData) => void;
  onBack: () => void;
  onSave: () => void;
}

export default function CoverLetterEditor({ title, editData, setEditData, onBack, onSave }: Props) {
  const update = (field: keyof CoverLetterData, value: string) => {
    setEditData({ ...editData, [field]: value });
  };

  // Check if it's a legacy cover letter (only has greeting/opening/body/closing)
  const isLegacy = !editData.applicant_name && !editData.value_experience && !editData.why_company && editData.body;

  const handleExportPDF = () => {
    generateCoverLetterPDF({
      title,
      data: editData,
      isLegacy: !!isLegacy,
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">← Back</Button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}><Download className="h-4 w-4 mr-2" />Export PDF</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {!isLegacy && (
            <>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={editData.applicant_name || ""} onChange={(e) => update("applicant_name", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Address / City</Label>
                  <Input value={editData.applicant_address || ""} onChange={(e) => update("applicant_address", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={editData.applicant_phone || ""} onChange={(e) => update("applicant_phone", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={editData.applicant_email || ""} onChange={(e) => update("applicant_email", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">LinkedIn / Portfolio</Label>
                  <Input value={editData.applicant_linkedin || ""} onChange={(e) => update("applicant_linkedin", e.target.value)} />
                </div>
              </div>

              <Separator />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recipient</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={editData.recipient_name || ""} onChange={(e) => update("recipient_name", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input value={editData.recipient_title || ""} onChange={(e) => update("recipient_title", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Company</Label>
                  <Input value={editData.company_name || ""} onChange={(e) => update("company_name", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Company Address</Label>
                  <Input value={editData.company_address || ""} onChange={(e) => update("company_address", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input value={editData.date || ""} onChange={(e) => update("date", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Subject Line</Label>
                  <Input value={editData.subject_line || ""} onChange={(e) => update("subject_line", e.target.value)} />
                </div>
              </div>

              <Separator />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Letter Content</h3>
            </>
          )}

          <div>
            <Label className="text-xs">Greeting</Label>
            <Input value={editData.greeting} onChange={(e) => update("greeting", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Opening / Hook</Label>
            <Textarea rows={4} value={editData.opening} onChange={(e) => update("opening", e.target.value)} />
          </div>

          {isLegacy ? (
            <div>
              <Label className="text-xs">Body</Label>
              <Textarea rows={8} value={editData.body || ""} onChange={(e) => update("body", e.target.value)} />
            </div>
          ) : (
            <>
              <div>
                <Label className="text-xs">Your Value & Experience</Label>
                <Textarea rows={5} value={editData.value_experience || ""} onChange={(e) => update("value_experience", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Why This Company</Label>
                <Textarea rows={4} value={editData.why_company || ""} onChange={(e) => update("why_company", e.target.value)} />
              </div>
            </>
          )}

          <div>
            <Label className="text-xs">Closing / Call to Action</Label>
            <Textarea rows={3} value={editData.closing} onChange={(e) => update("closing", e.target.value)} />
          </div>

          {!isLegacy && (
            <div>
              <Label className="text-xs">Sign-off</Label>
              <Input value={editData.sign_off || "Sincerely,"} onChange={(e) => update("sign_off", e.target.value)} />
            </div>
          )}
        </div>

        {/* Preview */}
        <Card className="sticky top-4 self-start overflow-hidden">
          <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
          <CardContent>
            <div>
              <CoverLetterPreview data={editData} isLegacy={!!isLegacy} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
