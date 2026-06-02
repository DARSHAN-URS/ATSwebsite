import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  FileText, Search, LayoutDashboard, LogOut, Menu, Building2, BarChart3, 
  Users, CreditCard, Briefcase, Headphones, Mail, Settings, ShieldCheck, Zap,
  ChevronRight, Sparkles, User, HelpCircle, Info, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const jobSeekerNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/resumes", icon: FileText, label: "My Resumes" },
  { to: "/jobs", icon: Search, label: "Find Jobs" },
  { to: "/companies", icon: Building2, label: "Companies" },
  { to: "/email-outreach", icon: Mail, label: "Email Outreach" },
  { to: "/interview-prep", icon: Headphones, label: "Interview Prep" },
];

const recruiterNav = [
  { to: "/recruiter/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/recruiter/company", icon: Building2, label: "Company" },
  { to: "/recruiter/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/recruiter/candidates", icon: Users, label: "Candidates" },
  { to: "/recruiter/analytics", icon: BarChart3, label: "Analytics" },
];

function SidebarContent({ user, onSignOut, onNavClick }: { user: any; onSignOut: () => void; onNavClick?: () => void; }) {
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const jobSeekerNav = [
    { to: "/dashboard", icon: LayoutDashboard, label: t.nav.dashboard },
    { to: "/resumes", icon: FileText, label: t.nav.resumes },
    { to: "/jobs", icon: Search, label: t.nav.findJobs },
    { to: "/companies", icon: Building2, label: t.nav.companies },
    { to: "/email-outreach", icon: Mail, label: t.nav.emailOutreach },
    { to: "/interview-prep", icon: Headphones, label: t.nav.interviewPrep },
  ];

  const recruiterNav = [
    { to: "/recruiter/dashboard", icon: LayoutDashboard, label: t.nav.dashboard },
    { to: "/recruiter/company", icon: Building2, label: t.nav.companyProfile },
    { to: "/recruiter/jobs", icon: Briefcase, label: t.nav.jobBoard },
    { to: "/recruiter/candidates", icon: Users, label: t.nav.candidates },
    { to: "/recruiter/analytics", icon: BarChart3, label: t.nav.analytics },
  ];

  const navItems = role === "recruiter" ? recruiterNav : jobSeekerNav;
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const avatarPath = user?.user_metadata?.avatar_url;
    if (avatarPath) {
      import("@/lib/storageUtils").then(({ resolvePhotoUrl }) => {
        resolvePhotoUrl(avatarPath).then(url => setResolvedAvatarUrl(url));
      });
    }
  }, [user?.user_metadata?.avatar_url]);

  return (
    <div className="h-full flex flex-col bg-slate-900 relative overflow-hidden border-r border-white/5">
      <div className="p-6 pt-8 pb-4 flex justify-center lg:justify-start">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <Logo variant="light" className="h-28 w-auto transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] -ml-4" />
        </div>
      </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
          <div className="px-4 mb-4 flex items-center justify-between">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.common?.mainMenu || "Main Menu"}</p>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-4 py-3.5 transition-all rounded-xl group/nav relative",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )
              }
            >
              <div className="flex items-center gap-3 relative z-10">
                 <item.icon className={cn("h-4 w-4 transition-transform group-hover/nav:scale-110", "text-current")} />
                 <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
              </div>
            </NavLink>
          ))}

          <div className="pt-8 px-4 mb-4">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">{t.common?.support || "Help & Support"}</p>
          </div>
          
          <NavLink
            to="/dashboard/contact"
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between px-4 py-3 transition-all rounded-xl group/nav relative",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )
            }
          >
            <div className="flex items-center gap-3 relative z-10">
               <HelpCircle className="h-4 w-4 transition-transform group-hover/nav:scale-110 text-current" />
               <span className="text-[11px] font-medium tracking-tight">Contact Us</span>
            </div>
          </NavLink>
        </nav>


        <div className="p-4 border-t border-white/5 space-y-3">
          <ThemeToggle className="w-full justify-start bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white h-10 px-4 rounded-xl font-bold uppercase tracking-wider text-[10px] gap-2" />
          <LanguageSwitcher className="w-full justify-start bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group">
                <Avatar className="h-9 w-9 border border-white/10">
                  <AvatarImage src={resolvedAvatarUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] font-bold text-white truncate tracking-tight">{displayName}</p>
                  <p className="text-[9px] text-slate-500 font-medium truncate uppercase tracking-widest">{role?.replace('_', ' ') || "Free Member"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-64 rounded-xl p-2 border border-white/10 shadow-2xl bg-slate-900 text-white">
              <DropdownMenuItem onClick={() => {navigate("/profile"); onNavClick?.();}} className="rounded-lg p-3 text-[11px] font-medium gap-3 focus:bg-white/10 focus:text-white cursor-pointer"><Settings className="w-4 h-4" /> {t.common?.edit || "Settings"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {navigate("/upgrade"); onNavClick?.();}} className="rounded-lg p-3 text-[11px] font-medium gap-3 focus:bg-white/10 focus:text-white cursor-pointer"><CreditCard className="w-4 h-4" /> {t.nav.pricing}</DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-white/5" />
              <DropdownMenuItem onClick={onSignOut} className="rounded-lg p-3 text-[11px] font-medium gap-3 text-red-400 focus:bg-red-500/10 cursor-pointer"><LogOut className="w-4 h-4" /> {t.nav.signOut}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </div>
  );
}

import { BugReportWidget } from "@/components/BugReportWidget";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background font-sans selection:bg-blue-600/10 selection:text-blue-600">
      {!isMobile ? (
        <aside className="w-64 h-screen sticky top-0 overflow-hidden z-40 border-r border-slate-200 dark:border-white/5 hidden md:block">
          <SidebarContent user={user} onSignOut={handleSignOut} />
        </aside>
      ) : (
        <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-slate-900 text-white border-b border-white/10 md:hidden">
          <div className="flex items-center gap-2">
            <Logo variant="light" className="h-10 drop-shadow-sm" />
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-none">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarContent user={user} onSignOut={handleSignOut} onNavClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>
      )}

      <main className="flex-1 min-w-0 flex flex-col bg-background relative">
        <div className="flex-1 relative overflow-y-auto p-4 md:p-8 lg:p-10">
           <Outlet />
        </div>
        <BugReportWidget />
      </main>
    </div>
  );
}
