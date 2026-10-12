import Image from "next/image";
import type { CSSProperties } from "react";
import { ABILITIES, type CharacterDraft } from "@/domain/character";
import {
  abilityNames,
  classNames,
  speciesNames,
  backgroundNames,
  skillNames,
  proficiencyName,
} from "@/lib/labels";
import { classPresentation } from "@/lib/class-presentation";

const signed = (value: number) => (value >= 0 ? "+" : "") + value;
export function SavedCharacterDetail({
  name,
  draft,
}: {
  name: string;
  draft: CharacterDraft;
}) {
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
            alt={`Ilustração da classe ${classNames[draft.input.classIndex]}`}
            fill
            sizes="(max-width: 700px) 100vw, 42vw"
            preload
          />
        </div>
        <div className="saved-art-caption">
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <path d={profile.icon} />
          </svg>
          <span>{classNames[draft.input.classIndex]}</span>
          <small>Arte ilustrativa da classe</small>
        </div>
      </aside>
      <div className="saved-character-content">
        <header className="saved-identity">
          <p className="stage-kicker">
            Seu aventureiro · Nível {draft.level} · D&D {draft.edition}
          </p>
          <h1>{name}</h1>
          <p className="saved-origin">
            {speciesNames[draft.input.speciesIndex]}{" "}
            <span aria-hidden="true">·</span>{" "}
            {classNames[draft.input.classIndex]}{" "}
            <span aria-hidden="true">·</span>{" "}
            {backgroundNames[draft.input.backgroundIndex]}
          </p>
          <p className="class-tagline">{profile.title}</p>
          <span className="character-status">
            <i aria-hidden="true" /> Rascunho
          </span>
          <dl className="saved-combat-stats">
            <div>
              <dt>Pontos de vida</dt>
              <dd>{draft.hitPoints}</dd>
            </div>
            <div>
              <dt>CA sem armadura</dt>
              <dd>{draft.unarmoredAC}</dd>
            </div>
            <div>
              <dt>Iniciativa</dt>
              <dd>{signed(draft.initiative)}</dd>
            </div>
            <div>
              <dt>Proficiência</dt>
              <dd>{signed(draft.proficiencyBonus)}</dd>
            </div>
            <div>
              <dt>Deslocamento</dt>
              <dd>
                {draft.speed}
                <small> ft.</small>
              </dd>
            </div>
          </dl>
        </header>
        <nav className="saved-section-nav" aria-label="Seções da ficha">
          <a href="#atributos">Atributos</a>
          <a href="#pericias">Perícias</a>
          <a href="#caracteristicas">Características</a>
          {draft.input.notes ? <a href="#historia">História</a> : null}
          <a href="#preparacao">Preparação</a>
        </nav>
        <section id="atributos" className="saved-section">
          <div className="saved-section-title">
            <span>01</span>
            <h2>Atributos</h2>
          </div>
          <div className="saved-ability-grid">
            {ABILITIES.map((ability) => (
              <div key={ability}>
                <span>{abilityNames[ability]}</span>
                <strong>{draft.attributes[ability]}</strong>
                <b>{signed(draft.modifiers[ability])}</b>
              </div>
            ))}
          </div>
          {training ? (
            <div className="saved-resistances">
              <h3>Testes de resistência</h3>
              <dl>
                {ABILITIES.map((ability) => (
                  <div key={ability}>
                    <dt>
                      {abilityNames[ability]}
                      {training.savingThrows[ability].proficient ? (
                        <span
                          className="proficient-dot"
                          aria-label="proficiente"
                        >
                          ◆
                        </span>
                      ) : null}
                    </dt>
                    <dd>{signed(training.savingThrows[ability].bonus)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
        <section id="pericias" className="saved-section">
          <div className="saved-section-title">
            <span>02</span>
            <h2>Perícias e treinamento</h2>
          </div>
          {training ? (
            <>
              <p className="saved-passive-perception">
                Percepção passiva <strong>{training.passivePerception}</strong>
              </p>
              <dl className="saved-skills">
                {training.skills.map((skill) => (
                  <div
                    key={skill.index}
                    className={skill.proficient ? "is-proficient" : ""}
                  >
                    <dt>
                      <span className="skill-mark" aria-hidden="true">
                        {skill.proficient ? "◆" : "◇"}
                      </span>
                      {skillNames[skill.index] || skill.name}
                      <small>{skill.ability}</small>
                      {skill.proficient ? (
                        <span className="sr-only"> · proficiente</span>
                      ) : null}
                    </dt>
                    <dd>{signed(skill.bonus)}</dd>
                  </div>
                ))}
              </dl>
              <p className="saved-help-text">
                ◆ Proficiência aplicada. Especialização e benefícios de escolhas
                ainda pendentes não estão incluídos nos bônus.
              </p>
              {nonSkills.length ? (
                <div className="saved-proficiencies">
                  <h3>Armas, armaduras e ferramentas</h3>
                  <div>
                    {nonSkills.map((ref) => (
                      <span key={ref.index}>
                        {proficiencyName(ref.index, ref.name)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p>
              Este rascunho foi salvo antes da etapa de treinamento. As escolhas
              de proficiência ainda precisam ser preenchidas.
            </p>
          )}
        </section>
        <section id="caracteristicas" className="saved-section">
          <div className="saved-section-title">
            <span>03</span>
            <h2>Características</h2>
          </div>
          <article className="saved-origin-feat">
            <p className="stage-kicker">
              Talento de origem · {backgroundNames[draft.input.backgroundIndex]}
            </p>
            <h3>{draft.originFeat.name}</h3>
            <p className="rules-description">
              {draft.originFeat.desc?.join("\n\n")}
            </p>
          </article>
          <div className="saved-feature-groups">
            <div>
              <h3>Classe · {classNames[draft.input.classIndex]}</h3>
              {draft.features.map((feature) => (
                <details key={feature.index}>
                  <summary>{feature.name}</summary>
                  <p className="rules-description">
                    {feature.desc?.join("\n\n")}
                  </p>
                </details>
              ))}
            </div>
            <div>
              <h3>Espécie · {speciesNames[draft.input.speciesIndex]}</h3>
              {draft.traits.map((trait) => (
                <details key={trait.index}>
                  <summary>{trait.name}</summary>
                  <p className="rules-description">
                    {trait.desc?.join("\n\n")}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
        {draft.input.notes ? (
          <section id="historia" className="saved-section saved-story">
            <div className="saved-section-title">
              <span>04</span>
              <h2>Um começo de história</h2>
            </div>
            <p>{draft.input.notes}</p>
          </section>
        ) : null}
        <section id="preparacao" className="saved-section saved-preparation">
          <p className="stage-kicker">O próximo capítulo</p>
          <h2>Antes da aventura</h2>
          <p>
            Sua ficha está salva. Estas escolhas ainda precisam ser concluídas
            antes de iniciar uma aventura.
          </p>
          <ul>
            {draft.pending.map((pending) => (
              <li key={pending}>
                <span aria-hidden="true">◇</span>
                {pending}
              </li>
            ))}
          </ul>
          <a href="/personagens/novo" className="saved-create-another">
            Criar outro personagem <span aria-hidden="true">↗</span>
          </a>
        </section>
      </div>
    </div>
  );
}
