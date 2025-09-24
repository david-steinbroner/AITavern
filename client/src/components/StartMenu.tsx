import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, HelpCircle, Settings, Sword, Scroll, Dice6, ScrollText, Package } from "lucide-react";

interface StartMenuProps {
  onStartGame: () => void;
  onShowGuide: () => void;
  onShowSettings?: () => void;
}

export default function StartMenu({ 
  onStartGame, 
  onShowGuide, 
  onShowSettings 
}: StartMenuProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <Sword className="w-16 h-16 mx-auto text-primary mb-2" />
          <Scroll className="w-12 h-12 mx-auto text-accent -mt-8 ml-8" />
        </div>
        <h1 className="font-serif text-4xl text-primary mb-2" data-testid="game-title">
          AI Dungeon Master
        </h1>
        <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
          Embark on epic adventures powered by artificial intelligence. Your story awaits.
        </p>
      </div>

      {/* Main Menu Cards */}
      <div className="w-full max-w-sm space-y-4">
        <Card className="p-6 hover-elevate">
          <Button 
            onClick={onStartGame}
            className="w-full h-16 text-lg font-semibold"
            data-testid="button-start-game"
          >
            <Play className="w-6 h-6 mr-3" />
            Continue Adventure
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Resume your current quest and continue your journey
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

      {/* Game Features */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="text-center">
          <Badge variant="secondary" className="mb-2 flex items-center gap-1"><Dice6 className="w-3 h-3" /> Smart AI</Badge>
          <p className="text-xs text-muted-foreground">Dynamic storytelling</p>
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="mb-2 flex items-center gap-1"><Sword className="w-3 h-3" /> Combat</Badge>
          <p className="text-xs text-muted-foreground">Turn-based battles</p>
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="mb-2 flex items-center gap-1"><ScrollText className="w-3 h-3" /> Quests</Badge>
          <p className="text-xs text-muted-foreground">Epic adventures</p>
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="mb-2 flex items-center gap-1"><Package className="w-3 h-3" /> Inventory</Badge>
          <p className="text-xs text-muted-foreground">Collect & manage</p>
        </div>
      </div>
    </div>
  );
}