import { getI18n } from "@/lib/i18n/server";
import { localizeRecord } from "@/lib/i18n/shared";
import { getLocalizedCatalogue } from "@/lib/catalogue";
import {
  classNames as base_classNames,
  speciesNames as base_speciesNames,
  backgroundNames as base_backgroundNames,
} from "@/lib/labels";
import Image from "next/image";
import Link from "next/link";
import { classPresentation as base_classPresentation } from "@/lib/class-presentation";
import {
  speciesPresentation as base_speciesPresentation,
  speciesSize as base_speciesSize,
} from "@/lib/species-presentation";
import { backgroundPresentation as base_backgroundPresentation } from "@/lib/background-presentation";
export async function generateMetadata() {
  const { t } = await getI18n();

  return { title: t("Compêndio") };
}
export default async function Page() {
  const { t, l } = await getI18n();
  const classNames = localizeRecord(base_classNames, t);
  const speciesNames = localizeRecord(base_speciesNames, t);
  const backgroundNames = localizeRecord(base_backgroundNames, t);
  const classPresentation = localizeRecord(base_classPresentation, t);
  const speciesPresentation = localizeRecord(base_speciesPresentation, t);
  const speciesSize = (...args: Parameters<typeof base_speciesSize>) =>
    t(base_speciesSize(...args));
  const backgroundPresentation = localizeRecord(base_backgroundPresentation, t);
  const catalogue = await getLocalizedCatalogue();

  return (
    <main id="main" className="character-space compendium-page">
      <header className="compendium-hero">
        <div className="compendium-hero-art" aria-hidden="true">
          <Image
            src="/images/heroes/arcane-library-wide.webp"
            alt=""
            fill
            sizes="100vw"
            preload
          />
        </div>
        <div className="compendium-heading">
          <p className="stage-kicker">{t("Compêndio · Regras de 2024")}</p>
          <h1>{t("Conheça suas possibilidades")}</h1>
          <p>
            {t(
              " Uma referência das origens e características disponíveis para criar seu personagem. Escolha o idioma para explorar as regras. ",
            )}
          </p>
        </div>
      </header>
      <nav className="compendium-nav" aria-label={t("Categorias do compêndio")}>
        <a href="#classes">{t("Classes")}</a>
        <a href="#species">{t("Espécies")}</a>
        <a href="#backgrounds">{t("Antecedentes")}</a>
        <Link href="/bestiario">{t("Bestiário")}</Link>
      </nav>
      <section className="compendium-section" id="classes">
        <h2>{t("Classes")}</h2>
        <p className="compendium-intro">
          {t(
            "Doze caminhos para sua aventura. Explore uma classe para conhecer suas características e começar seu personagem.",
          )}
        </p>
        <div className="compendium-class-grid">
          {l(
            catalogue.classes.map((entry) => (
              <Link
                className="compendium-class-card"
                href={`/regras/classes/${entry.index}`}
                key={entry.index}
              >
                <div className="compendium-class-art">
                  <Image
                    src={`/images/classes/${entry.index}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
                  />
                </div>
                <div className="compendium-class-copy">
                  <span className="stage-kicker">
                    {t("Dado de vida · d")}
                    {l(entry.hit_die)}
                  </span>
                  <h3>{l(classNames[entry.index])}</h3>
                  <p>{l(classPresentation[entry.index].title)}</p>
                  <span className="compendium-card-action">
                    {t("Conhecer classe ")}
                    <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            )),
          )}
        </div>
      </section>
      <section className="compendium-section" id="species">
        <h2>{t("Espécies")}</h2>
        <p className="compendium-intro">
          {t(
            "Nove origens para seu aventureiro. Conheça seus traços e escolha como sua história começa. Cada ilustração apresenta um exemplo de personagem; qualquer espécie pode seguir diferentes classes.",
          )}
        </p>
        <div className="compendium-class-grid compendium-species-grid">
          {l(
            catalogue.species.map((entry) => (
              <Link
                className="compendium-class-card"
                href={`/regras/especies/${entry.index}`}
                key={entry.index}
              >
                <div className="compendium-class-art">
                  <Image
                    src={`/images/species/${entry.index}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
                  />
                </div>
                <div className="compendium-class-copy">
                  <span className="stage-kicker">
                    {l(speciesSize(entry))} · {l(entry.speed)} {t(" pés")}
                  </span>
                  <h3>{l(speciesNames[entry.index])}</h3>
                  <p>{l(speciesPresentation[entry.index].title)}</p>
                  <span className="compendium-card-action">
                    {t("Conhecer espécie ")}
                    <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            )),
          )}
        </div>
      </section>
      <section className="compendium-section" id="backgrounds">
        <h2>{t("Antecedentes")}</h2>
        <p className="compendium-intro">
          {t(
            "Quem você era antes de se tornar aventureiro? Conheça as quatro formações do catálogo e o que cada uma acrescenta ao seu personagem.",
          )}
        </p>
        <div className="compendium-class-grid compendium-background-grid">
          {l(
            catalogue.backgrounds.map((entry) => (
              <Link
                className="compendium-class-card"
                href={`/regras/antecedentes/${entry.index}`}
                key={entry.index}
              >
                <div className="compendium-class-art">
                  <Image
                    src={`/images/backgrounds/${entry.index}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
                  />
                </div>
                <div className="compendium-class-copy">
                  <span className="stage-kicker">
                    {t("Sua vida antes da aventura")}
                  </span>
                  <h3>{l(backgroundNames[entry.index])}</h3>
                  <p>{l(backgroundPresentation[entry.index].title)}</p>
                  <span className="compendium-card-action">
                    {t("Conhecer antecedente ")}
                    <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            )),
          )}
        </div>
      </section>
    </main>
  );
}
