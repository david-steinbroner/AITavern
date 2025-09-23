import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { Quest } from "@shared/schema";
import { useState } from "react";

interface QuestCardProps {
  quest: Quest;
  onClick?: () => void;
  className?: string;
}

export default function QuestCard({ quest, onClick, className = "" }: QuestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const progressPercentage = (quest.progress / quest.maxProgress) * 100;
  
  const getPriorityIcon = () => {
    switch (quest.priority) {
      case "urgent": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "high": return <Clock className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };
  
  const getPriorityVariant = () => {
    switch (quest.priority) {
      case "urgent": return "destructive";
      case "high": return "secondary";
      default: return "outline";
    }
  };
  
  const getStatusIcon = () => {
    switch (quest.status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    onClick?.();
  };

  return (
    <Card 
      className={`hover-elevate cursor-pointer transition-all duration-200 ${className}`} 
      onClick={handleClick}
      data-testid={`quest-card-${quest.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              {getStatusIcon()}
              {quest.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getPriorityVariant()} className="text-xs">
                {getPriorityIcon()}
                {quest.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {quest.status}
              </Badge>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{quest.description}</p>
            
            {quest.status === "active" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{quest.progress}/{quest.maxProgress}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
            
            {quest.reward && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-medium text-foreground mb-1">Reward</div>
                <div className="text-sm text-muted-foreground">{quest.reward}</div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}