import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Swords, Shield, Zap, Heart, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useState } from "react";

interface Enemy {
  id: string;
  name: string;
  currentHealth: number;
  maxHealth: number;
  level: number;
}

interface CombatInterfaceProps {
  isInCombat: boolean;
  currentTurn: "player" | "enemy";
  enemies: Enemy[];
  onAttack?: (targetId: string) => void;
  onDefend?: () => void;
  onCastSpell?: (spellId: string) => void;
  onUseItem?: (itemId: string) => void;
  onFlee?: () => void;
  className?: string;
}

export default function CombatInterface({
  isInCombat,
  currentTurn,
  enemies,
  onAttack,
  onDefend,
  onCastSpell,
  onUseItem,
  onFlee,
  className = ""
}: CombatInterfaceProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  
  if (!isInCombat) {
    return null;
  }
  
  const handleAttack = (enemyId: string) => {
    onAttack?.(enemyId);
    console.log('Attack action:', enemyId);
    setSelectedAction(null);
    setSelectedTarget(null);
  };
  
  const handleDefend = () => {
    onDefend?.();
    console.log('Defend action triggered');
    setSelectedAction(null);
  };
  
  const handleSpell = () => {
    onCastSpell?.("fireball"); // todo: implement spell selection
    console.log('Spell cast: fireball');
    setSelectedAction(null);
  };
  
  const handleItem = () => {
    onUseItem?.("healing-potion"); // todo: implement item selection
    console.log('Item used: healing potion');
    setSelectedAction(null);
  };
  
  const handleFlee = () => {
    onFlee?.();
    console.log('Flee attempt');
    setSelectedAction(null);
  };
  
  return (
    <div className={`fixed inset-0 z-50 bg-background/95 backdrop-blur ${className}`} data-testid="combat-interface">
      <div className="h-full flex flex-col p-4">
        {/* Combat Header */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-xl text-center text-destructive">
              <Swords className="w-6 h-6 inline mr-2" />
              Combat!
            </CardTitle>
            <div className="text-center">
              <Badge variant={currentTurn === "player" ? "default" : "secondary"}>
                {currentTurn === "player" ? "Your Turn" : "Enemy Turn"}
              </Badge>
            </div>
          </CardHeader>
        </Card>
        
        {/* Enemies */}
        <Card className="flex-1 mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Enemies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enemies.map((enemy) => {
                const healthPercentage = (enemy.currentHealth / enemy.maxHealth) * 100;
                return (
                  <div 
                    key={enemy.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedTarget === enemy.id ? 'border-destructive bg-destructive/10' : 'border-border hover-elevate'
                    }`}
                    onClick={() => {
                      if (selectedAction === "attack" && currentTurn === "player") {
                        setSelectedTarget(enemy.id);
                      }
                    }}
                    data-testid={`enemy-${enemy.id}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{enemy.name}</div>
                      <Badge variant="outline">Lvl {enemy.level}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Health</span>
                        <span>{enemy.currentHealth}/{enemy.maxHealth}</span>
                      </div>
                      <Progress value={healthPercentage} className="h-2 [&>div]:bg-red-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        {currentTurn === "player" && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Gesture Hints */}
                <div className="text-center text-sm text-muted-foreground">
                  Swipe right to attack • Swipe left to defend • Swipe up for spells
                </div>
                
                {selectedAction === "attack" && selectedTarget ? (
                  <div className="space-y-2">
                    <div className="text-center text-sm font-medium">Confirm Attack on {enemies.find(e => e.id === selectedTarget)?.name}</div>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleAttack(selectedTarget)}
                        data-testid="button-confirm-attack"
                      >
                        <Swords className="w-4 h-4 mr-2" />
                        Confirm Attack
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedAction(null);
                          setSelectedTarget(null);
                        }}
                        data-testid="button-cancel-action"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={() => setSelectedAction("attack")}
                      className="h-16 flex flex-col"
                      data-testid="button-attack"
                    >
                      <Swords className="w-5 h-5 mb-1" />
                      <span className="text-sm">Attack</span>
                      <ArrowRight className="w-3 h-3 text-destructive-foreground/70" />
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      onClick={handleDefend}
                      className="h-16 flex flex-col"
                      data-testid="button-defend"
                    >
                      <Shield className="w-5 h-5 mb-1" />
                      <span className="text-sm">Defend</span>
                      <ArrowLeft className="w-3 h-3 text-secondary-foreground/70" />
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      onClick={handleSpell}
                      className="h-16 flex flex-col"
                      data-testid="button-cast-spell"
                    >
                      <Zap className="w-5 h-5 mb-1" />
                      <span className="text-sm">Cast Spell</span>
                      <ArrowUp className="w-3 h-3 text-accent-foreground/70" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleItem}
                      className="h-16 flex flex-col"
                      data-testid="button-use-item"
                    >
                      <Heart className="w-5 h-5 mb-1" />
                      <span className="text-sm">Use Item</span>
                    </Button>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleFlee}
                  className="w-full"
                  data-testid="button-flee"
                >
                  Flee Combat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {currentTurn === "enemy" && (
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-muted-foreground">Enemy is taking their turn...</div>
              <div className="mt-2">
                <Progress value={75} className="w-full h-2" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}