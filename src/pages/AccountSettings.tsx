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
  Eye, EyeOff, CreditCard, Receipt, CheckCircle, AlertTriangle, Camera, Building2
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { accountTranslations } from "@/i18n/accountTranslations";

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

  // Resolve avatar storage path to signed URL
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
      // Store the storage path (not a public URL) for security
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

  const PLAN_FEATURES = {
    free: [ta.freeFeature1, ta.freeFeature2, ta.freeFeature3, ta.freeFeature4],
    pro: [ta.proFeature1, ta.proFeature2, ta.proFeature3, ta.proFeature4, ta.proFeature5, ta.proFeature6, ta.proFeature7],
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <SEOHead title="Account Settings — ATS Pro Resume Builder" description="Manage your profile, password, subscription, and billing." />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{ta.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{ta.subtitle}</p>
      </div>

      {/* PROFILE INFO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" /> {ta.profileInfo}
          </CardTitle>
          <CardDescription>{ta.profileDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={resolvedAvatarUrl || undefined} alt={name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">{avatarFallback}</AvatarFallback>
              </Avatar>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <button
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="acc-name" className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {ta.fullName}</Label>
              <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={ta.fullName} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-email" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {ta.email}</Label>
              <Input id="acc-email" value={user?.email || ""} disabled className="opacity-60 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-phone" className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {ta.phoneNumber}</Label>
              <Input id="acc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-location" className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {ta.locationLabel}</Label>
              <Input id="acc-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto">
            {savingProfile ? ta.saving : ta.saveProfile}
          </Button>
        </CardContent>
      </Card>

      {/* PASSWORD MANAGEMENT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" /> {ta.passwordSecurity}
          </CardTitle>
          <CardDescription>{ta.passwordSecurityDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 gap-2">
                  <Lock className="h-4 w-4" /> {ta.changePassword}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{ta.changePassword}</DialogTitle>
                  <DialogDescription>{ta.changePasswordDesc}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label>{ta.newPassword}</Label>
                    <div className="relative">
                      <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={ta.newPassword} className="pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className={newPassword.length >= 6 ? "text-green-500" : "text-muted-foreground"}>✓ {ta.sixChars}</span>
                      <span className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-muted-foreground"}>✓ {ta.uppercase}</span>
                      <span className={/[0-9]/.test(newPassword) ? "text-green-500" : "text-muted-foreground"}>✓ {ta.number}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{ta.confirmNewPassword}</Label>
                    <div className="relative">
                      <Input type={showCurrent ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={ta.confirmNewPassword} className="pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCurrent(!showCurrent)}>
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <p className={`text-xs ${newPassword === confirmPassword ? "text-green-500" : "text-destructive"}`}>
                        {newPassword === confirmPassword ? ta.passwordsMatch : ta.passwordsDontMatch}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordDialog(false)}>{ta.cancel}</Button>
                  <Button onClick={handleChangePassword} disabled={!passwordValid || savingPassword}>
                    {savingPassword ? ta.updating : ta.updatePassword}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex-1 gap-2" onClick={handleForgotPassword}>
              <Mail className="h-4 w-4" /> {ta.sendResetEmail}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{ta.twoFactorTitle}</p>
                <p className="text-xs text-muted-foreground">{ta.twoFactorDesc}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">{ta.comingSoonBadge}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* SUBSCRIPTION & BILLING (Job Seekers only) */}
      {role !== "recruiter" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-primary" /> {ta.subscriptionBilling}
          </CardTitle>
          <CardDescription>{ta.subscriptionDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-3">
              {isPro ? <Crown className="h-8 w-8 text-primary" /> : <Zap className="h-8 w-8 text-muted-foreground" />}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{isPro ? ta.proPlan : ta.freePlan}</p>
                  <Badge variant={isPro ? "default" : "secondary"}>{isPro ? ta.active : ta.free}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isPro ? ta.unlimitedAccess : ta.limitedAccess}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
              {isPro ? ta.manage : ta.upgrade}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(isPro ? PLAN_FEATURES.pro : PLAN_FEATURES.free).map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="h-4 w-4 text-primary" />
              <p className="font-medium text-sm">{ta.billingHistory}</p>
            </div>
            {subscription ? (
              <div className="rounded-lg border divide-y text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">
                      {subscription.plan_name === "pro_weekly" ? ta.plan7Day :
                       subscription.plan_name === "pro_biweekly" ? ta.plan14Day :
                       subscription.plan_name === "pro_monthly" ? ta.planMonthly :
                       subscription.plan_name} {ta.planSuffix}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.starts_at ? new Date(subscription.starts_at).toLocaleDateString() : "—"}
                      {subscription.expires_at ? ` → ${new Date(subscription.expires_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {subscription.plan_name === "pro_weekly" ? formatProPrice("weekly") :
                       subscription.plan_name === "pro_biweekly" ? formatProPrice("biweekly") :
                       subscription.plan_name === "pro_monthly" ? formatProPrice("monthly") :
                       `${subscription.currency} ${subscription.amount}`}
                    </p>
                    <Badge variant="outline" className="text-xs capitalize">{subscription.status}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed text-muted-foreground">
                <Receipt className="h-4 w-4" />
                <p className="text-sm">{ta.noBillingHistory}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-primary" />
              <p className="font-medium text-sm">{ta.paymentMethod}</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{ta.noPaymentMethod}</p>
              </div>
              <Button size="sm" variant="outline" disabled>{ta.addCard}</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{ta.stripeComingSoon}</p>
          </div>

          {isPro && (
            <>
              <Separator />
              <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 gap-2">
                    <AlertTriangle className="h-4 w-4" /> {ta.cancelSubscription}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> {ta.cancelAreYouSure}
                    </DialogTitle>
                    <DialogDescription>{ta.cancelDescription}</DialogDescription>
                  </DialogHeader>
                  <ul className="space-y-2 py-2">
                    {[ta.cancelFeature1, ta.cancelFeature2, ta.cancelFeature3, ta.cancelFeature4, ta.cancelFeature5].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <DialogFooter className="gap-2">
                    <Button variant="default" onClick={() => setCancelDialog(false)} className="flex-1">{ta.keepPlan}</Button>
                    <Button variant="outline" className="text-destructive flex-1" onClick={() => {
                      setCancelDialog(false);
                      toast({ title: ta.cancellationRequested, description: ta.cancellationDesc });
                    }}>{ta.cancelAnyway}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>
      )}


      {/* ACCOUNT DELETION */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" /> {ta.deleteAccount}
          </CardTitle>
          <CardDescription>{ta.deleteAccountDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> {ta.deleteMyAccount}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> {ta.deleteConfirmTitle}
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <span className="block">{ta.deleteWillRemove}</span>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>{ta.deleteItem1}</li>
                    <li>{ta.deleteItem2}</li>
                    <li>{ta.deleteItem3}</li>
                    <li>{ta.deleteItem4}</li>
                  </ul>
                  <span className="block mt-3 font-medium text-foreground">
                    {ta.deleteTypeConfirm} <span className="font-bold text-destructive">DELETE</span> {ta.deleteToConfirm}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={ta.deletePlaceholder}
                className="border-destructive/50 focus-visible:ring-destructive"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>{ta.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deletingAccount}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {deletingAccount ? ta.deleting : ta.deleteForever}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
