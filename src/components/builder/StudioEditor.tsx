import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";

interface StudioEditorProps {
  activeSection: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}

export default function StudioEditor({
  activeSection,
  children,
  onSave,
  saving,
}: StudioEditorProps) {
  return (
    <main className="flex-1 bg-[#F8FAFC] h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-12 pb-40 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 20,
                duration: 0.4 
              }}
              className="space-y-12"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>
      
      {/* Sticky Save Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-2 rounded-[2rem] shadow-3xl flex items-center gap-2">
           <Button variant="ghost" className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 gap-2 hover:bg-slate-50 transition-all">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
           </Button>
           <Button 
             onClick={onSave}
             disabled={saving}
             className="h-14 px-12 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
           >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Mission
           </Button>
        </div>
      </div>
    </main>
  );
}
