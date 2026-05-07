import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  User, Mail, Phone, MapPin, Lock, Shield, Trash2, Crown, Zap,
  Eye, EyeOff, CreditCard, Receipt, CheckCircle, AlertTriangle, Camera, Building2, ChevronRight, ArrowRight, Settings
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { accountTranslations } from "@/i18n/accountTranslations";
import { motion } from "framer-motion";

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { subscription, status, isPro } = useSubscription();
  const { formatPrice, formatProPrice, symbol, proPrices } = useLocalCurrency();
  const { t, locale } = useLanguage();
  const ta = accountTranslations[locale];
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role } = useUserRole();

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const [name, setName] = useState(displayName);
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [location, setLocation] = useState(user?.user_metadata?.location || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  const avatarFallback = (name || displayName).charAt(0).toUpperCase();

  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const avatarPath = user?.user_metadata?.avatar_url;
    if (avatarPath) {
      import("@/lib/storageUtils").then(({ resolvePhotoUrl }) => {
        resolvePhotoUrl(avatarPath).then((url) => {
          if (!cancelled) setResolvedAvatarUrl(url);
        });
      });
    } else {
      setResolvedAvatarUrl(null);
    }
    return () => { cancelled = true; };
  }, [user?.user_metadata?.avatar_url]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("resume-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      await supabase.auth.updateUser({ data: { avatar_url: path } });
      toast({ title: "Photo updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ data: { display_name: name, phone, location } });
    if (error) {
      toast({ title: t.common.error, description: error.message, variant: "destructive" });
    } else {
      await supabase.from("profiles").update({ display_name: name }).eq("user_id", user!.id);
      toast({ title: ta.profileUpdated, description: ta.profileUpdatedDesc });
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: ta.passwordsDontMatchTitle, variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: ta.passwordTooShort, description: ta.passwordTooShortDesc, variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: t.common.error, description: error.message, variant: "destructive" });
    } else {
      toast({ title: ta.passwordUpdated, description: ta.passwordUpdatedDesc });
      setPasswordDialog(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: t.common.error, description: error.message, variant: "destructive" });
    } else {
      toast({ title: ta.resetSent, description: ta.resetSentDesc });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeletingAccount(true);
    const uid = user!.id;
    await Promise.all([
      supabase.from("resumes").delete().eq("user_id", uid),
      supabase.from("cover_letters").delete().eq("user_id", uid),
      supabase.from("job_applications").delete().eq("user_id", uid),
      supabase.from("saved_jobs").delete().eq("user_id", uid),
      supabase.from("pinned_companies").delete().eq("user_id", uid),
      supabase.from("ai_apply_queue").delete().eq("user_id", uid),
      supabase.from("email_outreach_history").delete().eq("user_id", uid),
    ]);
    await supabase.auth.signOut();
    toast({ title: ta.accountDeleted, description: ta.accountDeletedDesc });
    navigate("/");
    setDeletingAccount(false);
  };

  const passwordValid =
    newPassword.length >= 6 &&
    /[A-Z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    newPassword === confirmPassword;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <SEOHead title="Account Settings — ResumePro" description="Manage your profile, password, subscription, and billing." />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Account <span className="text-primary">Settings</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your personal information and preferences.</p>
        </div>
        <Button variant="outline" onClick={() => signOut()} className="rounded-xl border-slate-200 font-bold px-6">
           Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <CardHeader className="p-10 pb-0 flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black">{ta.profileInfo}</CardTitle>
              <CardDescription className="font-medium">{ta.profileDesc}</CardDescription>
            </div>
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-2xl">
                <AvatarImage src={resolvedAvatarUrl || undefined} alt={name} />
                <AvatarFallback className="bg-primary text-white text-3xl font-black">{avatarFallback}</AvatarFallback>
              </Avatar>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <button
                className="absolute bottom-0 right-0 h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xl hover:bg-primary transition-all group-hover:scale-110"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.fullName}</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-11 rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={user?.email || ""} disabled className="pl-11 rounded-xl h-12 bg-slate-50/50 dark:bg-slate-800/50 border-none cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.phoneNumber}</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" className="pl-11 rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.locationLabel}</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="pl-11 rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
               <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-slate-900 dark:bg-slate-800 text-white font-black uppercase tracking-widest text-xs px-10 h-12 rounded-xl shadow-xl shadow-slate-900/10 hover:bg-primary transition-all">
                 {savingProfile ? "Saving..." : ta.saveProfile}
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        {role !== "recruiter" && (
           <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-l-4 border-l-primary">
             <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                   <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl ${isPro ? "bg-primary shadow-primary/30" : "bg-slate-400 shadow-slate-400/30"}`}>
                      {isPro ? <Crown className="w-10 h-10" /> : <Zap className="w-10 h-10" />}
                   </div>
                   <div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-2xl font-black">{isPro ? "Pro Plan" : "Free Plan"}</h3>
                         <Badge className={isPro ? "bg-primary" : "bg-slate-100 text-slate-500"}>{isPro ? "Active" : "Standard"}</Badge>
                      </div>
                      <p className="text-slate-500 font-medium mt-1">{isPro ? "Unlimited AI features and priority support." : "Upgrade to unlock advanced AI capabilities."}</p>
                   </div>
                </div>
                <Button onClick={() => navigate("/pricing")} className="bg-primary text-white font-black uppercase tracking-widest text-xs px-10 h-14 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                  {isPro ? "Manage Subscription" : "Upgrade to Pro"}
                </Button>
             </CardContent>
           </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Password & Security */}
           <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <CardHeader className="p-8">
                 <CardTitle className="text-xl font-black">{ta.passwordSecurity}</CardTitle>
                 <CardDescription className="font-medium">{ta.passwordSecurityDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                 <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold justify-between group" onClick={() => setPasswordDialog(true)}>
                    <div className="flex items-center gap-2">
                       <Lock className="w-4 h-4 text-slate-400" />
                       {ta.changePassword}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                 </Button>
                 <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold justify-between group" onClick={handleForgotPassword}>
                    <div className="flex items-center gap-2">
                       <Mail className="w-4 h-4 text-slate-400" />
                       {ta.sendResetEmail}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                 </Button>
              </CardContent>
           </Card>

           {/* Dangerous Area */}
           <Card className="rounded-[2.5rem] border-red-50 dark:border-red-900/20 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <CardHeader className="p-8">
                 <CardTitle className="text-xl font-black text-red-600">{ta.deleteAccount}</CardTitle>
                 <CardDescription className="font-medium">{ta.deleteAccountDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                 <AlertDialog>
                   <AlertDialogTrigger asChild>
                     <Button variant="ghost" className="w-full h-12 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 font-bold hover:bg-red-100 hover:text-red-700">
                       {ta.deleteMyAccount}
                     </Button>
                   </AlertDialogTrigger>
                   <AlertDialogContent className="rounded-[2rem]">
                     <AlertDialogHeader>
                       <AlertDialogTitle className="text-2xl font-black text-red-600">Are you absolutely sure?</AlertDialogTitle>
                       <AlertDialogDescription className="font-medium">
                         This will permanently delete your resumes, cover letters, and application history. This action cannot be undone.
                         <div className="mt-4 p-4 bg-red-50 rounded-xl text-red-700 text-xs font-bold uppercase tracking-widest">
                            Type <span className="underline">DELETE</span> below to confirm.
                         </div>
                       </AlertDialogDescription>
                     </AlertDialogHeader>
                     <Input 
                       value={deleteConfirmText} 
                       onChange={(e) => setDeleteConfirmText(e.target.value)} 
                       className="rounded-xl h-12 border-red-100 focus:ring-red-500" 
                     />
                     <AlertDialogFooter>
                       <AlertDialogCancel className="rounded-xl h-12 font-bold">Cancel</AlertDialogCancel>
                       <AlertDialogAction 
                         onClick={handleDeleteAccount} 
                         disabled={deleteConfirmText !== "DELETE" || deletingAccount}
                         className="rounded-xl h-12 bg-red-600 text-white font-bold hover:bg-red-700"
                       >
                         {deletingAccount ? "Deleting..." : "Delete Forever"}
                       </AlertDialogAction>
                     </AlertDialogFooter>
                   </AlertDialogContent>
                 </AlertDialog>
              </CardContent>
           </Card>
        </div>
      </div>

      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
         <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
                   <Lock className="h-6 w-6 text-white" />
                 </div>
                 <DialogTitle className="text-2xl font-black tracking-tight">{ta.changePassword}</DialogTitle>
                 <p className="text-slate-400 text-sm font-medium mt-2">{ta.changePasswordDesc}</p>
              </div>
           </div>
           <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.newPassword}</Label>
                   <div className="relative">
                     <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl h-11 pr-10" />
                     <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowNew(!showNew)}>
                       {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.confirmNewPassword}</Label>
                   <div className="relative">
                     <Input type={showCurrent ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl h-11 pr-10" />
                     <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowCurrent(!showCurrent)}>
                       {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                 </div>
              </div>
              <Button onClick={handleChangePassword} disabled={!passwordValid || savingPassword} className="w-full bg-primary text-white font-black h-12 rounded-xl">
                 {savingPassword ? "Updating..." : ta.updatePassword}
              </Button>
           </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
