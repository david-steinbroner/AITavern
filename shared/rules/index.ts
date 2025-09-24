import type { RulesEngine } from "./RulesEngine.ts";
import { DnD5eEngine }   from "./adapters/dnd5e.ts";
import { PbtaEngine }    from "./adapters/pbta.ts";

export type SystemKind = "dnd5e" | "pbta";

export function makeEngine(kind: SystemKind): RulesEngine {
  switch (kind) {
    case "dnd5e": return new DnD5eEngine();
    case "pbta":  return new PbtaEngine();
    default: throw new Error(`Unsupported system: ${kind}`);
  }
}
