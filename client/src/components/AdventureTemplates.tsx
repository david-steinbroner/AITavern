import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Scroll,
  Mountain,
  Crown,
  Sword,
  Map,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TreePine,
  Skull,
  Flame
} from "lucide-react";

interface AdventureTemplatesProps {
  onSelectTemplate: (template: AdventureTemplate) => void;
  onBack: () => void;
  className?: string;
}

export interface AdventureTemplate {
  id: string;
  name: string;
  description: string;
  setting: string;
  theme: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Epic";
  estimatedLength: string;
  initialScene: string;
  initialQuest: {
    title: string;
    description: string;
    priority: "high" | "normal" | "low";
    maxProgress: number;
  };
  worldFeatures: string[];
  icon: JSX.Element;
}

const adventureTemplates: AdventureTemplate[] = [
  {
    id: "fellowship-quest",
    name: "The Fellowship's Journey",
    description: "A classic tale of heroes banding together to destroy an ancient evil. Journey through Middle-earth inspired landscapes with rich lore and meaningful companions.",
    setting: "Middle-earth Inspired",
    theme: "Epic Fantasy",
    difficulty: "Medium",
    estimatedLength: "8-12 hours",
    initialScene: "The Prancing Pony Inn",
    initialQuest: {
      title: "The Ring Bearer's Task",
      description: "You've been entrusted with a mysterious ring that must be taken to the Elven council. Strange dark riders have been seen in the area, seeking something...",
      priority: "high",
      maxProgress: 5
    },
    worldFeatures: [
      "Hobbit-holes and peaceful villages",
      "Ancient elven kingdoms", 
      "Treacherous mountain passes",
      "Dark forests with lurking dangers",
      "Majestic kingdoms of men"
    ],
    icon: <Crown className="w-6 h-6" />
  },
  {
    id: "northern-ranger",
    name: "Rangers of the North",
    description: "Become a guardian of the wild frontier. Protect settlements from bandits, monsters, and ancient threats while exploring vast wilderness.",
    setting: "Northern Wilderness",
    theme: "Survival & Protection",
    difficulty: "Easy",
    estimatedLength: "4-6 hours",
    initialScene: "Ranger's Lodge",
    initialQuest: {
      title: "The Missing Patrol",
      description: "A ranger patrol hasn't returned from their route along the northern border. Investigate their last known location and ensure the safety of nearby settlements.",
      priority: "normal",
      maxProgress: 4
    },
    worldFeatures: [
      "Dense pine forests",
      "Mountain watchtowers",
      "Small frontier settlements",
      "Hidden bandit camps",
      "Ancient ruins with secrets"
    ],
    icon: <TreePine className="w-6 h-6" />
  },
  {
    id: "dragon-age",
    name: "The Dragon's Shadow",
    description: "An ancient dragon has awakened, threatening the kingdom. Gather allies, uncover the dragon's weakness, and prepare for an epic confrontation.",
    setting: "Highland Kingdom",
    theme: "Dragon Slaying",
    difficulty: "Hard",
    estimatedLength: "10-15 hours",
    initialScene: "The Royal Court",
    initialQuest: {
      title: "The King's Summons",
      description: "The king has called for heroes to investigate reports of a massive dragon seen flying over the eastern mountains. Villages have gone silent.",
      priority: "high",
      maxProgress: 6
    },
    worldFeatures: [
      "Royal castles and courts",
      "Dragon-scarred wastelands",
      "Mystical libraries with dragon lore",
      "Underground dwarven cities",
      "Sky-high mountain peaks"
    ],
    icon: <Flame className="w-6 h-6" />
  },
  {
    id: "underdark-expedition",
    name: "Into the Underdark",
    description: "Venture into the dangerous underground realm. Navigate complex politics between dark elf houses, discover ancient secrets, and survive constant danger.",
    setting: "Underground Realm",
    theme: "Political Intrigue",
    difficulty: "Hard",
    estimatedLength: "12-16 hours",
    initialScene: "The Deep Markets",
    initialQuest: {
      title: "The Prisoner's Information",
      description: "A captured drow noble claims to have information about a planned surface raid. Navigate the treacherous politics to learn what you need.",
      priority: "high",
      maxProgress: 7
    },
    worldFeatures: [
      "Sprawling underground cities",
      "Fungal forests and strange ecology",
      "Dark elf noble houses",
      "Ancient aberrant temples",
      "Labyrinthine cave systems"
    ],
    icon: <Skull className="w-6 h-6" />
  },
  {
    id: "seafaring-adventure",
    name: "Pirates of the Forgotten Sea",
    description: "Captain your own ship across dangerous waters. Hunt for legendary treasure while dealing with rival pirates, sea monsters, and supernatural storms.",
    setting: "Archipelago Waters",
    theme: "Nautical Adventure",
    difficulty: "Medium",
    estimatedLength: "6-10 hours",
    initialScene: "Port Blackwater",
    initialQuest: {
      title: "The Treasure Map",
      description: "You've acquired a map leading to the legendary treasure of Captain Redbeard. But you'll need a ship, crew, and supplies to survive the journey.",
      priority: "normal",
      maxProgress: 5
    },
    worldFeatures: [
      "Pirate havens and ports",
      "Mysterious tropical islands",
      "Dangerous sea monsters",
      "Hidden treasure caves",
      "Rival pirate fleets"
    ],
    icon: <Map className="w-6 h-6" />
  },
  {
    id: "wizard-academy",
    name: "The Arcane Academy",
    description: "Join a prestigious magical academy. Learn spells, uncover conspiracies, and face a dark threat that seeks to corrupt magical knowledge itself.",
    setting: "Magical Academy",
    theme: "Magical Discovery",
    difficulty: "Easy",
    estimatedLength: "5-8 hours",
    initialScene: "Academy Entrance Hall",
    initialQuest: {
      title: "The New Student's Trial",
      description: "As a new student at the Academy, you must complete the entrance trials. But strange magical disturbances suggest something darker is at work.",
      priority: "normal",
      maxProgress: 4
    },
    worldFeatures: [
      "Grand magical academy",
      "Enchanted libraries and laboratories",
      "Student dormitories and common areas",
      "Forbidden magical archives",
      "Hidden chambers with dark secrets"
    ],
    icon: <Sparkles className="w-6 h-6" />
  }
];

const difficultyColors = {
  "Easy": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", 
  "Hard": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "Epic": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
};

export default function AdventureTemplates({
  onSelectTemplate,
  onBack,
  className = ""
}: AdventureTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AdventureTemplate | null>(null);

  const handleSelectTemplate = (template: AdventureTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground p-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header - Compact */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl flex items-center justify-center gap-2 text-primary mb-2">
            <Scroll className="w-6 h-6" />
            Adventure Templates
          </h1>
          <p className="text-muted-foreground text-sm">
            Choose your adventure setting and begin your epic journey
          </p>
        </div>

        {/* Template Grid - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {adventureTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover-elevate ${
                selectedTemplate?.id === template.id
                  ? 'ring-2 ring-primary border-primary'
                  : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
              data-testid={`template-${template.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-primary shrink-0">
                      {template.icon}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base font-serif truncate">
                        {template.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.setting}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs shrink-0 ${difficultyColors[template.difficulty]}`}
                    data-testid={`difficulty-${template.difficulty.toLowerCase()}`}
                  >
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {template.description}
                </p>

                <div className="flex gap-4 text-xs">
                  <div className="flex-1">
                    <span className="text-muted-foreground">Theme: </span>
                    <span className="font-medium">{template.theme}</span>
                  </div>
                  <div className="shrink-0">
                    <span className="text-muted-foreground">{template.estimatedLength}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.worldFeatures.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.worldFeatures.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.worldFeatures.length - 2} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Template Details - Compact */}
        {selectedTemplate && (
          <Card className="mb-20 border-primary bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {selectedTemplate.icon}
                {selectedTemplate.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">Starting Quest</h4>
                <div className="p-3 rounded-md bg-background">
                  <p className="font-medium text-sm text-primary">{selectedTemplate.initialQuest.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTemplate.initialQuest.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <h4 className="font-medium text-sm mb-1">Starting Location</h4>
                  <p className="text-muted-foreground">{selectedTemplate.initialScene}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Features</h4>
                  <p className="text-muted-foreground">{selectedTemplate.worldFeatures.length} unique locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation - Sticky */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4">
          <div className="max-w-6xl mx-auto flex justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              data-testid="button-templates-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>

            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedTemplate}
              size="lg"
              data-testid="button-start-adventure"
            >
              Start Adventure
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}