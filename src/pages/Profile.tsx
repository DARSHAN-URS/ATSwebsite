import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Mail, Phone, MapPin, Shield, Crown, Zap, Settings, Camera, Loader2, LogOut, Trash2
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { invokeFunction } from "@/lib/api-client";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { isPro } = useSubscription();
  const { toast } = useToast();

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const [name, setName] = useState(displayName);
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [location, setLocation] = useState(user?.user_metadata?.location || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    const avatarPath = user?.user_metadata?.avatar_url;
    if (avatarPath) {
      import("@/lib/storageUtils").then(({ resolvePhotoUrl }) => {
        resolvePhotoUrl(avatarPath).then(setResolvedAvatarUrl);
      });
    }
  }, [user?.user_metadata?.avatar_url]);

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: name, phone, location }
      });
      if (error) throw error;
      toast({ title: "Profile Synchronized" });
    } catch (err: any) {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("resume-photos").upload(path, file);
      if (uploadError) throw uploadError;
      await supabase.auth.updateUser({ data: { avatar_url: path } });
      toast({ title: "Module Updated" });
    } catch (err: any) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const [cancelling, setCancelling] = useState(false);
  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your Pro subscription? You will lose access to premium features immediately.")) return;
    
    setCancelling(true);
    try {
      const { error } = await invokeFunction("cancel-subscription", {});
      if (error) throw error;
      toast({ title: "Subscription Cancelled" });
      // Reload page to reflect changes
      window.location.reload();
    } catch (err: any) {
      toast({ title: "Cancellation failed", description: err.message, variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 space-y-16 font-sans">
      <SEOHead title="Account Architecture — ResumePro" description="Manage your professional infrastructure and authentication protocols." />
      
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-12">
        <div className="space-y-4">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                 <Settings className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Account Settings</span>
           </motion.div>
           <h1 className="text-6xl md:text-[7rem] font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">
              My <br /> <span className="text-blue-600">Account.</span>
           </h1>
           <p className="text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
              Manage your professional credentials, subscription tier, and security protocols from a centralized interface.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         <div className="xl:col-span-4 space-y-10">
            <Card className="rounded-[4rem] border-none bg-slate-50/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10 flex flex-col items-center text-center">
               <div className="relative group">
                  <Avatar className="w-40 h-40 rounded-[3rem] border-4 border-white shadow-2xl">
                     <AvatarImage src={resolvedAvatarUrl || ""} />
                     <AvatarFallback className="bg-blue-600 text-white text-4xl font-black">{name[0]}</AvatarFallback>
                  </Avatar>
                  <button onClick={() => photoInputRef.current?.click()} className="absolute bottom-0 right-0 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100">
                     {uploadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </button>
                  <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
               </div>
               <h2 className="text-3xl font-black text-slate-900 mt-8 tracking-tight">{name}</h2>
               <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">{user?.email}</p>
               
               <div className="w-full mt-10 space-y-4">
                  {isPro ? (
                     <div className="p-6 rounded-3xl bg-blue-600 text-white flex items-center justify-between shadow-xl shadow-blue-600/30">
                        <div className="flex items-center gap-3">
                           <Crown className="w-5 h-5" />
                           <span className="font-black text-xs uppercase tracking-widest">Pro Member</span>
                        </div>
                        <Shield className="w-5 h-5" />
                     </div>
                  ) : (
                     <div className="p-6 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Zap className="w-5 h-5" />
                           <span className="font-black text-xs uppercase tracking-widest">Free Plan</span>
                        </div>
                     </div>
                  )}
                  <Button onClick={() => signOut()} variant="outline" className="w-full h-14 rounded-2xl border-slate-100 text-rose-500 font-black uppercase tracking-widest text-[10px] gap-3">
                     <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
               </div>
            </Card>
         </div>

         <div className="xl:col-span-8 space-y-10">
            <Card className="rounded-[4rem] border-none bg-white shadow-[0_40px_80px_rgba(0,0,0,0.06)] p-12 border border-slate-50">
               <div className="space-y-10">
                  <div className="flex items-center gap-3">
                     <User className="w-5 h-5 text-blue-600" />
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Personal Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6" />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                        <Input value={user?.email} disabled className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-bold px-6 text-slate-400" />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 555-000-0000" className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6" />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</Label>
                        <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. New York, USA" className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6" />
                     </div>
                  </div>
                  <div className="flex justify-end pt-6">
                     <Button onClick={handleUpdateProfile} disabled={savingProfile} className="h-16 px-16 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-blue-600/30 gap-4 hover:scale-105 transition-all">
                        {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                        Save Changes
                     </Button>
                  </div>
               </div>
            </Card>

            <Card className="rounded-[4rem] border-none bg-white shadow-[0_40px_80px_rgba(0,0,0,0.06)] p-12 border border-slate-50">
               <div className="space-y-10">
                  <div className="flex items-center gap-3">
                     <Crown className="w-5 h-5 text-blue-600" />
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Billing & Subscription</h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="text-xl font-black text-slate-900">{isPro ? "Pro Subscription" : "Free Tier"}</span>
                           {isPro && <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>}
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                           {isPro 
                              ? "You have full access to all premium intelligence features, unlimited resumes, and AI grading."
                              : "You are currently on the free tier with basic access. Upgrade to unlock AI features."}
                        </p>
                     </div>
                     <div className="flex flex-col gap-3 shrink-0">
                        {!isPro ? (
                           <Button onClick={() => window.location.href = "/upgrade"} className="h-12 px-8 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">
                              Upgrade to Pro
                           </Button>
                        ) : (
                           <>
                              <Button onClick={() => window.location.href = "/upgrade"} variant="outline" className="h-12 px-8 border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-100 transition-all">
                                 Change Plan
                              </Button>
                              <Button onClick={handleCancelSubscription} disabled={cancelling} variant="ghost" className="h-12 px-8 text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-xs rounded-xl transition-all">
                                 {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                 Cancel Plan
                              </Button>
                           </>
                        )}
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="rounded-[3rem] border-none bg-rose-50 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-black text-rose-600 tracking-tight">Delete Account</h3>
                  <p className="text-rose-600/70 font-medium text-sm">Permanently delete all your data and account information.</p>
               </div>
               <Button variant="ghost" className="h-14 px-10 rounded-2xl bg-white text-rose-600 font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 hover:text-white transition-all gap-3">
                  <Trash2 className="w-4 h-4" /> Delete Forever
               </Button>
            </Card>
         </div>
      </div>
    </div>
  );
}
