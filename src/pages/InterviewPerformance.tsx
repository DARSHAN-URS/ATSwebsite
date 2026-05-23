import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";
import {
  TrendingUp, Code, MessageSquare, ShieldCheck, Activity, Target, Brain, ArrowLeft, History
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function InterviewPerformance() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("mock_interviews_history");
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const totalSessions = historyList.length;
  const averageReadiness = totalSessions > 0 
    ? Math.round(historyList.reduce((sum, h) => sum + h.score, 0) / totalSessions) 
    : 0;

  const averageTech = totalSessions > 0
    ? Math.round(historyList.reduce((sum, h) => sum + h.technical, 0) / totalSessions)
    : 0;

  const averageComm = totalSessions > 0
    ? Math.round(historyList.reduce((sum, h) => sum + (h.communication || 85), 0) / totalSessions)
    : 0;

  const averageSysDesign = totalSessions > 0
    ? Math.round(historyList.reduce((sum, h) => sum + Math.max(50, Math.round((h.technical * 0.9 + h.communication * 0.1) - 4)), 0) / totalSessions)
    : 0;

  const analyticsData = historyList.slice().reverse().map(h => ({
    name: h.date,
    score: h.score
  })).slice(-7);

  if (analyticsData.length === 0) {
    analyticsData.push({ name: "No Sessions", score: 0 });
  }

  const pieData = [
    { name: "Technical", value: averageTech, color: "#2563eb" },
    { name: "Behavioral", value: averageComm, color: "#10b981" },
    { name: "System Design", value: averageSysDesign, color: "#f59e0b" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 relative font-sans text-left">
      <SEOHead title="Performance Analytics - ResumePro" description="Review your interview performance." />
         
         <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate("/interview-prep")} className="text-slate-400 hover:text-slate-900 rounded-xl px-2">
               <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
            </Button>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
               { label: "Confidence", value: totalSessions > 0 ? `${averageComm}%` : "--", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
               { label: "Technical", value: totalSessions > 0 ? `${averageTech}%` : "--", icon: Code, color: "text-indigo-600", bg: "bg-indigo-50" },
               { label: "Communication", value: totalSessions === 0 ? "--" : averageComm >= 85 ? "High" : averageComm >= 70 ? "Medium" : "Needs Work", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
               { label: "Readiness", value: totalSessions === 0 ? "--" : averageReadiness >= 80 ? "Ready" : averageReadiness >= 65 ? "Improving" : "Critical", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((stat, i) => (
               <Card key={i} className="bg-white border border-slate-200 p-5 rounded-[1.5rem] hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                     <div className={cn("p-2.5 rounded-xl transition-colors", stat.bg)}>
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                     </div>
                     <Badge variant="outline" className="text-[8px] border-slate-200 text-slate-400 font-bold px-2 py-0.5">+2.4%</Badge>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900">{stat.value}</p>
               </Card>
            ))}
         </div>

         {/* Charts & Analytics */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               <Card className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                  <div className="flex justify-between items-start mb-8">
                     <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                           <Activity className="w-4 h-4 text-indigo-600" /> Readiness Trajectory
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance over last 7 sessions</p>
                     </div>
                     <Badge className="bg-indigo-50 text-indigo-600 border-none text-[9px] font-bold uppercase tracking-widest">AI Tracked</Badge>
                  </div>
                  
                  <div className="h-64">
                     {totalSessions === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                           <Activity className="w-8 h-8 opacity-50" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">No Data Available</span>
                        </div>
                     ) : (
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={analyticsData}>
                              <XAxis dataKey="name" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} stroke="#94a3b8" />
                              <YAxis fontSize={10} fontWeight={700} tickLine={false} axisLine={false} stroke="#94a3b8" />
                              <ReTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }} />
                              <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     )}
                  </div>
               </Card>

               {/* Recent Sessions */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                     <History className="w-4 h-4 text-blue-600" />
                     <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Recent Sessions</h3>
                  </div>
                  
                  {historyList.length === 0 ? (
                     <Card className="bg-white border border-slate-200 border-dashed p-12 rounded-[2rem] text-center space-y-4">
                        <Target className="w-10 h-10 text-slate-300 mx-auto" />
                        <div>
                           <p className="text-sm font-bold text-slate-900">No Interview History</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complete a session to see detailed feedback</p>
                        </div>
                     </Card>
                  ) : (
                     <div className="space-y-4">
                        {historyList.map(session => (
                           <Card key={session.id} className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-blue-600/30 transition-all group">
                              <div className="flex flex-col md:flex-row justify-between gap-6">
                                 <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                       <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{session.role}</h4>
                                       <Badge variant="outline" className="text-[8px] font-bold uppercase border-slate-200 text-slate-400">{session.date}</Badge>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{session.summary}</p>
                                 </div>
                                 <div className="flex items-center gap-6">
                                    <div className="text-center">
                                       <p className="text-2xl font-black text-blue-600">{session.score}%</p>
                                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-50">
                                 <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Strengths</p>
                                    <ul className="space-y-1.5">
                                       {session.strengths.map((s: string, i: number) => (
                                          <li key={i} className="text-[11px] font-medium text-slate-600 flex items-start gap-2 before:content-['•'] before:text-emerald-500">{s}</li>
                                       ))}
                                    </ul>
                                 </div>
                                 <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Areas to Improve</p>
                                    <ul className="space-y-1.5">
                                       {session.weaknesses.map((w: string, i: number) => (
                                          <li key={i} className="text-[11px] font-medium text-slate-600 flex items-start gap-2 before:content-['•'] before:text-amber-500">{w}</li>
                                       ))}
                                    </ul>
                                 </div>
                              </div>
                           </Card>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <Card className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                     <Brain className="w-20 h-20 text-slate-900" />
                  </div>
                  <div className="space-y-1 mb-8 relative z-10">
                     <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-emerald-600" /> Competency Matrix
                     </h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill distribution analysis</p>
                  </div>

                  <div className="h-48 relative z-10">
                     {totalSessions === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                           <Brain className="w-8 h-8 opacity-50" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">No Data Available</span>
                        </div>
                     ) : (
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                 {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }} />
                           </PieChart>
                        </ResponsiveContainer>
                     )}
                  </div>
                  
                  {totalSessions > 0 && (
                     <div className="space-y-4 pt-6 mt-6 border-t border-slate-50 relative z-10">
                        {pieData.map(item => (
                           <div key={item.name} className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                 <span className="text-slate-500">{item.name}</span>
                                 <span style={{ color: item.color }}>{item.value}%</span>
                              </div>
                              <Progress value={item.value} className="h-1.5" style={{ '--progress-background': item.color } as any} />
                           </div>
                        ))}
                     </div>
                  )}
               </Card>
            </div>
         </div>
    </div>
  );
}
