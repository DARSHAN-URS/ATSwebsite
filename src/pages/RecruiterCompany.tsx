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
      toast({ title: "Module Synchronized", description: "Your organizational identity has been updated." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Organizational Data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <SEOHead title="Company Profile — ResumePro" description="Set up your employer profile." noindex />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
               <Building2 className="w-4 h-4" />
               <span className="text-[9px] font-black uppercase tracking-widest">Organizational Core</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
               Company <br /> <span className="text-blue-600">Identity.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
               Define your brand architecture to attract elite talent and deploy a consistent employer narrative across all job missions.
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
               <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-12 space-y-10">
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Company Legal Name</Label>
                           <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Acme Inc." className="h-20 rounded-[2rem] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 px-8 font-bold text-lg focus:ring-blue-600/10" />
                        </div>
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Logo Source URL</Label>
                           <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." className="h-20 rounded-[2rem] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 px-8 font-bold focus:ring-blue-600/10" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 flex items-center gap-2">
                              <Globe className="w-3 h-3" /> Digital Domain
                           </Label>
                           <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" className="h-20 rounded-[2rem] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 px-8 font-bold focus:ring-blue-600/10" />
                        </div>
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 flex items-center gap-2">
                              <Users className="w-3 h-3" /> Operational Scale
                           </Label>
                           <Select value={form.company_size} onValueChange={(v) => setForm({ ...form, company_size: v })}>
                              <SelectTrigger className="h-20 rounded-[2rem] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 px-8 font-bold focus:ring-blue-600/10">
                                 <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-none shadow-2xl">
                                 {companySizes.map((s) => <SelectItem key={s} value={s} className="rounded-xl font-bold">{s} employees</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Industry Sector</Label>
                        <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                           <SelectTrigger className="h-20 rounded-[2rem] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 px-8 font-bold focus:ring-blue-600/10">
                              <SelectValue placeholder="Select industry" />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl border-none shadow-2xl">
                              {industries.map((i) => <SelectItem key={i} value={i} className="rounded-xl font-bold">{i}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Organizational Narrative</Label>
                        <Textarea
                           value={form.description}
                           onChange={(e) => setForm({ ...form, description: e.target.value })}
                           placeholder="Define your mission, culture, and architectural goals..."
                           className="min-h-[200px] rounded-[2rem] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 p-8 font-medium focus:ring-blue-600/10 text-lg leading-relaxed"
                        />
                     </div>
                  </div>

                  <div className="pt-6">
                     <Button onClick={handleSave} disabled={saving || !form.company_name} className="w-full md:w-auto h-20 px-12 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] gap-4 shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all active:scale-95">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Synchronize Module
                     </Button>
                  </div>
               </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <Card className="rounded-[3rem] border-none bg-slate-900 p-10 text-white space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Building2 className="w-24 h-24" /></div>
                  <h4 className="text-2xl font-black tracking-tight leading-tight">Identity <br /> Blueprint.</h4>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed">Your company profile is the primary interface for potential candidates. Ensure all data vectors are accurate to maximize talent acquisition efficiency.</p>
                  <div className="pt-4 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <Zap className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Talent Visibility</p>
                        <p className="text-sm font-bold text-white">Enhanced Protocol</p>
                     </div>
                  </div>
               </Card>

               <div className="p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employer Branding</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Organizations with a defined identity see a 40% increase in candidate response rates.</p>
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 text-blue-600 font-black uppercase tracking-widest text-[9px]">Preview Profile</Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

