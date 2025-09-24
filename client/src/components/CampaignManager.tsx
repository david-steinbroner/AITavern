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
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Play, 
  Trash2, 
  RotateCcw, 
  MessageCircle,
  Crown,
  Sword,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Scroll
} from "lucide-react";
import { useState } from "react";

interface Campaign {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastPlayed: string;
  turnCount: number;
  isActive: boolean;
  characterLevel: number;
}

interface AdventureTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "beginner" | "intermediate" | "expert";
  estimatedLength: string;
  themes: string[];
}

interface AdventureCreatorProps {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  onCreateAdventure: (name: string, description: string, template?: string) => void;
  onStartAdventure: (campaignId: string) => void;
  onDeleteAdventure: (campaignId: string) => void;
  onResetProgress: (campaignId: string) => void;
  onOpenDMChat: () => void;
  className?: string;
}

export default function AdventureCreator({
  campaigns,
  activeCampaignId,
  onCreateAdventure,
  onStartAdventure,
  onDeleteAdventure,
  onResetProgress,
  onOpenDMChat,
  className = ""
}: AdventureCreatorProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newAdventureName, setNewAdventureName] = useState("");
  const [newAdventureDescription, setNewAdventureDescription] = useState("");
  
  const adventureTemplates: AdventureTemplate[] = [
    {
      id: "classic-dungeon",
      name: "Classic Dungeon Crawl",
      description: "Explore ancient ruins filled with treasures and dangers",
      icon: <MapPin className="w-6 h-6" />,
      difficulty: "beginner",
      estimatedLength: "2-4 hours",
      themes: ["Exploration", "Combat", "Treasure"]
    },
    {
      id: "mystery-investigation",
      name: "Mystery Investigation",
      description: "Solve crimes and uncover dark secrets in a bustling city",
      icon: <Scroll className="w-6 h-6" />,
      difficulty: "intermediate", 
      estimatedLength: "3-5 hours",
      themes: ["Investigation", "Social", "Intrigue"]
    },
    {
      id: "epic-quest",
      name: "Epic Quest",
      description: "Embark on a world-spanning adventure to save the realm",
      icon: <Crown className="w-6 h-6" />,
      difficulty: "expert",
      estimatedLength: "5-8 hours",
      themes: ["Heroic", "Epic", "Save the World"]
    },
    {
      id: "social-intrigue",
      name: "Court Intrigue",
      description: "Navigate politics and schemes in royal courts",
      icon: <Users className="w-6 h-6" />,
      difficulty: "intermediate",
      estimatedLength: "2-3 hours", 
      themes: ["Social", "Politics", "Roleplay"]
    },
    {
      id: "magical-academy",
      name: "Magical Academy",
      description: "Study magic and uncover mysteries in a school of wizardry",
      icon: <Sparkles className="w-6 h-6" />,
      difficulty: "beginner",
      estimatedLength: "3-4 hours",
      themes: ["Magic", "Learning", "Mystery"]
    }
  ];

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId);

  const handleCreateAdventure = () => {
    if (newAdventureName.trim()) {
      const template = selectedTemplate ? adventureTemplates.find(t => t.id === selectedTemplate) : null;
      const description = newAdventureDescription.trim() || template?.description || "";
      
      onCreateAdventure(newAdventureName.trim(), description, selectedTemplate || undefined);
      setNewAdventureName("");
      setNewAdventureDescription(""); 
      setSelectedTemplate(null);
      setShowCreateDialog(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-600 dark:text-green-400";
      case "intermediate": return "text-yellow-600 dark:text-yellow-400";
      case "expert": return "text-red-600 dark:text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active Campaign Header */}
      {activeCampaign && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Current Campaign</CardTitle>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">{activeCampaign.name}</h3>
                <p className="text-sm text-muted-foreground">{activeCampaign.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Turn {activeCampaign.turnCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sword className="w-3 h-3" />
                  <span>Level {activeCampaign.characterLevel}</span>
                </div>
                <div>Last played: {formatDate(activeCampaign.lastPlayed)}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetDialog(activeCampaign.id)}
                  data-testid="button-reset-rounds"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenDMChat}
                  data-testid="button-dm-chat"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  DM Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adventure Creation */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">Create New Adventure</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-adventure">
              <Plus className="w-4 h-4 mr-2" />
              New Adventure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Adventure</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Adventure Templates */}
              <div>
                <Label className="text-base font-medium">Choose Adventure Type</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select a template to get started quickly, or create a custom adventure
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant={selectedTemplate === null ? "default" : "outline"}
                    onClick={() => setSelectedTemplate(null)}
                    className="h-auto p-4 justify-start"
                    data-testid="template-custom"
                  >
                    <div className="text-left">
                      <div className="font-medium">Custom Adventure</div>
                      <div className="text-sm text-muted-foreground">Create your own unique story</div>
                    </div>
                  </Button>
                  {adventureTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      onClick={() => setSelectedTemplate(template.id)}
                      className="h-auto p-4 justify-start"
                      data-testid={`template-${template.id}`}
                    >
                      <div className="flex items-start gap-3 text-left">
                        <div className="mt-1">{template.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground mb-1">{template.description}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={getDifficultyColor(template.difficulty)}>
                              {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{template.estimatedLength}</span>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {template.themes.map(theme => (
                              <Badge key={theme} variant="secondary" className="text-xs">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Adventure Details */}
              <div>
                <Label htmlFor="adventure-name">Adventure Name *</Label>
                <Input
                  id="adventure-name"
                  value={newAdventureName}
                  onChange={(e) => setNewAdventureName(e.target.value)}
                  placeholder={selectedTemplate ? "Enter your adventure name..." : "e.g., The Crystal Caverns"}
                  data-testid="input-adventure-name"
                />
              </div>
              
              <div>
                <Label htmlFor="adventure-description">Custom Description (Optional)</Label>
                <Textarea
                  id="adventure-description"
                  value={newAdventureDescription}
                  onChange={(e) => setNewAdventureDescription(e.target.value)}
                  placeholder={selectedTemplate ? "Add your own twist to the template..." : "Describe your adventure story..."}
                  rows={3}
                  data-testid="input-adventure-description"
                />
                {selectedTemplate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to use the template description, or add your own custom details.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAdventure}
                disabled={!newAdventureName.trim()}
                data-testid="button-create-adventure"
              >
                Create Adventure
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Your Adventures */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg text-foreground">Your Adventures</h3>
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Sword className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">No adventures yet</h3>
                    <p className="text-sm text-muted-foreground">Create your first adventure to begin your journey</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            campaigns.map(campaign => (
              <Card 
                key={campaign.id} 
                className={`hover-elevate ${campaign.id === activeCampaignId ? 'ring-2 ring-primary/20' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                        {campaign.id === activeCampaignId && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Turn {campaign.turnCount}</span>
                        <span>Level {campaign.characterLevel}</span>
                        <span>Created {formatDate(campaign.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.id !== activeCampaignId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStartAdventure(campaign.id)}
                          data-testid={`button-start-${campaign.id}`}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteDialog(campaign.id)}
                        data-testid={`button-delete-${campaign.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Campaign Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Adventure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this adventure? This action cannot be undone.
              All progress and story will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showDeleteDialog) {
                  onDeleteAdventure(showDeleteDialog);
                  setShowDeleteDialog(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete Adventure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Rounds Dialog */}
      <AlertDialog open={!!showResetDialog} onOpenChange={() => setShowResetDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Progress</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the turn counter back to 1. The adventure story and character 
              progress will remain intact. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showResetDialog) {
                  onResetProgress(showResetDialog);
                  setShowResetDialog(null);
                }
              }}
              data-testid="button-confirm-reset"
            >
              Reset Rounds
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}