"use client";
import { useEffect, useRef, useState } from "react";
import {
  ABILITIES,
  STANDARD_ARRAY,
  deriveDraft,
  draftInputSchema,
  type DraftInput,
  type Ability,
  type CharacterDraft,
  type Catalogue,
} from "@/domain/character";
import {
  classNames,
  speciesNames,
  backgroundNames,
  abilityNames,
} from "@/lib/labels";
import { CharacterSheet } from "./character-sheet";
import { ProficiencyPicker } from "./proficiency-picker";
import { ClassSelector } from "./class-selector";
const initial: DraftInput = {
  name: "",
  classIndex: "fighter",
  speciesIndex: "dwarf",
  backgroundIndex: "soldier",
  attributes: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 12, CHA: 10 },
  bonusTwo: "STR",
  bonusOne: "CON",
  notes: "",
  proficiencySelections: {},
};
export function CharacterBuilder({
  signedIn,
  catalogue,
  initialClass,
  initialSpecies,
}: {
  signedIn: boolean;
  catalogue: Catalogue;
  initialClass?: string;
  initialSpecies?: string;
}) {
  const [input, setInput] = useState(() => ({ ...initial, classIndex: initialClass || initial.classIndex, speciesIndex: initialSpecies || initial.speciesIndex })),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false),
    [view, setView] = useState<"class" | "details">("class");
  const detailsHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (view === "details")
      detailsHeading.current?.focus({ preventScroll: true });
  }, [view]);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      const saved = sessionStorage.getItem("dnd-draft-2024");
      if (saved) {
        try {
          const parsed = draftInputSchema.safeParse(JSON.parse(saved));
          if (parsed.success && active) {
            const originChanged = (initialClass && initialClass !== parsed.data.classIndex) || (initialSpecies && initialSpecies !== parsed.data.speciesIndex);
            const restored = {
              ...parsed.data,
              classIndex: initialClass || parsed.data.classIndex,
              speciesIndex: initialSpecies || parsed.data.speciesIndex,
              proficiencySelections: originChanged ? {} : parsed.data.proficiencySelections,
            };
            deriveDraft(restored, catalogue);
            setInput(restored);
          }
        } catch {}
      }
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [catalogue, initialClass, initialSpecies]);
  useEffect(() => {
    if (ready) sessionStorage.setItem("dnd-draft-2024", JSON.stringify(input));
  }, [input, ready]);
  function set<K extends keyof DraftInput>(key: K, value: DraftInput[K]) {
    setInput((previous) => ({
      ...previous,
      [key]: value,
      ...(["classIndex", "speciesIndex"].includes(key)
        ? { proficiencySelections: {} }
        : {}),
    }));
    setError("");
  }
  const background = catalogue.backgrounds.find(
    (entry) => entry.index === input.backgroundIndex,
  )!;
  let draft: CharacterDraft | undefined;
  try {
    draft = deriveDraft(
      { ...input, name: input.name || "Seu aventureiro" },
      catalogue,
    );
  } catch {}
  function backgroundChanged(value: string) {
    const selected = catalogue.backgrounds.find(
      (entry) => entry.index === value,
    )!;
    setInput((previous) => ({
      ...previous,
      backgroundIndex: value,
      proficiencySelections: {},
      bonusTwo: selected.ability_scores[0].index.toUpperCase() as Ability,
      bonusOne: selected.ability_scores[1].index.toUpperCase() as Ability,
    }));
    setError("");
  }
  function scoreChanged(key: Ability, value: number) {
    const other = ABILITIES.find(
      (ability) => ability !== key && input.attributes[ability] === value,
    );
    const attributes = { ...input.attributes, [key]: value };
    if (other) attributes[other] = input.attributes[key];
    set("attributes", attributes);
  }
  function exportDraft() {
    const parsed = draftInputSchema.safeParse(input);
    if (!parsed.success || !draft) {
      setError("Informe o nome e revise os atributos antes de baixar.");
      return;
    }
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "personagem-2024.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function save() {
    const parsed = draftInputSchema.safeParse(input);
    if (!parsed.success || !draft) {
      setError("Informe o nome e revise os atributos.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/personagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      sessionStorage.removeItem("dnd-draft-2024");
      location.assign("/personagens/" + result.id);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
      setBusy(false);
    }
  }
  return (
    <>
      <div className="creation-steps" aria-label="Etapas de criação">
        <button
          type="button"
          onClick={() => setView("class")}
          aria-current={view === "class" ? "step" : undefined}
        >
          <span>01</span> Classe
        </button>
        <span className="creation-step-line" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setView("details")}
          aria-current={view === "details" ? "step" : undefined}
        >
          <span>02</span> Origens e ficha
        </button>
      </div>
      {view === "class" ? (
        <ClassSelector
          catalogue={catalogue}
          selected={input.classIndex}
          onSelect={(index) => {
            if (index !== input.classIndex) set("classIndex", index);
          }}
          onConfirm={() => {
            setView("details");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        />
      ) : (
        <>
          <div className="creation-details-heading">
            <button
              type="button"
              className="back-link"
              onClick={() => setView("class")}
            >
              ← Voltar às classes
            </button>
            <h1 ref={detailsHeading} tabIndex={-1}>
              Dê vida ao seu {classNames[input.classIndex].toLowerCase()}
            </h1>
            <p>
              A classe é o começo. Agora, escolha as origens e construa sua
              ficha.
            </p>
          </div>
          <div className="builder-layout">
            <div className="builder-form">
              <section className="form-section">
                <span className="section-marker">01</span>
                <h2>Quem é seu personagem?</h2>
                <label>
                  Nome
                  <input
                    value={input.name}
                    onChange={(event) => set("name", event.target.value)}
                    placeholder="Como será conhecido?"
                    maxLength={60}
                  />
                </label>
                <div className="form-columns">
                  <label>
                    Classe
                    <select
                      value={input.classIndex}
                      onChange={(event) =>
                        set("classIndex", event.target.value)
                      }
                    >
                      {catalogue.classes.map((entry) => (
                        <option key={entry.index} value={entry.index}>
                          {classNames[entry.index] || entry.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Espécie
                    <select
                      value={input.speciesIndex}
                      onChange={(event) =>
                        set("speciesIndex", event.target.value)
                      }
                    >
                      {catalogue.species.map((entry) => (
                        <option key={entry.index} value={entry.index}>
                          {speciesNames[entry.index] || entry.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Antecedente
                  <select
                    value={input.backgroundIndex}
                    onChange={(event) => backgroundChanged(event.target.value)}
                  >
                    {catalogue.backgrounds.map((entry) => (
                      <option key={entry.index} value={entry.index}>
                        {backgroundNames[entry.index] || entry.name}
                      </option>
                    ))}
                  </select>
                </label>
              </section>
              <section className="form-section">
                <span className="section-marker">02</span>
                <h2>Defina seus atributos</h2>
                <p>
                  Distribua a matriz padrão. Ao trocar um valor, o outro
                  atributo recebe o valor anterior.
                </p>
                <div className="attribute-inputs">
                  {ABILITIES.map((key) => (
                    <label key={key}>
                      {abilityNames[key]}
                      <select
                        value={input.attributes[key]}
                        onChange={(event) =>
                          scoreChanged(key, Number(event.target.value))
                        }
                      >
                        {STANDARD_ARRAY.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
                <div className="form-columns">
                  <label>
                    Bônus de +2
                    <select
                      value={input.bonusTwo}
                      onChange={(event) =>
                        set("bonusTwo", event.target.value as Ability)
                      }
                    >
                      {background.ability_scores.map((score) => (
                        <option
                          key={score.index}
                          value={score.index.toUpperCase()}
                        >
                          {abilityNames[score.index.toUpperCase()]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Bônus de +1
                    <select
                      value={input.bonusOne}
                      onChange={(event) =>
                        set("bonusOne", event.target.value as Ability)
                      }
                    >
                      {background.ability_scores.map((score) => (
                        <option
                          key={score.index}
                          value={score.index.toUpperCase()}
                        >
                          {abilityNames[score.index.toUpperCase()]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {!draft ? (
                  <p className="form-error" role="alert">
                    Escolha atributos diferentes para os bônus do antecedente.
                  </p>
                ) : null}
              </section>
              <section className="form-section">
                <span className="section-marker">03</span>
                <h2>O que você sabe fazer?</h2>
                <ProficiencyPicker
                  input={input}
                  catalogue={catalogue}
                  onChange={(choices) => set("proficiencySelections", choices)}
                />
                <p className="small-note">
                  Ao trocar classe, espécie ou antecedente, refaça as escolhas
                  para a nova origem.
                </p>
              </section>
              <section className="form-section">
                <span className="section-marker">04</span>
                <h2>Um começo de história</h2>
                <label>
                  Notas
                  <textarea
                    value={input.notes}
                    onChange={(event) => set("notes", event.target.value)}
                    placeholder="O que trouxe seu personagem até aqui?"
                    maxLength={2000}
                    rows={4}
                  />
                </label>
                <div className="form-actions">
                  {signedIn ? (
                    <button
                      className="button primary"
                      onClick={save}
                      disabled={busy || !draft}
                    >
                      {busy ? "Salvando…" : "Salvar rascunho"}
                    </button>
                  ) : (
                    <a href="/entrar" className="button primary">
                      Entrar para salvar
                    </a>
                  )}
                  <button
                    className="button secondary"
                    onClick={exportDraft}
                    disabled={!draft}
                  >
                    Baixar rascunho
                  </button>
                </div>
                {!signedIn ? (
                  <p className="small-note">
                    O rascunho fica nesta aba enquanto você cria. Entre para
                    vinculá-lo à sua conta ou baixe uma cópia.
                  </p>
                ) : null}
                {error ? (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                ) : null}
              </section>
            </div>
            <div className="sheet-column">
              {draft ? (
                <CharacterSheet draft={draft} />
              ) : (
                <div className="character-sheet">
                  <p>Revise os bônus para atualizar a prévia.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
