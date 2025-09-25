import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TreePine, 
  Leaf, 
  Sparkles, 
  Shield, 
  BookOpen, 
  Heart,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  User
} from "lucide-react";

interface CharacterTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  race: string;
  class: string;
  background: string;
  personality: string[];
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  appearance: string;
  backstory: string;
  icon: React.ReactNode;
  theme: "guardian" | "scholar" | "healer" | "wanderer" | "mystic" | "protector";
}

interface CharacterTemplatesProps {
  onSelectTemplate: (template: CharacterTemplate) => void;
  onCreateCustom: () => void;
  onBack: () => void;
  className?: string;
}

const characterTemplates: CharacterTemplate[] = [
  {
    id: "forest-guardian",
    name: "Thistle",
    title: "Forest Guardian",
    description: "A brave protector of woodland creatures and ancient groves",
    race: "Half-Elf",
    class: "Ranger",
    background: "Hermit",
    personality: ["Loyal", "Protective", "Nature-loving"],
    abilities: {
      strength: 13,
      dexterity: 16,
      constitution: 14,
      intelligence: 11,
      wisdom: 15,
      charisma: 12
    },
    appearance: "A lithe figure with moss-green eyes and auburn hair woven with small wildflowers. Dressed in earth-toned leather with a carved wooden staff.",
    backstory: "Raised by forest spirits after being found as a child, you've dedicated your life to protecting the balance between civilization and nature. Your skunk companion has been with you since you were young.",
    icon: <TreePine className="w-6 h-6" />,
    theme: "guardian"
  },
  {
    id: "woodland-scholar",
    name: "Acorn",
    title: "Woodland Scholar",
    description: "A curious student of forest lore and ancient magic",
    race: "Gnome",
    class: "Wizard",
    background: "Sage",
    personality: ["Curious", "Methodical", "Gentle"],
    abilities: {
      strength: 8,
      dexterity: 12,
      constitution: 13,
      intelligence: 16,
      wisdom: 14,
      charisma: 11
    },
    appearance: "A small, cheerful figure with bright hazel eyes and silver-streaked brown hair. Carries a satchel full of scrolls and wears spectacles that sparkle with magic.",
    backstory: "You've spent years studying the magical properties of plants and animals in the forest. Your research has uncovered ancient secrets that could help heal the woodland realm.",
    icon: <BookOpen className="w-6 h-6" />,
    theme: "scholar"
  },
  {
    id: "mystical-healer",
    name: "Sage",
    title: "Mystical Healer",
    description: "A compassionate soul who mends both body and spirit",
    race: "Halfling",
    class: "Cleric",
    background: "Acolyte",
    personality: ["Compassionate", "Wise", "Peaceful"],
    abilities: {
      strength: 10,
      dexterity: 11,
      constitution: 14,
      intelligence: 12,
      wisdom: 16,
      charisma: 13
    },
    appearance: "A warm, round face with kind brown eyes and graying hair braided with healing herbs. Wears flowing robes in earthy colors with a pendant of intertwined leaves.",
    backstory: "Trained in the sacred groves by woodland druids, you blend divine magic with natural healing. Your calling is to help all creatures find peace and wellness.",
    icon: <Heart className="w-6 h-6" />,
    theme: "healer"
  },
  {
    id: "wandering-bard",
    name: "Melody",
    title: "Wandering Bard",
    description: "A storyteller who spreads joy and wisdom through song",
    race: "Human",
    class: "Bard",
    background: "Entertainer",
    personality: ["Charismatic", "Creative", "Optimistic"],
    abilities: {
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 13,
      wisdom: 11,
      charisma: 16
    },
    appearance: "An expressive face with sparkling green eyes and curly chestnut hair. Carries a lute made from enchanted wood and wears a colorful cloak with many pockets.",
    backstory: "You travel from village to village, collecting stories and songs. Your music has the power to lift spirits and inspire courage in the darkest of times.",
    icon: <Sparkles className="w-6 h-6" />,
    theme: "wanderer"
  },
  {
    id: "earth-mystic",
    name: "Moss",
    title: "Earth Mystic",
    description: "A druid connected to the deep magic of stone and soil",
    race: "Dwarf",
    class: "Druid",
    background: "Hermit",
    personality: ["Grounded", "Mystical", "Patient"],
    abilities: {
      strength: 14,
      dexterity: 10,
      constitution: 16,
      intelligence: 11,
      wisdom: 15,
      charisma: 12
    },
    appearance: "A sturdy figure with earth-brown eyes and a long braided beard adorned with small stones. Skin has a slight greenish tint from communing with nature spirits.",
    backstory: "You've learned to speak with the stones themselves, understanding the ancient memories held within the earth. The forest's mineral veins guide your magical practice.",
    icon: <Leaf className="w-6 h-6" />,
    theme: "mystic"
  },
  {
    id: "village-protector",
    name: "Oak",
    title: "Village Protector",
    description: "A stalwart defender of peaceful woodland communities",
    race: "Human",
    class: "Fighter",
    background: "Folk Hero",
    personality: ["Brave", "Reliable", "Humble"],
    abilities: {
      strength: 16,
      dexterity: 12,
      constitution: 15,
      intelligence: 10,
      wisdom: 13,
      charisma: 14
    },
    appearance: "A tall, strong build with warm brown eyes and sandy hair. Bears small scars from protecting others, and wears simple but well-maintained armor with woodland motifs.",
    backstory: "You grew up defending your village from bandits and wild beasts. Your reputation for courage and kindness has spread throughout the forest communities.",
    icon: <Shield className="w-6 h-6" />,
    theme: "protector"
  },
  {
    id: "shadow-scout",
    name: "Wisp",
    title: "Shadow Scout",
    description: "A stealthy rogue who moves through the forest like a ghost",
    race: "Elf",
    class: "Rogue",
    background: "Outlander",
    personality: ["Stealthy", "Observant", "Independent"],
    abilities: {
      strength: 10,
      dexterity: 17,
      constitution: 12,
      intelligence: 14,
      wisdom: 13,
      charisma: 11
    },
    appearance: "A slender figure with silver-blue eyes and dark hair that seems to absorb light. Wears mottled grey and brown clothing that blends with tree bark.",
    backstory: "You learned to move unseen through the forest canopy, gathering information and protecting the woodland from threats. Your silent steps leave no trace on moss or leaves.",
    icon: <Leaf className="w-6 h-6" />,
    theme: "wanderer"
  },
  {
    id: "beast-friend",
    name: "Bramble",
    title: "Beast Friend",
    description: "A gentle soul who speaks the language of all woodland creatures",
    race: "Halfling",
    class: "Druid",
    background: "Folk Hero",
    personality: ["Gentle", "Empathetic", "Brave"],
    abilities: {
      strength: 11,
      dexterity: 13,
      constitution: 15,
      intelligence: 12,
      wisdom: 16,
      charisma: 14
    },
    appearance: "A small, friendly figure with warm honey-colored eyes and curly brown hair adorned with tiny flowers and leaves. Often has small animals perched on shoulders.",
    backstory: "Since childhood, you've been able to communicate with forest animals. You've saved countless creatures from hunters and helped broker peace between conflicting species.",
    icon: <Heart className="w-6 h-6" />,
    theme: "healer"
  },
  {
    id: "storm-caller",
    name: "Thunder",
    title: "Storm Caller",
    description: "A wild sorcerer who channels the raw power of nature's fury",
    race: "Human",
    class: "Sorcerer",
    background: "Hermit",
    personality: ["Wild", "Passionate", "Unpredictable"],
    abilities: {
      strength: 9,
      dexterity: 13,
      constitution: 14,
      intelligence: 11,
      wisdom: 12,
      charisma: 17
    },
    appearance: "An intense figure with storm-grey eyes that spark with electricity and wind-tossed black hair. Clothing bears scorch marks from magical surges.",
    backstory: "Born during a great thunderstorm, you've always felt the wild magic coursing through your veins. The forest spirits taught you to channel this power responsibly.",
    icon: <Sparkles className="w-6 h-6" />,
    theme: "mystic"
  }
];

export default function CharacterTemplates({
  onSelectTemplate,
  onCreateCustom,
  onBack,
  className = ""
}: CharacterTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CharacterTemplate | null>(null);

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "guardian":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "scholar":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
      case "healer":
        return "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800";
      case "wanderer":
        return "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800";
      case "mystic":
        return "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800";
      case "protector":
        return "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800";
      default:
        return "bg-muted";
    }
  };

  const generateRandomTemplate = () => {
    const randomTemplate = characterTemplates[Math.floor(Math.random() * characterTemplates.length)];
    
    // Generate a random name variation
    const nameVariants = {
      "forest-guardian": ["Thistle", "Willow", "Rowan", "Fern", "Sage"],
      "woodland-scholar": ["Acorn", "Quill", "Sage", "Reed", "Ivy"],
      "mystical-healer": ["Sage", "Herb", "Moss", "Clover", "Basil"],
      "wandering-bard": ["Melody", "Song", "Tune", "Aria", "Echo"],
      "earth-mystic": ["Moss", "Stone", "Clay", "Pebble", "Granite"],
      "village-protector": ["Oak", "Ash", "Birch", "Pine", "Cedar"],
      "shadow-scout": ["Wisp", "Shadow", "Mist", "Shade", "Dusk"],
      "beast-friend": ["Bramble", "Berry", "Thorn", "Leaf", "Petal"],
      "storm-caller": ["Thunder", "Storm", "Lightning", "Rain", "Gale"]
    };
    
    const variants = nameVariants[randomTemplate.id as keyof typeof nameVariants] || [randomTemplate.name];
    const randomName = variants[Math.floor(Math.random() * variants.length)];
    
    setSelectedTemplate({
      ...randomTemplate,
      name: randomName
    });
  };

  if (selectedTemplate) {
    return (
      <div className={`min-h-screen bg-background text-foreground p-4 ${className}`}>
        <div className="max-w-2xl mx-auto">
          <Card className={getThemeColors(selectedTemplate.theme)}>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {selectedTemplate.icon}
                <CardTitle className="font-serif text-2xl">
                  {selectedTemplate.name} - {selectedTemplate.title}
                </CardTitle>
              </div>
              <p className="text-muted-foreground">{selectedTemplate.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Character Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="secondary">{selectedTemplate.race}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Race</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">{selectedTemplate.class}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Class</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">{selectedTemplate.background}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Background</p>
                </div>
              </div>

              <Separator />

              {/* Personality */}
              <div>
                <h4 className="font-medium mb-2">Personality</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.personality.map((trait) => (
                    <Badge key={trait} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Appearance */}
              <div>
                <h4 className="font-medium mb-2">Appearance</h4>
                <p className="text-sm text-muted-foreground">{selectedTemplate.appearance}</p>
              </div>

              {/* Backstory */}
              <div>
                <h4 className="font-medium mb-2">Backstory</h4>
                <p className="text-sm text-muted-foreground">{selectedTemplate.backstory}</p>
              </div>

              {/* Ability Scores */}
              <div>
                <h4 className="font-medium mb-3">Ability Scores</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(selectedTemplate.abilities).map(([ability, score]) => (
                    <div key={ability} className="text-center p-2 bg-muted/20 rounded">
                      <div className="font-medium text-sm capitalize">{ability.slice(0, 3)}</div>
                      <div className="text-lg font-bold">{score}</div>
                      <div className="text-xs text-muted-foreground">
                        {score >= 10 ? `+${Math.floor((score - 10) / 2)}` : Math.floor((score - 10) / 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1"
                  data-testid="button-template-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Choose Different
                </Button>
                <Button
                  onClick={() => onSelectTemplate(selectedTemplate)}
                  className="flex-1"
                  data-testid="button-template-select"
                >
                  Use This Character
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background text-foreground p-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-3xl flex items-center justify-center gap-2">
              <User className="w-8 h-8 text-primary" />
              Choose Your Character
            </CardTitle>
            <p className="text-muted-foreground">
              Select a pre-made character template or create your own woodland adventurer
            </p>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            variant="outline"
            onClick={generateRandomTemplate}
            className="h-16"
            data-testid="button-random-template"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            <div>
              <div className="font-medium">Random Character</div>
              <div className="text-xs text-muted-foreground">Let fate decide</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={onCreateCustom}
            className="h-16"
            data-testid="button-custom-character"
          >
            <User className="w-5 h-5 mr-2" />
            <div>
              <div className="font-medium">Custom Character</div>
              <div className="text-xs text-muted-foreground">Build from scratch</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={onBack}
            className="h-16"
            data-testid="button-template-back-menu"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <div>
              <div className="font-medium">Back to Menu</div>
              <div className="text-xs text-muted-foreground">Return to start</div>
            </div>
          </Button>
        </div>

        {/* Character Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characterTemplates.map((template) => (
            <Card 
              key={template.id}
              className={`hover-elevate cursor-pointer transition-all ${getThemeColors(template.theme)}`}
              onClick={() => setSelectedTemplate(template)}
              data-testid={`template-${template.id}`}
            >
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {template.icon}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <p className="text-sm font-medium text-primary">{template.title}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline" className="text-xs">{template.race}</Badge>
                    <Badge variant="outline" className="text-xs">{template.class}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-1">
                    {template.personality.slice(0, 2).map((trait) => (
                      <Badge key={trait} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                    {template.personality.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.personality.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}