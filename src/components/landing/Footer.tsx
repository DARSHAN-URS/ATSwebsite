import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export const Footer = () => {
  const { toast } = useToast();
  
  return (
    <footer className="py-40 bg-white border-t border-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-600/20 to-transparent" />
      <div className="container mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-20">
          <div className="lg:col-span-2 space-y-12 text-left">
            <Logo variant="auto" className="h-14" />
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm">
              The high-fidelity infrastructure for the next generation of global technology professionals. Deploy your professional identity with AI precision.
            </p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map(platform => (
                <a key={platform} href="#" onClick={(e) => { e.preventDefault(); toast({ title: "Connecting to Node...", description: `Initializing secure handshake with ${platform}.` }); }} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                  <Globe className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-10 text-left">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Company</h4>
            <ul className="space-y-6">
              <li><Link to="/about" className="text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">Contact</Link></li>
              <li><button onClick={() => toast({ title: "Privacy Audit Active", description: "Your data is fully encrypted and secure." })} className="text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">Data Privacy</button></li>
              <li><Link to="/resume-templates" className="text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">Templates</Link></li>
            </ul>
          </div>

          <div className="space-y-10 text-left">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Products</h4>
            <ul className="space-y-6">
              <li><Link to="/pricing" className="text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">Pricing Plans</Link></li>
              <li><Link to="/blog" className="text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">Blog & News</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">Our Vision</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors">Support Center</Link></li>
            </ul>
          </div>

          <div className="space-y-10 text-left">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">System Status</h4>
            <button 
              onClick={() => toast({ title: "System Status", description: "The platform is running perfectly. All resumes are safe and synced." })}
              className="w-full p-10 rounded-[3rem] bg-slate-900 space-y-6 shadow-3xl relative overflow-hidden group text-left"
            >
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">All Systems Nominal</span>
              </div>
              <div className="space-y-2 relative z-10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Latency</p>
                <p className="text-xl font-black text-white tracking-tighter">14.8ms</p>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                <motion.div 
                  initial={{ width: "0%" }}
                  whileInView={{ width: "99.4%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                />
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mt-40 pt-20 border-t border-slate-100">
          <div className="flex flex-wrap justify-center gap-10">
            <Link to="/privacy" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors">Privacy Protocols</Link>
            <Link to="/terms" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors">Service Terms</Link>
            <button onClick={() => toast({ title: "Security Audit Active", description: "All infrastructure nodes are currently undergoing SOC2 verification." })} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors text-left">Security Audit</button>
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center">
            © {new Date().getFullYear()} ResumePro Infrastructure Dynamics. Deploying Build v4.2.1-ARCHITECT
          </p>
        </div>
      </div>
    </footer>
  );
};
