import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User, Mail, Phone, MapPin, Lock, Shield, Trash2, Crown, Zap,
  Eye, EyeOff, CreditCard, Receipt, CheckCircle, AlertTriangle, Camera, LogOut
} from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { subscription, status, isPro } = useSubscription();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Profile state
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const [name, setName] = useState(displayName);
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [location, setLocation] = useState(user?.user_metadata?.location || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Cancel subscription state
  const [cancelDialog, setCancelDialog] = useState(false);

  const avatarFallback = (name || displayName).charAt(0).toUpperCase();

  // ── Profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name, phone, location },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Also update profiles table
      await supabase.from("profiles").update({ display_name: name }).eq("user_id", user!.id);
      toast({ title: "Profile updated", description: "Your profile info has been saved." });
    }
    setSavingProfile(false);
  };

  // ── Password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reset email sent", description: "Check your inbox for a password reset link." });
    }
  };

  // ── Account Deletion ──────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeletingAccount(true);
    // Delete all user data from tables
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
    toast({ title: "Account deleted", description: "All your data has been permanently removed." });
    navigate("/");
    setDeletingAccount(false);
  };

  const passwordValid =
    newPassword.length >= 6 &&
    /[A-Z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    newPassword === confirmPassword;


  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <SEOHead title="Account Settings — ATS Pro Resume Builder" description="Manage your profile, password, subscription, and billing." />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile, security, and subscription.</p>
      </div>

      {/* ── PROFILE INFO ────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" /> Profile Information
          </CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                onClick={() => toast({ title: "Coming soon", description: "Profile photo upload will be available soon." })}
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
              <Label htmlFor="acc-name" className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</Label>
              <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-email" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
              <Input id="acc-email" value={user?.email || ""} disabled className="opacity-60 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-phone" className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</Label>
              <Input id="acc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-location" className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</Label>
              <Input id="acc-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto">
            {savingProfile ? "Saving…" : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* ── PASSWORD MANAGEMENT ─────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" /> Password & Security
          </CardTitle>
          <CardDescription>Manage your password and two-factor authentication.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Change Password Dialog */}
            <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 gap-2">
                  <Lock className="h-4 w-4" /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Choose a strong password with at least 6 characters, one uppercase letter, and one number.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="pr-10"
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className={newPassword.length >= 6 ? "text-green-500" : "text-muted-foreground"}>✓ 6+ chars</span>
                      <span className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-muted-foreground"}>✓ Uppercase</span>
                      <span className={/[0-9]/.test(newPassword) ? "text-green-500" : "text-muted-foreground"}>✓ Number</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pr-10"
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCurrent(!showCurrent)}>
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <p className={`text-xs ${newPassword === confirmPassword ? "text-green-500" : "text-destructive"}`}>
                        {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordDialog(false)}>Cancel</Button>
                  <Button onClick={handleChangePassword} disabled={!passwordValid || savingPassword}>
                    {savingPassword ? "Updating…" : "Update Password"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex-1 gap-2" onClick={handleForgotPassword}>
              <Mail className="h-4 w-4" /> Send Reset Email
            </Button>
          </div>

          <Separator />

          {/* 2FA */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── SUBSCRIPTION & BILLING ──────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-primary" /> Subscription & Billing
          </CardTitle>
          <CardDescription>Your current plan and payment details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current Plan */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-3">
              {isPro
                ? <Crown className="h-8 w-8 text-primary" />
                : <Zap className="h-8 w-8 text-muted-foreground" />}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{isPro ? "Pro Plan" : "Free Plan"}</p>
                  <Badge variant={isPro ? "default" : "secondary"}>{isPro ? "Active" : "Free"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isPro ? "Unlimited access to all features." : "Limited to 1 resume and basic features."}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
              {isPro ? "Manage" : "Upgrade"}
            </Button>
          </div>

          {/* Features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(isPro ? PLAN_FEATURES.pro : PLAN_FEATURES.free).map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Billing History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="h-4 w-4 text-primary" />
              <p className="font-medium text-sm">Billing History</p>
            </div>
            {subscription ? (
              <div className="rounded-lg border divide-y text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">{subscription.plan_name} Plan</p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.starts_at ? new Date(subscription.starts_at).toLocaleDateString() : "—"}
                      {subscription.expires_at ? ` → ${new Date(subscription.expires_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{subscription.currency} {subscription.amount}</p>
                    <Badge variant="outline" className="text-xs">{subscription.status}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed text-muted-foreground">
                <Receipt className="h-4 w-4" />
                <p className="text-sm">No billing history yet. You're on the free plan.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Payment Method */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-primary" />
              <p className="font-medium text-sm">Payment Method</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No payment method on file</p>
              </div>
              <Button size="sm" variant="outline" disabled>
                Add Card
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Stripe payment integration coming soon.</p>
          </div>

          {/* Cancel Subscription */}
          {isPro && (
            <>
              <Separator />
              <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 gap-2">
                    <AlertTriangle className="h-4 w-4" /> Cancel Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Are you sure?
                    </DialogTitle>
                    <DialogDescription>
                      Cancelling your Pro subscription means you'll lose:
                    </DialogDescription>
                  </DialogHeader>
                  <ul className="space-y-2 py-2">
                    {["AI resume grading & tailoring", "Unlimited resume storage", "All premium templates", "Cover letter generation", "Priority support"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <DialogFooter className="gap-2">
                    <Button variant="default" onClick={() => setCancelDialog(false)} className="flex-1">
                      Keep my Pro plan
                    </Button>
                    <Button variant="outline" className="text-destructive flex-1" onClick={() => {
                      setCancelDialog(false);
                      toast({ title: "Cancellation requested", description: "Your subscription will be cancelled at the end of the billing period." });
                    }}>
                      Cancel anyway
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── ACCOUNT DELETION ────────────────────────── */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" /> Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone and is required by GDPR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Permanently delete account?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <span className="block">This will permanently delete:</span>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All your resumes and cover letters</li>
                    <li>All job applications and saved jobs</li>
                    <li>Your profile and account data</li>
                    <li>All email outreach history</li>
                  </ul>
                  <span className="block mt-3 font-medium text-foreground">
                    Type <span className="font-bold text-destructive">DELETE</span> to confirm:
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="border-destructive/50 focus-visible:ring-destructive"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deletingAccount}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {deletingAccount ? "Deleting…" : "Delete Forever"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

const PLAN_FEATURES = {
  free: ["1 Resume", "Basic templates", "PDF download", "Job tracker (5 apps)"],
  pro: ["Unlimited resumes", "All premium templates", "AI resume grading", "AI resume tailoring", "Cover letter generation", "Unlimited job tracking", "Priority support"],
};
