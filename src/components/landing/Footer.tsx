import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v8a4 4 0 0 1-8 0 4 4 0 0 1 4-4Z" />
  </svg>
);

const socialLinks = [
  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/atsproresumebuilder/' },
  { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61588106469176' },
  { name: 'TikTok', icon: TikTokIcon, url: 'https://www.tiktok.com/@atsproresumebuilder' },
  { name: 'Twitter', icon: Twitter, url: 'https://x.com/Atspro_official' },
  { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/company/ats-pro-resume-builder/' },
];
export const Footer = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const tf = t.footer;
  const tn = t.nav;
  
  return (
    <footer className="py-16 md:py-40 bg-white border-t border-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-600/20 to-transparent" />
      <div className="container mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          <div className="lg:col-span-2 space-y-12 text-left">
            <Logo variant="auto" className="h-14" />
            <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-sm">
              {tf.tagline}
            </p>
            <div className="flex gap-4">
              {socialLinks.map(platform => {
                const Icon = platform.icon;
                return (
                  <a 
                    key={platform.name} 
                    href={platform.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm"
                    aria-label={platform.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-10 text-left">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{tf.company}</h4>
            <ul className="space-y-6">
              <li><Link to="/about" className="text-slate-600 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">{tn.about}</Link></li>
              <li><Link to="/contact" className="text-slate-600 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">{tn.contact || "Contact"}</Link></li>
              <li><button onClick={() => toast({ title: tf.privacyAudit, description: tf.privacyAuditDesc })} className="text-slate-600 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">{tf.privacyProtocols}</button></li>
              <li><Link to="/resume-templates" className="text-slate-600 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">{tn.resumeTemplates}</Link></li>
            </ul>
          </div>

          <div className="space-y-10 text-left">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{tf.products}</h4>
            <ul className="space-y-6">
              <li><Link to="/pricing" className="text-slate-600 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">{tn.pricing}</Link></li>
              <li><Link to="/blog" className="text-slate-600 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">{tn.blog}</Link></li>
              <li><Link to="/about" className="text-slate-600 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">{tn.vision || "Our Vision"}</Link></li>
              <li><Link to="/contact" className="text-slate-600 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">{tn.support || "Support Center"}</Link></li>
            </ul>
          </div>



        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mt-16 md:mt-40 pt-10 md:pt-20 border-t border-slate-100">
          <div className="flex flex-wrap justify-center gap-10">
            <Link to="/privacy" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors">{tf.privacyProtocols}</Link>
            <Link to="/terms" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors">{tf.serviceTerms}</Link>
            <button onClick={() => toast({ title: tf.securityAudit, description: tf.securityAuditDesc })} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors text-left">{tf.securityAudit}</button>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">
            © {new Date().getFullYear()} {tf.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
