import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8 font-sans">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-600 mx-auto animate-pulse">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-4">
               <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">System <br /><span className="text-rose-600">Anomaly.</span></h1>
               <p className="text-slate-500 font-medium leading-relaxed">
                 An unexpected operational error has been detected in the core architecture. The diagnostic trace has been logged.
               </p>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-mono text-slate-400 break-all">
                 {this.state.error?.message}
               </div>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="h-16 px-12 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] gap-3 hover:bg-blue-600 transition-all shadow-xl"
            >
              <RefreshCcw className="w-4 h-4" /> Restart Architecture
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
