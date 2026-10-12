import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { characters } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { SavedCharacterDetail } from "@/components/saved-character-detail";
export const metadata = { title: "Ficha do personagem" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    session = await getSession();
  if (!session) redirect("/entrar");
  const [row] = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, session.user.id)));
  if (!row) notFound();
  return (
    <main id="main" className="character-space saved-character-page">
      <div className="character-space-heading">
        <a className="back-link" href="/personagens">
          ← Meus personagens
        </a>
        <p>
          Seu grupo de aventureiros <span aria-hidden="true">/</span> Ficha
        </p>
      </div>
      <SavedCharacterDetail name={row.name} draft={row.draft} />
    </main>
  );
}
