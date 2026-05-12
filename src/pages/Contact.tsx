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

export default function Contact() {
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
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
      <SEOHead 
        title="Contact — ResumePro" 
        description="Initialize communication with our support modules for architectural guidance."
      />
      
      <div className="max-w-7xl mx-auto px-8 py-20 space-y-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-12">
           <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Communication Protocol</span>
              </motion.div>
              <h1 className="text-6xl md:text-[8rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] uppercase">
                 Get in <br /> <span className="text-blue-600">Touch.</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                 Whether you have a question about features, pricing, or need architectural guidance, our team is ready to synchronize.
              </p>
           </div>

           <div className="hidden lg:block pb-4">
              <div className="w-px h-32 bg-slate-100 dark:bg-slate-800" />
           </div>

           <div className="space-y-4 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Support Operational</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Response: 2.4 Hours</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-4 space-y-10">
             <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: Mail, label: "Transmission", value: "muza30111997@gmail.com", desc: "For technical inquiries" },
                  { icon: MessageSquare, label: "Real-time", value: "Live Chat", desc: "Available Mon-Fri, 9am-6pm" },
                  { icon: MapPin, label: "Node Location", value: "Remote First", desc: "Distributed global team" }
                ].map((item, i) => (
                  <Card key={i} className="rounded-3xl border-none bg-slate-50 dark:bg-slate-900 p-8 space-y-6 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl transition-all group">
                     <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                        <item.icon className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.value}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                     </div>
                  </Card>
                ))}
             </div>

             <Card className="rounded-[3rem] border-none bg-blue-600 text-white p-10 shadow-2xl shadow-blue-600/30 space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                   <Phone className="w-8 h-8 text-blue-200" />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black tracking-tight uppercase leading-none">Enterprise <br /> Demo.</h3>
                   <p className="text-blue-100 font-medium leading-relaxed">
                      Schedule a 15-min deep dive of our AI synthesis tools for your recruitment team.
                   </p>
                </div>
                <Button variant="secondary" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-white text-blue-600 hover:bg-blue-50">
                   Book Strategic Call
                </Button>
             </Card>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8">
            <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.04)] overflow-hidden">
               <div className="p-12 md:p-20">
                  {submitted ? (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.9 }} 
                       animate={{ opacity: 1, scale: 1 }}
                       className="py-12 flex flex-col items-center justify-center text-center space-y-8"
                    >
                      <div className="h-24 w-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/10">
                        <CheckCircle2 className="h-12 w-12" />
                      </div>
                      <div className="space-y-4">
                         <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Message Received.</h2>
                         <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
                           Thank you for reaching out. A specialist will synchronize with your request at <strong>{formData.email}</strong> shortly.
                         </p>
                      </div>
                      <Button variant="outline" onClick={() => setSubmitted(false)} className="h-14 px-10 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50">Send another transmission</Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Identity Name</Label>
                          <Input 
                            required 
                            placeholder="John Doe" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold px-8 focus-visible:ring-blue-600"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Network Email</Label>
                          <Input 
                            type="email" 
                            required 
                            placeholder="john@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold px-8 focus-visible:ring-blue-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Inquiry Vector</Label>
                          <Select 
                            value={formData.type} 
                            onValueChange={(v) => setFormData({...formData, type: v})}
                          >
                            <SelectTrigger className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold px-8 focus:ring-blue-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                              <SelectItem value="general" className="rounded-xl p-3 font-bold">General Support</SelectItem>
                              <SelectItem value="billing" className="rounded-xl p-3 font-bold">Billing & Pricing</SelectItem>
                              <SelectItem value="feature" className="rounded-xl p-3 font-bold">Feature Request</SelectItem>
                              <SelectItem value="bug" className="rounded-xl p-3 font-bold">Report a Bug</SelectItem>
                              <SelectItem value="business" className="rounded-xl p-3 font-bold">Business Partnership</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Subject Matter</Label>
                          <Input 
                            required 
                            placeholder="How can we help?"
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold px-8 focus-visible:ring-blue-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Transmission Message</Label>
                        <Textarea 
                          required 
                          rows={6} 
                          placeholder="Provide detailed context for your inquiry..."
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border-none font-bold p-8 focus-visible:ring-blue-600 min-h-[200px]"
                        />
                      </div>

                      <div className="pt-4">
                        <Button type="submit" className="w-full h-20 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[11px] gap-4 shadow-3xl shadow-blue-600/30 hover:scale-[1.02] transition-all" disabled={loading}>
                          {loading ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Transmitting...</>
                          ) : (
                            <><Send className="h-5 w-5" /> Initialize Transmission</>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
