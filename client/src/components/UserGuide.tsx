import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sword, MessageSquare, ScrollText, Package, Dice6, Heart, Zap, Play } from "lucide-react";

interface UserGuideProps {
  onBack: () => void;
}

export default function UserGuide({ onBack }: UserGuideProps) {
  const guideCards = [
    {
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      title: "Chat with your AI Storyteller",
      description: "Your AI storyteller will guide your adventure. Simply type what you want to do and they will respond with the story.",
      tips: [
        "Describe your actions in detail",
        "Ask questions about your surroundings", 
        "Try creative solutions to problems"
      ]
    },
    {
      icon: <ScrollText className="w-6 h-6 text-primary" />,
      title: "Complete Quests",
      description: "Track your objectives in the Quest tab. Complete quests to gain experience and rewards.",
      tips: [
        "Check active quests regularly",
        "Some quests have multiple steps",
        "Completed quests give XP and items"
      ]
    },
    {
      icon: <Sword className="w-6 h-6 text-primary" />,
      title: "Combat System",
      description: "When you encounter enemies, combat becomes turn-based. Choose your actions wisely!",
      tips: [
        "Attack: Deal damage to enemies",
        "Defend: Reduce incoming damage",
        "Use items for healing or buffs"
      ]
    },
    {
      icon: <Package className="w-6 h-6 text-primary" />,
      title: "Manage Inventory",
      description: "Collect weapons, armor, and items throughout your journey. Equip them to improve your character.",
      tips: [
        "Better equipment improves your stats",
        "Use consumables in combat",
        "Sell unwanted items to merchants"
      ]
    }
  ];

  const characterStats = [
    { icon: <Heart className="w-4 h-4" />, name: "Health", description: "Your life force" },
    { icon: <Zap className="w-4 h-4" />, name: "Mana", description: "For casting spells" },
    { icon: <Sword className="w-4 h-4" />, name: "Strength", description: "Physical power" },
    { icon: <Dice6 className="w-4 h-4" />, name: "Dexterity", description: "Speed and agility" }
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          data-testid="button-back-to-menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-serif text-2xl text-primary ml-3">New Player Guide</h1>
      </div>

      {/* Welcome Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Dice6 className="w-6 h-6 text-accent mr-2" />
            Welcome to Your Adventure!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            This AI-powered tabletop RPG combines the storytelling of traditional D&D with modern mobile gaming. 
            Your friendly AI storyteller creates dynamic stories based on your choices and actions.
          </p>
        </CardContent>
      </Card>

      {/* Core Gameplay */}
      <div className="space-y-4 mb-6">
        <h2 className="font-serif text-xl text-primary mb-4">Core Gameplay</h2>
        {guideCards.map((card, index) => (
          <Card key={index} className="hover-elevate">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                {card.icon}
                <span className="ml-3">{card.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                {card.description}
              </p>
              <div className="space-y-1">
                {card.tips.map((tip, tipIndex) => (
                  <div key={tipIndex} className="flex items-start">
                    <Badge variant="outline" className="mr-2 mt-0.5 text-xs">
                      {tipIndex + 1}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Character Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Understanding Your Character</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {characterStats.map((stat, index) => (
              <div key={index} className="flex items-center p-2 rounded-md bg-muted/50">
                {stat.icon}
                <div className="ml-2">
                  <p className="font-medium text-sm">{stat.name}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips for Success</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start">
              <Badge className="mr-2 mt-0.5 flex items-center"><Zap className="w-3 h-3" /></Badge>
              <span className="text-sm">Be creative with your actions - the AI responds to imagination!</span>
            </div>
            <div className="flex items-start">
              <Badge className="mr-2 mt-0.5 flex items-center"><Heart className="w-3 h-3" /></Badge>
              <span className="text-sm">Keep an eye on your health and mana during adventures</span>
            </div>
            <div className="flex items-start">
              <Badge className="mr-2 mt-0.5 flex items-center"><ScrollText className="w-3 h-3" /></Badge>
              <span className="text-sm">Focus on completing quests to level up your character</span>
            </div>
            <div className="flex items-start">
              <Badge className="mr-2 mt-0.5 flex items-center"><Package className="w-3 h-3" /></Badge>
              <span className="text-sm">Don't forget to equip better gear as you find it</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Playing Button */}
      <div className="mt-8 text-center">
        <Button 
          onClick={onBack}
          className="w-full h-12 text-lg font-semibold"
          data-testid="button-start-playing"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Your Adventure!
        </Button>
      </div>
    </div>
  );
}