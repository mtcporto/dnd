"use client";
import { useI18n } from "@/lib/i18n/client";
import { localizeRecord } from "@/lib/i18n/shared";

import { ABILITIES, type CharacterDraft } from "@/domain/character";
import {
  abilityNames as base_abilityNames,
  classNames as base_classNames,
  speciesNames as base_speciesNames,
  backgroundNames as base_backgroundNames,
  skillNames as base_skillNames,
} from "@/lib/labels";
export function CharacterSheet({ draft }: { draft: CharacterDraft }) {
  const { t, l } = useI18n();
  const abilityNames = localizeRecord(base_abilityNames, t);
  const classNames = localizeRecord(base_classNames, t);
  const speciesNames = localizeRecord(base_speciesNames, t);
  const backgroundNames = localizeRecord(base_backgroundNames, t);
  const skillNames = localizeRecord(base_skillNames, t);

  return (
    <section className="character-sheet" aria-label={t("Prévia da ficha")}>
      <div className="sheet-heading">
        <p className="eyebrow">{t("Ficha de personagem · Rascunho")}</p>
        <h2>{draft.input.name || t("Seu aventureiro")}</h2>
        <p>
          {l(speciesNames[draft.input.speciesIndex])} ·{l(" ")}
          {l(classNames[draft.input.classIndex])} {t(" · Nível 1 ")}
        </p>
        <span className="sheet-background">
          {l(backgroundNames[draft.input.backgroundIndex])}
        </span>
      </div>
      <div className="ability-grid">
        {l(
          ABILITIES.map((key) => (
            <div key={key}>
              <span>{l(abilityNames[key])}</span>
              <strong>{l(draft.attributes[key])}</strong>
              <b>
                {l(draft.modifiers[key] >= 0 ? "+" : "")}
                {l(draft.modifiers[key])}
              </b>
            </div>
          )),
        )}
      </div>
      <dl className="combat-stats">
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
          <dd>
            {l(draft.initiative >= 0 ? "+" : "")}
            {l(draft.initiative)}
          </dd>
        </div>
        <div>
          <dt>{t("Proficiência")}</dt>
          <dd>+{l(draft.proficiencyBonus)}</dd>
        </div>
        <div>
          <dt>{t("Deslocamento")}</dt>
          <dd>
            {l(draft.speed)} {t(" pés")}
          </dd>
        </div>
      </dl>
      {l(
        draft.training ? (
          <>
            <div className="sheet-section">
              <h3>{t("Testes de resistência")}</h3>
              <dl className="training-list">
                {l(
                  ABILITIES.map((ability) => {
                    const save = draft.training.savingThrows[ability];
                    return (
                      <div key={ability}>
                        <dt>
                          {l(abilityNames[ability])}
                          {l(save.proficient ? t(" · proficiente") : "")}
                        </dt>
                        <dd>
                          {l(save.bonus >= 0 ? "+" : "")}
                          {l(save.bonus)}
                        </dd>
                      </div>
                    );
                  }),
                )}
              </dl>
            </div>
            <div className="sheet-section">
              <h3>{t("Perícias")}</h3>
              <p className="small-note">
                {t(" Percepção passiva: ")}
                {l(draft.training.passivePerception)}
                {t(
                  ". Bônus básicos; especialização e benefícios de escolhas pendentes ainda não estão aplicados. ",
                )}
              </p>
              <dl className="training-list">
                {l(
                  draft.training.skills.map((skill) => (
                    <div key={skill.index}>
                      <dt>
                        {l(skillNames[skill.index] || skill.name)}
                        {l(skill.proficient ? t(" · proficiente") : "")}
                      </dt>
                      <dd>
                        {l(skill.bonus >= 0 ? "+" : "")}
                        {l(skill.bonus)}
                      </dd>
                    </div>
                  )),
                )}
              </dl>
            </div>
          </>
        ) : null,
      )}
      <div className="sheet-section">
        <h3>{t("Talento de origem")}</h3>
        <p>{l(draft.originFeat.name)}</p>
        <p className="rules-description">
          {l(draft.originFeat.desc?.join("\n\n"))}
        </p>
      </div>
      <div className="sheet-section">
        <h3>{t("Para completar a ficha")}</h3>
        <ul>
          {l(draft.pending.map((value) => <li key={value}>{l(value)}</li>))}
        </ul>
      </div>
      <p className="small-note">
        {t(
          " Esta ficha ainda é um rascunho: escolhas e equipamento precisam ser finalizados antes de iniciar uma aventura. ",
        )}
      </p>
    </section>
  );
}
