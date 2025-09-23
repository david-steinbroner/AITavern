import CharacterSheet from '../CharacterSheet';
import type { Character } from '@shared/schema';

export default function CharacterSheetExample() {
  const mockCharacter: Character = {
    id: '1',
    name: 'Elara Swiftblade',
    class: 'Rogue',
    level: 5,
    experience: 2750,
    strength: 12,
    dexterity: 18,
    constitution: 14,
    intelligence: 13,
    wisdom: 15,
    charisma: 16,
    currentHealth: 34,
    maxHealth: 42,
    currentMana: 8,
    maxMana: 15
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <CharacterSheet character={mockCharacter} />
    </div>
  );
}