import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const DEMO_BANNER_STORAGE_KEY = 'demo-banner-collapsed';

export default function DemoIndicator() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if we're in a demo session by trying to fetch user data
  const { data: user, error } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // If user has demo claims, show the demo indicator
  const isDemoMode = user?.claims?.email === "demo@example.com" || 
                     user?.claims?.sub?.startsWith("demo-");

  // Load collapsed state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(DEMO_BANNER_STORAGE_KEY);
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  // Save collapsed state to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem(DEMO_BANNER_STORAGE_KEY, isCollapsed.toString());
  }, [isCollapsed]);

  const handleSignInToSave = () => {
    window.location.href = "/api/login";
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!isDemoMode) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div className="w-full bg-background border-b border-border">
        {/* Collapsed pill */}
        <div className="flex justify-center py-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleCollapse}
            className="h-6 px-3 text-xs bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/50"
            data-testid="demo-pill-expand"
          >
            Demo mode
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-orange-500 dark:bg-orange-600 text-white border-b border-orange-600 dark:border-orange-700">
      {/* Full banner */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 shrink-0">
              DEMO MODE
            </Badge>
            <span className="text-sm font-medium truncate">
              You're in demo mode; progress won't be saved.
            </span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Primary action */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignInToSave}
              className="h-8 px-3 text-xs bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40"
              data-testid="demo-sign-in-save"
            >
              Sign in to save progress
            </Button>
            
            {/* Secondary action - Hide */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              className="h-8 px-2 text-white hover:bg-white/10"
              data-testid="demo-hide"
            >
              <span className="text-xs mr-1">Hide</span>
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}