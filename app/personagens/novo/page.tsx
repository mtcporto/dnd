import { getBuilderCatalogue } from "@/lib/catalogue";
import { CharacterBuilder } from "@/components/character-builder";
import { getSession } from "@/lib/session";
export const metadata = { title: "Criar personagem" };
export default async function Page({ searchParams }: { searchParams: Promise<{ classe?: string; especie?: string }> }) {
  const query = await searchParams;
  const catalogue = getBuilderCatalogue();
  const initialClass = catalogue.classes.some((entry) => entry.index === query.classe) ? query.classe : undefined;
  const initialSpecies = catalogue.species.some((entry) => entry.index === query.especie) ? query.especie : undefined;
  const session = await getSession();
  return (
    <main id="main" className="creation-page">
      <div className="creation-heading">
        <a className="back-link" href="/personagens">
          ← Personagens
        </a>
        <p>
          Capítulo zero <span aria-hidden="true">/</span> Crie seu aventureiro
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
