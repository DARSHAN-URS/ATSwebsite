import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  FileText, Search, LayoutDashboard, LogOut, Menu, Building2, BarChart3, 
  Users, CreditCard, Briefcase, Headphones, Mail, Settings, ShieldCheck, Zap,
  ChevronRight, Sparkles, User, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

const jobSeekerNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/resumes", icon: FileText, label: "Resumes" },
  { to: "/jobs", icon: Search, label: "Find Jobs" },
  { to: "/companies", icon: Building2, label: "Companies" },
  { to: "/email-outreach", icon: Mail, label: "Outreach" },
  { to: "/interview-prep", icon: Headphones, label: "Practice Hub" },
  { to: "/pricing", icon: CreditCard, label: "Premium" },
];

const recruiterNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/recruiter/company", icon: Building2, label: "Company" },
  { to: "/recruiter/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/recruiter/candidates", icon: Users, label: "Candidates" },
  { to: "/recruiter/analytics", icon: BarChart3, label: "Analytics" },
];

function SidebarContent({ user, onSignOut, onNavClick }: { user: any; onSignOut: () => void; onNavClick?: () => void; }) {
  const { role } = useUserRole();
  const navigate = useNavigate();
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
    <div className="h-full flex flex-col bg-white border-r border-slate-200/60 relative overflow-hidden">
      <div className="p-8 relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <Logo variant="dark" className="h-12" />
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2 overflow-y-auto relative z-10 custom-scrollbar pt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between px-6 py-4 transition-all rounded-2xl group/nav relative overflow-hidden",
                isActive 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                  : "text-slate-400 hover:text-blue-600 hover:bg-blue-50/50"
              )
            }
          >
            <div className="flex items-center gap-4 relative z-10">
               <item.icon className={cn("h-5 w-5 transition-transform group-hover/nav:scale-110", "text-current")} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            </div>
            {item.label === "Premium" && <Sparkles className="w-4 h-4 text-amber-400 relative z-10" />}
            
            <div 
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full transition-transform duration-500",
                "hidden group-[.active]/nav:block"
              )} 
            />
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 bg-white/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-left group">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={resolvedAvatarUrl || undefined} />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{role?.replace('_', ' ') || "Free Member"}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-64 rounded-2xl p-2 border border-slate-200 shadow-xl bg-white text-slate-900">
            <DropdownMenuItem onClick={() => {navigate("/profile"); onNavClick?.();}} className="rounded-xl p-3 font-semibold text-sm gap-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer transition-all"><Settings className="w-4 h-4" /> Profile Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {navigate("/pricing"); onNavClick?.();}} className="rounded-xl p-3 font-semibold text-sm gap-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer transition-all"><CreditCard className="w-4 h-4" /> Subscription</DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-slate-100" />
            <DropdownMenuItem onClick={onSignOut} className="rounded-xl p-3 font-semibold text-sm gap-3 text-red-500 focus:bg-red-50/50 cursor-pointer transition-all"><LogOut className="w-4 h-4" /> Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

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
    <div className="flex min-h-screen bg-white font-sans selection:bg-blue-600/10 selection:text-blue-600">
      {!isMobile && (
        <aside className="w-72 h-screen sticky top-0 overflow-hidden z-40">
          <SidebarContent user={user} onSignOut={handleSignOut} />
        </aside>
      )}

      <main className="flex-1 min-w-0 relative">
        {isMobile && (
          <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2" onClick={() => navigate("/")}>
              <Logo variant="dark" className="h-8" />
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100"><Menu className="h-5 w-5 text-slate-500" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-72 bg-white">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent user={user} onSignOut={handleSignOut} onNavClick={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </header>
        )}
        <div className="relative min-h-screen p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
