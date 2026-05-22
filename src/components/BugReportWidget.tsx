import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bug, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { invokeFunction } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export function BugReportWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const { error } = await invokeFunction("contact", {
        name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || "User",
        email: user?.email,
        subject: `[BUG REPORT] ${subject || "General Bug"}`,
        message: message,
        type: "Bug Report"
      });

      if (error) throw error;

      toast({ title: "Report Submitted", description: "Thank you for reporting this issue. Our team will look into it." });
      setOpen(false);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message || "An error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-[0_10px_40px_rgba(225,29,72,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          title="Report a Bug"
        >
          <Bug className="w-6 h-6" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-8">
        <DialogHeader>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <Bug className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">Report an Issue</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Found a bug or glitch? Let us know so we can fix it immediately.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brief Description</Label>
            <Input 
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Broken button on PDF export" 
              className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Details</Label>
            <Textarea 
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe what happened, what you expected, and how we can reproduce the issue." 
              className="min-h-[120px] bg-slate-50 border-slate-100 rounded-xl resize-none font-medium p-4"
              required
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading || !message.trim()} 
              className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-black tracking-widest uppercase text-xs rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
