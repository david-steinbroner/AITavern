import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mic, MicOff, Send, Swords, Eye, MessageSquare, Loader2, User, UserCheck, HelpCircle, RotateCcw, Clock, BookOpen, AlertTriangle } from "lucide-react";
import HighlightedMessage from "./HighlightedMessage";
import DMMessage from "./DMMessage";
import type { Message, Character } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // DM Help preset buttons
  const dmPresets = [
    { label: "Recap my last session", action: "recap_session", icon: <RotateCcw className="w-4 h-4" /> },
    { label: "What's happening right now?", action: "current_status", icon: <Clock className="w-4 h-4" /> },
    { label: "Summarize the quest", action: "summarize_quest", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Fix a misunderstanding", action: "fix_misunderstanding", icon: <AlertTriangle className="w-4 h-4" /> },
  ];
  
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
  
  const handleDMPreset = (preset: typeof dmPresets[0]) => {
    const presetMessages = {
      recap_session: "Please give me a recap of my last session and what has happened so far in our adventure.",
      current_status: "What's happening right now? Where am I and what's the current situation?",
      summarize_quest: "Can you summarize my current quest objectives and any important details I should remember?",
      fix_misunderstanding: "I think there might be a misunderstanding about something that happened. Can you help clarify the current situation?"
    };
    
    const message = presetMessages[preset.action as keyof typeof presetMessages];
    if (message) {
      onSendMessage?.(message, true); // Always send as DM Help
      console.log('DM preset triggered:', preset.action);
    }
  };
  
  const handleToggleListening = () => {
    onToggleListening?.();
    console.log('Speech recognition toggled:', !isListening);
  };

  const handleDiceRoll = (rollType: string, ability: string) => {
    // Generate dice roll result (d20 + ability modifier)
    const roll = Math.floor(Math.random() * 20) + 1;
    const abilityScore = character?.[ability as keyof Character] as number || 10;
    const modifier = Math.floor((abilityScore - 10) / 2);
    const total = roll + modifier;
    
    const rollMessage = `🎲 **${ability.charAt(0).toUpperCase() + ability.slice(1)} Check:** Rolled ${roll} + ${modifier} = **${total}**`;
    
    // Send the roll result as a message
    onSendMessage?.(rollMessage, false);
    console.log('Dice roll:', { rollType, ability, roll, modifier, total });
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
              {isDirectDM ? "Message the AI DM for clarifications, recaps, or fixes" : "Talk as your character. Your words shape the story."}
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="touch-manipulation cursor-help min-h-[44px] flex items-center" role="button" tabIndex={0}>
                        <span className="text-muted-foreground">Roleplay</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>Talk and act as your character. Your words and actions directly shape the adventure story.</p>
                    </TooltipContent>
                  </Tooltip>
                  <Switch
                    checked={isDirectDM}
                    onCheckedChange={setIsDirectDM}
                    data-testid="switch-chat-mode"
                    className="touch-manipulation"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="touch-manipulation cursor-help min-h-[44px] flex items-center" role="button" tabIndex={0}>
                        <span className="text-muted-foreground">DM Help</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>Message the AI Dungeon Master directly for out-of-character help, story clarifications, rule questions, or to request changes to the adventure.</p>
                    </TooltipContent>
                  </Tooltip>
                  <HelpCircle className="w-4 h-4" />
                </div>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="space-y-3 pr-4">
              {messages.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Adventure awaits!</p>
                  <p className="text-sm mt-1">What do you want to do first?</p>
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
                      {message.sender === "dm" ? (
                        <DMMessage 
                          content={message.content} 
                          character={character}
                          messages={messages}
                          onDiceRoll={handleDiceRoll}
                        />
                      ) : (
                        <HighlightedMessage 
                          content={message.content} 
                          character={character}
                          messages={messages}
                          className="text-sm text-foreground"
                        />
                      )}
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
          
          {/* User Input - More Prominent */}
          <div className="space-y-3 border-t pt-3 mt-4">
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
                <textarea
                  placeholder={isListening ? "Listening..." : isDirectDM ? "Ask the DM..." : "Say or do something..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1 px-4 py-3 bg-muted rounded-md text-base text-foreground placeholder:text-muted-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[60px] max-h-[120px]"
                  disabled={isListening || isLoading}
                  data-testid="input-chat-message"
                  rows={2}
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
            
            {/* Quick Actions - Compact */}
            <div className="flex gap-2 flex-wrap">
              {isDirectDM ? (
                dmPresets.map((preset) => (
                  <Button 
                    key={preset.action}
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDMPreset(preset)}
                    disabled={isLoading}
                    className="text-xs h-8 px-2 truncate"
                    data-testid={`button-dm-preset-${preset.action}`}
                  >
                    {preset.icon}
                    <span className="ml-1 truncate">{preset.label}</span>
                  </Button>
                ))
              ) : (
                quickActions.map((action) => (
                  <Button 
                    key={action.action}
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    disabled={isLoading}
                    className="text-xs h-8 px-2 truncate"
                    data-testid={`button-quick-action-${action.action}`}
                  >
                    {action.icon}
                    <span className="ml-1 truncate">{action.label}</span>
                  </Button>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}