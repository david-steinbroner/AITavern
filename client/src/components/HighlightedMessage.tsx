import { Character, Message } from "@shared/schema";

interface HighlightedMessageProps {
  content: string;
  character?: Character;
  messages?: Message[];
  className?: string;
}

// Predefined color palette for highlighting different names
const nameColors = [
  "text-primary font-medium bg-primary/10",
  "text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-100/50 dark:bg-emerald-900/20",
  "text-purple-600 dark:text-purple-400 font-medium bg-purple-100/50 dark:bg-purple-900/20",
  "text-orange-600 dark:text-orange-400 font-medium bg-orange-100/50 dark:bg-orange-900/20",
  "text-blue-600 dark:text-blue-400 font-medium bg-blue-100/50 dark:bg-blue-900/20",
  "text-rose-600 dark:text-rose-400 font-medium bg-rose-100/50 dark:bg-rose-900/20"
];

// Extract unique names from messages and character
function extractNamesToHighlight(character?: Character, messages?: Message[]): string[] {
  const names = new Set<string>();
  
  // Add player character name
  if (character?.name) {
    names.add(character.name);
  }
  
  // Add NPC names from recent messages
  if (messages) {
    messages.forEach(message => {
      if (message.sender === 'npc' && message.senderName) {
        names.add(message.senderName);
      }
    });
  }
  
  return Array.from(names);
}

// Create a deterministic color mapping for names
function createNameColorMap(names: string[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  names.forEach((name, index) => {
    colorMap.set(name.toLowerCase(), nameColors[index % nameColors.length]);
  });
  return colorMap;
}

// Utility function to highlight multiple character names in different colors
function highlightCharacterNames(text: string, character?: Character, messages?: Message[]): React.ReactNode {
  if (!text) {
    return text;
  }

  const namesToHighlight = extractNamesToHighlight(character, messages);
  
  if (namesToHighlight.length === 0) {
    return text;
  }

  const colorMap = createNameColorMap(namesToHighlight);
  
  // Create a regex that matches any of the names (case insensitive, word boundaries)
  const escapedNames = namesToHighlight.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const nameRegex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');
  const parts = text.split(nameRegex);
  
  return parts.map((part, index) => {
    // Check if this part matches any character name
    const matchingName = namesToHighlight.find(name => 
      part.toLowerCase() === name.toLowerCase()
    );
    
    if (matchingName) {
      const colorClass = colorMap.get(matchingName.toLowerCase()) || nameColors[0];
      return (
        <span 
          key={index} 
          className={`${colorClass} px-1 rounded`}
          data-testid={`highlighted-character-name-${index}`}
          title={`Character: ${matchingName}`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function HighlightedMessage({ 
  content, 
  character, 
  messages,
  className = "text-sm text-foreground" 
}: HighlightedMessageProps) {
  const highlightedContent = highlightCharacterNames(content, character, messages);
  
  return (
    <p className={className} data-testid="highlighted-message">
      {highlightedContent}
    </p>
  );
}