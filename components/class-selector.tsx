"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "motion/react";
import type { Catalogue } from "@/domain/character";
import { abilityNames, classNames } from "@/lib/labels";
import { classOrder, classPresentation } from "@/lib/class-presentation";

export function ClassSelector({
  catalogue,
  selected,
  onSelect,
  onConfirm,
}: {
  catalogue: Catalogue;
  selected: string;
  onSelect: (index: string) => void;
  onConfirm: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [showFeatures, setShowFeatures] = useState(false);
  const entry = catalogue.classes.find((item) => item.index === selected)!;
  const profile = classPresentation[selected];
  const available = classOrder.filter((index) =>
    catalogue.classes.some((item) => item.index === index),
  );
  const features = entry.levelOne.features;
  const primaryChoice = entry.primary_ability?.ability_score_options;
  const primaryAbilities = primaryChoice
    ? (primaryChoice.from.options || []).flatMap((option) =>
        option.item ? [option.item] : [],
      )
    : entry.primary_ability?.ability_scores || [];
  function navigate(event: KeyboardEvent<HTMLButtonElement>) {
    const current = available.indexOf(selected);
    let next = current;
    if (["ArrowDown", "ArrowRight"].includes(event.key))
      next = (current + 1) % available.length;
    else if (["ArrowUp", "ArrowLeft"].includes(event.key))
      next = (current - 1 + available.length) % available.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = available.length - 1;
    else return;
    event.preventDefault();
    onSelect(available[next]);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>("button")
      [next]?.focus();
  }
  return (
    <LazyMotion features={domAnimation}>
      <section
        className="class-stage"
        style={{ "--class-accent": profile.color } as CSSProperties}
        aria-label="Escolha sua classe"
      >
        <div className="stage-atmosphere" aria-hidden="true" />
        <aside className="class-roster-panel">
          <p className="stage-kicker">Seu caminho</p>
          <h2>Escolha uma classe</h2>
          <div
            className="class-roster"
            role="radiogroup"
            aria-label="Classes de D&D"
          >
            {available.map((index) => (
              <button
                key={index}
                type="button"
                role="radio"
                aria-checked={selected === index}
                tabIndex={selected === index ? 0 : -1}
                onKeyDown={navigate}
                onClick={() => onSelect(index)}
                className={selected === index ? "is-selected" : ""}
              >
                <svg viewBox="0 0 28 28" aria-hidden="true">
                  <path d={classPresentation[index].icon} />
                </svg>
                <span>{classNames[index]}</span>
                {selected === index ? (
                  <span className="selection-mark" aria-hidden="true">
                    ◆
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <p className="roster-note">12 caminhos. Uma história sua.</p>
        </aside>
        <div className="class-portrait-stage">
          <AnimatePresence initial={false} mode="sync">
            <m.div
              key={selected}
              className="class-portrait"
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.4 }}
            >
              <Image
                src={`/images/classes/${profile.image}.webp`}
                alt={`Ilustração de um aventureiro da classe ${classNames[selected]}`}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1050px) 55vw, 50vw"
                preload={selected === "fighter"}
                className="class-art"
              />
            </m.div>
          </AnimatePresence>
          <div className="portrait-caption">
            <span>Arquétipo de classe</span>
            <strong>{classNames[selected]}</strong>
            <span className="portrait-rule" />
          </div>
        </div>
        <div className="class-overview" aria-live="polite" aria-atomic="true">
          <AnimatePresence initial={false} mode="wait">
            <m.div
              key={selected}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.18 }}
            >
              <p className="stage-kicker">D&D · Regras de 2024</p>
              <h1>{classNames[selected]}</h1>
              <p className="class-tagline">{profile.title}</p>
              <p className="class-description">{profile.description}</p>
              <dl className="class-facts">
                <div>
                  <dt>Dado de vida</dt>
                  <dd>d{entry.hit_die}</dd>
                </div>
                <div>
                  <dt>Atributo principal</dt>
                  <dd>
                    {primaryAbilities
                      .map(
                        (score) =>
                          abilityNames[score.index.toUpperCase()] || score.name,
                      )
                      .join(primaryChoice ? " ou " : " e ") ||
                      "Consulte a classe"}
                  </dd>
                </div>
              </dl>
              <p className="class-approach">{profile.approach}</p>
              <div className="class-features-preview">
                {profile.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </m.div>
          </AnimatePresence>
          <button type="button" className="class-confirm" onClick={onConfirm}>
            Escolher {classNames[selected]} <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="class-rules-toggle"
            aria-expanded={showFeatures}
            aria-controls="class-level-features"
            onClick={() => setShowFeatures(!showFeatures)}
          >
            {showFeatures ? "Ocultar" : "Ver"} características do nível 1{" "}
            <span aria-hidden="true">{showFeatures ? "−" : "+"}</span>
          </button>
          {showFeatures ? (
            <div className="class-level-features" id="class-level-features">
              {features.map((feature) => (
                <details key={feature.index}>
                  <summary>{feature.name}</summary>
                  <p>{feature.desc?.join("\n\n")}</p>
                </details>
              ))}
            </div>
          ) : null}
          <p className="class-art-note">
            A ilustração apresenta a classe. Você define a espécie e a
            identidade do personagem na próxima etapa.
          </p>
        </div>
      </section>
    </LazyMotion>
  );
}
