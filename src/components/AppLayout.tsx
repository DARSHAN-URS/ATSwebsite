import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/i18n/LanguageContext";
import { FileText, Search, LayoutDashboard, LogOut, Menu, Building2, BarChart3, Users, CreditCard, Briefcase, Headphones, Mail, ChevronDown, Settings, ShieldAlert } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

const jobSeekerNav = [
{ to: "/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
{ to: "/resumes", icon: FileText, key: "resumes" as const },
{ to: "/jobs", icon: Search, key: "findJobs" as const },
{ to: "/companies", icon: Building2, key: "companies" as const },
{ to: "/email-outreach", icon: Mail, key: "emailOutreach" as const },
{ to: "/interview-prep", icon: Headphones, key: "interviewPrep" as const },
{ to: "/pricing", icon: CreditCard, key: "pricing" as const }];


const recruiterNav = [
{ to: "/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
{ to: "/recruiter/company", icon: Building2, key: "companyProfile" as const },
{ to: "/recruiter/jobs", icon: Briefcase, key: "myJobPosts" as const },
{ to: "/recruiter/candidates", icon: Users, key: "candidates" as const },
{ to: "/recruiter/analytics", icon: BarChart3, key: "analytics" as const }];


function SidebarContent({ user, onSignOut, onNavClick }: {user: any;onSignOut: () => void;onNavClick?: () => void;}) {
  const { t } = useLanguage();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const navItems = role === "recruiter" ? recruiterNav : jobSeekerNav;

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarFallback = displayName.charAt(0).toUpperCase();

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

  return (
    <>
      <div className="p-8 pb-10">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            RESUME<span className="text-primary">PRO</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all rounded-xl",
                isActive ?
                "bg-primary/10 text-primary" :
                "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span>{t.nav[item.key]}</span>
          </NavLink>
        )}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Settings</p>
          <div className="flex items-center justify-between">
            <LanguageSwitcher className="h-8 text-xs bg-transparent border-none hover:bg-white dark:hover:bg-slate-800" />
            <ThemeToggle className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-800" />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-left group">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                  <AvatarImage src={resolvedAvatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-white text-sm font-bold">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-tighter">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800">
            <div className="px-3 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem onClick={() => {navigate("/account");onNavClick?.();}} className="rounded-xl cursor-pointer gap-3 py-3 px-3 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Settings className="h-4 w-4 text-slate-400" />
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Account Settings</span>
            </DropdownMenuItem>
            {role === "admin" && (
              <DropdownMenuItem onClick={() => {navigate("/admin");onNavClick?.();}} className="rounded-xl cursor-pointer gap-3 py-3 px-3 focus:bg-primary/5 text-primary">
                <ShieldAlert className="h-4 w-4" />
                <span className="font-bold text-xs">Admin Dashboard</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
            <DropdownMenuItem onClick={onSignOut} className="rounded-xl text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer gap-3 py-3 px-3">
              <LogOut className="h-4 w-4" />
              <span className="font-bold text-xs">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

}

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {isMobile &&
      <header className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center px-3 border-b border-primary/20 bg-background glow-border">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground flex flex-col">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent user={user} onSignOut={handleSignOut} onNavClick={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 ml-2">
            <Logo className="h-8 w-auto" width={120} height={36} variant="light" />
          </div>
        </header>
      }

      {!isMobile &&
      <aside className="w-72 bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col border-r border-slate-100 dark:border-slate-800 shrink-0">
          <SidebarContent user={user} onSignOut={handleSignOut} />
        </aside>
      }

      <main className={cn("flex-1 overflow-x-hidden overflow-y-auto", isMobile && "pt-12")}>
        <Outlet />
      </main>
    </div>);

}