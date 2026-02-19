import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/i18n/LanguageContext";
import { FileText, Search, LayoutDashboard, LogOut, Menu, Building2, BarChart3, Users, CreditCard, Briefcase, Headphones } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

const jobSeekerNav = [
  { to: "/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
  { to: "/resumes", icon: FileText, key: "resumes" as const },
  { to: "/jobs", icon: Search, key: "findJobs" as const },
  { to: "/companies", icon: Building2, key: "companies" as const },
  { to: "/interview-prep", icon: Headphones, key: "interviewPrep" as const },
  { to: "/pricing", icon: CreditCard, key: "pricing" as const },
];

const recruiterNav = [
  { to: "/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
  { to: "/recruiter/company", icon: Building2, key: "companyProfile" as const },
  { to: "/recruiter/jobs", icon: Briefcase, key: "myJobPosts" as const },
  { to: "/recruiter/candidates", icon: Users, key: "candidates" as const },
  { to: "/recruiter/analytics", icon: BarChart3, key: "analytics" as const },
  { to: "/pricing", icon: CreditCard, key: "pricing" as const },
];

function SidebarContent({ user, onSignOut, onNavClick }: { user: any; onSignOut: () => void; onNavClick?: () => void }) {
  const { t } = useLanguage();
  const { role } = useUserRole();
  const navItems = role === "recruiter" ? recruiterNav : jobSeekerNav;

  return (
    <>
      <div className="p-6 flex items-center gap-2">
        <img src={logo} alt="ATS Pro Resume Builder" className="h-[92px] brightness-0 invert" width={383} height={92} />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {t.nav[item.key]}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-2 border-t border-sidebar-border">
        <div className="px-3 flex gap-2">
          <LanguageSwitcher className="flex-1 h-8 text-xs bg-sidebar-accent text-sidebar-foreground border-sidebar-border [&>svg]:text-sidebar-foreground" />
          <ThemeToggle className="h-8 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" />
        </div>
        <div className="px-3 py-2 text-xs text-sidebar-foreground/50 truncate">
          {user?.email}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t.nav.signOut}
        </Button>
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
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center px-3 border-b bg-background">
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
            <img src={logo} alt="ATS Pro Resume Builder" className="h-10 dark:brightness-100 brightness-0" width={167} height={40} />
          </div>
        </header>
      )}

      {!isMobile && (
        <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0">
          <SidebarContent user={user} onSignOut={handleSignOut} />
        </aside>
      )}

      <main className={cn("flex-1 overflow-auto", isMobile && "pt-12")}>
        <Outlet />
      </main>
    </div>
  );
}
