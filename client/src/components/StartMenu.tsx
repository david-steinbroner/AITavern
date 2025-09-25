import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Settings, Sparkles, UserPlus, Map } from "lucide-react";
import MultipleAdventures from "./MultipleAdventures";
import AccountMenu from "./AccountMenu";
import DemoIndicator from "./DemoIndicator";

interface StartMenuProps {
  onStartGame: (campaignId: string) => void;
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
  onShowSettings 
}: StartMenuProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Indicator */}
      <DemoIndicator />
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <div></div> {/* Spacer */}
          <h1 className="font-serif text-xl text-primary">Skunk Tales</h1>
          <AccountMenu />
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-start p-4 min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <div className="mb-3 relative">
          {/* Friendly Skunk Placeholder */}
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
            <div className="text-white text-xl">🦨</div>
          </div>
          <Sparkles className="w-5 h-5 absolute top-0 right-1/2 transform translate-x-6 text-accent animate-pulse" />
        </div>
        <h1 className="font-serif text-2xl text-primary mb-1" data-testid="game-title">
          Skunk Tales.
        </h1>
        <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
          Be the hero of any story.
        </p>
      </div>

      {/* Main Menu Cards */}
      <div className="w-full max-w-sm space-y-4">
        <MultipleAdventures 
          onContinueAdventure={onStartGame}
          onCreateNew={onCreateCharacter}
        />

        <Card className="p-6 hover-elevate">
          <Button 
            variant="outline"
            onClick={onCreateCharacter}
            className="w-full h-16 text-lg font-semibold"
            data-testid="button-create-character"
          >
            <UserPlus className="w-6 h-6 mr-3" />
            Create New Character
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Design your adventurer with AI-generated portrait
          </p>
        </Card>

        <Card className="p-6 hover-elevate">
          <Button 
            variant="outline"
            onClick={onShowAdventureTemplates}
            className="w-full h-16 text-lg font-semibold"
            data-testid="button-adventure-templates"
          >
            <Map className="w-6 h-6 mr-3" />
            Adventure Templates
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Choose from preset adventures in familiar worlds
          </p>
        </Card>

        <Card className="p-6 hover-elevate">
          <Button 
            variant="outline"
            onClick={onShowGuide}
            className="w-full h-16 text-lg font-semibold"
            data-testid="button-show-guide"
          >
            <HelpCircle className="w-6 h-6 mr-3" />
            New Player Guide
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Learn the basics of tabletop RPG adventures
          </p>
        </Card>

        {onShowSettings && (
          <Card className="p-6 hover-elevate">
            <Button 
              variant="ghost"
              onClick={onShowSettings}
              className="w-full h-12 text-base"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Button>
          </Card>
        )}
      </div>
      </div>

    </div>
  );
}