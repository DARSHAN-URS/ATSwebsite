import { Plus, Trash2, GripVertical, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomSection } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

export default function CustomSectionsEditor({ sections, onChange }: Props) {
  const addSection = () => {
    const newSection: CustomSection = {
      id: crypto.randomUUID(),
      title: "New Section",
      items: [""],
    };
    onChange([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<CustomSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addItem = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      updateSection(sectionId, { items: [...section.items, ""] });
    }
  };

  const updateItem = (sectionId: string, index: number, value: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      const newItems = [...section.items];
      newItems[index] = value;
      updateSection(sectionId, { items: newItems });
    }
  };

  const removeItem = (sectionId: string, index: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      const newItems = section.items.filter((_, i) => i !== index);
      updateSection(sectionId, { items: newItems });
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-300" />
                  <input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="bg-transparent border-none p-0 focus:ring-0 text-sm font-black uppercase tracking-widest text-slate-900 w-48"
                    placeholder="Section Title"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeSection(section.id)}
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  {section.items.map((item, index) => (
                    <motion.div 
                      key={index} 
                      layout
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex-1 relative">
                        <Input
                          value={item}
                          onChange={(e) => updateItem(section.id, index, e.target.value)}
                          placeholder="Add an achievement or detail..."
                          className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-medium pr-10"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors">
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(section.id, index)}
                        className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(section.id)}
                  className="w-full h-11 rounded-xl border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all font-bold text-xs gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        onClick={addSection}
        className="w-full h-16 rounded-[2rem] border-2 border-dashed border-slate-100 bg-transparent text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all font-black uppercase tracking-widest text-[10px] gap-2"
      >
        <Plus className="w-4 h-4" /> Add New Section
      </Button>
    </div>
  );
}
