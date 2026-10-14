import Link from "next/link";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { localizeRecord } from "@/lib/i18n/shared";
import {
  abilityNames as baseAbilityNames,
  proficiencyName,
} from "@/lib/labels";
import {
  bestiarySource,
  getBestiaryLabels,
  getMonster,
  monsterImage,
} from "@/lib/bestiary";
import {
  queryHref,
  challengeLabel,
  type BestiaryQuery,
  type MonsterRule,
} from "@/domain/monster";
import { MonsterImage } from "@/components/monster-image";
import { RulesText } from "@/components/rules-text";
type Props = {
  params: Promise<{ monstro: string }>;
  searchParams: Promise<{ from?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const { monstro } = await params;
  const monster = await getMonster(monstro);
  const { t } = await getI18n();
  return {
    title: monster
      ? t("{0} · Bestiário", [monster.name])
      : t("Criatura não encontrada"),
  };
}
const signed = (value: number) => (value >= 0 ? "+" : "") + value;
export default async function Page({ params, searchParams }: Props) {
  const { monstro } = await params;
  const monster = await getMonster(monstro);
  if (!monster) notFound();
  const { t, locale } = await getI18n();
  const { t: term } = await getBestiaryLabels();
  const abilityNames = localizeRecord(baseAbilityNames, t);
  const incoming = (await searchParams).from;
  const from = new URLSearchParams(
    typeof incoming === "string" ? incoming.slice(0, 800) : "",
  );
  const returnQuery: BestiaryQuery = Object.fromEntries(
    ["q", "type", "size", "cr", "sort", "page"].map((k) => [
      k,
      from.get(k) || undefined,
    ]),
  );
  const abilities = [
    ["STR", "strength"],
    ["DEX", "dexterity"],
    ["CON", "constitution"],
    ["INT", "intelligence"],
    ["WIS", "wisdom"],
    ["CHA", "charisma"],
  ] as const;
  const speeds: Record<string, string> = {
    walk: t("Caminhada"),
    fly: t("Voo"),
    swim: t("Natação"),
    burrow: t("Escavação"),
    climb: t("Escalada"),
  };
  const senses: Record<string, string> = {
    darkvision: t("Visão no escuro"),
    blindsight: t("Visão às cegas"),
    truesight: t("Visão verdadeira"),
    tremorsense: t("Sentido sísmico"),
    passive_perception: t("Percepção passiva"),
  };
  const readable = (value: string) => term(value).replace(/\bft\.?/g, t("pés"));
  const groups: [string, MonsterRule[]][] = [
    [t("Habilidades especiais"), monster.special_abilities],
    [t("Ações"), monster.actions],
    [t("Ações bônus"), monster.bonus_actions],
    [t("Reações"), monster.reactions],
    [t("Ações lendárias"), monster.legendary_actions],
  ];
  const narrative = Array.isArray(monster.desc)
    ? monster.desc.join("\n\n")
    : monster.desc || monster.description;
  const number = new Intl.NumberFormat(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
  );
  return (
    <main
      id="main"
      className="character-space class-reference-page monster-reference-page"
    >
      <Link className="back-link" href={queryHref(returnQuery)}>
        {t("← Bestiário")}
      </Link>
      <div className="class-reference-layout monster-reference-layout">
        <aside className="class-reference-art monster-reference-art">
          <MonsterImage
            key={monster.index}
            src={monsterImage(monster.index)}
            name={monster.name}
            priority
          />
        </aside>
        <div className="class-reference-content monster-reference-content">
          <p className="stage-kicker">{t("Bestiário · Regras de 2024")}</p>
          <h1>{monster.name}</h1>
          <p className="monster-classification">
            {term(monster.size)} · {term(monster.type)} ·{" "}
            {term(monster.alignment)}
          </p>
          {narrative ? <RulesText text={narrative} /> : null}
          <dl className="monster-core-stats">
            <div>
              <dt>{t("Classe de armadura")}</dt>
              <dd>{monster.armor_class.map((ac) => ac.value).join(" / ")}</dd>
            </div>
            <div>
              <dt>{t("Pontos de vida")}</dt>
              <dd>
                {monster.hit_points}{" "}
                <small>({monster.hit_points_roll || monster.hit_dice})</small>
              </dd>
            </div>
            <div>
              <dt>{t("Nível de desafio")}</dt>
              <dd>
                {challengeLabel(monster.challenge_rating)}{" "}
                <small>
                  {number.format(monster.xp)} {t("XP")}
                </small>
              </dd>
            </div>
            <div>
              <dt>{t("Bônus de proficiência")}</dt>
              <dd>{signed(monster.proficiency_bonus)}</dd>
            </div>
          </dl>
          <div className="monster-ability-grid">
            {abilities.map(([key, property]) => (
              <div key={key}>
                <span>{abilityNames[key]}</span>
                <strong>{monster[property]}</strong>
                <small>
                  {signed(Math.floor((monster[property] - 10) / 2))}
                </small>
              </div>
            ))}
          </div>
          <dl className="monster-reference-facts">
            <div>
              <dt>{t("Deslocamento")}</dt>
              <dd>
                {Object.entries(monster.speed)
                  .filter(([, value]) => typeof value === "string")
                  .map(
                    ([key, value]) =>
                      `${speeds[key] || term(key)} ${readable(String(value))}`,
                  )
                  .join(" · ")}
                {monster.speed.hover ? ` · ${t("Pode pairar")}` : null}
              </dd>
            </div>
            {monster.proficiencies.length ? (
              <div>
                <dt>{t("Perícias e testes de resistência")}</dt>
                <dd>
                  {monster.proficiencies
                    .map(
                      (p) =>
                        `${t(proficiencyName(p.proficiency.index, p.proficiency.name))} ${signed(p.value)}`,
                    )
                    .join(" · ")}
                </dd>
              </div>
            ) : null}
            {monster.damage_vulnerabilities.length ? (
              <div>
                <dt>{t("Vulnerabilidades a dano")}</dt>
                <dd>
                  {monster.damage_vulnerabilities.map(readable).join(" · ")}
                </dd>
              </div>
            ) : null}
            {monster.damage_resistances.length ? (
              <div>
                <dt>{t("Resistências a dano")}</dt>
                <dd>{monster.damage_resistances.map(readable).join(" · ")}</dd>
              </div>
            ) : null}
            {monster.damage_immunities.length ? (
              <div>
                <dt>{t("Imunidades a dano")}</dt>
                <dd>{monster.damage_immunities.map(readable).join(" · ")}</dd>
              </div>
            ) : null}
            {monster.condition_immunities.length ? (
              <div>
                <dt>{t("Imunidades a condições")}</dt>
                <dd>
                  {monster.condition_immunities.map((c) => c.name).join(" · ")}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>{t("Sentidos")}</dt>
              <dd>
                {Object.entries(monster.senses)
                  .map(
                    ([key, value]) =>
                      `${senses[key] || term(key)} ${typeof value === "string" ? readable(value) : value}`,
                  )
                  .join(" · ")}
              </dd>
            </div>
            <div>
              <dt>{t("Idiomas")}</dt>
              <dd>
                {monster.languages
                  ? readable(monster.languages)
                  : t("Nenhum idioma informado")}
              </dd>
            </div>
            {monster.gear ? (
              <div>
                <dt>{t("Equipamento")}</dt>
                <dd>{term(monster.gear)}</dd>
              </div>
            ) : null}
            {monster.xp_in_lair !== undefined ? (
              <div>
                <dt>{t("XP no covil")}</dt>
                <dd>{number.format(monster.xp_in_lair)}</dd>
              </div>
            ) : null}
          </dl>
          {groups
            .filter(([, rules]) => rules.length)
            .map(([heading, rules]) => (
              <section
                className="class-reference-section monster-action-group"
                key={heading}
              >
                <h2>{heading}</h2>
                {rules.map((rule, index) => (
                  <article className="class-reference-feature" key={index}>
                    <h3>{rule.name}</h3>
                    <RulesText text={rule.desc} />
                    <div className="monster-action-meta">
                      {rule.attack_bonus !== undefined ? (
                        <span>
                          {t("Bônus de ataque")}: {signed(rule.attack_bonus)}
                        </span>
                      ) : null}
                      {rule.dc ? (
                        <span>
                          {t("CD")}: {rule.dc.dc_value}
                          {rule.dc.dc_type
                            ? ` (${abilityNames[rule.dc.dc_type.index.toUpperCase()] || rule.dc.dc_type.name})`
                            : null}
                        </span>
                      ) : null}
                      {rule.usage?.type === "recharge on roll" ? (
                        <span>
                          {t("Recarga")}: {rule.usage.dice}, {t("mínimo")}{" "}
                          {rule.usage.min_value}
                        </span>
                      ) : null}
                      {rule.usage?.times !== undefined ? (
                        <span>
                          {t("Usos")}: {rule.usage.times}
                          {rule.usage.type === "per day"
                            ? ` / ${t("dia")}`
                            : ""}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </section>
            ))}
          <p className="small-note">
            {t("Fonte: SRD {0}, edição 2024.", [bestiarySource.srdVersion])}{" "}
            <a
              href={bestiarySource.source + "/" + monster.index}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Ver dados da API")}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
