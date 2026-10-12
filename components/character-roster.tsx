"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import Image from "next/image";
import {
  LazyMotion,
  domAnimation,
  AnimatePresence,
  m,
  useReducedMotion,
} from "motion/react";
import { ABILITIES, type Scores } from "@/domain/character";
import {
  abilityNames,
  classNames,
  speciesNames,
  backgroundNames,
} from "@/lib/labels";
import { classPresentation } from "@/lib/class-presentation";

export interface RosterCharacter {
  id: string;
  name: string;
  classIndex: string;
  speciesIndex: string;
  backgroundIndex: string;
  level: number;
  hitPoints: number;
  unarmoredAC: number;
  initiative: number;
  attributes: Scores;
  pendingCount: number;
}
export function CharacterRoster({
  characters,
}: {
  characters: RosterCharacter[];
}) {
  const [selectedId, setSelectedId] = useState(characters[0].id);
  const selected =
    characters.find((character) => character.id === selectedId) ||
    characters[0];
  const profile = classPresentation[selected.classIndex];
  const reduced = useReducedMotion();
  function navigate(event: KeyboardEvent<HTMLButtonElement>, position: number) {
    let next = position;
    if (["ArrowDown", "ArrowRight"].includes(event.key))
      next = (position + 1) % characters.length;
    else if (["ArrowUp", "ArrowLeft"].includes(event.key))
      next = (position - 1 + characters.length) % characters.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = characters.length - 1;
    else return;
    event.preventDefault();
    setSelectedId(characters[next].id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>("button")
      [next]?.focus();
  }
  return (
    <LazyMotion features={domAnimation}>
      <section
        className="roster-stage"
        style={{ "--class-accent": profile.color } as CSSProperties}
        aria-label="Seus personagens"
      >
        <div className="stage-atmosphere" aria-hidden="true" />
        <aside className="roster-sidebar">
          <div className="roster-sidebar-heading">
            <p className="stage-kicker">Seus aventureiros</p>
            <span>{characters.length.toString().padStart(2, "0")}</span>
          </div>
          <div
            className="roster-characters"
            role="radiogroup"
            aria-label="Selecione um personagem"
          >
            {characters.map((character, position) => (
              <button
                key={character.id}
                type="button"
                role="radio"
                aria-checked={selected.id === character.id}
                tabIndex={selected.id === character.id ? 0 : -1}
                onKeyDown={(event) => navigate(event, position)}
                onClick={() => setSelectedId(character.id)}
                className={selected.id === character.id ? "is-selected" : ""}
              >
                <svg viewBox="0 0 28 28" aria-hidden="true">
                  <path d={classPresentation[character.classIndex].icon} />
                </svg>
                <span>
                  <strong>{character.name}</strong>
                  <small>
                    {classNames[character.classIndex]} · Nível {character.level}
                  </small>
                </span>
                <span className="roster-selection-dot" aria-hidden="true" />
              </button>
            ))}
          </div>
          <a className="roster-new-character" href="/personagens/novo">
            <span aria-hidden="true">＋</span> Criar personagem
          </a>
        </aside>
        <div className="class-portrait-stage roster-portrait">
          <AnimatePresence initial={false}>
            <m.div
              key={selected.id}
              className="class-portrait"
              initial={{ opacity: 0, scale: reduced ? 1 : 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.35 }}
            >
              <Image
                src={`/images/classes/${profile.image}.webp`}
                alt={`Arte ilustrativa da classe ${classNames[selected.classIndex]}`}
                fill
                sizes="(max-width: 700px) 100vw, 45vw"
                preload={selected.id === characters[0].id}
                className="class-art"
              />
            </m.div>
          </AnimatePresence>
          <div className="portrait-caption">
            <span>Arquétipo de classe</span>
            <strong>{classNames[selected.classIndex]}</strong>
            <span className="portrait-rule" />
          </div>
        </div>
        <div className="roster-overview" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={selected.id}
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
            >
              <p className="stage-kicker">Nível {selected.level} · D&D 2024</p>
              <h1>{selected.name}</h1>
              <p className="roster-character-origin">
                {speciesNames[selected.speciesIndex]}{" "}
                <span aria-hidden="true">·</span>{" "}
                {classNames[selected.classIndex]}
              </p>
              <p className="class-tagline">{profile.title}</p>
              <span className="character-status">
                <i aria-hidden="true" /> Rascunho
              </span>
              <dl className="roster-combat-stats">
                <div>
                  <dt>Pontos de vida</dt>
                  <dd>{selected.hitPoints}</dd>
                </div>
                <div>
                  <dt>CA sem armadura</dt>
                  <dd>{selected.unarmoredAC}</dd>
                </div>
                <div>
                  <dt>Iniciativa</dt>
                  <dd>
                    {selected.initiative >= 0 ? "+" : ""}
                    {selected.initiative}
                  </dd>
                </div>
              </dl>
              <div className="roster-abilities" aria-label="Atributos">
                {ABILITIES.map((ability) => (
                  <div key={ability}>
                    <span title={abilityNames[ability]}>{ability}</span>
                    <strong>{selected.attributes[ability]}</strong>
                  </div>
                ))}
              </div>
              <p className="roster-background">
                Antecedente{" "}
                <strong>{backgroundNames[selected.backgroundIndex]}</strong>
              </p>
            </m.div>
          </AnimatePresence>
          <a
            href={`/personagens/${selected.id}`}
            className="class-confirm roster-open-sheet"
          >
            Abrir ficha <span aria-hidden="true">→</span>
          </a>
          <p className="roster-progress-note">
            {selected.pendingCount}{" "}
            {selected.pendingCount === 1
              ? "etapa pendente"
              : "etapas pendentes"}{" "}
            antes da aventura. Veja os detalhes na ficha.
          </p>
          <p className="class-art-note">
            Arte da classe. A aparência personalizada do seu personagem será
            definida em uma etapa futura.
          </p>
        </div>
      </section>
    </LazyMotion>
  );
}
