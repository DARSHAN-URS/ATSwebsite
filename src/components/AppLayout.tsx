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
    <div className="h-full flex flex-col bg-white relative overflow-hidden p-6">
      <div className="bg-slate-900 rounded-[3rem] h-full flex flex-col shadow-2xl shadow-slate-900/20 relative overflow-hidden">
        <div className="p-10 pb-6">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <Logo variant="light" className="h-10 transition-transform group-hover:scale-105" />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pt-6">
          <div className="px-6 mb-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Operational Hub</p>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-6 py-5 transition-all rounded-[1.8rem] group/nav relative overflow-hidden",
                  isActive 
                    ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )
              }
            >
              <div className="flex items-center gap-4 relative z-10">
                 <item.icon className={cn("h-4.5 w-4.5 transition-transform group-hover/nav:scale-110", "text-current")} />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              </div>
              {item.label === "Premium" && <Sparkles className="w-3.5 h-3.5 text-amber-400 relative z-10" />}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Neural Link</span>
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">v4.2</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full w-3/4 bg-blue-600 rounded-full" />
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-4 p-4 rounded-[2rem] hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/5">
                <Avatar className="h-12 w-12 border-4 border-slate-800 shadow-md transition-transform group-hover:scale-105">
                  <AvatarImage src={resolvedAvatarUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm font-black">{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-black text-white truncate uppercase tracking-tight">{displayName}</p>
                  <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.2em]">{role?.replace('_', ' ') || "Free Member"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-64 rounded-[2rem] p-3 border-none shadow-3xl bg-slate-900 text-white">
              <DropdownMenuItem onClick={() => {navigate("/profile"); onNavClick?.();}} className="rounded-xl p-4 font-black uppercase tracking-widest text-[9px] gap-3 focus:bg-white/10 focus:text-white cursor-pointer"><Settings className="w-4 h-4" /> Profile Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {navigate("/pricing"); onNavClick?.();}} className="rounded-xl p-4 font-black uppercase tracking-widest text-[9px] gap-3 focus:bg-white/10 focus:text-white cursor-pointer"><CreditCard className="w-4 h-4" /> Subscription</DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-white/5" />
              <DropdownMenuItem onClick={onSignOut} className="rounded-xl p-4 font-black uppercase tracking-widest text-[9px] gap-3 text-red-400 focus:bg-red-500/10 cursor-pointer"><LogOut className="w-4 h-4" /> Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
        <aside className="w-80 h-screen sticky top-0 overflow-hidden z-40 bg-slate-50/50">
          <SidebarContent user={user} onSignOut={handleSignOut} />
        </aside>
      )}

      <main className="flex-1 min-w-0 flex flex-col bg-white">
        {!isMobile && (
          <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-30 bg-white/80 backdrop-blur-md">
            <div className="flex-1 max-w-xl">
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search mission objectives..." 
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium"
                  />
               </div>
            </div>
            
            <div className="flex items-center gap-8 ml-12">
               <div className="flex items-center gap-4 px-6 py-3 bg-slate-50 rounded-full border border-slate-100/50 shadow-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">System Operational</span>
               </div>
               
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100/50 shadow-sm hover:text-blue-600">
                  <HelpCircle className="w-5 h-5" />
               </Button>
               
               <div className="h-10 w-px bg-slate-100" />
               
               <Button onClick={() => navigate("/pricing")} className="h-12 px-8 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">
                  Upgrade Plan
               </Button>
            </div>
          </header>
        )}

        {isMobile && (
          <header className="h-20 border-b border-slate-100 bg-white px-8 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2" onClick={() => navigate("/")}>
              <Logo variant="dark" className="h-8" />
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100"><Menu className="h-6 w-6 text-slate-900" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-80 bg-white">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent user={user} onSignOut={handleSignOut} onNavClick={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </header>
        )}
        
        <div className="flex-1 relative p-6 md:p-12 md:pt-4 overflow-y-auto">
          <div className="bg-white rounded-[4rem] min-h-full shadow-sm border border-slate-100 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 p-10 md:p-16">
                <Outlet />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
