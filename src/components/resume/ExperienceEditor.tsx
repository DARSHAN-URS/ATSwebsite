import { Plus, Trash2, GripVertical, Calendar, Building2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import type { ExperienceItem } from "./types";

interface Props {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
}

export default function ExperienceEditor({ experience, onChange }: Props) {
  const addItem = () => {
    const newItem: ExperienceItem = {
      company: "",
      title: "",
      description: "",
      bullets: [""],
      startDate: "",
      endDate: "",
    };
    onChange([...experience, newItem]);
  };

  const updateItem = (index: number, updates: Partial<ExperienceItem>) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(experience.filter((_, i) => i !== index));
  };

  const updateBullet = (itemIndex: number, bulletIndex: number, value: string) => {
    const updated = [...experience];
    const bullets = [...updated[itemIndex].bullets];
    bullets[bulletIndex] = value;
    updated[itemIndex] = { ...updated[itemIndex], bullets };
    onChange(updated);
  };

  const addBullet = (itemIndex: number) => {
    const updated = [...experience];
    updated[itemIndex] = {
      ...updated[itemIndex],
      bullets: [...updated[itemIndex].bullets, ""],
    };
    onChange(updated);
  };

  const removeBullet = (itemIndex: number, bulletIndex: number) => {
    const updated = [...experience];
    updated[itemIndex] = {
      ...updated[itemIndex],
      bullets: updated[itemIndex].bullets.filter((_, i) => i !== bulletIndex),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-12">
      <AnimatePresence mode="popLayout">
        {experience.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            layout
          >
            <Card className="rounded-[3rem] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700">
              <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      value={item.company}
                      onChange={(e) => updateItem(index, { company: e.target.value })}
                      className="bg-transparent border-none p-0 focus:ring-0 text-2xl font-black text-slate-900 w-full placeholder:text-slate-200"
                      placeholder="Company Name"
                    />
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Employment Module</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeItem(index)}
                  className="h-12 w-12 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4 group/input">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">Professional Job Title</Label>
                    <div className="relative">
                       <GripVertical className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200 group-focus-within/input:text-blue-600 transition-colors" />
                       <Input 
                         value={item.title} 
                         onChange={(e) => updateItem(index, { title: e.target.value })} 
                         placeholder="e.g. Senior Software Engineer"
                         className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-bold placeholder:text-slate-200"
                       />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4 group/input">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">Deployment Start</Label>
                      <div className="relative">
                         <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200 group-focus-within/input:text-blue-600 transition-colors" />
                         <Input 
                           value={item.startDate} 
                           onChange={(e) => updateItem(index, { startDate: e.target.value })} 
                           placeholder="MM / YYYY"
                           className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-xs font-bold"
                         />
                      </div>
                    </div>
                    <div className="space-y-4 group/input">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">Deployment End</Label>
                      <div className="relative">
                         <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200 group-focus-within/input:text-blue-600 transition-colors" />
                         <Input 
                           value={item.endDate} 
                           onChange={(e) => updateItem(index, { endDate: e.target.value })} 
                           placeholder="Present"
                           className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-xs font-bold"
                         />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                       <Sparkles className="w-4 h-4 text-blue-600" />
                       <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Mission Achievements</Label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 gap-2 hover:bg-blue-50 transition-all">
                      <Wand2 className="w-3.5 h-3.5" /> AI Assist
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {item.bullets.map((bullet, bi) => (
                      <motion.div 
                        key={bi} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 group/bullet"
                      >
                        <div className="flex-1 relative">
                          <Input 
                            value={bullet} 
                            onChange={(e) => updateBullet(index, bi, e.target.value)}
                            placeholder="e.g. Optimized core infrastructure resulting in 40% efficiency gains..."
                            className="h-16 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium pr-12 placeholder:text-slate-300"
                          />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-100 rounded-r-full group-focus-within/bullet:bg-blue-600 transition-colors" />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeBullet(index, bi)}
                          className="h-16 w-16 rounded-2xl opacity-0 group-hover/bullet:opacity-100 transition-all text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={() => addBullet(index)}
                      className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-100 bg-transparent text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all font-bold text-xs gap-3"
                    >
                      <Plus className="w-5 h-5" /> Add Achievement Vector
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        onClick={addItem}
        className="w-full h-24 rounded-[3rem] border-2 border-dashed border-slate-100 bg-transparent text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all font-black uppercase tracking-[0.2em] text-xs gap-4 shadow-sm"
      >
        <Plus className="w-6 h-6" /> Initialize New Experience Module
      </Button>
    </div>
  );
  );
}
