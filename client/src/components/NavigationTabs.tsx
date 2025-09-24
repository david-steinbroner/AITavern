import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, ScrollText, Package, MessageSquare } from "lucide-react";

type TabType = "character" | "quests" | "inventory" | "chat";

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  questCount?: number;
  itemCount?: number;
  unreadMessages?: number;
  className?: string;
}

export default function NavigationTabs({
  activeTab,
  onTabChange,
  questCount = 0,
  itemCount = 0,
  unreadMessages = 0,
  className = ""
}: NavigationTabsProps) {
  const tabs = [
    {
      id: "character" as TabType,
      label: "Character",
      icon: <User className="w-5 h-5" />,
      badge: null
    },
    {
      id: "quests" as TabType,
      label: "Quests",
      icon: <ScrollText className="w-5 h-5" />,
      badge: questCount > 0 ? questCount : null
    },
    {
      id: "inventory" as TabType,
      label: "Inventory",
      icon: <Package className="w-5 h-5" />,
      badge: itemCount > 0 ? itemCount : null
    },
    {
      id: "chat" as TabType,
      label: "Chat",
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadMessages > 0 ? unreadMessages : null
    }
  ];
  
  const handleTabClick = (tabId: TabType) => {
    onTabChange(tabId);
    console.log('Tab changed to:', tabId);
  };
  
  return (
    <Card className={`fixed bottom-0 left-0 right-0 z-40 rounded-none border-x-0 border-b-0 ${className}`}>
      <div className="grid grid-cols-4 p-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => handleTabClick(tab.id)}
            className="relative h-16 flex flex-col items-center justify-center px-2 min-w-[44px] touch-manipulation"
            data-testid={`tab-${tab.id}`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {tab.badge > 99 ? "99+" : tab.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs mt-1 font-medium leading-tight">{tab.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}