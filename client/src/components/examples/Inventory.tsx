import Inventory from '../Inventory';
import type { Item } from '@shared/schema';

export default function InventoryExample() {
  const mockItems: Item[] = [
    {
      id: '1',
      name: 'Flame Sword',
      type: 'weapon',
      description: 'A magical sword that burns with eternal flames.',
      quantity: 1,
      rarity: 'rare',
      equipped: true
    },
    {
      id: '2',
      name: 'Leather Armor',
      type: 'armor',
      description: 'Sturdy leather protection.',
      quantity: 1,
      rarity: 'common',
      equipped: true
    },
    {
      id: '3',
      name: 'Health Potion',
      type: 'consumable',
      description: 'Restores 25 HP when consumed.',
      quantity: 3,
      rarity: 'common',
      equipped: false
    },
    {
      id: '4',
      name: 'Magic Scroll',
      type: 'misc',
      description: 'Ancient scroll with mysterious runes.',
      quantity: 2,
      rarity: 'uncommon',
      equipped: false
    }
  ];

  return (
    <div className="h-96 max-w-md mx-auto p-4">
      <Inventory items={mockItems} />
    </div>
  );
}