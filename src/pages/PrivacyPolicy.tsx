import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background text-foreground">
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="JobFlow AI" className="h-14" />
        </Link>
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </nav>

    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
          <p>When you use JobFlow AI, we collect information you provide directly, including your name, email address, and resume content. We also automatically collect usage data such as pages visited, features used, and device information to improve our services.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide, maintain, and improve our resume building and job tracking services</li>
            <li>To process your resume data through our AI-powered optimization tools</li>
            <li>To send you account-related notifications and updates</li>
            <li>To analyze usage patterns and improve user experience</li>
            <li>To protect against fraud and unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. Resume data and personal information are stored in encrypted databases. We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing</h2>
          <p>We do not sell your personal information to third parties. We may share data with trusted service providers who assist in operating our platform, subject to strict confidentiality agreements. We may also disclose information when required by law or to protect our rights.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time. You can export your resume data or request account deletion through your account settings. We will respond to all data-related requests within 30 days.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We may also use analytics cookies to understand how our platform is used. You can control cookie preferences through your browser settings.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or our data practices, please contact us at <span className="text-primary font-medium">support@jobflowai.com</span>.</p>
        </section>
      </div>
    </main>
  </div>
);

export default PrivacyPolicy;
