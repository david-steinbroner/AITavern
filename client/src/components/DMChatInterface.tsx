import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Crown, 
  Settings, 
  Send, 
  User, 
  MessageCircle, 
  RotateCcw,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

interface DMMessage {
  id: string;
  content: string;
  timestamp: string;
  type: 'setting' | 'request' | 'response';
}

interface DMChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string, type: 'setting' | 'request') => void;
  messages: DMMessage[];
  isLoading?: boolean;
}

export default function DMChatInterface({
  isOpen,
  onClose,
  onSendMessage,
  messages,
  isLoading = false
}: DMChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const [activeSection, setActiveSection] = useState<'chat' | 'settings'>('chat');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), activeSection === 'settings' ? 'setting' : 'request');
      setNewMessage("");
    }
  };

  const quickActions = [
    {
      id: 'difficulty',
      label: 'Adjust Difficulty',
      message: 'Please adjust the difficulty. Make encounters [easier/harder] and reduce/increase the challenge level.'
    },
    {
      id: 'pace',
      label: 'Change Story Pace',
      message: 'Please adjust the story pacing. I want [faster/slower] progression through the adventure.'
    },
    {
      id: 'tone',
      label: 'Change Tone',
      message: 'Please adjust the story tone to be more [serious/lighthearted/dramatic/comedic].'
    },
    {
      id: 'reset',
      label: 'Reset Story',
      message: 'Please reset the current storyline and start a new adventure from the beginning.'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Storyteller Console
          </DialogTitle>
        </DialogHeader>

        {/* Section Tabs */}
        <div className="flex gap-2 border-b border-border">
          <Button
            variant={activeSection === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('chat')}
            className="rounded-b-none"
            data-testid="tab-dm-chat"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            DM Chat
          </Button>
          <Button
            variant={activeSection === 'settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('settings')}
            className="rounded-b-none"
            data-testid="tab-dm-settings"
          >
            <Settings className="w-4 h-4 mr-2" />
            Game Settings
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeSection === 'chat' && (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 rounded-md">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-foreground mb-1">Direct DM Communication</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask your AI storyteller to adjust game settings, change story direction, or make modifications to your campaign.
                    </p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className="space-y-2">
                      <div className={`flex items-start gap-3 ${
                        message.type === 'response' ? 'flex-row' : 'flex-row-reverse'
                      }`}>
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          message.type === 'response' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {message.type === 'response' ? (
                            <Crown className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className={`flex-1 space-y-1 ${
                          message.type === 'response' ? 'text-left' : 'text-right'
                        }`}>
                          <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            message.type === 'response'
                              ? 'bg-card text-card-foreground'
                              : 'bg-primary text-primary-foreground'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{message.timestamp}</span>
                            {message.type === 'setting' && (
                              <Badge variant="outline" className="text-xs">
                                Setting Request
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask the DM to adjust game settings or story..."
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isLoading}
                    data-testid="input-dm-message"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    data-testid="button-send-dm-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeSection === 'settings' && (
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Quick Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Use these quick actions to make common adjustments to your campaign.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(action => (
                  <Card key={action.id} className="hover-elevate cursor-pointer">
                    <CardContent 
                      className="p-3"
                      onClick={() => {
                        setNewMessage(action.message);
                        setActiveSection('chat');
                      }}
                    >
                      <div className="text-center">
                        {action.id === 'difficulty' && <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-primary" />}
                        {action.id === 'pace' && <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />}
                        {action.id === 'tone' && <Settings className="w-6 h-6 mx-auto mb-2 text-primary" />}
                        {action.id === 'reset' && <Trash2 className="w-6 h-6 mx-auto mb-2 text-destructive" />}
                        <p className="text-sm font-medium">{action.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <Label htmlFor="custom-setting">Custom Setting Request</Label>
                <Textarea
                  id="custom-setting"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe the changes you want the DM to make to your campaign settings, story, or gameplay..."
                  rows={4}
                  data-testid="textarea-custom-setting"
                />
                <Button 
                  onClick={() => {
                    if (newMessage.trim()) {
                      onSendMessage(newMessage.trim(), 'setting');
                      setNewMessage("");
                      setActiveSection('chat');
                    }
                  }}
                  disabled={!newMessage.trim() || isLoading}
                  className="w-full"
                  data-testid="button-send-setting"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Send Setting Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}