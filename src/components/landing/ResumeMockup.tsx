import { motion } from "framer-motion";

export const ResumeMockup = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="relative max-w-6xl mx-auto">
          {/* Main Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 glass p-4 rounded-[2rem] shadow-2xl border-slate-200"
          >
            <div className="bg-white rounded-[1.5rem] overflow-hidden aspect-[16/10] relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Fake Dashboard UI */}
              <div className="flex h-full">
                <div className="w-1/4 border-r border-slate-200 p-6 flex flex-col gap-4">
                  <div className="w-1/2 h-4 bg-slate-200 rounded-full mb-4" />
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-full h-8 bg-white border border-slate-100 rounded-lg" />
                  ))}
                </div>
                <div className="w-3/4 p-8 flex justify-center bg-slate-100/50">
                  <div className="w-[85%] h-full bg-white shadow-2xl rounded-lg p-10 flex flex-col gap-6 scale-95 origin-top transition-transform group-hover:scale-100 duration-700">
                    <div className="flex justify-between items-start">
                      <div className="w-1/2">
                        <div className="w-3/4 h-8 bg-slate-900 rounded-md mb-2" />
                        <div className="w-1/2 h-4 bg-slate-400 rounded-md" />
                      </div>
                      <div className="w-16 h-16 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-4">
                        <div className="w-1/3 h-4 bg-primary/20 rounded-md" />
                        <div className="w-full h-24 bg-white rounded-md" />
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="w-1/3 h-4 bg-primary/20 rounded-md" />
                        <div className="w-full h-24 bg-white rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Cards */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 z-20 glass p-6 rounded-2xl shadow-xl w-64 hidden lg:block"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                ✓
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">ATS Optimized</p>
                <p className="text-xs text-slate-500">Score: 98/100</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-[98%] h-full bg-green-500" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 z-20 glass p-6 rounded-2xl shadow-xl w-64 hidden lg:block"
          >
            <p className="text-sm font-bold text-slate-900 mb-2">Live Preview</p>
            <div className="flex flex-col gap-2">
              <div className="w-full h-4 bg-slate-100 rounded-md" />
              <div className="w-3/4 h-4 bg-slate-100 rounded-md" />
              <div className="w-full h-4 bg-primary/10 rounded-md animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
