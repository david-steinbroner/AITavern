import { useState } from "react";
import { analytics } from "@/lib/posthog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Wand2, 
  RefreshCw,
  ArrowRight,
  ArrowLeft 
} from "lucide-react";
import CharacterQuestionnaire, { type CharacterQuestionnaireResults } from "./CharacterQuestionnaire";
import AbilityScoreRoller, { type AbilityScores } from "./AbilityScoreRoller";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CharacterCreationProps {
  onComplete: (character: CharacterData) => void;
  onBack: () => void;
  className?: string;
}

interface CharacterData {
  name: string;
  appearance: string;
  backstory: string;
  portraitUrl?: string;
  race?: string;
  class?: string;
  abilities?: AbilityScores;
  questionnaireResults?: CharacterQuestionnaireResults;
}

type CreationStep = "basics" | "portrait" | "questionnaire" | "abilities";

export default function CharacterCreation({
  onComplete,
  onBack,
  className = ""
}: CharacterCreationProps) {
  const [currentStep, setCurrentStep] = useState<CreationStep>("basics");
  const [character, setCharacter] = useState<CharacterData>({
    name: "",
    appearance: "",
    backstory: ""
  });
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);

  const handleBasicsSubmit = () => {
    if (character.name.trim() && character.appearance.trim() && character.backstory.trim()) {
      setCurrentStep("portrait");
    }
  };

  const generatePortrait = async () => {
    setIsGeneratingPortrait(true);
    try {
      const data = await apiRequest('POST', '/api/character/generate-portrait', {
        appearance: character.appearance,
        name: character.name,
      });

      setCharacter(prev => ({ 
        ...prev, 
        portraitUrl: data.url 
      }));
    } catch (error) {
      console.error('Failed to generate portrait:', error);
      // Fallback to placeholder if generation fails
      setCharacter(prev => ({ 
        ...prev, 
        portraitUrl: `https://picsum.photos/256/256?random=${Date.now()}` 
      }));
    } finally {
      setIsGeneratingPortrait(false);
    }
  };

  const renderBasicsStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Create Your Character
        </CardTitle>
        <p className="text-muted-foreground">
          Tell us about your adventurer's identity and background
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="character-name">Character Name</Label>
          <Input
            id="character-name"
            placeholder="Enter your character's name..."
            value={character.name}
            onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
            data-testid="input-character-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="character-appearance">Physical Appearance</Label>
          <Textarea
            id="character-appearance"
            placeholder="Describe what your character looks like. Be as detailed as you'd like - this will help generate your portrait!"
            value={character.appearance}
            onChange={(e) => setCharacter(prev => ({ ...prev, appearance: e.target.value }))}
            rows={3}
            data-testid="textarea-character-appearance"
          />
          <p className="text-xs text-muted-foreground">
            Example: "A tall elf with silver hair and piercing blue eyes, wearing a dark hooded cloak"
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="character-backstory">Character Backstory</Label>
          <Textarea
            id="character-backstory"
            placeholder="What's your character's history? Where do they come from? What drives them to adventure?"
            value={character.backstory}
            onChange={(e) => setCharacter(prev => ({ ...prev, backstory: e.target.value }))}
            rows={4}
            data-testid="textarea-character-backstory"
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            data-testid="button-character-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          <Button
            onClick={handleBasicsSubmit}
            disabled={!character.name.trim() || !character.appearance.trim() || !character.backstory.trim()}
            data-testid="button-character-continue"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPortraitStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl flex items-center justify-center gap-2">
          <Wand2 className="w-6 h-6 text-primary" />
          Generate Your Portrait
        </CardTitle>
        <p className="text-muted-foreground">
          Create an AI-generated image of your character
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          {character.portraitUrl ? (
            <div className="space-y-4">
              <img
                src={character.portraitUrl}
                alt="Character Portrait"
                className="w-64 h-64 mx-auto rounded-lg border-2 border-primary/20"
                data-testid="character-portrait"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={generatePortrait}
                  disabled={isGeneratingPortrait}
                  data-testid="button-regenerate-portrait"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingPortrait ? 'animate-spin' : ''}`} />
                  Generate New Portrait
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-64 h-64 mx-auto border-2 border-dashed border-muted rounded-lg flex items-center justify-center bg-muted/10">
                {isGeneratingPortrait ? (
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Generating portrait...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Wand2 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click below to generate</p>
                  </div>
                )}
              </div>
              <Button
                onClick={generatePortrait}
                disabled={isGeneratingPortrait}
                className="w-full"
                data-testid="button-generate-portrait"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Portrait with AI
              </Button>
            </div>
          )}
        </div>

        <div className="bg-muted/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Appearance Description:</h4>
          <p className="text-sm text-muted-foreground">"{character.appearance}"</p>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("basics")}
            data-testid="button-portrait-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep("questionnaire")}
            data-testid="button-portrait-continue"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "basics":
        return renderBasicsStep();
      case "portrait":
        return renderPortraitStep();
      case "questionnaire":
        return (
          <CharacterQuestionnaire
            character={character}
            onComplete={(results) => {
              setCharacter(prev => ({ 
                ...prev, 
                race: results.suggestedRace,
                class: results.suggestedClass,
                questionnaireResults: results
              }));
              setCurrentStep("abilities");
            }}
            onBack={() => setCurrentStep("portrait")}
          />
        );
      case "abilities":
        return (
          <AbilityScoreRoller
            character={character}
            suggestedAbilities={character.questionnaireResults?.suggestedAbilities || {
              strength: 10, dexterity: 10, constitution: 10,
              intelligence: 10, wisdom: 10, charisma: 10
            }}
            onComplete={async (abilities) => {
              const finalCharacter = {
                ...character,
                abilities
              };
              
              // Save character to backend
              try {
                await apiRequest('POST', '/api/character', {
                  name: finalCharacter.name,
                  class: finalCharacter.class || 'Fighter',
                  level: 1,
                  experience: 0,
                  strength: abilities.strength,
                  dexterity: abilities.dexterity,
                  constitution: abilities.constitution,
                  intelligence: abilities.intelligence,
                  wisdom: abilities.wisdom,
                  charisma: abilities.charisma,
                  maxHealth: 10 + Math.floor((abilities.constitution - 10) / 2),
                  currentHealth: 10 + Math.floor((abilities.constitution - 10) / 2),
                  maxMana: abilities.intelligence > 12 ? 5 + Math.floor((abilities.intelligence - 10) / 2) : 0,
                  currentMana: abilities.intelligence > 12 ? 5 + Math.floor((abilities.intelligence - 10) / 2) : 0
                });
                
                // Invalidate character query to refresh data
                queryClient.invalidateQueries({ queryKey: ['/api/character'] });
                
                onComplete(finalCharacter);
              } catch (error) {
                console.error('Failed to save character:', error);
                // Still call onComplete to proceed, character data is in memory
                onComplete(finalCharacter);
              }
            }}
            onBack={() => setCurrentStep("questionnaire")}
          />
        );
      default:
        return renderBasicsStep();
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground p-4 ${className}`}>
      {/* Progress indicator */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {["basics", "portrait", "questionnaire", "abilities"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep === step ? 'bg-primary text-primary-foreground' : 
                  ["basics", "portrait", "questionnaire", "abilities"].indexOf(currentStep) > index 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'}
              `}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  ["basics", "portrait", "questionnaire", "abilities"].indexOf(currentStep) > index 
                    ? 'bg-primary' 
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            Step {["basics", "portrait", "questionnaire", "abilities"].indexOf(currentStep) + 1} of 4
          </Badge>
        </div>
      </div>

      {renderCurrentStep()}
    </div>
  );
}