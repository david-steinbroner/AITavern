import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, MapPin, Users, Zap } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 dark:from-amber-950 dark:to-green-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-green-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-green-700 bg-clip-text text-transparent">
              Skunk Tales
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Embark on magical adventures with your AI-powered companion. 
            Create characters, explore worlds, and experience cozy tabletop gaming reimagined for mobile.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg">AI Adventure Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your intelligent companion creates dynamic stories, manages quests, and guides you through magical worlds tailored to your choices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-lg">Character Creation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build unique characters with templates and randomization. Choose from various classes, customize appearance, and craft compelling backstories.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg">Mobile-First Gaming</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Optimized for mobile with intuitive touch controls, bottom navigation, and cozy design that makes tabletop gaming accessible anywhere.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-6">Everything You Need for Epic Adventures</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Real-time AI Responses",
              "Character Progression",
              "Quest Management", 
              "Inventory System",
              "Combat Mechanics",
              "Multiple Campaigns",
              "Touch-Optimized UI",
              "Offline Support"
            ].map((feature) => (
              <Badge key={feature} variant="secondary" className="text-sm">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to Begin Your Adventure?</CardTitle>
              <CardDescription>
                Sign in to create your first character and start exploring magical worlds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onLogin}
                size="lg"
                className="w-full bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700"
                data-testid="button-login"
              >
                Start Playing
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Sign in with Google, GitHub, or email to get started
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}