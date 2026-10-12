import { ABILITIES, type CharacterDraft } from "@/domain/character";
import {
  abilityNames,
  classNames,
  speciesNames,
  backgroundNames,
  skillNames,
} from "@/lib/labels";
export function CharacterSheet({ draft }: { draft: CharacterDraft }) {
  return (
    <section className="character-sheet" aria-label="Prévia da ficha">
      <div className="sheet-heading">
        <p className="eyebrow">Ficha de personagem · Rascunho</p>
        <h2>{draft.input.name || "Seu aventureiro"}</h2>
        <p>
          {speciesNames[draft.input.speciesIndex]} ·{" "}
          {classNames[draft.input.classIndex]} · Nível 1
        </p>
        <span className="sheet-background">
          {backgroundNames[draft.input.backgroundIndex]}
        </span>
      </div>
      <div className="ability-grid">
        {ABILITIES.map((key) => (
          <div key={key}>
            <span>{abilityNames[key]}</span>
            <strong>{draft.attributes[key]}</strong>
            <b>
              {draft.modifiers[key] >= 0 ? "+" : ""}
              {draft.modifiers[key]}
            </b>
          </div>
        ))}
      </div>
      <dl className="combat-stats">
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
          <dd>
            {draft.initiative >= 0 ? "+" : ""}
            {draft.initiative}
          </dd>
        </div>
        <div>
          <dt>Proficiência</dt>
          <dd>+{draft.proficiencyBonus}</dd>
        </div>
        <div>
          <dt>Deslocamento</dt>
          <dd>{draft.speed} ft.</dd>
        </div>
      </dl>
      {draft.training ? (
        <>
          <div className="sheet-section">
            <h3>Testes de resistência</h3>
            <dl className="training-list">
              {ABILITIES.map((ability) => {
                const save = draft.training.savingThrows[ability];
                return (
                  <div key={ability}>
                    <dt>
                      {abilityNames[ability]}
                      {save.proficient ? " · proficiente" : ""}
                    </dt>
                    <dd>
                      {save.bonus >= 0 ? "+" : ""}
                      {save.bonus}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
          <div className="sheet-section">
            <h3>Perícias</h3>
            <p className="small-note">
              Percepção passiva: {draft.training.passivePerception}. Bônus
              básicos; especialização e benefícios de escolhas pendentes ainda
              não estão aplicados.
            </p>
            <dl className="training-list">
              {draft.training.skills.map((skill) => (
                <div key={skill.index}>
                  <dt>
                    {skillNames[skill.index] || skill.name}
                    {skill.proficient ? " · proficiente" : ""}
                  </dt>
                  <dd>
                    {skill.bonus >= 0 ? "+" : ""}
                    {skill.bonus}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      ) : null}
      <div className="sheet-section">
        <h3>Talento de origem</h3>
        <p>{draft.originFeat.name}</p>
        <p className="rules-description">
          {draft.originFeat.desc?.join("\n\n")}
        </p>
      </div>
      <div className="sheet-section">
        <h3>Para completar a ficha</h3>
        <ul>
          {draft.pending.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </div>
      <p className="small-note">
        Esta ficha ainda é um rascunho: escolhas e equipamento precisam ser
        finalizados antes de iniciar uma aventura.
      </p>
    </section>
  );
}
