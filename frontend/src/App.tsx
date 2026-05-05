import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { useUserRole, UserRoleProvider } from "@/hooks/useUserRole";
import { lazy, Suspense } from "react";

// Eagerly loaded — small, needed immediately
import AppLayout from "@/components/AppLayout";

// Index page lazy-loaded to keep initial bundle small
const Index = lazy(() => import("@/pages/Index"));

// Lazy-loaded — only pulled in when the user navigates there
const Dashboard = lazy(() => import("@/pages/Dashboard"));
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
const AccountSettings = lazy(() => import("@/pages/AccountSettings"));
import ProRoute from "@/components/ProRoute";
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Contact = lazy(() => import("@/pages/Contact"));
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

function RoleRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) return <PageFallback />;
  if (!user) return <Navigate to="/" replace />;
  if (role) return <Navigate to="/dashboard" replace />;
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
                <Route path="/auth" element={<Navigate to="/" replace />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
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
                <Route path="/select-role" element={<RoleRoute><RoleSelection /></RoleRoute>} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/resumes" element={<Resumes />} />
                  <Route path="/job-tracker" element={<ProRoute><JobTracker /></ProRoute>} />
                  <Route path="/email-outreach" element={<ProRoute><EmailOutreach /></ProRoute>} />
                  <Route path="/cover-letters" element={<Navigate to="/resumes" replace />} />
                  <Route path="/jobs" element={<FindJobs />} />
                  <Route path="/companies" element={<ProRoute><Companies /></ProRoute>} />
                  <Route path="/interview-prep" element={<ProRoute><InterviewPrep /></ProRoute>} />

                  <Route path="/recruiter/company" element={<RecruiterCompany />} />
                  <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
                  <Route path="/recruiter/jobs/:jobId/applicants" element={<RecruiterApplicants />} />
                  <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
                  <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
                  <Route path="/account" element={<AccountSettings />} />
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>

                </Route>
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
