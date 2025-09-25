import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Gamepad2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [, setLocation] = useLocation();
  const [demoMode, setDemoMode] = useState(false);
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const [isQuickStarting, setIsQuickStarting] = useState(false);

  // Check if demo mode is enabled
  const { data: demoStatus, isLoading: isDemoStatusLoading } = useQuery<{enabled: boolean}>({
    queryKey: ['/api/demo/status'],
    enabled: true,
  });

  const handleStartDemo = async () => {
    try {
      setIsStartingDemo(true);
      const response = await apiRequest('POST', '/api/demo/start');
      if (response.ok) {
        // Force a page reload to trigger authentication check with demo session
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to start demo mode:', error);
    } finally {
      setIsStartingDemo(false);
    }
  };

  const handleQuickStart = async () => {
    try {
      setIsQuickStarting(true);
      if (demoMode) {
        // Start demo first, then quick start
        const demoResponse = await apiRequest('POST', '/api/demo/start');
        if (demoResponse.ok) {
          // Quick start with default character
          await apiRequest('POST', '/api/quick-start');
          window.location.reload();
        }
      } else {
        // Check if user is authenticated first
        try {
          await apiRequest('GET', '/api/auth/user');
          // User is authenticated, proceed with quick start
          await apiRequest('POST', '/api/quick-start');
          window.location.reload();
        } catch (authError) {
          // User is not authenticated, redirect to login or show error
          console.warn('User not authenticated for quick start');
          // For now, switch to demo mode as fallback
          setDemoMode(true);
          const demoResponse = await apiRequest('POST', '/api/demo/start');
          if (demoResponse.ok) {
            await apiRequest('POST', '/api/quick-start');
            window.location.reload();
          }
        }
      }
    } catch (error) {
      console.error('Failed to quick start:', error);
      // TODO: Show user-friendly error message
    } finally {
      setIsQuickStarting(false);
    }
  };

  const handleMainCTA = () => {
    if (demoMode) {
      handleStartDemo();
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 dark:from-amber-950 dark:to-green-950">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-600 to-green-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-700 to-green-700 bg-clip-text text-transparent">
              Skunk Tales.
            </h1>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
            Be the hero of any story.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            Talk • Tap • Type
          </p>
        </div>

        {/* Example Adventure Preview - Compact version */}
        <div className="text-center mb-4 sm:mb-5 hidden sm:block">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-amber-100 to-green-100 dark:from-amber-900/30 dark:to-green-900/30 rounded-lg p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
              <div className="text-left space-y-2">
                <p className="text-xs text-muted-foreground">Example Adventure in Progress:</p>
                <blockquote className="text-sm italic leading-relaxed">
                  "At dusk, a doorway appears where the wall should be. What do you do?"
                </blockquote>
                <div className="grid grid-cols-2 gap-1.5 sm:flex sm:gap-2 sm:flex-wrap">
                  <Button variant="outline" size="sm" className="text-xs h-auto py-1 px-2 min-h-[1.75rem]">
                    Open it
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-auto py-1 px-2 min-h-[1.75rem]">
                    Examine first
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-auto py-1 px-2 min-h-[1.75rem]">
                    Ask a companion
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-auto py-1 px-2 min-h-[1.75rem]">
                    Try something else
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl">Start an Adventure</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Jump into your first adventure or customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Demo Mode Toggle - only show if demo is enabled */}
              {demoStatus?.enabled && !isDemoStatusLoading && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Label htmlFor="demo-mode" className="text-sm">Demo Mode</Label>
                  <Switch
                    id="demo-mode"
                    checked={demoMode}
                    onCheckedChange={setDemoMode}
                    data-testid="switch-demo-mode"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  onClick={handleQuickStart}
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700"
                  data-testid="button-quick-start"
                  disabled={isQuickStarting || isStartingDemo}
                >
                  {isQuickStarting ? "Starting Adventure..." : "Start Playing Now"}
                </Button>
                
                <Button 
                  onClick={handleMainCTA}
                  variant="outline"
                  size="lg"
                  className="w-full"
                  data-testid="button-customize"
                  disabled={isStartingDemo || isQuickStarting}
                >
                  {isStartingDemo ? "Starting Demo..." : "Customize Character"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {demoMode ? (
                  <p>Try the adventure demo without creating an account. Your progress won't be saved.</p>
                ) : (
                  <p><strong>Start Playing Now</strong>: Jump in with a default character. <br />
                     <strong>Customize</strong>: Create your own character and choose your adventure.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}