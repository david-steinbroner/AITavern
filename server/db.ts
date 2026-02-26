import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required.\n" +
    "Get your connection string from Supabase: Settings > Connect > Session pooler > URI"
  );
}

const client = postgres(DATABASE_URL);
export const db = drizzle(client, { schema });

export async function testConnection(): Promise<boolean> {
  try {
    await client`SELECT 1 as connected`;
    console.log("[db] Connection successful");
    return true;
  } catch (error) {
    console.error("[db] Connection failed:", error instanceof Error ? error.message : error);
    return false;
  }
}
