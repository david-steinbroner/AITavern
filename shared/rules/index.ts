import type { RulesEngine } from "./RulesEngine";
import { DnD5eEngine } from "./adapters/dnd5e.ts";

export type SystemKind = "dnd5e"; // later: "pbta" | "blades" | "fate" | ...

export function makeEngine(kind: SystemKind): RulesEngine {
  switch (kind) {
    case "dnd5e": return new DnD5eEngine();
    default: throw new Error(`Unsupported system: ${kind}`);
  }
}
