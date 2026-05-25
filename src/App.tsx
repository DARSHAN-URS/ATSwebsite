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
import { CookieConsent } from "@/components/CookieConsent";

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
const RecruiterDashboard = lazy(() => import("@/pages/RecruiterDashboard"));
const About = lazy(() => import("@/pages/About"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const InterviewPrep = lazy(() => import("@/pages/InterviewPrep"));
const InterviewSession = lazy(() => import("@/pages/InterviewSession"));
const InterviewQuestions = lazy(() => import("@/pages/InterviewQuestions"));
const InterviewPerformance = lazy(() => import("@/pages/InterviewPerformance"));
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
import ErrorBoundary from "@/components/ErrorBoundary";

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
    return <Navigate to={role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

function RoleRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) return <PageFallback />;
  if (!user) return <Navigate to="/" replace />;
  if (role) return <Navigate to={role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} replace />;
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
              <ErrorBoundary>
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
                  <Route path="/dashboard" element={<RoleGuard requiredRole="job_seeker"><Suspense fallback={<PageFallback />}><Dashboard /></Suspense></RoleGuard>} />
                  <Route path="/resumes" element={<RoleGuard requiredRole="job_seeker"><Suspense fallback={<PageFallback />}><Resumes /></Suspense></RoleGuard>} />
                  <Route path="/job-tracker" element={<RoleGuard requiredRole="job_seeker"><ProRoute><Suspense fallback={<PageFallback />}><JobTracker /></Suspense></ProRoute></RoleGuard>} />
                  <Route path="/email-outreach" element={<RoleGuard requiredRole="job_seeker"><ProRoute><Suspense fallback={<PageFallback />}><EmailOutreach /></Suspense></ProRoute></RoleGuard>} />
                  <Route path="/cover-letters" element={<RoleGuard requiredRole="job_seeker"><Suspense fallback={<PageFallback />}><CoverLetters /></Suspense></RoleGuard>} />
                  <Route path="/jobs" element={<RoleGuard requiredRole="job_seeker"><Suspense fallback={<PageFallback />}><FindJobs /></Suspense></RoleGuard>} />
                  <Route path="/companies" element={<RoleGuard requiredRole="job_seeker"><ProRoute><Suspense fallback={<PageFallback />}><Companies /></Suspense></ProRoute></RoleGuard>} />
                  <Route path="/upgrade" element={<RoleGuard requiredRole="job_seeker"><Suspense fallback={<PageFallback />}><Pricing isInternal={true} /></Suspense></RoleGuard>} />

                  <Route path="/interview-prep" element={<RoleGuard requiredRole="job_seeker"><ProRoute><Suspense fallback={<PageFallback />}><InterviewPrep /></Suspense></ProRoute></RoleGuard>} />
                  <Route path="/interview-prep/session" element={<RoleGuard requiredRole="job_seeker"><ProRoute><Suspense fallback={<PageFallback />}><InterviewSession /></Suspense></ProRoute></RoleGuard>} />
                  <Route path="/interview-prep/questions" element={<RoleGuard requiredRole="job_seeker"><ProRoute><Suspense fallback={<PageFallback />}><InterviewQuestions /></Suspense></ProRoute></RoleGuard>} />
                  <Route path="/interview-prep/performance" element={<RoleGuard requiredRole="job_seeker"><ProRoute><Suspense fallback={<PageFallback />}><InterviewPerformance /></Suspense></ProRoute></RoleGuard>} />

                  <Route path="/recruiter/dashboard" element={<RoleGuard requiredRole="recruiter"><Suspense fallback={<PageFallback />}><RecruiterDashboard /></Suspense></RoleGuard>} />
                  <Route path="/recruiter/company" element={<RoleGuard requiredRole="recruiter"><Suspense fallback={<PageFallback />}><RecruiterCompany /></Suspense></RoleGuard>} />
                  <Route path="/recruiter/jobs" element={<RoleGuard requiredRole="recruiter"><Suspense fallback={<PageFallback />}><RecruiterJobs /></Suspense></RoleGuard>} />
                  <Route path="/recruiter/jobs/:jobId/applicants" element={<RoleGuard requiredRole="recruiter"><Suspense fallback={<PageFallback />}><RecruiterApplicants /></Suspense></RoleGuard>} />
                  <Route path="/recruiter/candidates" element={<RoleGuard requiredRole="recruiter"><Suspense fallback={<PageFallback />}><RecruiterCandidates /></Suspense></RoleGuard>} />
                  <Route path="/recruiter/analytics" element={<RoleGuard requiredRole="recruiter"><Suspense fallback={<PageFallback />}><RecruiterAnalytics /></Suspense></RoleGuard>} />
                  <Route path="/profile" element={<Suspense fallback={<PageFallback />}><Profile /></Suspense>} />
                  <Route path="/dashboard/about" element={<Suspense fallback={<PageFallback />}><About isInternal={true} /></Suspense>} />
                  <Route path="/dashboard/blog" element={<Suspense fallback={<PageFallback />}><Blog isInternal={true} /></Suspense>} />
                  <Route path="/dashboard/blog/:slug" element={<Suspense fallback={<PageFallback />}><BlogArticlePage isInternal={true} /></Suspense>} />
                  <Route path="/dashboard/contact" element={<Suspense fallback={<PageFallback />}><Contact isInternal={true} /></Suspense>} />
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<Suspense fallback={<PageFallback />}><AdminDashboard /></Suspense>} />
                  </Route>
                </Route>

                <Route path="/builder" element={<ProtectedRoute><RoleGuard requiredRole="job_seeker"><Suspense fallback={<PageFallback />}><Builder /></Suspense></RoleGuard></ProtectedRoute>} />
                <Route path="/builder/:id" element={<ProtectedRoute><RoleGuard requiredRole="job_seeker"><Suspense fallback={<PageFallback />}><Builder /></Suspense></RoleGuard></ProtectedRoute>} />

                <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFound /></Suspense>} />
              </Routes>
            </ErrorBoundary>
            </Suspense>
           </UserRoleProvider>
          </AuthProvider>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
