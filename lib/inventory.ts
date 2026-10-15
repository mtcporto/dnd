import { readDatabase } from "@/domain/database-transport";
import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { characterInventories } from "@/server/db/schema";
import { emptyInventory, type InventoryView } from "@/domain/inventory";
import type { CharacterDraft } from "@/domain/character";
export async function getInventory(
  characterId: string,
  draft: CharacterDraft,
): Promise<InventoryView> {
  const [row] = await readDatabase(() =>
    getDb()
      .select()
      .from(characterInventories)
      .where(eq(characterInventories.characterId, characterId)),
  );
  return row
    ? { state: row.state, revision: row.revision }
    : { state: emptyInventory(draft), revision: 0 };
}
