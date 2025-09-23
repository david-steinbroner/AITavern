import { Progress } from "@/components/ui/progress";

interface StatDisplayProps {
  label: string;
  value: number;
  maxValue?: number;
  className?: string;
}

export default function StatDisplay({ label, value, maxValue = 20, className = "" }: StatDisplayProps) {
  const percentage = (value / maxValue) * 100;
  const modifier = Math.floor((value - 10) / 2);
  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`} data-testid={`stat-${label.toLowerCase()}`}>
      <div className="relative w-16 h-16">
        <Progress value={percentage} className="w-full h-full rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{modifierText}</div>
          </div>
        </div>
      </div>
      <div className="text-sm font-medium text-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}