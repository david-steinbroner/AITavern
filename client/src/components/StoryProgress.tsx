import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface StoryProgressProps {
  currentPage: number;
  totalPages: number;
  genre?: string;
  storyComplete?: boolean;
  className?: string;
}

export default function StoryProgress({
  currentPage,
  totalPages,
  genre,
  storyComplete = false,
  className = "",
}: StoryProgressProps) {
  const progress = totalPages > 0 ? Math.min((currentPage / totalPages) * 100, 100) : 0;

  // Pacing label based on position
  const getPacingLabel = () => {
    if (storyComplete) return "Story Complete";
    const pct = currentPage / totalPages;
    if (pct < 0.2) return "Setting the scene";
    if (pct < 0.5) return "Rising action";
    if (pct < 0.75) return "Building tension";
    if (pct < 0.9) return "Approaching climax";
    return "Final chapters";
  };

  return (
    <div className={`px-4 py-2 border-b bg-card/50 ${className}`}>
      <div className="flex items-center gap-3">
        {storyComplete ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        ) : (
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground truncate">
              {getPacingLabel()}
            </span>
            <span className="text-xs font-medium text-muted-foreground shrink-0 ml-2">
              {currentPage}/{totalPages}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    </div>
  );
}
