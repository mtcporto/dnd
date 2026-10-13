import { RulesText } from "@/components/rules-text";
import { getI18n } from "@/lib/i18n/server";
import { localizeRecord } from "@/lib/i18n/shared";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocalizedCatalogue } from "@/lib/catalogue";
import { speciesNames as base_speciesNames } from "@/lib/labels";
import {
  speciesPresentation as base_speciesPresentation,
  speciesSize as base_speciesSize,
} from "@/lib/species-presentation";

type Props = { params: Promise<{ especie: string }> };

export async function generateMetadata({ params }: Props) {
  const { t } = await getI18n();
  const speciesNames = localizeRecord(base_speciesNames, t);

  const catalogue = await getLocalizedCatalogue();

  const { especie } = await params;
  return {
    title: catalogue.species.some((entry) => entry.index === especie)
      ? t("{0} · Compêndio", [speciesNames[especie]])
      : t("Espécie não encontrada"),
  };
}

export default async function Page({ params }: Props) {
  const { t, l } = await getI18n();
  const speciesNames = localizeRecord(base_speciesNames, t);
  const speciesPresentation = localizeRecord(base_speciesPresentation, t);
  const speciesSize = (...args: Parameters<typeof base_speciesSize>) =>
    t(base_speciesSize(...args));
  const catalogue = await getLocalizedCatalogue();

  const { especie } = await params;
  const entry = catalogue.species.find((item) => item.index === especie);
  if (!entry) notFound();
  const profile = speciesPresentation[especie];
  return (
    <main
      id="main"
      className="character-space class-reference-page species-reference-page"
    >
      <Link className="back-link" href="/regras#species">
        {t("← Todas as espécies")}
      </Link>
      <div className="class-reference-layout">
        <aside className="class-reference-art">
          <Image
            src={`/images/species/${especie}.webp`}
            alt={t("Ilustração de um aventureiro da espécie {0}", [
              speciesNames[especie],
            ])}
            fill
            sizes="(max-width: 760px) 100vw, 40vw"
            preload
          />
        </aside>
        <div className="class-reference-content">
          <p className="stage-kicker">
            {t("Compêndio · ")}
            {l(profile.title)}
          </p>
          <h1>{l(speciesNames[especie])}</h1>
          <p className="class-reference-description">
            {l(profile.description)}
          </p>
          <dl className="class-reference-facts">
            <div>
              <dt>{t("Tamanho")}</dt>
              <dd>{l(speciesSize(entry))}</dd>
            </div>
            <div>
              <dt>{t("Deslocamento")}</dt>
              <dd>
                {l(entry.speed)} {t(" pés")}
              </dd>
            </div>
            <div>
              <dt>{t("Classe")}</dt>
              <dd>{t("À sua escolha")}</dd>
            </div>
          </dl>
          <Link
            className="class-confirm"
            href={`/personagens/novo?especie=${especie}`}
          >
            {t("Criar personagem ")}
            {l(speciesNames[especie])} <span aria-hidden="true">→</span>
          </Link>
          <section className="class-reference-section">
            <p className="stage-kicker">{t("Sua origem")}</p>
            <h2>{t("Traços da espécie")}</h2>
            <p className="compendium-intro">
              {t("Regras do SRD ")}
              {l(catalogue.srdVersion)}
              {t(
                ". A ilustração é um exemplo visual, sem definir a classe ou aparência do seu personagem.",
              )}
            </p>
            {l(
              entry.traits.map((trait) => (
                <article className="class-reference-feature" key={trait.index}>
                  <h3>{l(trait.name)}</h3>
                  <RulesText text={t(trait.desc?.join("\n\n") || "")} />
                </article>
              )),
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
