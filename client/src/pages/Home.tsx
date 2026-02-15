import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { useCreateCall } from "@/hooks/use-calls";
import { useToast } from "@/hooks/use-toast";
import profileImage from "@assets/AI_Tutor_1771134482149.png";

type VapiState = "idle" | "connecting" | "listening" | "speaking" | "error";

const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = "965bd1fa-1b1e-42c9-bf90-3ec7d28ab5ee";

export default function Home() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [status, setStatus] = useState<VapiState>("idle");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const createCall = useCreateCall();
  const { toast } = useToast();
  
  // Configure Vapi instance
  useEffect(() => {
    if (!PUBLIC_KEY) return;

    try {
      const vapiInstance = new Vapi(PUBLIC_KEY);
      
      vapiInstance.on("call-start", () => {
        setStatus("listening");
        createCall.mutate({ status: "started" });
        toast({ title: "Connected", description: "Auralix is ready to talk." });
      });

      vapiInstance.on("call-end", () => {
        setStatus("idle");
        setVolume(0);
      });

      vapiInstance.on("speech-start", () => setStatus("listening"));
      vapiInstance.on("speech-end", () => setStatus("listening"));
      
      vapiInstance.on("volume-level", (level) => {
        setVolume(level);
      });

      vapiInstance.on("error", (e) => {
        console.error("Vapi error:", e);
        setStatus("error");
        setError(e.message || "An unexpected error occurred");
        vapiInstance.stop();
      });

      setVapi(vapiInstance);
    } catch (err) {
      console.error("Failed to init Vapi", err);
      setError("Failed to initialize Auralix");
    }

    return () => {
      vapi?.stop();
    };
  }, [PUBLIC_KEY]);

  const handleStart = async () => {
    if (!PUBLIC_KEY || !ASSISTANT_ID) {
      setError("System configuration missing (API Key or Assistant ID)");
      return;
    }

    setError(null);
    setStatus("connecting");
    
    try {
      await vapi?.start(ASSISTANT_ID);
    } catch (err) {
      setStatus("error");
      setError("Failed to connect to Auralix");
    }
  };

  const handleStop = () => {
    vapi?.stop();
    setStatus("idle");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[128px] animate-float" style={{ animationDelay: "-2s" }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white/10 shadow-2xl">
            <img src={profileImage} alt="Auralix" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
            Auralix – AI Voice Assistant
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide font-medium">Built by Anjali Redhu</p>
        </div>

        <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-2xl">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AudioVisualizer 
            isActive={status !== "idle" && status !== "error"} 
            state={status === "error" ? "idle" : status} 
            volume={volume}
          />

          <div className="mt-10 flex flex-col gap-4 w-full max-w-[220px]">
            {status === "idle" || status === "error" ? (
              <Button 
                size="lg" 
                onClick={handleStart}
                className="w-full h-16 rounded-full text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-50 to-indigo-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <Mic className="mr-3 w-6 h-6" />
                Start Talking
              </Button>
            ) : status === "connecting" ? (
              <Button 
                size="lg" 
                disabled 
                className="w-full h-16 rounded-full bg-white/10 text-white/50 cursor-wait border border-white/5"
              >
                <Loader2 className="mr-3 w-6 h-6 animate-spin" />
                Connecting...
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="destructive"
                onClick={handleStop}
                className="w-full h-16 rounded-full text-xl font-semibold shadow-lg shadow-destructive/20 hover:shadow-destructive/40 hover:-translate-y-1 transition-all duration-300"
              >
                <Square className="mr-3 w-6 h-6 fill-current" />
                Stop Session
              </Button>
            )}
          </div>
          
          <div className="mt-8 text-[10px] text-white/20 text-center font-mono tracking-widest uppercase">
            {PUBLIC_KEY && ASSISTANT_ID ? "Auralix Online" : "Configuration Required"}
          </div>
        </Card>
      </div>
    </div>
  );
}
