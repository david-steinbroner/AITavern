import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemCard from "./ItemCard";
import type { Item } from "@shared/schema";
import { Package, Sword, Shield, Pill } from "lucide-react";

interface InventoryProps {
  items: Item[];
  onItemTap?: (item: Item) => void;
  onItemLongPress?: (item: Item) => void;
  className?: string;
}

export default function Inventory({ items, onItemTap, onItemLongPress, className = "" }: InventoryProps) {
  const weapons = items.filter(item => item.type === "weapon");
  const armor = items.filter(item => item.type === "armor");
  const consumables = items.filter(item => item.type === "consumable");
  const misc = items.filter(item => item.type === "misc");
  
  const allItems = items;
  
  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>No {type} items</p>
    </div>
  );
  
  return (
    <div className={`h-full ${className}`} data-testid="inventory">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {items.length} items • Tap to use, hold for details
          </div>
        </CardHeader>
        
        <CardContent className="h-full overflow-hidden">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="text-xs px-2">
                <Package className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="weapons" className="text-xs px-2">
                <Sword className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="armor" className="text-xs px-2">
                <Shield className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="consumables" className="text-xs px-2">
                <Pill className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="misc" className="text-xs px-2">
                Misc
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="flex-1 overflow-auto mt-4">
              <div className="grid grid-cols-2 gap-3">
                {allItems.length === 0 ? (
                  <div className="col-span-2">
                    <EmptyState type="" />
                  </div>
                ) : (
                  allItems.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onTap={onItemTap}
                      onLongPress={onItemLongPress}
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="weapons" className="flex-1 overflow-auto mt-4">
              <div className="grid grid-cols-2 gap-3">
                {weapons.length === 0 ? (
                  <div className="col-span-2">
                    <EmptyState type="weapon" />
                  </div>
                ) : (
                  weapons.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onTap={onItemTap}
                      onLongPress={onItemLongPress}
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="armor" className="flex-1 overflow-auto mt-4">
              <div className="grid grid-cols-2 gap-3">
                {armor.length === 0 ? (
                  <div className="col-span-2">
                    <EmptyState type="armor" />
                  </div>
                ) : (
                  armor.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onTap={onItemTap}
                      onLongPress={onItemLongPress}
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="consumables" className="flex-1 overflow-auto mt-4">
              <div className="grid grid-cols-2 gap-3">
                {consumables.length === 0 ? (
                  <div className="col-span-2">
                    <EmptyState type="consumable" />
                  </div>
                ) : (
                  consumables.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onTap={onItemTap}
                      onLongPress={onItemLongPress}
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="misc" className="flex-1 overflow-auto mt-4">
              <div className="grid grid-cols-2 gap-3">
                {misc.length === 0 ? (
                  <div className="col-span-2">
                    <EmptyState type="misc" />
                  </div>
                ) : (
                  misc.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onTap={onItemTap}
                      onLongPress={onItemLongPress}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}