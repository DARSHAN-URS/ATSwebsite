import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Play, Square, RotateCcw, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-prep`;

export default function InterviewPrep() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [position, setPosition] = useState("");
  const [industry, setIndustry] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
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
    setIsLoading(true);
    try {
      const text = await streamResponse({ action: "start", position, industry });
      speak(text);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const sendAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    const userMsg: Message = { role: "user", content: answer };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setTranscript("");
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = async () => {
    setIsLoading(true);
    synthRef.current.cancel();
    try {
      const text = await streamResponse({
        action: "summary",
        position,
        industry,
        conversation: messages,
      });
      speak(text);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
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
      setIsListening(false);
      return;
    }

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
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      sendAnswer(transcript.trim());
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
    }
  };

  const resetInterview = () => {
    synthRef.current.cancel();
    setStarted(false);
    setMessages([]);
    setTranscript("");
    setIsListening(false);
    setIsSpeaking(false);
  };

  if (!started) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Interview Prep Assistant</h1>
          <p className="text-muted-foreground">Practice mock interviews with AI voice coaching</p>
        </div>
        <Card>
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
              <Play className="h-4 w-4 mr-2" /> Start Mock Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Mock Interview</h1>
          <p className="text-xs text-muted-foreground">{position} • {industry}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setVoiceEnabled(!voiceEnabled); if (isSpeaking) synthRef.current.cancel(); }}>
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={endInterview} disabled={isLoading || messages.length < 2}>
            <Square className="h-3 w-3 mr-1" /> End & Summary
          </Button>
          <Button variant="ghost" size="sm" onClick={resetInterview}>
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-auto space-y-3 mb-4 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap",
              m.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}>
              {m.role === "assistant" && (
                <Badge variant="secondary" className="mb-1 text-[10px]">
                  {isSpeaking && i === messages.length - 1 ? "🔊 Speaking..." : "Coach"}
                </Badge>
              )}
              <p>{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground animate-pulse">Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border pt-3 space-y-2">
        {transcript && (
          <div className="bg-muted/50 rounded-lg p-2 text-sm text-foreground">
            <span className="text-muted-foreground text-xs">Transcript: </span>{transcript}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleListening}
            disabled={isLoading}
            className="shrink-0"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            placeholder="Type or speak your answer..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendTranscript()}
            disabled={isLoading}
          />
          <Button onClick={handleSendTranscript} disabled={isLoading || !transcript.trim()}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
