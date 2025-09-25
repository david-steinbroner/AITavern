import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface DemoSession {
  demo?: boolean;
  demoUserId?: string;
}

export default function DemoIndicator() {
  // Check if we're in a demo session by trying to fetch user data
  const { data: user, error } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // If user has demo claims, show the demo indicator
  const isDemoMode = user?.claims?.email === "demo@example.com" || 
                     user?.claims?.sub?.startsWith("demo-");

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 dark:bg-orange-600 text-white text-center py-2 text-sm font-medium">
      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
        DEMO MODE
      </Badge>
      <span className="ml-2">You're in demo mode - your progress won't be saved</span>
    </div>
  );
}