import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { useUserRole, UserRoleProvider, type AppRole } from "@/hooks/useUserRole";
import { lazy, Suspense } from "react";

// Eagerly loaded — small, needed immediately
import AppLayout from "@/components/AppLayout";
import Index from "@/pages/Index";

// Lazy-loaded — only pulled in when the user navigates there
import Dashboard from "@/pages/Dashboard";
const Resumes = lazy(() => import("@/pages/Resumes"));
const FindJobs = lazy(() => import("@/pages/FindJobs"));
const Companies = lazy(() => import("@/pages/Companies"));
const CoverLetters = lazy(() => import("@/pages/CoverLetters"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const RoleSelection = lazy(() => import("@/pages/RoleSelection"));
const RecruiterJobs = lazy(() => import("@/pages/RecruiterJobs"));
const RecruiterAnalytics = lazy(() => import("@/pages/RecruiterAnalytics"));
const RecruiterCompany = lazy(() => import("@/pages/RecruiterCompany"));
const RecruiterApplicants = lazy(() => import("@/pages/RecruiterApplicants"));
const RecruiterCandidates = lazy(() => import("@/pages/RecruiterCandidates"));
const About = lazy(() => import("@/pages/About"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const InterviewPrep = lazy(() => import("@/pages/InterviewPrep"));
const Blog = lazy(() => import("@/pages/Blog"));
const ATSResumeBuilderSEO = lazy(() => import("@/pages/seo/ATSResumeBuilder"));
const ResumeTemplatesSEO = lazy(() => import("@/pages/seo/ResumeTemplates"));
const ResumeBuilderForFreshers = lazy(() => import("@/pages/seo/ResumeBuilderForFreshers"));
const SoftwareEngineerResume = lazy(() => import("@/pages/seo/SoftwareEngineerResume"));
const InterviewPreparationSEO = lazy(() => import("@/pages/seo/InterviewPreparation"));
const ResumeDownloadFormats = lazy(() => import("@/pages/seo/ResumeDownloadFormats"));
const BlogArticlePage = lazy(() =>
  import("@/pages/seo/BlogArticles").then((m) => ({ default: m.BlogArticlePage }))
);
const ResumeExamplesIndex = lazy(() => import("@/pages/seo/ResumeExamplesIndex"));
const ResumeExamplePage = lazy(() => import("@/pages/seo/ResumeExamplePage"));
const ResumeKeywordsPage = lazy(() => import("@/pages/seo/ResumeKeywordsPage"));
const ResumeTemplatePage = lazy(() => import("@/pages/seo/ResumeTemplatePage"));
const ResumeGuidePage = lazy(() => import("@/pages/seo/ResumeGuidePage"));
const JobTracker = lazy(() => import("@/pages/JobTracker"));
const EmailOutreach = lazy(() => import("@/pages/EmailOutreach"));
const Profile = lazy(() => import("@/pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
import ProRoute from "@/components/ProRoute";
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Contact = lazy(() => import("@/pages/Contact"));
const Builder = lazy(() => import("@/pages/Builder"));
const Auth = lazy(() => import("@/pages/Auth"));
const JobBoard = lazy(() => import("@/pages/JobBoard"));
import AdminRoute from "@/components/auth/AdminRoute";


const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="flex items-center justify-center h-screen text-muted-foreground">Loading...</div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) return <PageFallback />;
  if (!user) return <Navigate to="/" replace />;
  if (!role) return <Navigate to="/select-role" replace />;
  return <>{children}</>;
}

function RoleGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole: AppRole }) {
  const { role, loading } = useUserRole();
  
  if (loading) return <PageFallback />;
  if (role !== requiredRole) {
    return <Navigate to={role === "recruiter" ? "/recruiter/jobs" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

function RoleRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) return <PageFallback />;
  if (!user) return <Navigate to="/" replace />;
  if (role) return <Navigate to={role === "recruiter" ? "/recruiter/jobs" : "/dashboard"} replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
           <UserRoleProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/p/:slug" element={<PublicProfile />} />
                <Route path="/about" element={<About />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/job-board" element={<JobBoard />} />
                <Route path="/cookies" element={<PrivacyPolicy />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticlePage />} />
                <Route path="/ats-resume-builder" element={<ATSResumeBuilderSEO />} />
                <Route path="/resume-templates" element={<ResumeTemplatesSEO />} />
                <Route path="/resume-builder-for-freshers" element={<ResumeBuilderForFreshers />} />
                <Route path="/software-engineer-resume" element={<SoftwareEngineerResume />} />
                <Route path="/interview-preparation" element={<InterviewPreparationSEO />} />
                <Route path="/resume-download" element={<ResumeDownloadFormats />} />
                <Route path="/resume-examples" element={<ResumeExamplesIndex />} />
                <Route path="/resume-examples/:jobTitle" element={<ResumeExamplePage />} />
                <Route path="/resume-keywords/:jobTitle" element={<ResumeKeywordsPage />} />
                <Route path="/resume-template/:jobTitle" element={<ResumeTemplatePage />} />
                <Route path="/resume-guide/:topic" element={<ResumeGuidePage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/select-role" element={<RoleRoute><RoleSelection /></RoleRoute>} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<RoleGuard requiredRole="job_seeker"><Dashboard /></RoleGuard>} />
                  <Route path="/resumes" element={<RoleGuard requiredRole="job_seeker"><Resumes /></RoleGuard>} />
                  <Route path="/job-tracker" element={<RoleGuard requiredRole="job_seeker"><ProRoute><JobTracker /></ProRoute></RoleGuard>} />
                  <Route path="/email-outreach" element={<RoleGuard requiredRole="job_seeker"><ProRoute><EmailOutreach /></ProRoute></RoleGuard>} />
                  <Route path="/cover-letters" element={<RoleGuard requiredRole="job_seeker"><CoverLetters /></RoleGuard>} />
                  <Route path="/jobs" element={<RoleGuard requiredRole="job_seeker"><FindJobs /></RoleGuard>} />
                  <Route path="/companies" element={<RoleGuard requiredRole="job_seeker"><ProRoute><Companies /></ProRoute></RoleGuard>} />

                  <Route path="/interview-prep" element={<RoleGuard requiredRole="job_seeker"><ProRoute><InterviewPrep /></ProRoute></RoleGuard>} />

                  <Route path="/recruiter/company" element={<RoleGuard requiredRole="recruiter"><RecruiterCompany /></RoleGuard>} />
                  <Route path="/recruiter/jobs" element={<RoleGuard requiredRole="recruiter"><RecruiterJobs /></RoleGuard>} />
                  <Route path="/recruiter/jobs/:jobId/applicants" element={<RoleGuard requiredRole="recruiter"><RecruiterApplicants /></RoleGuard>} />
                  <Route path="/recruiter/candidates" element={<RoleGuard requiredRole="recruiter"><RecruiterCandidates /></RoleGuard>} />
                  <Route path="/recruiter/analytics" element={<RoleGuard requiredRole="recruiter"><RecruiterAnalytics /></RoleGuard>} />
                  <Route path="/profile" element={<Profile />} />
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>
                </Route>

                <Route path="/builder" element={<ProtectedRoute><RoleGuard requiredRole="job_seeker"><Builder /></RoleGuard></ProtectedRoute>} />
                <Route path="/builder/:id" element={<ProtectedRoute><RoleGuard requiredRole="job_seeker"><Builder /></RoleGuard></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
           </UserRoleProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
