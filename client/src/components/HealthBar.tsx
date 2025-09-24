import { Progress } from "@/components/ui/progress";
import GameTooltip from "./GameTooltip";

interface HealthBarProps {
  current: number;
  max: number;
  type: "health" | "mana";
  className?: string;
}

export default function HealthBar({ current, max, type, className = "" }: HealthBarProps) {
  const percentage = (current / max) * 100;
  const isHealth = type === "health";
  
  return (
    <div className={`space-y-1 ${className}`} data-testid={`bar-${type}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium capitalize text-foreground">{type}</span>
          <GameTooltip 
            content={isHealth 
              ? "Health points represent your character's vitality. When it reaches 0, your character falls unconscious and may die." 
              : "Mana points fuel your magical abilities and spells. Use them wisely in combat and exploration."
            }
            testId={`tooltip-${type}`}
            ariaLabel={`Learn about ${type} points`}
          />
        </div>
        <span className="text-sm text-muted-foreground">{current}/{max}</span>
      </div>
      <div className="relative">
        <Progress 
          value={percentage} 
          className={`h-3 ${isHealth ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`}
        />
        <div className="absolute inset-y-0 left-0 flex items-center px-2">
          <div className={`h-1 w-1 rounded-full ${isHealth ? 'bg-red-300' : 'bg-blue-300'}`} />
        </div>
      </div>
    </div>
  );
}