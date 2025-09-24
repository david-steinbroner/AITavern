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
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-3xl flex items-center justify-center gap-2">
              <Scroll className="w-8 h-8 text-primary" />
              Adventure Templates
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Choose your adventure setting and begin your epic journey
            </p>
          </CardHeader>
        </Card>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-serif">
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {template.setting}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={`text-xs ${difficultyColors[template.difficulty]}`}
                    data-testid={`difficulty-${template.difficulty.toLowerCase()}`}
                  >
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Theme:</span>
                    <span className="font-medium">{template.theme}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Length:</span>
                    <span className="font-medium">{template.estimatedLength}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">World Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.worldFeatures.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {template.worldFeatures.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.worldFeatures.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Template Details */}
        {selectedTemplate && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedTemplate.icon}
                {selectedTemplate.name} - Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Starting Quest:</h4>
                <Card>
                  <CardContent className="pt-4">
                    <h5 className="font-medium text-primary">{selectedTemplate.initialQuest.title}</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTemplate.initialQuest.description}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-medium mb-2">Starting Location:</h4>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {selectedTemplate.initialScene}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">All World Features:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTemplate.worldFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Mountain className="w-3 h-3 text-muted-foreground" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
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
            data-testid="button-start-adventure"
          >
            Start Adventure
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}