import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, SkipForward } from "lucide-react";
import { type DemoStep } from "@/hooks/useTooltips";

interface DemoTooltipProps {
  step: DemoStep;
  isVisible: boolean;
  onNext: () => void;
  onSkip: () => void;
  totalSteps: number;
  currentStepNumber: number;
}

export default function DemoTooltip({
  step,
  isVisible,
  onNext,
  onSkip,
  totalSteps,
  currentStepNumber
}: DemoTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(step.targetElement);
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = targetRect.bottom + 10;
      let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

      // Adjust if tooltip goes off screen
      if (left < 10) {
        left = 10;
      } else if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
      }

      // Position above if no space below
      if (top + tooltipRect.height > viewportHeight - 10) {
        top = targetRect.top - tooltipRect.height - 10;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible, step.targetElement]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 max-w-xs"
        style={{ top: position.top, left: position.left }}
        data-testid={`demo-tooltip-${step.id}`}
      >
        <Card className="border-primary/20 shadow-xl">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentStepNumber} of {totalSteps}
                </Badge>
                <h3 className="font-semibold text-sm">{step.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="h-6 w-6 p-0"
                data-testid="button-skip-demo"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-xs"
                data-testid="button-skip-all"
              >
                <SkipForward className="w-3 h-3 mr-1" />
                Skip Tutorial
              </Button>
              <Button
                size="sm"
                onClick={onNext}
                className="text-xs"
                data-testid="button-next-demo"
              >
                {step.action || "Continue"}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Arrow pointing to target */}
        <div 
          className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-border"
          style={{ 
            top: -8, 
            left: '50%', 
            transform: 'translateX(-50%)'
          }}
        />
      </div>
    </>
  );
}