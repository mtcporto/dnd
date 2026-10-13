import { getI18n } from "@/lib/i18n/server";
import Image from "next/image";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { characters } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { CharacterRoster } from "@/components/character-roster";
import { IllustratedBackdrop } from "@/components/illustrated-backdrop";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("Personagens") };
}
export default async function Page() {
  const { t, l } = await getI18n();

  const session = await getSession();
  if (!session) {
    return (
      <main id="main" className="character-space login-page roster-guest-page">
        <section className="login-hero" aria-labelledby="roster-guest-title">
          <div className="login-copy">
            <a className="back-link" href="/">
              {t("← D&D Aventuras")}
            </a>
            <p className="stage-kicker">{t("Seu grupo de aventureiros")}</p>
            <h1 id="roster-guest-title">
              {t("Um lugar para")}
              <br />
              {t("suas ")}
              <em>{t("histórias.")}</em>
            </h1>
            <p className="login-description">
              {t(
                "Escolha uma classe e dê vida ao seu personagem. Entre com sua conta Google para salvar suas fichas e reencontrá-las aqui.",
              )}
            </p>
            <div className="login-actions">
              <a href="/personagens/novo" className="class-confirm">
                {t("Criar personagem ")}
                <span aria-hidden="true">→</span>
              </a>
              <a href="/entrar" className="adventure-home-secondary">
                {t("Entrar com Google ")}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className="login-note">
              {t("Cada aventureiro começa com uma escolha.")}
            </p>
          </div>
          <IllustratedBackdrop
            image="/images/heroes/adventurers-tavern-wide.webp"
            mobileImage="/images/heroes/adventurers-tavern-wide.webp"
            caption={t("Cada jornada começa com uma escolha.")}
          />
        </section>
      </main>
    );
  }
  const rows = await getDb()
    .select({
      id: characters.id,
      name: characters.name,
      draft: characters.draft,
    })
    .from(characters)
    .where(eq(characters.userId, session.user.id))
    .orderBy(desc(characters.updatedAt));
  return (
    <main id="main" className="character-space roster-page">
      <div className="character-space-heading">
        <a className="back-link" href="/">
          {t(" ← D&D Aventuras ")}
        </a>
        <p>
          {t(" Seu grupo de aventureiros ")}
          <span aria-hidden="true">/</span>
          {l(" ")}
          {t(" Personagens ")}
        </p>
      </div>
      {l(
        rows.length ? (
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
              <p className="stage-kicker">{t("O primeiro capítulo")}</p>
              <h1>{t("Sua história ainda vai começar.")}</h1>
              <p>
                {t(
                  "Cada aventureiro começa com uma escolha. Crie seu personagem, salve a ficha e encontre seu próximo caminho aqui.",
                )}
              </p>
              <a href="/personagens/novo" className="class-confirm">
                {t(" Criar personagem ")}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </section>
        ),
      )}
    </main>
  );
}
