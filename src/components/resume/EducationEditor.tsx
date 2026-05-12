import { Plus, Trash2, GraduationCap, Calendar, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import type { EducationItem } from "./types";

interface Props {
  education: EducationItem[];
  onChange: (education: EducationItem[]) => void;
}

export default function EducationEditor({ education, onChange }: Props) {
  const addItem = () => {
    const newItem: EducationItem = {
      school: "",
      degree: "",
      year: "",
    };
    onChange([...education, newItem]);
  };

  const updateItem = (index: number, updates: Partial<EducationItem>) => {
    const updated = [...education];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {education.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <School className="w-4 h-4 text-purple-600" />
                  <input
                    value={item.school}
                    onChange={(e) => updateItem(index, { school: e.target.value })}
                    className="bg-transparent border-none p-0 focus:ring-0 text-sm font-black uppercase tracking-widest text-slate-900 w-64"
                    placeholder="University Name"
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Degree</Label>
                    <Input 
                      value={item.degree} 
                      onChange={(e) => updateItem(index, { degree: e.target.value })} 
                      placeholder="e.g. B.S. in Computer Science"
                      className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Graduation Year</Label>
                    <Input 
                      value={item.year} 
                      onChange={(e) => updateItem(index, { year: e.target.value })} 
                      placeholder="e.g. 2024"
                      className="h-12 rounded-xl bg-slate-50/50 border-slate-100 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        onClick={addItem}
        className="w-full h-16 rounded-[2rem] border-2 border-dashed border-slate-100 bg-transparent text-slate-400 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all font-black uppercase tracking-widest text-[10px] gap-2"
      >
        <Plus className="w-4 h-4" /> Add Education
      </Button>
    </div>
  );
}
