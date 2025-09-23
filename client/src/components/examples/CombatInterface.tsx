import CombatInterface from '../CombatInterface';

export default function CombatInterfaceExample() {
  const mockEnemies = [
    {
      id: '1',
      name: 'Goblin Warrior',
      currentHealth: 15,
      maxHealth: 25,
      level: 3
    },
    {
      id: '2',
      name: 'Orc Shaman',
      currentHealth: 8,
      maxHealth: 20,
      level: 4
    }
  ];

  return (
    <CombatInterface 
      isInCombat={true}
      currentTurn="player"
      enemies={mockEnemies}
    />
  );
}