import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestCard from "./QuestCard";
import type { Quest } from "@shared/schema";
import { ScrollText, CheckCircle, XCircle } from "lucide-react";

interface QuestLogProps {
  quests: Quest[];
  onQuestClick?: (quest: Quest) => void;
  className?: string;
}

export default function QuestLog({ quests, onQuestClick, className = "" }: QuestLogProps) {
  const activeQuests = quests.filter(q => q.status === "active");
  const completedQuests = quests.filter(q => q.status === "completed");
  const failedQuests = quests.filter(q => q.status === "failed");
  
  return (
    <div className={`h-full ${className}`} data-testid="quest-log">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Quest Log
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {activeQuests.length} Active
            </Badge>
            <Badge variant="outline" className="text-xs">
              {completedQuests.length} Completed
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="h-full overflow-hidden">
          <Tabs defaultValue="active" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="text-xs">
                <ScrollText className="w-4 h-4 mr-1" />
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                <CheckCircle className="w-4 h-4 mr-1" />
                Done
              </TabsTrigger>
              <TabsTrigger value="failed" className="text-xs">
                <XCircle className="w-4 h-4 mr-1" />
                Failed
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                {activeQuests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-base">No active quests</p>
                    <p className="text-sm mt-2">Speak with NPCs to discover new adventures!</p>
                  </div>
                ) : (
                  activeQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onClick={() => onQuestClick?.(quest)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                {completedQuests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-base">No completed quests yet</p>
                  </div>
                ) : (
                  completedQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onClick={() => onQuestClick?.(quest)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="failed" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                {failedQuests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-base">No failed quests</p>
                  </div>
                ) : (
                  failedQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onClick={() => onQuestClick?.(quest)}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}