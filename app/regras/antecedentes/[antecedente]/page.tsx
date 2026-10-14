import { imageUrl } from "@/lib/image-assets";
import { RulesText } from "@/components/rules-text";
import { getI18n } from "@/lib/i18n/server";
import { localizeRecord } from "@/lib/i18n/shared";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocalizedCatalogue } from "@/lib/catalogue";
import {
  abilityNames as base_abilityNames,
  backgroundNames as base_backgroundNames,
  proficiencyName as base_proficiencyName,
} from "@/lib/labels";
import { backgroundPresentation as base_backgroundPresentation } from "@/lib/background-presentation";

type Props = { params: Promise<{ antecedente: string }> };

export async function generateMetadata({ params }: Props) {
  const { t } = await getI18n();

  const backgroundNames = localizeRecord(base_backgroundNames, t);

  const catalogue = await getLocalizedCatalogue();

  const { antecedente } = await params;
  return {
    title: catalogue.backgrounds.some((entry) => entry.index === antecedente)
      ? t("{0} · Compêndio", [backgroundNames[antecedente]])
      : t("Antecedente não encontrado"),
  };
}

export default async function Page({ params }: Props) {
  const { t, l } = await getI18n();
  const abilityNames = localizeRecord(base_abilityNames, t);
  const backgroundNames = localizeRecord(base_backgroundNames, t);
  const proficiencyName = (...args: Parameters<typeof base_proficiencyName>) =>
    t(base_proficiencyName(...args));
  const backgroundPresentation = localizeRecord(base_backgroundPresentation, t);
  const catalogue = await getLocalizedCatalogue();

  const { antecedente } = await params;
  const entry = catalogue.backgrounds.find(
    (item) => item.index === antecedente,
  );
  if (!entry) notFound();
  const profile = backgroundPresentation[antecedente];
  return (
    <main
      id="main"
      className="character-space class-reference-page background-reference-page"
    >
      <Link className="back-link" href="/regras#backgrounds">
        {t("← Todos os antecedentes")}
      </Link>
      <div className="class-reference-layout">
        <aside className="class-reference-art">
          <Image
            src={imageUrl(`/images/backgrounds/${antecedente}.webp`)}
            alt={t("Ilustração do antecedente {0}", [
              backgroundNames[antecedente],
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
          <h1>{l(backgroundNames[antecedente])}</h1>
          <p className="class-reference-description">
            {l(profile.description)}
          </p>
          <dl className="class-reference-facts">
            <div>
              <dt>{t("Atributos disponíveis")}</dt>
              <dd>
                {l(
                  entry.ability_scores
                    .map(
                      (score) =>
                        abilityNames[score.index.toUpperCase()] || score.name,
                    )
                    .join(", "),
                )}
              </dd>
            </div>
            <div>
              <dt>{t("Talento de origem")}</dt>
              <dd>{l(entry.feat.name)}</dd>
            </div>
            <div>
              <dt>{t("Classe")}</dt>
              <dd>{t("À sua escolha")}</dd>
            </div>
          </dl>
          <section className="class-reference-section">
            <h2>{t("Proficiências")}</h2>
            <p>
              {l(
                entry.proficiencies
                  .map((item) => proficiencyName(item.index, item.name))
                  .join(" · "),
              )}
            </p>
            {l(
              entry.proficiency_choices?.map((choice, index) => (
                <p key={index}>
                  {t("Escolha ")}
                  {l(choice.choose)}:{" "}
                  {l(
                    (choice.from.options || [])
                      .flatMap((option) =>
                        option.item
                          ? [
                              proficiencyName(
                                option.item.index,
                                option.item.name,
                              ),
                            ]
                          : option.choice?.desc
                            ? [option.choice.desc]
                            : [],
                      )
                      .join(", "),
                  )}
                  .
                </p>
              )),
            )}
          </section>
          <section className="class-reference-section">
            <p className="stage-kicker">{t("Sua formação")}</p>
            <h2>{t("Talento de origem")}</h2>
            <p className="compendium-intro">
              {t("Regras do SRD ")}
              {l(catalogue.srdVersion)}
              {t(
                ". A ilustração representa uma ocupação anterior à aventura, sem definir sua espécie ou classe.",
              )}
            </p>
            <article className="class-reference-feature">
              <h3>{l(entry.feat.name)}</h3>
              <RulesText text={t(entry.feat.desc?.join("\n\n") || "")} />
            </article>
          </section>
          <Link className="class-confirm" href="/personagens/novo">
            {t("Criar personagem ")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
