import QuestLog from '../QuestLog';
import type { Quest } from '@shared/schema';

export default function QuestLogExample() {
  const mockQuests: Quest[] = [
    {
      id: '1',
      title: 'The Lost Artifact',
      description: 'Retrieve the ancient Crystal of Power from the temple.',
      status: 'active',
      priority: 'high',
      progress: 2,
      maxProgress: 5,
      reward: '500 gold'
    },
    {
      id: '2',
      title: 'Goblin Troubles',
      description: 'Clear the goblin camp threatening the village.',
      status: 'active',
      priority: 'normal',
      progress: 4,
      maxProgress: 4,
      reward: '200 gold'
    },
    {
      id: '3',
      title: 'Herb Collection',
      description: 'Gather rare healing herbs for the village healer.',
      status: 'completed',
      priority: 'low',
      progress: 10,
      maxProgress: 10,
      reward: '100 gold, Healing Potion'
    }
  ];

  return (
    <div className="h-96 max-w-md mx-auto p-4">
      <QuestLog quests={mockQuests} />
    </div>
  );
}