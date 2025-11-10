import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Play, 
  SkipForward, 
  Sword, 
  Crown,
  Star 
} from "lucide-react";

interface WelcomeScreenProps {
  onStartDemo: () => void;
  onSkipDemo: () => void;
  onEnterGame: () => void;
  className?: string;
}

export default function WelcomeScreen({
  onStartDemo,
  onSkipDemo, 
  onEnterGame,
  className = ""
}: WelcomeScreenProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center px-4 py-6 sm:p-6 ${className}`}>
      <div className="w-full max-w-lg space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-3xl sm:text-4xl text-foreground mb-2">
              STORY MODE
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2 sm:px-0">
              Create unlimited interactive stories. Any genre, any setting. Your story, your rules.
            </p>
          </div>
        </div>

        {/* New Player Options */}
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">First Time Playing?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-3">
              <Button
                className="w-full h-auto py-4 px-4 justify-start text-left flex items-center gap-3 rounded-3xl"
                onClick={onStartDemo}
                data-testid="button-start-demo"
              >
                <Play className="w-5 h-5 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-semibold text-base">Take the Interactive Tour</div>
                  <div className="text-sm text-primary-foreground/80">
                    Learn by doing! We'll guide you through your first story step by step.
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs rounded-full">Recommended</Badge>
                    <Badge variant="outline" className="text-xs border-primary-foreground/20 rounded-full">5 min</Badge>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-4 px-4 justify-start text-left flex items-center gap-3 rounded-3xl"
                onClick={onSkipDemo}
                data-testid="button-skip-demo"
              >
                <SkipForward className="w-5 h-5 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-semibold text-base">Skip Tutorial</div>
                  <div className="text-sm text-muted-foreground">
                    I'm ready to start creating my own stories.
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Players */}
        <Card className="border-muted/20">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Been here before?</span>
              </div>
              <Button
                variant="ghost"
                onClick={onEnterGame}
                className="text-sm rounded-full"
                data-testid="button-enter-game"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Continue Your Story
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}