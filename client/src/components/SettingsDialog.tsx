import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Key, Bot } from "lucide-react";

interface SettingsDialogProps {
  onSave: (publicKey: string, assistantId: string) => void;
  defaultPublicKey?: string;
  defaultAssistantId?: string;
}

export function SettingsDialog({ onSave, defaultPublicKey = "", defaultAssistantId = "" }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [publicKey, setPublicKey] = useState(defaultPublicKey);
  const [assistantId, setAssistantId] = useState(defaultAssistantId);

  useEffect(() => {
    setPublicKey(defaultPublicKey);
    setAssistantId(defaultAssistantId);
  }, [defaultPublicKey, defaultAssistantId]);

  const handleSave = () => {
    onSave(publicKey, assistantId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2 text-muted-foreground">
              <Key className="w-4 h-4" /> Vapi Public Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your public key..."
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="bg-black/20 border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Vapi Dashboard under API Keys.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assistantId" className="flex items-center gap-2 text-muted-foreground">
              <Bot className="w-4 h-4" /> Assistant ID
            </Label>
            <Input
              id="assistantId"
              placeholder="Enter assistant ID..."
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              className="bg-black/20 border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
