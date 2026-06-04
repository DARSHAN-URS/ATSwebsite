import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import AppLayout from "@/components/AppLayout";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContactProps {
  isInternal?: boolean;
}

export default function Contact({ isInternal = false }: ContactProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    type: "general",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/emails/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setSubmitted(true);
      toast({ title: "Message Sent!", description: "We'll get back to you shortly." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen text-slate-900 dark:text-white font-sans", isInternal ? "bg-transparent" : "bg-white dark:bg-slate-900")}>
      <SEOHead 
        title="Contact — ResumePro" 
        description="Initialize communication with our support modules for architectural guidance."
      />
      
      {!isInternal && <Navbar />}

      <main className={cn("max-w-7xl mx-auto px-8 pb-40 space-y-20", isInternal ? "pt-10" : "pt-48")}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-12">
           <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Communication Protocol</span>
              </motion.div>
              <h1 className="text-2xl md:text-4xl md:text-6xl md:text-[8rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] uppercase">
                 Get in <br /> <span className="text-blue-600">Touch.</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                 Whether you have a question about features, pricing, or need architectural guidance, our team is ready to synchronize.
              </p>
           </div>

           <div className="hidden lg:block pb-4">
              <div className="w-px h-32 bg-slate-100 dark:bg-slate-800" />
           </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-10">
           <Card className="rounded-[2.5rem] border border-slate-100/50 bg-slate-50 dark:bg-slate-900 p-12 space-y-8 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl transition-all group flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                 <Mail className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Direct Transmission</p>
                 <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none break-all select-all">
                    support@atsproresume.com
                 </h3>
                 <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Reach out directly via email for technical inquiries & support. We'll get back to you as soon as possible.</p>
              </div>
           </Card>
        </div>
      </main>

      {!isInternal && <Footer />}
    </div>
  );
}
