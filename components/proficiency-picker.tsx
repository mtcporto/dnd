import type { Catalogue, DraftInput } from "@/domain/character";
import {
  getTrainingGroups,
  getFixedProficiencies,
} from "@/domain/proficiencies";
import { proficiencyName } from "@/lib/labels";

export function ProficiencyPicker({
  input,
  catalogue,
  onChange,
}: {
  input: DraftInput;
  catalogue: Catalogue;
  onChange: (choices: DraftInput["proficiencySelections"]) => void;
}) {
  const selections = input.proficiencySelections || {};
  const fixed = getFixedProficiencies(input, catalogue);
  return (
    <>
      <p>
        As proficiências do antecedente e da classe já estão incluídas. Complete
        as escolhas abaixo; cada proficiência é contada uma vez.
      </p>
      <div className="proficiency-granted">
        {fixed
          .filter((ref) => !ref.index.startsWith("saving-throw-"))
          .map((ref) => (
            <span className="badge" key={ref.index}>
              {proficiencyName(ref.index, ref.name)}
            </span>
          ))}
      </div>
      {getTrainingGroups(input, catalogue).map((group) => {
        const picks = selections[group.id] || [];
        const elsewhere = new Set([
          ...fixed.map((ref) => ref.index),
          ...Object.entries(selections)
            .filter(([id]) => id !== group.id)
            .flatMap(([, refs]) => refs),
        ]);
        return (
          <fieldset className="proficiency-group" key={group.id}>
            <legend>
              {group.source} · escolha {group.choose} ({picks.length}/
              {group.choose})
            </legend>
            <div className="proficiency-options">
              {group.options.map((option) => {
                const checked = picks.includes(option.index);
                const granted = elsewhere.has(option.index);
                return (
                  <label key={option.index}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={
                        granted || (!checked && picks.length >= group.choose)
                      }
                      onChange={() =>
                        onChange({
                          ...selections,
                          [group.id]: checked
                            ? picks.filter((ref) => ref !== option.index)
                            : [...picks, option.index],
                        })
                      }
                    />
                    <span>
                      {proficiencyName(option.index, option.name)}
                      {granted ? " · já possui" : ""}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </>
  );
}
