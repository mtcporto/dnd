import { getI18n } from "@/lib/i18n/server";
import { getBuilderCatalogue, getLocalizedCatalogue } from "@/lib/catalogue";
import { CharacterBuilder } from "@/components/character-builder";
import { getSession } from "@/lib/session";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("Criar personagem") };
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ classe?: string; especie?: string }>;
}) {
  const { t } = await getI18n();

  const query = await searchParams;
  const catalogue = getBuilderCatalogue(await getLocalizedCatalogue());
  const initialClass = catalogue.classes.some(
    (entry) => entry.index === query.classe,
  )
    ? query.classe
    : undefined;
  const initialSpecies = catalogue.species.some(
    (entry) => entry.index === query.especie,
  )
    ? query.especie
    : undefined;
  const session = await getSession();
  return (
    <main id="main" className="creation-page">
      <div className="creation-heading">
        <a className="back-link" href="/personagens">
          {t(" ← Personagens ")}
        </a>
        <p>
          {t(" Capítulo zero ")}
          <span aria-hidden="true">/</span> {t(" Crie seu aventureiro ")}
        </p>
      </div>
      <CharacterBuilder
        signedIn={!!session}
        catalogue={catalogue}
        initialClass={initialClass}
        initialSpecies={initialSpecies}
      />
    </main>
  );
}
