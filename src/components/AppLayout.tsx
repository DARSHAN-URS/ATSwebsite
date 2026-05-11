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
    <div className="h-full flex flex-col bg-slate-900 relative overflow-hidden border-r border-white/5">
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <Logo variant="light" className="h-8 transition-transform group-hover:scale-105" />
        </div>
      </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
          <div className="px-4 mb-4">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Operational Hub</p>
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
              {item.label === "Premium" && <Sparkles className="w-3.5 h-3.5 text-amber-400 relative z-10" />}
            </NavLink>
          ))}

          <div className="pt-8 px-4 mb-4">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Support & Resources</p>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <HelpCircle className="w-4 h-4" />
            <span className="text-[11px] font-medium tracking-tight">Support Center</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-4 h-4" />
            <span className="text-[11px] font-medium tracking-tight">System Status</span>
          </button>
        </nav>


        <div className="p-4 border-t border-white/5">
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
              <DropdownMenuItem onClick={() => {navigate("/profile"); onNavClick?.();}} className="rounded-lg p-3 text-[11px] font-medium gap-3 focus:bg-white/10 focus:text-white cursor-pointer"><Settings className="w-4 h-4" /> Profile Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {navigate("/pricing"); onNavClick?.();}} className="rounded-lg p-3 text-[11px] font-medium gap-3 focus:bg-white/10 focus:text-white cursor-pointer"><CreditCard className="w-4 h-4" /> Subscription</DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-white/5" />
              <DropdownMenuItem onClick={onSignOut} className="rounded-lg p-3 text-[11px] font-medium gap-3 text-red-400 focus:bg-red-500/10 cursor-pointer"><LogOut className="w-4 h-4" /> Sign Out</DropdownMenuItem>
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
    <div className="flex min-h-screen bg-[#F5F7FB] font-sans selection:bg-blue-600/10 selection:text-blue-600">
      {!isMobile && (
        <aside className="w-64 h-screen sticky top-0 overflow-hidden z-40 border-r border-slate-200">
          <SidebarContent user={user} onSignOut={handleSignOut} />
        </aside>
      )}

      <main className="flex-1 min-w-0 flex flex-col bg-[#F5F7FB]">

        
        <div className="flex-1 relative overflow-y-auto p-8 md:p-10">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
