import QuestCard from '../QuestCard';
import type { Quest } from '@shared/schema';

export default function QuestCardExample() {
  const mockQuest: Quest = {
    id: '1',
    title: 'The Lost Artifact',
    description: 'Retrieve the ancient Crystal of Power from the abandoned temple deep in the Whispering Woods.',
    status: 'active',
    priority: 'high',
    progress: 2,
    maxProgress: 5,
    reward: '500 gold, Crystal of Power'
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <QuestCard quest={mockQuest} />
    </div>
  );
}