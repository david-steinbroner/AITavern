import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTooltips } from "@/components/TooltipProvider";

interface GameTooltipProps {
  content: string;
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  testId?: string;
  ariaLabel?: string;
}

export default function GameTooltip({ 
  content, 
  children, 
  side = "top",
  className = "",
  testId = "tooltip-trigger",
  ariaLabel = "Show tooltip"
}: GameTooltipProps) {
  const { showTooltips } = useTooltips();

  if (!showTooltips) {
    return children ? <>{children}</> : null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className={`min-h-9 min-w-9 text-muted-foreground hover:text-foreground ${className}`}
            aria-label={ariaLabel}
            data-testid={testId}
          >
            <Info className="w-3 h-3" />
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-sm">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}