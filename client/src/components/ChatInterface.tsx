import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mic, MicOff, Send, Swords, Eye, MessageSquare, Loader2, User, UserCheck } from "lucide-react";
import HighlightedMessage from "./HighlightedMessage";
import type { Message, Character } from "@shared/schema";
import { useState, useRef, useEffect } from "react";

interface ChatInterfaceProps {
  messages: Message[];
  character?: Character;
  onSendMessage?: (content: string, isDirectDM?: boolean) => void;
  onQuickAction?: (action: string) => void;
  isListening?: boolean;
  onToggleListening?: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function ChatInterface({ 
  messages, 
  character,
  onSendMessage, 
  onQuickAction,
  isListening = false,
  onToggleListening,
  isLoading = false,
  className = "" 
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState("");
  const [isDirectDM, setIsDirectDM] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const quickActions = [
    { label: "Attack", action: "attack", icon: <Swords className="w-4 h-4" /> },
    { label: "Investigate", action: "investigate", icon: <Eye className="w-4 h-4" /> },
    { label: "Talk", action: "talk", icon: <MessageSquare className="w-4 h-4" /> },
  ];
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage?.(inputText, isDirectDM);
      setInputText("");
      console.log('Message sent:', inputText, 'Direct DM:', isDirectDM);
    }
  };
  
  const handleQuickAction = (action: string) => {
    onQuickAction?.(action);
    console.log('Quick action triggered:', action);
  };
  
  const handleToggleListening = () => {
    onToggleListening?.();
    console.log('Speech recognition toggled:', !isListening);
  };
  
  const getSenderBadge = (sender: string, senderName?: string | null) => {
    switch (sender) {
      case "dm":
        return <Badge variant="secondary">DM</Badge>;
      case "npc":
        return <Badge variant="secondary">{senderName || "NPC"}</Badge>;
      default:
        return <Badge variant="outline">You</Badge>;
    }
  };
  
  return (
    <div className={`h-full flex flex-col ${className}`} data-testid="chat-interface">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-xl">Adventure Chat</CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isDirectDM ? "Direct DM communication" : "In-character roleplay"}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span className="text-muted-foreground">In Character</span>
                <Switch
                  checked={isDirectDM}
                  onCheckedChange={setIsDirectDM}
                  data-testid="switch-direct-dm"
                />
                <span className="text-muted-foreground">Direct DM</span>
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="space-y-3 pr-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start your adventure by speaking or using quick actions!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getSenderBadge(message.sender, message.senderName)}
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.sender === "player" 
                        ? "bg-primary/10 border-l-4 border-primary ml-4" 
                        : "bg-muted/50"
                    }`}>
                      <HighlightedMessage 
                        content={message.content} 
                        character={character}
                        messages={messages}
                        className="text-sm text-foreground"
                      />
                    </div>
                  </div>
                ))
              )}
              
              {/* AI Thinking Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">The DM is thinking...</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Quick Actions */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Quick Actions</div>
            <div className="flex gap-2">
              {quickActions.map((action) => (
                <Button 
                  key={action.action}
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction(action.action)}
                  disabled={isLoading}
                  className="flex-1"
                  data-testid={`quick-action-${action.action}`}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Voice Input */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant={isListening ? "destructive" : "secondary"}
              onClick={handleToggleListening}
              className="shrink-0"
              data-testid="button-voice-toggle"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder={isListening ? "Listening..." : isDirectDM ? "Ask the DM directly..." : "Type your in-character message..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-3 py-2 bg-muted rounded-md text-sm text-foreground placeholder:text-muted-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isListening || isLoading}
                data-testid="input-chat-message"
              />
              <Button 
                size="icon" 
                onClick={handleSend} 
                disabled={!inputText.trim() || isListening || isLoading}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}