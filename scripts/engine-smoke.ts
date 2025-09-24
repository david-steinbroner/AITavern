import { makeEngine } from "../shared/rules/index.ts";

const engine = makeEngine("dnd5e");
engine.initSession(42);

const check = engine.abilityCheck({ actorId: "pc1", skill: "athletics", difficulty: 12 });
const dmg = engine.damageRoll("2d6+3");
const order = engine.turnOrder(["pc1","pc2","goblin"]);

console.log({ check, dmg, order });
