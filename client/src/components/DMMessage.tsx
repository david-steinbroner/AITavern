import { Character, Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dice6 } from "lucide-react";

interface DMMessageProps {
  content: string;
  character?: Character;
  messages?: Message[];
  className?: string;
  onDiceRoll?: (rollType: string, ability: string) => void;
}

function parseDMResponse(content: string) {
  const lines = content.split('\n').filter(line => line.trim());
  
  const narrative: string[] = [];
  const actionOptions: string[] = [];
  const diceRolls: { text: string; ability?: string; rollType?: string }[] = [];
  
  let currentSection = 'narrative';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for action options (bullet points)
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      currentSection = 'actions';
      actionOptions.push(trimmedLine.replace(/^[•\-\*]\s*/, ''));
      continue;
    }
    
    // Check for dice roll instructions
    if (trimmedLine.toLowerCase().includes('roll ') || 
        trimmedLine.toLowerCase().includes('make a ') ||
        trimmedLine.toLowerCase().includes('check') && (
          trimmedLine.toLowerCase().includes('strength') ||
          trimmedLine.toLowerCase().includes('dexterity') ||
          trimmedLine.toLowerCase().includes('constitution') ||
          trimmedLine.toLowerCase().includes('intelligence') ||
          trimmedLine.toLowerCase().includes('wisdom') ||
          trimmedLine.toLowerCase().includes('charisma')
        )) {
      
      const rollMatch = trimmedLine.match(/roll\s+(\w+)/i) || 
                        trimmedLine.match(/make\s+a\s+(\w+)/i);
      const ability = rollMatch ? rollMatch[1].toLowerCase() : undefined;
      
      diceRolls.push({
        text: trimmedLine,
        ability,
        rollType: ability ? `${ability}Check` : 'general'
      });
      continue;
    }
    
    // Everything else goes to narrative
    if (currentSection === 'narrative' || !trimmedLine.startsWith('•')) {
      narrative.push(trimmedLine);
    }
  }
  
  return { narrative, actionOptions, diceRolls };
}

// Highlight character names in text
function highlightCharacterNames(text: string, character?: Character, messages?: Message[]): React.ReactNode {
  if (!text || !character?.name) {
    return text;
  }

  const characterName = character.name;
  const regex = new RegExp(`\\b(${characterName})\\b`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === characterName.toLowerCase()) {
      return (
        <span 
          key={index} 
          className="text-primary font-medium bg-primary/10 px-1 rounded"
          title={`Character: ${characterName}`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function DMMessage({ 
  content, 
  character,
  messages,
  className = "text-base leading-relaxed text-foreground font-medium",
  onDiceRoll
}: DMMessageProps) {
  const { narrative, actionOptions, diceRolls } = parseDMResponse(content);
  
  return (
    <div className="space-y-3">
      {/* Main Narrative */}
      {narrative.length > 0 && (
        <div className={className}>
          {narrative.map((paragraph, index) => (
            <p key={index} className="mb-2 last:mb-0">
              {highlightCharacterNames(paragraph, character, messages)}
            </p>
          ))}
        </div>
      )}
      
      {/* Dice Roll Requests */}
      {diceRolls.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
          {diceRolls.map((roll, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <span className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                {roll.text}
              </span>
              {onDiceRoll && roll.ability && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDiceRoll(roll.rollType || 'general', roll.ability!)}
                  className="shrink-0 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  data-testid={`button-dice-roll-${roll.ability}`}
                >
                  <Dice6 className="w-4 h-4 mr-1" />
                  Roll {roll.ability}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Action Options */}
      {actionOptions.length > 0 && (
        <div className="bg-muted/30 border border-border rounded-lg p-3">
          <div className="text-sm font-medium text-muted-foreground mb-2">What would you like to do?</div>
          <ul className="space-y-1">
            {actionOptions.map((option, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>{option}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}