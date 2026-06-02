import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Monitor, Smartphone, Layout, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumePreview from "@/components/resume/ResumePreview";
import { ResumeData } from "@/components/resume/types";
import { TemplateId } from "@/components/resume/pdfTemplates";
import { cn } from "@/lib/utils";

interface StudioPreviewProps {
  resumeData: ResumeData;
  title: string;
  selectedTemplate: TemplateId;
  colors: any;
  zoom: number;
  onZoomChange: (val: number) => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function StudioPreview({
  resumeData,
  title,
  selectedTemplate,
  colors,
  zoom,
  onZoomChange,
  activeSection,
  onSectionChange,
}: StudioPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Page width is 794px in ResumePreview.
  // In mobile view, we want to scale the page to fit inside a 296px wide mobile screen view.
  // 296 / 794 = ~0.373
  const mobileScale = 0.373;

  return (
    <section className="flex-1 min-w-0 bg-[#EDF2F7] flex flex-col h-full overflow-hidden relative border-l border-slate-200">
      {/* Top Preview Controls */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-auto">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("desktop")}
              className={cn(
                "w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors",
                viewMode === "desktop" ? "bg-slate-100 text-blue-600 font-bold" : "text-slate-400"
              )}
              title="Desktop Print View"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("mobile")}
              className={cn(
                "w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors",
                viewMode === "mobile" ? "bg-slate-100 text-blue-600 font-bold" : "text-slate-400"
              )}
              title="Mobile Responsive View"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-4 w-px bg-slate-200 mx-1" />
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 px-2">
            <Button 
              variant="ghost" 
              size="icon" 
              disabled={viewMode === "mobile"}
              onClick={() => onZoomChange(Math.max(50, zoom - 10))} 
              className="w-9 h-9 rounded-xl hover:bg-slate-100 disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-slate-500" />
            </Button>
            <span className={cn(
              "text-[10px] font-black w-10 text-center transition-opacity",
              viewMode === "mobile" ? "text-slate-400 opacity-60" : "text-slate-900"
            )}>
              {viewMode === "mobile" ? "AUTO" : `${zoom}%`}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              disabled={viewMode === "mobile"}
              onClick={() => onZoomChange(Math.min(150, zoom + 10))} 
              className="w-9 h-9 rounded-xl hover:bg-slate-100 disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
          
          <div className="h-4 w-px bg-slate-200 mx-1" />
          
          {/* Quick Tab Selectors */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onSectionChange?.("templates")}
              className={cn(
                "w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors",
                activeSection === "templates" ? "bg-slate-100 text-blue-600 font-bold" : "text-slate-500"
              )}
              title="Switch to Templates Tab"
            >
              <Layout className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onSectionChange?.("design")}
              className={cn(
                "w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors",
                activeSection === "design" ? "bg-slate-100 text-blue-600 font-bold" : "text-slate-500"
              )}
              title="Switch to Visual Design Tab"
            >
              <Palette className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Paper Canvas */}
      <div className="flex-1 overflow-auto custom-scrollbar pt-28 pb-32 flex items-start justify-center">
        {viewMode === "desktop" ? (
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
        ) : (
          /* Mobile View: Render in a simulated Smartphone Mockup */
          <div className="relative mx-auto mt-4">
            {/* Phone Case Frame */}
            <div className="w-[340px] h-[680px] bg-slate-900 rounded-[50px] p-4 shadow-[0_30px_70px_rgba(0,0,0,0.25)] border-4 border-slate-700 relative flex flex-col overflow-hidden ring-1 ring-slate-800">
              {/* Dynamic Island / Speaker notch */}
              <div className="absolute top-7 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40 flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-950 rounded-full ml-auto mr-4" />
              </div>
              
              {/* Phone Screen Container */}
              <div className="w-full h-full bg-[#EDF2F7] rounded-[36px] overflow-y-auto overflow-x-hidden custom-scrollbar relative flex flex-col items-center pt-10 pb-8 px-2 gap-4">
                <div 
                  style={{
                    width: "794px",
                    transform: `scale(${mobileScale})`,
                    transformOrigin: "top center",
                    // Adjust container height to match scaled down pages
                    height: "auto",
                    marginBottom: `calc(794px * (1 - ${mobileScale}) * -1)`
                  }}
                  className="shadow-md rounded-md overflow-hidden bg-white"
                >
                  <ResumePreview 
                    resumeData={resumeData} 
                    title={title} 
                    templateId={selectedTemplate} 
                    colors={colors} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Helper Text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap opacity-50">
        Rendered via Architecture Engine v4.2
      </div>
    </section>
  );
}
