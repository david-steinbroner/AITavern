import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Sword, Scroll, UserPlus, Map } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Character } from "@shared/schema";

interface StartMenuProps {
  onStartGame: () => void;
  onShowGuide: () => void;
  onCreateCharacter: () => void;
  onShowAdventureTemplates: () => void;
  onShowSettings?: () => void;
}

export default function StartMenu({
  onStartGame,
  onShowGuide,
  onCreateCharacter,
  onShowAdventureTemplates,
}: StartMenuProps) {
  // Check if user has an active character/game
  const { data: character } = useQuery<Character>({
    queryKey: ['/api/character'],
  });

  const hasActiveGame = !!character;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-6">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <div className="mb-3 relative h-12">
          <Sword className="w-12 h-12 mx-auto text-primary absolute left-1/2 -translate-x-1/2 top-0" />
          <Scroll className="w-8 h-8 mx-auto text-accent absolute left-1/2 -translate-x-1/2 top-0 translate-x-4 translate-y-2" />
        </div>
        <h1 className="font-serif text-3xl text-primary mb-2" data-testid="game-title">
          AI Dungeon Master
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Embark on epic adventures powered by artificial intelligence. Your story awaits.
        </p>
      </div>

      {/* Main Menu - New CTA Hierarchy */}
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* Primary CTA - Continue Adventure (only if has active game) */}
        {hasActiveGame && (
          <Card className="p-6 hover-elevate border-primary/30 bg-primary/5">
            <Button
              onClick={onStartGame}
              size="lg"
              className="w-full text-lg font-semibold h-14"
              data-testid="button-start-game"
            >
              <Play className="w-5 h-5 mr-2" />
              Continue Adventure
            </Button>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Resume your current quest and continue your journey
            </p>
          </Card>
        )}

        {/* Secondary CTAs - Main Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Adventure Templates */}
          <Card className="p-6 hover-elevate">
            <Button
              onClick={onShowAdventureTemplates}
              className="w-full font-semibold h-12"
              data-testid="button-adventure-templates"
            >
              <Map className="w-5 h-5 mr-2" />
              Adventure Templates
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Choose from preset adventures in familiar worlds
            </p>
          </Card>

          {/* Create New Character */}
          <Card className="p-6 hover-elevate">
            <Button
              variant="outline"
              onClick={onCreateCharacter}
              className="w-full font-semibold h-12"
              data-testid="button-create-character"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Character
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Design your adventurer with AI-generated portrait
            </p>
          </Card>

          {/* New Player Guide */}
          <Card className="p-6 hover-elevate sm:col-span-2 lg:col-span-1">
            <Button
              variant="outline"
              onClick={onShowGuide}
              className="w-full font-semibold h-12"
              data-testid="button-show-guide"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              New Player Guide
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Learn the basics of tabletop RPG adventures
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
