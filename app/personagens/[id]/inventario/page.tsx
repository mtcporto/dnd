import { readDatabase } from "@/domain/database-transport";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { characters } from "@/server/db/schema";
import { getInventory } from "@/lib/inventory";
import { getItems } from "@/lib/items";
import { getI18n } from "@/lib/i18n/server";
import { InventoryManager } from "@/components/inventory-manager";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("Inventário") };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/entrar");
  const [character] = await readDatabase(() =>
    getDb()
      .select()
      .from(characters)
      .where(
        and(eq(characters.id, id), eq(characters.userId, session.user.id)),
      ),
  );
  if (!character) notFound();
  const [{ t }, inventory, catalogue] = await Promise.all([
    getI18n(),
    getInventory(id, character.draft),
    getItems(),
  ]);
  return (
    <main id="main" className="character-space compendium-page inventory-page">
      <Link className="back-link" href={"/personagens/" + id}>
        {t("← Ficha do personagem")}
      </Link>
      <header className="bestiary-heading">
        <p className="stage-kicker">{t("Equipamento e suprimentos")}</p>
        <h1>{t("Inventário de {0}", [character.name])}</h1>
        <p className="compendium-intro">
          {t(
            "Organize os itens, equipe seu personagem e acompanhe seus recursos.",
          )}
        </p>
      </header>
      <InventoryManager
        characterId={id}
        draft={character.draft}
        initial={inventory}
        catalogue={{
          ...catalogue,
          categories: [],
          properties: [],
          masteries: [],
          items: catalogue.items.map((item) => ({
            ...item,
            desc: item.desc,
            description: item.description,
            notes: item.notes,
            variants: undefined,
            contents: undefined,
          })),
        }}
      />
    </main>
  );
}
