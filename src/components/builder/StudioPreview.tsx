import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Monitor, Smartphone, Layout, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumePreview from "@/components/resume/ResumePreview";
import { ResumeData } from "@/components/resume/types";
import { TemplateId } from "@/components/resume/pdfTemplates";

interface StudioPreviewProps {
  resumeData: ResumeData;
  title: string;
  selectedTemplate: TemplateId;
  colors: any;
  zoom: number;
  onZoomChange: (val: number) => void;
}

export default function StudioPreview({
  resumeData,
  title,
  selectedTemplate,
  colors,
  zoom,
  onZoomChange,
}: StudioPreviewProps) {
  return (
    <section className="flex-1 min-w-0 bg-[#EDF2F7] flex flex-col h-full overflow-hidden relative border-l border-slate-200">
      {/* Top Preview Controls */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-auto">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex items-center gap-2">
           <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500"><Monitor className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400"><Smartphone className="w-4 h-4" /></Button>
           </div>
           <div className="h-4 w-px bg-slate-200 mx-1" />
           <div className="flex items-center gap-2 px-2">
              <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.max(50, zoom - 10))} className="w-9 h-9 rounded-xl hover:bg-slate-100"><ZoomOut className="w-4 h-4 text-slate-500" /></Button>
              <span className="text-[10px] font-black text-slate-900 w-10 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.min(150, zoom + 10))} className="w-9 h-9 rounded-xl hover:bg-slate-100"><ZoomIn className="w-4 h-4 text-slate-500" /></Button>
           </div>
           <div className="h-4 w-px bg-slate-200 mx-1" />
           <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500"><Layout className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500"><Palette className="w-4 h-4" /></Button>
           </div>
        </div>
      </div>
      
      {/* Paper Canvas */}
      <div className="flex-1 overflow-auto custom-scrollbar pt-28 pb-32">
        <div className="min-h-full flex flex-col items-center justify-start min-w-max px-8">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: zoom / 100 }}
           style={{ 
              transformOrigin: "top center",
           }}
           className="shadow-[0_40px_100px_rgba(0,0,0,0.12)] rounded-sm bg-white ring-1 ring-slate-200/50"
        >
          <div className="bg-white">
            <ResumePreview 
              resumeData={resumeData} 
              title={title} 
              templateId={selectedTemplate} 
              colors={colors} 
            />
          </div>
        </motion.div>
        </div>
      </div>

      {/* Template Helper Text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap opacity-50">
         Rendered via Architecture Engine v4.2
      </div>
    </section>
  );
}
