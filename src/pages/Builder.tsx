import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Settings, 
  Layout, 
  Type, 
  Grid, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical,
  Save,
  ZoomIn,
  ZoomOut,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Builder = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  
  // Resume State
  const [resumeData, setResumeData] = useState({
    personal: {
      fullName: "Alex Rivera",
      email: "alex.rivera@example.com",
      phone: "+1 555 0123",
      location: "San Francisco, CA",
      website: "alexrivera.design",
      role: "Senior Product Designer"
    },
    experience: [
      {
        id: "1",
        company: "Stripe",
        role: "Product Designer",
        duration: "2021 — Present",
        description: "Led the redesign of the checkout experience, increasing conversion by 12%. Collaborated with engineering teams to implement a new design system."
      }
    ],
    education: [
      {
        id: "1",
        school: "Design Institute",
        degree: "BFA in Interaction Design",
        duration: "2017 — 2021"
      }
    ],
    skills: ["Product Design", "Framer", "React", "Visual Design", "Prototyping"]
  });

  const handlePersonalChange = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Resume Saved",
        description: "Your changes have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight">Untitled Resume</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
              {isSaving ? "Saving..." : "Saved to Cloud"}
              {!isSaving && <div className="w-1 h-1 bg-green-500 rounded-full" />}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-bold text-slate-600 gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Assist
          </Button>
          <Button onClick={saveResume} variant="ghost" size="sm" className="font-bold text-slate-600 gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl px-6">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - NAVIGATION */}
        <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-8">
          {[
            { id: "content", icon: <Layout className="w-6 h-6" />, label: "Content" },
            { id: "appearance", icon: <Type className="w-6 h-6" />, label: "Design" },
            { id: "templates", icon: <Grid className="w-6 h-6" />, label: "Themes" },
            { id: "settings", icon: <Settings className="w-6 h-6" />, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 group relative ${
                activeTab === item.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                activeTab === item.id ? "bg-primary/10" : "bg-transparent group-hover:bg-slate-50"
              }`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeSideTab"
                  className="absolute -right-[1px] top-1/4 w-1 h-1/2 bg-primary rounded-l-full" 
                />
              )}
            </button>
          ))}
        </aside>

        {/* CENTER PANEL - EDITABLE FORMS */}
        <main className="w-[450px] bg-white border-r border-slate-200 flex flex-col">
          <ScrollArea className="flex-1 px-8 py-10">
            <AnimatePresence mode="wait">
              {activeTab === "content" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-12"
                >
                  {/* Personal Info */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-900" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Personal Info</h3>
                    </div>
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</Label>
                        <Input 
                          value={resumeData.personal.fullName}
                          onChange={(e) => handlePersonalChange("fullName", e.target.value)}
                          className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/10 h-11" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desired Role</Label>
                        <Input 
                          value={resumeData.personal.role}
                          onChange={(e) => handlePersonalChange("role", e.target.value)}
                          className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/10 h-11" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</Label>
                          <Input 
                            value={resumeData.personal.email}
                            className="rounded-xl border-slate-200 h-11" 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</Label>
                          <Input 
                            value={resumeData.personal.phone}
                            className="rounded-xl border-slate-200 h-11" 
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Experience */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-slate-900" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Experience</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary font-bold">
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 group relative">
                          <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid gap-4">
                            <Input 
                              placeholder="Company Name" 
                              value={exp.company}
                              className="bg-transparent border-none p-0 font-bold text-slate-900 focus-visible:ring-0 h-auto text-base" 
                            />
                            <Input 
                              placeholder="Role" 
                              value={exp.role}
                              className="bg-transparent border-none p-0 text-slate-600 focus-visible:ring-0 h-auto text-sm" 
                            />
                            <Textarea 
                              placeholder="Description" 
                              value={exp.description}
                              className="bg-transparent border-none p-0 text-slate-500 focus-visible:ring-0 resize-none text-xs leading-relaxed" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === "appearance" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <h3 className="text-lg font-black text-slate-900 mb-6">Design Settings</h3>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                        Font Size <span>{14}px</span>
                      </Label>
                      <Slider defaultValue={[14]} max={20} min={10} step={1} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                        Line Height <span>{1.5}</span>
                      </Label>
                      <Slider defaultValue={[1.5]} max={2} min={1} step={0.1} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                        Page Margins <span>{40}px</span>
                      </Label>
                      <Slider defaultValue={[40]} max={80} min={20} step={5} />
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === "templates" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <h3 className="text-lg font-black text-slate-900 mb-6">Choose Template</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "modern", name: "Modern", color: "bg-primary" },
                      { id: "minimal", name: "Minimal", color: "bg-slate-900" },
                      { id: "creative", name: "Creative", color: "bg-purple-600" },
                      { id: "corporate", name: "Corporate", color: "bg-blue-900" },
                    ].map((template) => (
                      <button
                        key={template.id}
                        className="group flex flex-col gap-3 text-left"
                      >
                        <div className="aspect-[3/4] bg-slate-100 rounded-xl border-2 border-transparent group-hover:border-primary transition-all overflow-hidden relative shadow-sm">
                          <div className={`absolute top-0 left-0 w-full h-2 ${template.color}`} />
                          <div className="p-4 space-y-2">
                            <div className="w-1/2 h-2 bg-slate-200 rounded" />
                            <div className="w-3/4 h-1 bg-slate-200 rounded" />
                            <div className="w-full h-1 bg-slate-200 rounded" />
                            <div className="pt-4 space-y-2">
                              <div className="w-1/3 h-1 bg-slate-200 rounded" />
                              <div className="w-full h-10 bg-slate-50 rounded" />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{template.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <h3 className="text-lg font-black text-slate-900 mb-6">Resume Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <p className="text-sm font-bold text-slate-900">ATS Optimization</p>
                        <p className="text-xs text-slate-500">Automatically optimize for job scanners</p>
                      </div>
                      <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </main>

        {/* RIGHT PANEL - LIVE PREVIEW */}
        <section className="flex-1 bg-slate-100 flex flex-col relative">
          {/* Preview Toolbar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full flex items-center gap-4 z-20 shadow-xl border-slate-200/50">
            <button onClick={() => setZoom(prev => Math.max(prev - 10, 50))} className="p-1 hover:bg-slate-100 rounded-full">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 min-w-[3rem] text-center">{zoom}%</span>
            <button onClick={() => setZoom(prev => Math.min(prev + 10, 150))} className="p-1 hover:bg-slate-100 rounded-full">
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <Button variant="ghost" size="sm" className="h-7 text-xs font-bold px-2">
              <Eye className="w-3.5 h-3.5 mr-1" /> Preview
            </Button>
          </div>

          <ScrollArea className="flex-1 p-20">
            <div className="flex justify-center">
              <motion.div
                style={{ scale: zoom / 100, transformOrigin: "top center" }}
                className="resume-page p-12 shadow-2xl rounded-sm transition-all duration-300"
              >
                {/* Resume Header */}
                <header className="mb-10 text-center">
                  <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                    {resumeData.personal.fullName}
                  </h1>
                  <p className="text-primary font-bold text-lg mb-4 tracking-wide uppercase italic">
                    {resumeData.personal.role}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-medium">
                    <span>{resumeData.personal.email}</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{resumeData.personal.phone}</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{resumeData.personal.location}</span>
                  </div>
                </header>

                <div className="grid grid-cols-12 gap-8">
                  {/* Left Column */}
                  <div className="col-span-8 space-y-10">
                    <section>
                      <h2 className="resume-section-title">Professional Experience</h2>
                      <div className="space-y-8">
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="resume-item-title">{exp.role}</h3>
                              <span className="resume-item-date">{exp.duration}</span>
                            </div>
                            <p className="resume-item-subtitle mb-2">{exp.company}</p>
                            <p className="resume-content">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h2 className="resume-section-title">Education</h2>
                      <div className="space-y-6">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id}>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="resume-item-title">{edu.degree}</h3>
                              <span className="resume-item-date">{edu.duration}</span>
                            </div>
                            <p className="resume-item-subtitle">{edu.school}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="col-span-4 space-y-10">
                    <section>
                      <h2 className="resume-section-title">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200 uppercase tracking-tighter">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h2 className="resume-section-title">Contact</h2>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-primary" />
                          <span className="text-[11px] font-bold text-slate-600">{resumeData.personal.website}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollArea>
        </section>
      </div>
    </div>
  );
};

export default Builder;
