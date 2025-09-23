import ItemCard from '../ItemCard';
import type { Item } from '@shared/schema';

export default function ItemCardExample() {
  const mockItem: Item = {
    id: '1',
    name: 'Flame Sword',
    type: 'weapon',
    description: 'A magical sword that burns with eternal flames. +2 fire damage.',
    quantity: 1,
    rarity: 'rare',
    equipped: true
  };

  return (
    <div className="max-w-xs mx-auto p-4">
      <ItemCard item={mockItem} />
    </div>
  );
}