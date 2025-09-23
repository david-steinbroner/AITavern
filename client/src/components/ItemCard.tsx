import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Pill, Package, Star } from "lucide-react";
import type { Item } from "@shared/schema";

interface ItemCardProps {
  item: Item;
  onTap?: (item: Item) => void;
  onLongPress?: (item: Item) => void;
  className?: string;
  isDragging?: boolean;
}

export default function ItemCard({ item, onTap, onLongPress, className = "", isDragging = false }: ItemCardProps) {
  const getTypeIcon = () => {
    switch (item.type) {
      case "weapon": return <Sword className="w-5 h-5" />;
      case "armor": return <Shield className="w-5 h-5" />;
      case "consumable": return <Pill className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };
  
  const getRarityColor = () => {
    switch (item.rarity) {
      case "legendary": return "border-yellow-400 bg-yellow-400/10";
      case "epic": return "border-purple-400 bg-purple-400/10";
      case "rare": return "border-blue-400 bg-blue-400/10";
      case "uncommon": return "border-green-400 bg-green-400/10";
      default: return "border-muted bg-muted/20";
    }
  };
  
  const getRarityStars = () => {
    const rarityLevels = {
      "common": 1,
      "uncommon": 2, 
      "rare": 3,
      "epic": 4,
      "legendary": 5
    };
    
    const level = rarityLevels[item.rarity as keyof typeof rarityLevels] || 1;
    return Array.from({ length: level }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-current" />
    ));
  };

  const handleClick = () => {
    onTap?.(item);
    console.log('Item tapped:', item.name);
  };
  
  const handleLongPress = () => {
    onLongPress?.(item);
    console.log('Item long pressed:', item.name);
  };

  return (
    <Card 
      className={`relative hover-elevate cursor-pointer transition-all duration-200 ${getRarityColor()} ${isDragging ? 'opacity-50 scale-95' : ''} ${item.equipped ? 'ring-2 ring-primary' : ''} ${className}`}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
      data-testid={`item-card-${item.id}`}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {getTypeIcon()}
            {item.quantity > 1 && (
              <Badge variant="secondary" className="text-xs h-5 px-1">
                {item.quantity}
              </Badge>
            )}
          </div>
          
          <div>
            <div className="font-medium text-sm text-foreground truncate">{item.name}</div>
            <div className="flex items-center gap-1 mt-1">
              {getRarityStars()}
            </div>
          </div>
          
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs capitalize">
              {item.type}
            </Badge>
            {item.equipped && (
              <Badge variant="default" className="text-xs">
                Equipped
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}