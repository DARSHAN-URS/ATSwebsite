import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Play, Square, RotateCcw, Send, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };
type Phase = "setup" | "listening" | "thinking" | "speaking" | "idle" | "summary";

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-prep`;

export default function InterviewPrep() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [position, setPosition] = useState("");
  const [industry, setIndustry] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [currentCoachText, setCurrentCoachText] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);
  const isListening = phase === "listening";

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) { setPhase("idle"); return; }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setPhase("speaking");
    utterance.onend = () => setPhase("idle");
    utterance.onerror = () => setPhase("idle");
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const streamResponse = useCallback(async (body: any): Promise<string> => {
    const resp = await fetch(FUNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") break;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            full += content;
            setCurrentCoachText(full);
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: full } : m);
              }
              return [...prev, { role: "assistant", content: full }];
            });
          }
        } catch { /* partial */ }
      }
    }
    return full;
  }, [session]);

  const startInterview = async () => {
    if (!position.trim() || !industry.trim()) {
      toast({ title: "Please enter both position and industry", variant: "destructive" });
      return;
    }
    setStarted(true);
    setMessages([]);
    setQuestionCount(1);
    setPhase("thinking");
    try {
      const text = await streamResponse({ action: "start", position, industry });
      speak(text);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
      setPhase("idle");
    }
  };

  const sendAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    const userMsg: Message = { role: "user", content: answer };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setTranscript("");
    setCurrentCoachText("");
    setPhase("thinking");
    setQuestionCount(prev => prev + 1);
    try {
      const text = await streamResponse({
        action: "respond",
        position,
        industry,
        conversation: allMsgs,
      });
      speak(text);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
      setPhase("idle");
    }
  };

  const endInterview = async () => {
    synthRef.current.cancel();
    if (recognitionRef.current) { recognitionRef.current.stop(); }
    setCurrentCoachText("");
    setPhase("thinking");
    try {
      const text = await streamResponse({
        action: "summary",
        position,
        industry,
        conversation: messages,
      });
      setPhase("summary");
      speak(text);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
      setPhase("idle");
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Speech recognition not supported in this browser", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setPhase("idle");
      // Auto-send if there's a transcript
      if (transcript.trim()) sendAnswer(transcript.trim());
      return;
    }

    synthRef.current.cancel(); // stop coach if speaking
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => setPhase("idle");
    recognition.onend = () => {
      // Don't reset phase here, handled by toggle
    };
    recognitionRef.current = recognition;
    recognition.start();
    setPhase("listening");
  };

  const handleTextSend = () => {
    if (transcript.trim()) {
      if (isListening) recognitionRef.current?.stop();
      sendAnswer(transcript.trim());
    }
  };

  const resetInterview = () => {
    synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setStarted(false);
    setMessages([]);
    setTranscript("");
    setCurrentCoachText("");
    setPhase("setup");
    setQuestionCount(0);
  };

  // --- Setup screen ---
  if (!started) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Coach avatar */}
          <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview Coach</h1>
            <p className="text-muted-foreground mt-1">Your AI-powered one-on-one mock interview</p>
          </div>
          <Card className="text-left">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Position / Job Title</label>
                <Input placeholder="e.g. Senior Frontend Developer" value={position} onChange={e => setPosition(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Industry</label>
                <Input placeholder="e.g. Technology, Healthcare, Finance" value={industry} onChange={e => setIndustry(e.target.value)} />
              </div>
              <Button onClick={startInterview} className="w-full" size="lg">
                <Play className="h-4 w-4 mr-2" /> Start Interview
              </Button>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">Uses your microphone for voice conversation. You can also type.</p>
        </div>
      </div>
    );
  }

  // --- Interview screen ---
  const phaseLabel = {
    listening: "Listening to you...",
    thinking: "Coach is thinking...",
    speaking: "Coach is speaking...",
    idle: "Tap the mic to answer",
    summary: "Interview Summary",
  }[phase] || "";

  return (
    <div className="flex flex-col items-center justify-between h-full p-4 max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="text-sm">
          <span className="font-semibold text-foreground">{position}</span>
          <span className="text-muted-foreground"> • {industry}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setVoiceEnabled(!voiceEnabled); if (phase === "speaking") synthRef.current.cancel(); }}>
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetInterview}>
            <RotateCcw className="h-3 w-3 mr-1" /> New
          </Button>
        </div>
      </div>

      {/* Central conversation area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 overflow-auto">
        {/* Coach avatar with pulse */}
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
          phase === "speaking" && "bg-primary/20 animate-pulse ring-4 ring-primary/30",
          phase === "thinking" && "bg-muted animate-pulse",
          phase === "listening" && "bg-accent",
          (phase === "idle" || phase === "summary") && "bg-primary/10",
        )}>
          <Bot className={cn("h-10 w-10 transition-colors", phase === "speaking" ? "text-primary" : "text-muted-foreground")} />
        </div>

        {/* Phase label */}
        <p className="text-sm font-medium text-muted-foreground mb-3">{phaseLabel}</p>
        {questionCount > 0 && phase !== "summary" && (
          <p className="text-xs text-muted-foreground/60 mb-4">Question {questionCount}</p>
        )}

        {/* Coach text - show only latest */}
        {currentCoachText && (
          <div className="w-full max-w-lg bg-muted/50 rounded-2xl p-5 mb-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-auto">
            {currentCoachText}
          </div>
        )}

        {/* User transcript while listening */}
        {isListening && transcript && (
          <div className="w-full max-w-lg bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 text-sm text-foreground">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">You</span>
            </div>
            {transcript}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="w-full space-y-3 pt-4">
        {/* Big mic button */}
        {phase !== "summary" && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={endInterview}
              disabled={phase === "thinking" || messages.length < 2}
              className="text-xs"
            >
              <Square className="h-3 w-3 mr-1" /> End Interview
            </Button>

            <button
              onClick={toggleListening}
              disabled={phase === "thinking"}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg",
                isListening
                  ? "bg-destructive text-destructive-foreground scale-110 ring-4 ring-destructive/30 animate-pulse"
                  : "bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl",
                phase === "thinking" && "opacity-50 cursor-not-allowed"
              )}
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>

            <div className="w-[100px]" /> {/* spacer for centering */}
          </div>
        )}

        {/* Text fallback input */}
        {phase !== "summary" && (
          <div className="flex gap-2 max-w-lg mx-auto">
            <Input
              placeholder="Or type your answer..."
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTextSend()}
              disabled={phase === "thinking"}
              className="text-sm"
            />
            <Button size="icon" onClick={handleTextSend} disabled={phase === "thinking" || !transcript.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Summary: restart button */}
        {phase === "summary" && (
          <div className="flex justify-center">
            <Button onClick={resetInterview} size="lg">
              <RotateCcw className="h-4 w-4 mr-2" /> Start New Interview
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
