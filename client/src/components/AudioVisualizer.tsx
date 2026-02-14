import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  isActive: boolean;
  volume?: number; // 0 to 1
  state: "idle" | "connecting" | "listening" | "speaking";
}

export function AudioVisualizer({ isActive, volume = 0, state }: AudioVisualizerProps) {
  // Simulate bars based on volume or just random movement when active
  const bars = Array.from({ length: 5 });

  const getStateColor = () => {
    switch (state) {
      case "connecting": return "bg-yellow-400";
      case "listening": return "bg-secondary"; // Cyan
      case "speaking": return "bg-primary"; // Purple
      default: return "bg-muted-foreground";
    }
  };

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mb-8">
      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-3xl transition-all duration-700 opacity-20",
        state === "speaking" ? "bg-primary scale-110" : 
        state === "listening" ? "bg-secondary scale-100" : "bg-transparent"
      )} />

      {/* Main Orb Container */}
      <div className={cn(
        "relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500",
        "bg-gradient-to-br from-card to-background border border-white/10 shadow-2xl",
        isActive && "shadow-primary/20"
      )}>
        {/* Ripples when active */}
        {isActive && (
          <>
            <div className={cn("absolute inset-0 rounded-full border border-current opacity-20 animate-pulse-ring", getStateColor())} />
            <div className={cn("absolute inset-0 rounded-full border border-current opacity-20 animate-pulse-ring delay-700", getStateColor())} />
          </>
        )}

        {/* Visualizer Bars */}
        <div className="flex items-end gap-1.5 h-12">
          {bars.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 rounded-full transition-all duration-100 ease-in-out",
                getStateColor()
              )}
              style={{
                height: isActive 
                  ? `${Math.max(20, Math.random() * 100 * (volume + 0.5))}%` 
                  : "20%",
                opacity: isActive ? 1 : 0.3
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Status Label */}
      <div className="absolute -bottom-12 font-display text-sm uppercase tracking-widest text-muted-foreground">
        {state === "idle" ? "Ready" : state}
      </div>
    </div>
  );
}
