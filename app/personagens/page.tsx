import Image from "next/image";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { characters } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { CharacterRoster } from "@/components/character-roster";
export const metadata = { title: "Personagens" };
export default async function Page() {
  const session = await getSession();
  const rows = session
    ? await getDb()
        .select({
          id: characters.id,
          name: characters.name,
          draft: characters.draft,
        })
        .from(characters)
        .where(eq(characters.userId, session.user.id))
        .orderBy(desc(characters.updatedAt))
    : [];
  return (
    <main id="main" className="character-space roster-page">
      <div className="character-space-heading">
        <a className="back-link" href="/">
          ← D&D Aventuras
        </a>
        <p>
          Seu grupo de aventureiros <span aria-hidden="true">/</span>{" "}
          Personagens
        </p>
      </div>
      {rows.length ? (
        <CharacterRoster
          characters={rows.map((row) => ({
            id: row.id,
            name: row.name,
            classIndex: row.draft.input.classIndex,
            speciesIndex: row.draft.input.speciesIndex,
            backgroundIndex: row.draft.input.backgroundIndex,
            level: row.draft.level,
            hitPoints: row.draft.hitPoints,
            unarmoredAC: row.draft.unarmoredAC,
            initiative: row.draft.initiative,
            attributes: row.draft.attributes,
            pendingCount: row.draft.pending.length,
          }))}
        />
      ) : (
        <section className="roster-empty">
          <div className="roster-empty-art" aria-hidden="true">
            <Image
              src="/images/classes/fighter.webp"
              alt=""
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
              preload
            />
          </div>
          <div className="roster-empty-copy">
            <p className="stage-kicker">O primeiro capítulo</p>
            <h1>
              {session
                ? "Sua história ainda vai começar."
                : "Um lugar para suas histórias."}
            </h1>
            <p>
              {session
                ? "Cada aventureiro começa com uma escolha. Crie seu personagem, salve a ficha e encontre seu próximo caminho aqui."
                : "Escolha uma classe e dê vida ao seu personagem. Entre com sua conta Google para salvar suas fichas e reencontrá-las aqui."}
            </p>
            <a href="/personagens/novo" className="class-confirm">
              Criar personagem <span aria-hidden="true">→</span>
            </a>
            {!session ? (
              <a href="/entrar" className="roster-sign-in">
                Entrar com Google →
              </a>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
