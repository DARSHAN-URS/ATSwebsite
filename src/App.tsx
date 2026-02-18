import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";
import AppLayout from "@/components/AppLayout";

import Dashboard from "@/pages/Dashboard";
import Resumes from "@/pages/Resumes";
import FindJobs from "@/pages/FindJobs";
import Companies from "@/pages/Companies";

import CoverLetters from "@/pages/CoverLetters";
import Index from "@/pages/Index";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/NotFound";
import RoleSelection from "@/pages/RoleSelection";
import RecruiterJobs from "@/pages/RecruiterJobs";

import RecruiterAnalytics from "@/pages/RecruiterAnalytics";
import RecruiterCompany from "@/pages/RecruiterCompany";
import RecruiterApplicants from "@/pages/RecruiterApplicants";
import RecruiterCandidates from "@/pages/RecruiterCandidates";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import ResetPassword from "@/pages/ResetPassword";
import InterviewPrep from "@/pages/InterviewPrep";
import Blog from "@/pages/Blog";
import ATSResumeBuilderSEO from "@/pages/seo/ATSResumeBuilder";
import ResumeTemplatesSEO from "@/pages/seo/ResumeTemplates";
import ResumeBuilderForFreshers from "@/pages/seo/ResumeBuilderForFreshers";
import SoftwareEngineerResume from "@/pages/seo/SoftwareEngineerResume";
import InterviewPreparationSEO from "@/pages/seo/InterviewPreparation";
import ResumeDownloadFormats from "@/pages/seo/ResumeDownloadFormats";
import { BlogArticlePage } from "@/pages/seo/BlogArticles";


const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!role) return <Navigate to="/select-role" replace />;
  return <>{children}</>;
}

function RoleRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading...</div>;
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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Navigate to="/" replace />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogArticlePage />} />
              <Route path="/ats-resume-builder" element={<ATSResumeBuilderSEO />} />
              <Route path="/resume-templates" element={<ResumeTemplatesSEO />} />
              <Route path="/resume-builder-for-freshers" element={<ResumeBuilderForFreshers />} />
              <Route path="/software-engineer-resume" element={<SoftwareEngineerResume />} />
              <Route path="/interview-preparation" element={<InterviewPreparationSEO />} />
              <Route path="/resume-download" element={<ResumeDownloadFormats />} />
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
                <Route path="/cover-letters" element={<Navigate to="/resumes" replace />} />
                <Route path="/jobs" element={<FindJobs />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/interview-prep" element={<InterviewPrep />} />
                
                <Route path="/recruiter/company" element={<RecruiterCompany />} />
                <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
                <Route path="/recruiter/jobs/:jobId/applicants" element={<RecruiterApplicants />} />
                <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
                
                <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
                
                
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
