import { RulesText } from "@/components/rules-text";
import { getI18n } from "@/lib/i18n/server";
import { localizeRecord } from "@/lib/i18n/shared";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ABILITIES, type CharacterDraft } from "@/domain/character";
import {
  abilityNames as base_abilityNames,
  classNames as base_classNames,
  speciesNames as base_speciesNames,
  backgroundNames as base_backgroundNames,
  skillNames as base_skillNames,
  proficiencyName as base_proficiencyName,
} from "@/lib/labels";
import { classPresentation as base_classPresentation } from "@/lib/class-presentation";

const signed = (value: number) => (value >= 0 ? "+" : "") + value;
export async function SavedCharacterDetail({
  name,
  draft,
}: {
  name: string;
  draft: CharacterDraft;
}) {
  const { t, l } = await getI18n();
  const abilityNames = localizeRecord(base_abilityNames, t);
  const classNames = localizeRecord(base_classNames, t);
  const speciesNames = localizeRecord(base_speciesNames, t);
  const backgroundNames = localizeRecord(base_backgroundNames, t);
  const skillNames = localizeRecord(base_skillNames, t);
  const proficiencyName = (...args: Parameters<typeof base_proficiencyName>) =>
    t(base_proficiencyName(...args));
  const classPresentation = localizeRecord(base_classPresentation, t);

  const profile = classPresentation[draft.input.classIndex];
  const training = draft.training;
  const nonSkills =
    training?.proficiencies.filter(
      (ref) =>
        !ref.index.startsWith("skill-") &&
        !ref.index.startsWith("saving-throw-"),
    ) || [];
  return (
    <div
      className="saved-character-layout"
      style={{ "--class-accent": profile.color } as CSSProperties}
    >
      <aside className="saved-character-art-panel">
        <div className="saved-character-art">
          <Image
            src={`/images/classes/${profile.image}.webp`}
            alt={t("Ilustração da classe {0}", [
              classNames[draft.input.classIndex],
            ])}
            fill
            sizes="(max-width: 700px) 100vw, 42vw"
            preload
          />
        </div>
        <div className="saved-art-caption">
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <path d={profile.icon} />
          </svg>
          <span>{l(classNames[draft.input.classIndex])}</span>
          <small>{t("Arte ilustrativa da classe")}</small>
        </div>
      </aside>
      <div className="saved-character-content">
        <header className="saved-identity">
          <p className="stage-kicker">
            {t(" Seu aventureiro · Nível ")}
            {l(draft.level)} {t(" · D&D ")}
            {l(draft.edition)}
          </p>
          <h1>{name}</h1>
          <p className="saved-origin">
            {l(speciesNames[draft.input.speciesIndex])}
            {l(" ")}
            <span aria-hidden="true">·</span>
            {l(" ")}
            {l(classNames[draft.input.classIndex])}
            {l(" ")}
            <span aria-hidden="true">·</span>
            {l(" ")}
            {l(backgroundNames[draft.input.backgroundIndex])}
          </p>
          <p className="class-tagline">{l(profile.title)}</p>
          <span className="character-status">
            <i aria-hidden="true" /> {t(" Rascunho ")}
          </span>
          <dl className="saved-combat-stats">
            <div>
              <dt>{t("Pontos de vida")}</dt>
              <dd>{l(draft.hitPoints)}</dd>
            </div>
            <div>
              <dt>{t("CA sem armadura")}</dt>
              <dd>{l(draft.unarmoredAC)}</dd>
            </div>
            <div>
              <dt>{t("Iniciativa")}</dt>
              <dd>{l(signed(draft.initiative))}</dd>
            </div>
            <div>
              <dt>{t("Proficiência")}</dt>
              <dd>{l(signed(draft.proficiencyBonus))}</dd>
            </div>
            <div>
              <dt>{t("Deslocamento")}</dt>
              <dd>
                {l(draft.speed)}
                <small> {t(" pés")}</small>
              </dd>
            </div>
          </dl>
        </header>
        <nav className="saved-section-nav" aria-label={t("Seções da ficha")}>
          <a href="#atributos">{t("Atributos")}</a>
          <a href="#pericias">{t("Perícias")}</a>
          <a href="#caracteristicas">{t("Características")}</a>
          {draft.input.notes ? <a href="#historia">{t("História")}</a> : null}
          <a href="#preparacao">{t("Preparação")}</a>
        </nav>
        <section id="atributos" className="saved-section">
          <div className="saved-section-title">
            <span>01</span>
            <h2>{t("Atributos")}</h2>
          </div>
          <div className="saved-ability-grid">
            {l(
              ABILITIES.map((ability) => (
                <div key={ability}>
                  <span>{l(abilityNames[ability])}</span>
                  <strong>{l(draft.attributes[ability])}</strong>
                  <b>{l(signed(draft.modifiers[ability]))}</b>
                </div>
              )),
            )}
          </div>
          {l(
            training ? (
              <div className="saved-resistances">
                <h3>{t("Testes de resistência")}</h3>
                <dl>
                  {l(
                    ABILITIES.map((ability) => (
                      <div key={ability}>
                        <dt>
                          {l(abilityNames[ability])}
                          {l(
                            training.savingThrows[ability].proficient ? (
                              <span
                                className="proficient-dot"
                                aria-label={t("proficiente")}
                              >
                                ◆
                              </span>
                            ) : null,
                          )}
                        </dt>
                        <dd>
                          {l(signed(training.savingThrows[ability].bonus))}
                        </dd>
                      </div>
                    )),
                  )}
                </dl>
              </div>
            ) : null,
          )}
        </section>
        <section id="pericias" className="saved-section">
          <div className="saved-section-title">
            <span>02</span>
            <h2>{t("Perícias e treinamento")}</h2>
          </div>
          {l(
            training ? (
              <>
                <p className="saved-passive-perception">
                  {t(" Percepção passiva ")}
                  <strong>{l(training.passivePerception)}</strong>
                </p>
                <dl className="saved-skills">
                  {l(
                    training.skills.map((skill) => (
                      <div
                        key={skill.index}
                        className={skill.proficient ? "is-proficient" : ""}
                      >
                        <dt>
                          <span className="skill-mark" aria-hidden="true">
                            {l(skill.proficient ? "◆" : "◇")}
                          </span>
                          {l(skillNames[skill.index] || skill.name)}
                          <small>{l(skill.ability)}</small>
                          {l(
                            skill.proficient ? (
                              <span className="sr-only">
                                {" "}
                                {t(" · proficiente")}
                              </span>
                            ) : null,
                          )}
                        </dt>
                        <dd>{l(signed(skill.bonus))}</dd>
                      </div>
                    )),
                  )}
                </dl>
                <p className="saved-help-text">
                  {t(
                    " ◆ Proficiência aplicada. Especialização e benefícios de escolhas ainda pendentes não estão incluídos nos bônus. ",
                  )}
                </p>
                {l(
                  nonSkills.length ? (
                    <div className="saved-proficiencies">
                      <h3>{t("Armas, armaduras e ferramentas")}</h3>
                      <div>
                        {l(
                          nonSkills.map((ref) => (
                            <span key={ref.index}>
                              {l(proficiencyName(ref.index, ref.name))}
                            </span>
                          )),
                        )}
                      </div>
                    </div>
                  ) : null,
                )}
              </>
            ) : (
              <p>
                {t(
                  " Este rascunho foi salvo antes da etapa de treinamento. As escolhas de proficiência ainda precisam ser preenchidas. ",
                )}
              </p>
            ),
          )}
        </section>
        <section id="caracteristicas" className="saved-section">
          <div className="saved-section-title">
            <span>03</span>
            <h2>{t("Características")}</h2>
          </div>
          <article className="saved-origin-feat">
            <p className="stage-kicker">
              {t(" Talento de origem · ")}
              {l(backgroundNames[draft.input.backgroundIndex])}
            </p>
            <h3>{l(draft.originFeat.name)}</h3>
            <RulesText text={t(draft.originFeat.desc?.join("\n\n") || "")} />
          </article>
          <div className="saved-feature-groups">
            <div>
              <h3>
                {t("Classe · ")}
                {l(classNames[draft.input.classIndex])}
              </h3>
              {l(
                draft.features.map((feature) => (
                  <details key={feature.index}>
                    <summary>{l(feature.name)}</summary>
                    <RulesText text={t(feature.desc?.join("\n\n") || "")} />
                  </details>
                )),
              )}
            </div>
            <div>
              <h3>
                {t("Espécie · ")}
                {l(speciesNames[draft.input.speciesIndex])}
              </h3>
              {l(
                draft.traits.map((trait) => (
                  <details key={trait.index}>
                    <summary>{l(trait.name)}</summary>
                    <RulesText text={t(trait.desc?.join("\n\n") || "")} />
                  </details>
                )),
              )}
            </div>
          </div>
        </section>
        {draft.input.notes ? (
          <section id="historia" className="saved-section saved-story">
            <div className="saved-section-title">
              <span>04</span>
              <h2>{t("Um começo de história")}</h2>
            </div>
            <p>{draft.input.notes}</p>
          </section>
        ) : null}
        <section id="preparacao" className="saved-section saved-preparation">
          <p className="stage-kicker">{t("O próximo capítulo")}</p>
          <h2>{t("Antes da aventura")}</h2>
          <p>
            {t(
              " Sua ficha está salva. Estas escolhas ainda precisam ser concluídas antes de iniciar uma aventura. ",
            )}
          </p>
          <ul>
            {l(
              draft.pending.map((pending) => (
                <li key={pending}>
                  <span aria-hidden="true">◇</span>
                  {l(pending)}
                </li>
              )),
            )}
          </ul>
          <a href="/personagens/novo" className="saved-create-another">
            {t(" Criar outro personagem ")}
            <span aria-hidden="true">↗</span>
          </a>
        </section>
      </div>
    </div>
  );
}
