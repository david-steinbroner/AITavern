import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, HelpCircle, Sword, Scroll, UserPlus, Map, Trash2, Sparkles, BookOpen } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Character, Quest, Message } from "@shared/schema";
import { analytics } from "@/lib/posthog";

interface StartMenuProps {
  onStartGame: () => void;
  onShowGuide: () => void;
  onCreateCharacter: () => void;
  onShowAdventureTemplates: () => void;
  onNewStory?: () => void;
  onShowSettings?: () => void;
  onEndAdventure?: () => void;
}

export default function StartMenu({
  onStartGame,
  onShowGuide,
  onCreateCharacter,
  onShowAdventureTemplates,
  onNewStory,
  onEndAdventure,
}: StartMenuProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Check if user has an active character/game
  const { data: character } = useQuery<Character>({
    queryKey: ['/api/character'],
    refetchOnMount: 'always', // Always refetch when component mounts
    staleTime: 0, // Consider data immediately stale
  });

  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ['/api/quests'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const hasActiveGame = !!character;
  const activeQuests = quests.filter(q => q.status === 'active');
  const recentMessage = messages.length > 1 ? messages[messages.length - 1] : null;

  const handleContinueClick = () => {
    console.log('[StartMenu] Continue Adventure button clicked');
    analytics.buttonClicked('Continue Adventure', 'Start Menu', {
      hasActiveQuests: activeQuests.length > 0,
      questCount: quests.length
    });
    setShowOverviewModal(true);
  };

  const handleConfirmContinue = () => {
    console.log('[StartMenu] Confirmed continue from overview modal');
    analytics.buttonClicked('Confirm Continue', 'Adventure Overview Modal');
    setShowOverviewModal(false);
    onStartGame();
  };

  const handleDeleteClick = () => {
    console.log('[StartMenu] Delete Adventure button clicked');
    analytics.buttonClicked('Delete Adventure', 'Start Menu');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    console.log('[StartMenu] Confirming adventure deletion', {
      characterName: character?.name,
      questCount: quests.length,
      messageCount: messages.length
    });
    analytics.buttonClicked('Confirm Delete Adventure', 'Delete Modal', {
      character_name: character?.name,
      quest_count: quests.length,
      message_count: messages.length
    });

    setIsDeleting(true);
    try {
      // Call the delete handler
      await onEndAdventure?.();

      analytics.adventureEnded('user_deleted', undefined);

      // Force refetch all queries to get updated data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/character'] }),
        queryClient.refetchQueries({ queryKey: ['/api/quests'] }),
        queryClient.refetchQueries({ queryKey: ['/api/messages'] }),
      ]);

      console.log('[StartMenu] Adventure deleted successfully');
      // Close modal after data is refreshed
      setShowDeleteModal(false);
    } catch (error) {
      console.error('[StartMenu] Error deleting adventure:', error);
      analytics.errorOccurred('adventure_delete_error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-6">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <div className="mb-3">
          <Sparkles className="w-12 h-12 mx-auto text-primary" />
        </div>
        <h1 className="font-bold text-4xl text-foreground mb-2" data-testid="game-title">
          STORY MODE
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Your story, your rules. Create unlimited adventures. Any genre you can imagine.
        </p>
      </div>

      {/* Main Menu - New CTA Hierarchy */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Primary CTA - Continue Adventure (only if has active game) */}
        {hasActiveGame ? (
          <Card className="p-6 hover-elevate border-primary/30 bg-primary/5">
            <div className="flex gap-3">
              <Button
                onClick={handleContinueClick}
                size="lg"
                className="flex-1 text-lg font-semibold h-14"
                data-testid="button-start-game"
              >
                <Play className="w-5 h-5 mr-2" />
                Continue Adventure
              </Button>
              {onEndAdventure && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleDeleteClick}
                        variant="destructive"
                        size="lg"
                        className="h-14"
                        data-testid="button-delete-adventure"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Current Adventure</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Resume your current quest and continue your journey
            </p>
          </Card>
        ) : (
          /* No Active Adventure - Show Getting Started */
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="text-center space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Ready to Begin Your Adventure?
                </h2>
                <p className="text-muted-foreground">
                  Choose how you'd like to start your epic journey
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Action CTAs - Emphasized when no active game */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* New Story (V2) - Primary CTA */}
          {onNewStory && (
            <Card className={`p-6 hover-elevate transition-all ${!hasActiveGame ? 'border-primary/30 bg-primary/5 ring-2 ring-primary/20' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">New Story</h3>
                  <p className="text-xs text-muted-foreground">
                    Pick a genre, choose your length, and begin
                  </p>
                </div>
              </div>
              <Button
                variant={!hasActiveGame ? "default" : "outline"}
                onClick={() => {
                  console.log('[StartMenu] New Story button clicked');
                  analytics.buttonClicked('New Story', 'Start Menu', {
                    hasActiveGame
                  });
                  onNewStory();
                }}
                className="w-full font-semibold"
                size={!hasActiveGame ? "lg" : "default"}
                data-testid="button-new-story"
              >
                {!hasActiveGame && <Sparkles className="w-4 h-4 mr-2" />}
                Start a New Story
              </Button>
              {!hasActiveGame && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Choose genre, length & character
                </p>
              )}
            </Card>
          )}

          {/* Adventure Templates */}
          <Card className="p-6 hover-elevate transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Map className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">Adventure Templates</h3>
                <p className="text-xs text-muted-foreground">
                  Choose from preset adventures in familiar worlds
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                console.log('[StartMenu] Adventure Templates button clicked');
                analytics.buttonClicked('Start Adventure', 'Start Menu', {
                  hasActiveGame
                });
                onShowAdventureTemplates();
              }}
              className="w-full font-semibold"
              data-testid="button-adventure-templates"
            >
              Browse Templates
            </Button>
          </Card>

          {/* Create New Character */}
          <Card className="p-6 hover-elevate">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">Create Character</h3>
                <p className="text-xs text-muted-foreground">
                  Design your adventurer with custom details
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                console.log('[StartMenu] Create Character button clicked');
                analytics.buttonClicked('Customize Hero', 'Start Menu');
                onCreateCharacter();
              }}
              className="w-full font-semibold"
              data-testid="button-create-character"
            >
              Customize Hero
            </Button>
          </Card>
        </div>

        {/* Helper Link */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('[StartMenu] Show Guide button clicked');
              analytics.buttonClicked('Show Guide', 'Start Menu');
              onShowGuide();
            }}
            className="text-muted-foreground"
            data-testid="button-show-guide"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            New to tabletop RPGs? Read the guide
          </Button>
        </div>
      </div>

      {/* Adventure Overview Modal */}
      <Dialog open={showOverviewModal} onOpenChange={setShowOverviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Your Adventure
            </DialogTitle>
            <DialogDescription>
              Review your current progress before continuing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Character Info */}
            {character && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Character</h3>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-serif text-lg">{character.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Level {character.level} {character.class}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span>HP: {character.currentHealth}/{character.maxHealth}</span>
                    <span>XP: {character.experience}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Active Quests */}
            {activeQuests.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Active Quests ({activeQuests.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeQuests.map((quest) => (
                    <div key={quest.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                      <p className="font-medium">{quest.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Progress: {quest.progress}/{quest.maxProgress}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Story Event */}
            {recentMessage && recentMessage.sender !== 'player' && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Last Story Event</h3>
                <div className="p-4 rounded-lg bg-muted/50 text-sm max-h-32 overflow-y-auto">
                  <p className="text-muted-foreground line-clamp-4">
                    {recentMessage.content.substring(0, 200)}
                    {recentMessage.content.length > 200 && '...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                console.log('[StartMenu] Back to Menu from overview modal');
                analytics.buttonClicked('Back to Menu', 'Adventure Overview Modal');
                setShowOverviewModal(false);
              }}
            >
              Back to Menu
            </Button>
            <Button onClick={handleConfirmContinue}>
              <Play className="w-4 h-4 mr-2" />
              Continue Adventure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Adventure?</DialogTitle>
            <DialogDescription>
              This will permanently delete your current adventure, including your character,
              quests, items, and all progress. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                console.log('[StartMenu] Cancel delete from modal');
                analytics.buttonClicked('Cancel Delete', 'Delete Modal');
                setShowDeleteModal(false);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Adventure'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
