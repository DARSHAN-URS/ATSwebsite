import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, Globe, Users, Save, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
  "Retail", "Media", "Consulting", "Real Estate", "Hospitality", "Other",
];

const companySizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export default function RecruiterCompany() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    website: "",
    industry: "",
    company_size: "",
    description: "",
    logo_url: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("recruiter_companies" as any)
        .select("*")
        .eq("recruiter_id", user.id)
        .maybeSingle();
      if (data) {
        const d = data as any;
        setForm({
          company_name: d.company_name || "",
          website: d.website || "",
          industry: d.industry || "",
          company_size: d.company_size || "",
          description: d.description || "",
          logo_url: d.logo_url || "",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.company_name) return;
    setSaving(true);

    const payload = {
      recruiter_id: user.id,
      company_name: form.company_name,
      website: form.website || null,
      industry: form.industry || null,
      company_size: form.company_size || null,
      description: form.description || null,
      logo_url: form.logo_url || null,
    };

    const { error } = await supabase
      .from("recruiter_companies" as any)
      .upsert(payload as any, { onConflict: "recruiter_id" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Company profile saved!" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <SEOHead title="Company Profile — ATS Pro" description="Set up your employer profile." noindex />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6" /> Company Profile
        </h1>
        <p className="text-muted-foreground">Set up your company information to display on job listings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>This information will be shown to candidates on your job posts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Company Name *</Label>
            <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Acme Inc." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1"><Globe className="h-3 w-3" /> Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1"><Users className="h-3 w-3" /> Company Size</Label>
              <Select value={form.company_size} onValueChange={(v) => setForm({ ...form, company_size: v })}>
                <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                <SelectContent>
                  {companySizes.map((s) => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell candidates about your company, culture, and mission..."
              rows={5}
            />
          </div>

          <Button onClick={handleSave} disabled={saving || !form.company_name} className="w-full sm:w-auto">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Profile</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
