import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  subtitle?: string;
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  }>;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  };
  className?: string;
}

export default function PageHeader({
  title,
  icon: Icon,
  subtitle,
  badges,
  action,
  className = ""
}: PageHeaderProps) {
  return (
    <CardHeader className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5" />}
            {title}
          </CardTitle>
        </div>
        {action && (
          <Button
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        )}
      </div>
      {(subtitle || badges) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}
          {badges && badges.length > 0 && (
            <div className="flex gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || "secondary"} className="text-xs">
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </CardHeader>
  );
}
