import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  FileText, Search, LayoutDashboard, LogOut, Menu, Building2, BarChart3, 
  Users, CreditCard, Briefcase, Headphones, Mail, Settings, ShieldCheck, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

const jobSeekerNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Intelligence" },
  { to: "/resumes", icon: FileText, label: "Repository" },
  { to: "/jobs", icon: Search, label: "Matrix" },
  { to: "/companies", icon: Building2, label: "Organizations" },
  { to: "/email-outreach", icon: Mail, label: "Strategic Link" },
  { to: "/interview-prep", icon: Headphones, label: "Simulations" },
  { to: "/pricing", icon: CreditCard, label: "Subscription" },
];

const recruiterNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Intelligence" },
  { to: "/recruiter/company", icon: Building2, label: "Enterprise" },
  { to: "/recruiter/jobs", icon: Briefcase, label: "Deployments" },
  { to: "/recruiter/candidates", icon: Users, label: "Talent Matrix" },
  { to: "/recruiter/analytics", icon: BarChart3, label: "Analytics" },
];

function SidebarContent({ user, onSignOut, onNavClick }: { user: any; onSignOut: () => void; onNavClick?: () => void; }) {
  const { role } = useUserRole();
  const navigate = useNavigate();
  const navItems = role === "recruiter" ? recruiterNav : jobSeekerNav;
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Architect";
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
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
      <div className="p-10">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            RESUME<span className="text-blue-600">PRO</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl",
                isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-8 border-t border-slate-100 dark:border-slate-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left">
              <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-xl">
                <AvatarImage src={resolvedAvatarUrl || undefined} />
                <AvatarFallback className="bg-blue-600 text-white font-black">{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{displayName}</p>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{role || "Architect"}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-3xl p-3 border-none shadow-2xl bg-white dark:bg-slate-900">
            <DropdownMenuItem onClick={() => {navigate("/profile"); onNavClick?.();}} className="rounded-xl p-4 font-black text-[10px] uppercase tracking-widest gap-3 focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer"><Settings className="w-4 h-4 text-blue-600" /> Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
            <DropdownMenuItem onClick={onSignOut} className="rounded-xl p-4 font-black text-[10px] uppercase tracking-widest gap-3 text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"><LogOut className="w-4 h-4" /> Terminate Session</DropdownMenuItem>
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
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans">
      {!isMobile && (
        <aside className="w-80 h-screen sticky top-0 overflow-hidden">
          <SidebarContent user={user} onSignOut={handleSignOut} />
        </aside>
      )}

      <main className="flex-1 min-w-0">
        {isMobile && (
          <header className="h-20 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><ShieldCheck className="w-5 h-5" /></div>
              <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase">RESUME<span className="text-blue-600">PRO</span></span>
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl"><Menu className="h-6 w-6 text-slate-600" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-80 bg-white dark:bg-slate-900">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarContent user={user} onSignOut={handleSignOut} onNavClick={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </header>
        )}
        <div className="relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}