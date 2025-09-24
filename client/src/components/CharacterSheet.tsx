import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Scroll } from "lucide-react";
import StatDisplay from "./StatDisplay";
import HealthBar from "./HealthBar";
import EditableCharacterName from "./EditableCharacterName";
import GameTooltip from "./GameTooltip";
import type { Character } from "@shared/schema";

interface CharacterSheetProps {
  character: Character;
  className?: string;
}

export default function CharacterSheet({ character, className = "" }: CharacterSheetProps) {
  const [showBackstory, setShowBackstory] = useState(false);

  return (
    <div className={`space-y-4 ${className}`} data-testid="character-sheet">
      {/* Character Header with Portrait */}
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="flex flex-col items-center space-y-3">
            {/* Character Portrait */}
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage 
                src={character.portraitUrl || ''} 
                alt={`${character.name} portrait`} 
                data-testid="character-portrait"
              />
              <AvatarFallback className="text-lg font-semibold bg-primary/10">
                {character.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex justify-center">
              <EditableCharacterName
                characterName={character.name}
                characterId={character.id}
              />
            </div>
            
            <div className="flex justify-center space-x-2">
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" data-testid="character-class">{character.class}</Badge>
                <GameTooltip 
                  content="Your character's class determines their abilities, skills, and role in combat and adventures." 
                  testId="tooltip-class"
                  ariaLabel="Learn about character classes"
                />
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" data-testid="character-level">Level {character.level}</Badge>
                <GameTooltip 
                  content="Character level represents your overall power and experience. Higher levels unlock new abilities and increase your stats." 
                  testId="tooltip-level"
                  ariaLabel="Learn about character levels"
                />
              </div>
            </div>
            
            {/* Backstory Button */}
            <Button
              variant="outline" 
              size="sm"
              onClick={() => setShowBackstory(!showBackstory)}
              className="text-xs"
              data-testid="button-backstory"
            >
              <Scroll className="w-3 h-3 mr-1" />
              {showBackstory ? 'Hide' : 'View'} Backstory
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Backstory Display */}
          {showBackstory && character.backstory && (
            <div className="bg-muted/20 p-4 rounded-lg border-l-4 border-primary/30">
              <h4 className="font-medium text-sm mb-2 text-primary">Character Backstory</h4>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="character-backstory">
                {character.backstory}
              </p>
            </div>
          )}
          
          {/* Health and Mana */}
          <div className="space-y-3">
            <HealthBar 
              current={character.currentHealth} 
              max={character.maxHealth} 
              type="health" 
            />
            {character.maxMana > 0 && (
              <HealthBar 
                current={character.currentMana} 
                max={character.maxMana} 
                type="mana" 
              />
            )}
          </div>
          
          {/* Experience */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-foreground">Experience</span>
                <GameTooltip 
                  content="Experience points (XP) are earned by completing quests, defeating enemies, and accomplishing goals. Collect enough XP to level up!" 
                  testId="tooltip-experience"
                  ariaLabel="Learn about experience points"
                />
              </div>
              <span className="text-sm text-muted-foreground">{character.experience} XP</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((character.experience % 100) / 100) * 100}%` }}
                data-testid="experience-progress"
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {character.experience % 100}/100 to level {character.level + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ability Scores */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg font-serif">Ability Scores</CardTitle>
            <GameTooltip 
              content="Ability scores determine your character's natural talents and capabilities. Higher scores mean better performance in related actions and skills." 
              testId="tooltip-abilities"
              ariaLabel="Learn about ability scores"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatDisplay label="STR" value={character.strength} />
            <StatDisplay label="DEX" value={character.dexterity} />
            <StatDisplay label="CON" value={character.constitution} />
            <StatDisplay label="INT" value={character.intelligence} />
            <StatDisplay label="WIS" value={character.wisdom} />
            <StatDisplay label="CHA" value={character.charisma} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}