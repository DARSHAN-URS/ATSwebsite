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
    <div className="space-y-8">
      <AnimatePresence mode="popLayout">
        {experience.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            layout
          >
            <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <input
                    value={item.company}
                    onChange={(e) => updateItem(index, { company: e.target.value })}
                    className="bg-transparent border-none p-0 focus:ring-0 text-sm font-black uppercase tracking-widest text-slate-900 w-64"
                    placeholder="Company Name"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeItem(index)}
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Job Title</Label>
                    <Input 
                      value={item.title} 
                      onChange={(e) => updateItem(index, { title: e.target.value })} 
                      placeholder="e.g. Senior Software Engineer"
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-sm font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</Label>
                      <Input 
                        value={item.startDate} 
                        onChange={(e) => updateItem(index, { startDate: e.target.value })} 
                        placeholder="MM/YYYY"
                        className="h-11 rounded-xl bg-slate-50/50 border-slate-100 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date</Label>
                      <Input 
                        value={item.endDate} 
                        onChange={(e) => updateItem(index, { endDate: e.target.value })} 
                        placeholder="Present"
                        className="h-11 rounded-xl bg-slate-50/50 border-slate-100 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key Achievements</Label>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-blue-600 gap-2 hover:bg-blue-50">
                      <Wand2 className="w-3 h-3" /> AI Suggest
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {item.bullets.map((bullet, bi) => (
                      <div key={bi} className="flex gap-3 group">
                        <div className="flex-1 relative">
                          <Input 
                            value={bullet} 
                            onChange={(e) => updateBullet(index, bi, e.target.value)}
                            placeholder="e.g. Scaled system to 1M+ users..."
                            className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-sm font-medium pr-10"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeBullet(index, bi)}
                          className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={() => addBullet(index)}
                      className="w-full h-11 rounded-xl border-dashed border-slate-200 text-slate-400 hover:text-blue-600 font-bold text-xs gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Bullet Point
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
        className="w-full h-16 rounded-[2rem] border-2 border-dashed border-slate-100 bg-transparent text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all font-black uppercase tracking-widest text-[10px] gap-2"
      >
        <Plus className="w-4 h-4" /> Add Work Experience
      </Button>
    </div>
  );
}
