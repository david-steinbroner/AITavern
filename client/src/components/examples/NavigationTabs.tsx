import NavigationTabs from '../NavigationTabs';
import { useState } from 'react';

export default function NavigationTabsExample() {
  const [activeTab, setActiveTab] = useState<"character" | "quests" | "inventory" | "chat">("character");

  return (
    <div className="h-96 relative">
      <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Main content area</p>
      </div>
      <NavigationTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        questCount={3}
        itemCount={12}
        unreadMessages={2}
      />
    </div>
  );
}