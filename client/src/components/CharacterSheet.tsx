import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatDisplay from "./StatDisplay";
import HealthBar from "./HealthBar";
import type { Character } from "@shared/schema";

interface CharacterSheetProps {
  character: Character;
  className?: string;
}

export default function CharacterSheet({ character, className = "" }: CharacterSheetProps) {
  return (
    <div className={`space-y-4 ${className}`} data-testid="character-sheet">
      {/* Character Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl text-primary">{character.name}</CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="secondary" data-testid="character-class">{character.class}</Badge>
            <Badge variant="outline" data-testid="character-level">Level {character.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health and Mana */}
          <div className="space-y-2">
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Experience</span>
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
          <CardTitle className="font-serif text-xl">Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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