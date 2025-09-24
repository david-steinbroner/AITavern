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
import skunkImage from "@assets/stock_images/friendly_cartoon_sku_323499d5.jpg";

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
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src={skunkImage} 
                alt="Skunk Tales mascot" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Skunk Tales
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2 sm:px-0 mb-1">
              Cozy adventures await in your enchanted forest
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/80 px-2 sm:px-0">
              Create epic stories with your AI storyteller companion
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
                className="w-full h-auto p-3 sm:p-4 justify-start"
                onClick={onStartDemo}
                data-testid="button-start-demo"
              >
                <div className="flex items-start gap-2 sm:gap-3 text-left">
                  <div className="mt-0.5 sm:mt-1">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">Take the Interactive Tour</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Learn by doing! We'll guide you through your first adventure step by step.
                    </div>
                    <div className="flex gap-1 mt-1.5 sm:mt-2">
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      <Badge variant="outline" className="text-xs">5 min</Badge>
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto p-3 sm:p-4 justify-start"
                onClick={onSkipDemo}
                data-testid="button-skip-demo"
              >
                <div className="flex items-start gap-2 sm:gap-3 text-left">
                  <div className="mt-0.5 sm:mt-1">
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">Skip Tutorial</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      I'm familiar with RPGs and want to jump right in.
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Players */}
        <Card className="border-muted/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Returning Player?</span>
              </div>
              <Button
                variant="ghost"
                onClick={onEnterGame}
                className="text-sm"
                data-testid="button-enter-game"
              >
                <Sword className="w-4 h-4 mr-2" />
                Continue Your Adventure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-1 gap-3 text-center">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">What you'll experience:</p>
            <div className="flex justify-center gap-4">
              <span>• AI Storyteller</span>
              <span>• Dynamic Stories</span>
              <span>• Multiple Adventures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}