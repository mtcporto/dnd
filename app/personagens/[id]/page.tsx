import { getInventory } from "@/lib/inventory";
import { canonicalItems } from "@/lib/items";
import { inventoryStats } from "@/domain/inventory";
import { getI18n } from "@/lib/i18n/server";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { characters } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { SavedCharacterDetail } from "@/components/saved-character-detail";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("Ficha do personagem") };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = await getI18n();

  const { id } = await params,
    session = await getSession();
  if (!session) redirect("/entrar");
  const [row] = await getDb()
    .select()
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, session.user.id)));
  if (!row) notFound();
  const inventory = await getInventory(id, row.draft);
  const loadout = inventoryStats(inventory.state, row.draft, canonicalItems);
  return (
    <main id="main" className="character-space saved-character-page">
      <div className="character-space-heading">
        <a className="back-link" href="/personagens">
          {t(" ← Meus personagens ")}
        </a>
        <p>
          {t(" Seu grupo de aventureiros ")}
          <span aria-hidden="true">/</span> {t(" Ficha ")}
        </p>
      </div>
      <a className="class-confirm" href={`/personagens/${id}/inventario`}>
        {t("Abrir inventário")} ↗
      </a>
      <SavedCharacterDetail
        name={row.name}
        draft={row.draft}
        currentHP={inventory.state.currentHP}
        armorClass={loadout.armorClass}
      />
    </main>
  );
}
