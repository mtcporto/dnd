import { getI18n } from "@/lib/i18n/server";
import { localizeRecord } from "@/lib/i18n/shared";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocalizedCatalogue } from "@/lib/catalogue";
import { classPresentation as base_classPresentation } from "@/lib/class-presentation";
import {
  abilityNames as base_abilityNames,
  classNames as base_classNames,
  proficiencyName as base_proficiencyName,
} from "@/lib/labels";

type Props = { params: Promise<{ classe: string }> };

export async function generateMetadata({ params }: Props) {
  const { t } = await getI18n();

  const classNames = localizeRecord(base_classNames, t);

  const catalogue = await getLocalizedCatalogue();

  const { classe } = await params;
  return {
    title: catalogue.classes.some((entry) => entry.index === classe)
      ? t("{0} · Compêndio", [classNames[classe]])
      : t("Classe não encontrada"),
  };
}

export default async function Page({ params }: Props) {
  const { t, l } = await getI18n();
  const classPresentation = localizeRecord(base_classPresentation, t);
  const abilityNames = localizeRecord(base_abilityNames, t);
  const classNames = localizeRecord(base_classNames, t);
  const proficiencyName = (...args: Parameters<typeof base_proficiencyName>) =>
    t(base_proficiencyName(...args));
  const catalogue = await getLocalizedCatalogue();

  const { classe } = await params;
  const entry = catalogue.classes.find((item) => item.index === classe);
  if (!entry) notFound();
  const profile = classPresentation[classe];
  const options = entry.primary_ability?.ability_score_options;
  const primary = options
    ? (options.from.options || []).flatMap((option) =>
        option.item ? [option.item] : [],
      )
    : entry.primary_ability?.ability_scores || [];
  return (
    <main id="main" className="character-space class-reference-page">
      <Link className="back-link" href="/regras#classes">
        {t("← Todas as classes")}
      </Link>
      <div className="class-reference-layout">
        <aside className="class-reference-art">
          <Image
            src={`/images/classes/${classe}.webp`}
            alt={t("Ilustração de {0}", [classNames[classe]])}
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
          <h1>{l(classNames[classe])}</h1>
          <p className="class-reference-description">
            {l(profile.description)}
          </p>
          <dl className="class-reference-facts">
            <div>
              <dt>{t("Dado de vida")}</dt>
              <dd>
                {t("d")}
                {l(entry.hit_die)}
              </dd>
            </div>
            <div>
              <dt>{t("Atributo principal")}</dt>
              <dd>
                {l(
                  primary
                    .map(
                      (score) =>
                        abilityNames[score.index.toUpperCase()] || score.name,
                    )
                    .join(options ? t(" ou ") : t(" e ")),
                )}
              </dd>
            </div>
            <div>
              <dt>{t("Testes de resistência")}</dt>
              <dd>
                {l(
                  entry.saving_throws
                    ?.map(
                      (score) =>
                        abilityNames[score.index.toUpperCase()] || score.name,
                    )
                    .join(t(" e ")),
                )}
              </dd>
            </div>
          </dl>
          <Link
            className="class-confirm"
            href={`/personagens/novo?classe=${classe}`}
          >
            {t("Criar ")}
            {l(classNames[classe])} <span aria-hidden="true">→</span>
          </Link>
          <section className="class-reference-section">
            <h2>{t("Proficiências")}</h2>
            <p>
              {l(
                entry.proficiencies
                  ?.map((item) => proficiencyName(item.index, item.name))
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
            <p className="stage-kicker">{t("Primeiros passos · Nível 1")}</p>
            <h2>{t("Características da classe")}</h2>
            <p className="compendium-intro">
              {t("Regras do SRD ")}
              {l(catalogue.srdVersion)}
              {t(
                ". Esta referência cobre as características de nível 1 disponíveis no catálogo.",
              )}
            </p>
            {l(
              entry.levelOne.features.map((feature) => (
                <article
                  className="class-reference-feature"
                  key={feature.index}
                >
                  <h3>{l(feature.name)}</h3>
                  <p className="rules-description">
                    {l(feature.desc?.join("\n\n"))}
                  </p>
                </article>
              )),
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
