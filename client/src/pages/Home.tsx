import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useCreateCall } from "@/hooks/use-calls";
import { useToast } from "@/hooks/use-toast";

type VapiState = "idle" | "connecting" | "listening" | "speaking" | "error";

export default function Home() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [status, setStatus] = useState<VapiState>("idle");
  const [publicKey, setPublicKey] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const createCall = useCreateCall();
  const { toast } = useToast();
  
  // Initialize from local storage
  useEffect(() => {
    const storedKey = localStorage.getItem("vapi_public_key");
    const storedAssistant = localStorage.getItem("vapi_assistant_id");
    if (storedKey) setPublicKey(storedKey);
    if (storedAssistant) setAssistantId(storedAssistant);
  }, []);

  // Configure Vapi instance
  useEffect(() => {
    if (!publicKey) return;

    try {
      const vapiInstance = new Vapi(publicKey);
      
      vapiInstance.on("call-start", () => {
        setStatus("listening");
        createCall.mutate({ status: "started" });
        toast({ title: "Connected", description: "Voice assistant is ready." });
      });

      vapiInstance.on("call-end", () => {
        setStatus("idle");
        setVolume(0);
      });

      vapiInstance.on("speech-start", () => setStatus("listening"));
      vapiInstance.on("speech-end", () => setStatus("listening")); // Back to listening after user speaks
      
      // Note: Vapi SDK events might vary, assuming simple state mapping here
      // Real implementation might listen to 'volume-level' for visualizer
      vapiInstance.on("volume-level", (level) => {
        setVolume(level);
        if (level > 0.1 && status !== "speaking") {
          // simple heuristic for "assistant speaking" if needed, 
          // or rely on other events if Vapi provides them
        }
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
      setError("Failed to initialize Vapi SDK");
    }

    return () => {
      vapi?.stop();
    };
  }, [publicKey]);

  const handleStart = async () => {
    if (!publicKey || !assistantId) {
      toast({
        variant: "destructive",
        title: "Configuration Missing",
        description: "Please set your API Key and Assistant ID in settings."
      });
      return;
    }

    setError(null);
    setStatus("connecting");
    
    try {
      await vapi?.start(assistantId);
    } catch (err) {
      setStatus("error");
      setError("Failed to connect to assistant");
    }
  };

  const handleStop = () => {
    vapi?.stop();
    setStatus("idle");
  };

  const handleSaveSettings = (pk: string, aid: string) => {
    setPublicKey(pk);
    setAssistantId(aid);
    localStorage.setItem("vapi_public_key", pk);
    localStorage.setItem("vapi_assistant_id", aid);
    toast({ title: "Settings Saved", description: "Configuration updated successfully." });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[128px] animate-float" style={{ animationDelay: "-2s" }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="flex justify-between items-center mb-12 px-2">
          <div className="flex flex-col">
            <h1 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Auralix
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">Created by: Anjali Redhu</p>
          </div>
          <SettingsDialog 
            onSave={handleSaveSettings} 
            defaultPublicKey={publicKey} 
            defaultAssistantId={assistantId} 
          />
        </div>

        <Card className="glass-panel border-none p-8 flex flex-col items-center justify-center min-h-[400px]">
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

          <div className="mt-8 flex flex-col gap-4 w-full max-w-[200px]">
            {status === "idle" || status === "error" ? (
              <Button 
                size="lg" 
                onClick={handleStart}
                className="w-full h-14 rounded-full text-lg font-medium bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Mic className="mr-2 w-5 h-5" />
                Start Talking
              </Button>
            ) : status === "connecting" ? (
              <Button 
                size="lg" 
                disabled 
                className="w-full h-14 rounded-full bg-muted/50 text-muted-foreground cursor-wait"
              >
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Connecting...
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="destructive"
                onClick={handleStop}
                className="w-full h-14 rounded-full text-lg font-medium hover:shadow-lg hover:shadow-destructive/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Square className="mr-2 w-5 h-5 fill-current" />
                Stop Session
              </Button>
            )}
          </div>
          
          <div className="mt-8 text-xs text-muted-foreground/60 text-center font-mono">
            {publicKey && assistantId ? "SYSTEM READY" : "CONFIGURATION REQUIRED"}
          </div>
        </Card>

        {/* Instructions / Footer */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            &nbsp;
          </p>
        </div>
      </div>
    </div>
  );
}
