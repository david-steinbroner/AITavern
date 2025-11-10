import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import { Mic, MicOff, Send, MessageSquare, Loader2, XCircle } from "lucide-react";
import type { Message } from "@shared/schema";
import { useState, useRef, useEffect } from "react";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage?: (content: string) => void;
  isListening?: boolean;
  onToggleListening?: () => void;
  isLoading?: boolean;
  className?: string;
  onEndAdventure?: () => void;
}

// Helper function to parse message content and extract options
function parseMessageContent(content: string): { text: string; options: string[] } {
  const lines = content.split('\n');
  const options: string[] = [];
  let text = '';
  let inOptions = false;

  for (const line of lines) {
    // Check if line starts with bullet point (•, -, or *)
    if (line.trim().match(/^[•\-\*]\s+/)) {
      inOptions = true;
      options.push(line.trim().replace(/^[•\-\*]\s+/, ''));
    } else if (line.trim().toLowerCase().includes('what do you do')) {
      inOptions = true;
      // Don't add this line to text or options
    } else if (!inOptions) {
      text += line + '\n';
    }
  }

  return { text: text.trim(), options };
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isListening = false,
  onToggleListening,
  isLoading = false,
  className = "",
  onEndAdventure
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage?.(inputText);
      setInputText("");
      console.log('Message sent:', inputText);
    }
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
        <PageHeader
          title="Adventure Chat"
          subtitle="Speak with the DM and NPCs"
          action={{
            label: "End Adventure",
            onClick: onEndAdventure || (() => {}),
            icon: XCircle,
            variant: "destructive"
          }}
        />

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="space-y-4 pr-4">
              {messages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No messages yet"
                  description="Start your adventure by speaking or using quick actions!"
                />
              ) : (
                messages.map((message) => {
                  const { text, options } = parseMessageContent(message.content);
                  const isPlayer = message.sender === "player";

                  return (
                    <div key={message.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getSenderBadge(message.sender, message.senderName)}
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        isPlayer
                          ? "bg-primary/10 border-l-4 border-primary ml-4"
                          : "bg-muted/50"
                      }`}>
                        <p className="text-sm text-foreground whitespace-pre-line">{text}</p>

                        {/* Render clickable options for DM/NPC messages */}
                        {!isPlayer && options.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-semibold text-foreground">What do you do?</p>
                            {options.map((option, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2 px-3"
                                onClick={() => onSendMessage?.(option)}
                                disabled={isLoading}
                              >
                                <span className="text-sm">{option}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
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

          {/* Text Input */}
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
                placeholder={isListening ? "Listening..." : "Type your message..."}
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