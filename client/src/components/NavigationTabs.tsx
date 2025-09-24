import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, ScrollText, Package, MessageSquare } from "lucide-react";
import { useTooltips } from "@/hooks/useTooltips";
import { useNotifications } from "@/hooks/useNotifications";
import Tooltip from "./Tooltip";
import { useRef, useEffect } from "react";

type TabType = "character" | "quests" | "inventory" | "chat";

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  questCount?: number;
  itemCount?: number;
  unreadMessages?: number;
  className?: string;
  showNewPlayerTooltips?: boolean;
}

export default function NavigationTabs({
  activeTab,
  onTabChange,
  questCount = 0,
  itemCount = 0,
  unreadMessages = 0,
  className = "",
  showNewPlayerTooltips = true
}: NavigationTabsProps) {
  const { shouldShowTooltip, markTooltipAsSeen, activeTooltip, showTooltip } = useTooltips();
  const { hasNotification, markTabAsVisited, getNotificationForTab } = useNotifications();
  
  // Initialize tab refs at component level
  const characterRef = useRef<HTMLButtonElement>(null);
  const questsRef = useRef<HTMLButtonElement>(null);
  const inventoryRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLButtonElement>(null);
  
  const tabRefs = {
    character: characterRef,
    quests: questsRef,
    inventory: inventoryRef,
    chat: chatRef
  };

  const tabs = [
    {
      id: "character" as TabType,
      label: "Character",
      icon: <User className="w-5 h-5" />,
      badge: null,
      tooltip: {
        id: 'nav-character',
        title: 'Character Sheet',
        content: 'View your stats, health, mana, and level progression. This is where you can see how strong your adventurer has become!'
      }
    },
    {
      id: "quests" as TabType,
      label: "Quests",
      icon: <ScrollText className="w-5 h-5" />,
      badge: questCount > 0 ? questCount : null,
      tooltip: {
        id: 'nav-quests',
        title: 'Quest Log',
        content: 'Track your active adventures and objectives. Complete quests to gain experience and valuable rewards!'
      }
    },
    {
      id: "inventory" as TabType,
      label: "Inventory",
      icon: <Package className="w-5 h-5" />,
      badge: itemCount > 0 ? itemCount : null,
      tooltip: {
        id: 'nav-inventory',
        title: 'Inventory',
        content: 'Manage your weapons, armor, and items. Equip better gear to improve your combat abilities!'
      }
    },
    {
      id: "chat" as TabType,
      label: "Chat",
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadMessages > 0 ? unreadMessages : null,
      tooltip: {
        id: 'nav-chat',
        title: 'Adventure Chat',
        content: 'Talk with your AI storyteller! Describe what you want to do and they will guide your story.'
      }
    }
  ];
  
  const handleTabClick = (tabId: TabType) => {
    // Mark tab as visited to clear notifications
    markTabAsVisited(tabId);
    
    // Mark tooltip as seen
    const tab = tabs.find(t => t.id === tabId);
    if (tab && showNewPlayerTooltips) {
      markTooltipAsSeen(tab.tooltip.id);
    }
    
    onTabChange(tabId);
    console.log('Tab changed to:', tabId);
  };
  
  // Show tooltip for first unseen tab after a delay
  useEffect(() => {
    if (!showNewPlayerTooltips) return;
    
    const firstUnseenTab = tabs.find(tab => shouldShowTooltip(tab.tooltip.id));
    if (firstUnseenTab && activeTab === firstUnseenTab.id) {
      const timer = setTimeout(() => {
        showTooltip(firstUnseenTab.tooltip.id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, showNewPlayerTooltips, shouldShowTooltip, showTooltip, tabs]);
  
  return (
    <Card className={`fixed bottom-0 left-0 right-0 z-40 rounded-none border-x-0 border-b-0 ${className}`}>
      <div className="grid grid-cols-4 p-2">
        {tabs.map((tab) => {
          const notification = getNotificationForTab(tab.id);
          const hasNotif = hasNotification(tab.id);
          
          return (
            <div key={tab.id} className="relative">
              <Button
                ref={tabRefs[tab.id]}
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
                  {hasNotif && (
                    <Badge 
                      variant={notification?.type === 'error' ? 'destructive' : 'default'}
                      className="absolute -top-1 -right-1 h-3 w-3 p-0 flex items-center justify-center animate-pulse"
                      data-testid={`notification-${tab.id}`}
                    >
                      <span className="text-xs">!</span>
                    </Badge>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium leading-tight">{tab.label}</span>
              </Button>
              
              {/* Tooltip */}
              {showNewPlayerTooltips && shouldShowTooltip(tab.tooltip.id) && activeTooltip === tab.tooltip.id && (
                <Tooltip
                  id={tab.tooltip.id}
                  title={tab.tooltip.title}
                  content={tab.tooltip.content}
                  position="top"
                  isVisible={true}
                  onDismiss={() => markTooltipAsSeen(tab.tooltip.id)}
                  targetRef={tabRefs[tab.id]}
                />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}