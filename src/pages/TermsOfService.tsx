import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const TermsOfService = () => (
  <div className="min-h-screen bg-background text-foreground">
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="JobFlow AI" className="h-[72px]" />
        </Link>
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </nav>

    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using JobFlow AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and continued use constitutes acceptance of any modifications.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
          <p>JobFlow AI provides AI-powered resume building, resume grading, job application tracking, cover letter generation, and job search tools. Our platform uses artificial intelligence to help optimize your career documents for Applicant Tracking Systems (ATS) and improve your job search outcomes.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You must be at least 16 years old to use our services</li>
            <li>One person may not maintain more than one account</li>
            <li>You are responsible for all activity that occurs under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. User Content</h2>
          <p>You retain ownership of all content you upload to JobFlow AI, including resume data, cover letters, and personal information. By using our AI features, you grant us a limited license to process your content for the purpose of providing our services. We do not claim ownership of your content.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Acceptable Use</h2>
          <p>You agree not to use JobFlow AI to create fraudulent or misleading resumes, impersonate others, upload malicious content, attempt to gain unauthorized access to our systems, or use our services for any unlawful purpose. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. AI-Generated Content</h2>
          <p>Our AI tools provide suggestions and optimizations based on industry best practices. While we strive for accuracy, AI-generated content should be reviewed by you before use. JobFlow AI is not responsible for hiring outcomes or decisions made based on AI-generated suggestions.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
          <p>JobFlow AI is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for our services in the preceding 12 months.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. Termination</h2>
          <p>You may terminate your account at any time through your account settings. We may suspend or terminate your access if you violate these terms. Upon termination, your data will be deleted within 30 days unless retention is required by law.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">9. Contact</h2>
          <p>For questions about these Terms of Service, contact us at <span className="text-primary font-medium">support@jobflowai.com</span>.</p>
        </section>
      </div>
    </main>
  </div>
);

export default TermsOfService;
