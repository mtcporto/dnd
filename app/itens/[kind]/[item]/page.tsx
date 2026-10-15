import { ItemArt } from "@/components/item-art";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { characters } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { AddItemToInventory } from "@/components/add-item-to-inventory";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItems } from "@/lib/items";
import { getI18n } from "@/lib/i18n/server";
import { categoriesOf, itemPath } from "@/domain/items";
import { RulesText } from "@/components/rules-text";
type Props = { params: Promise<{ kind: string; item: string }> };
export async function generateMetadata({ params }: Props) {
  const p = await params,
    c = await getItems(),
    { t } = await getI18n(),
    item = c.items.find((i) => i.kind === p.kind && i.index === p.item);
  return { title: item?.name || t("Item não encontrado.") };
}
export default async function Page({ params }: Props) {
  const [p, catalogue, { t }] = await Promise.all([
    params,
    getItems(),
    getI18n(),
  ]);
  const item = catalogue.items.find(
    (i) => i.kind === p.kind && i.index === p.item,
  );
  if (!item) notFound();
  const session = await getSession();
  const owned = session
    ? await getDb()
        .select({ id: characters.id, name: characters.name })
        .from(characters)
        .where(eq(characters.userId, session.user.id))
    : [];
  const properties =
    item.properties?.map(
      (ref) => catalogue.properties.find((p) => p.index === ref.index) || ref,
    ) || [];
  const mastery = item.mastery
    ? catalogue.masteries.find((m) => m.index === item.mastery?.index)
    : undefined;
  return (
    <main id="main" className="character-space item-reference-page">
      <Link className="back-link" href="/itens">
        {t("← Arsenal")}
      </Link>
      <header className="bestiary-heading">
        <p className="stage-kicker">
          {item.kind === "magic" ? t("Item mágico") : t("Equipamento")}
        </p>
        <h1>{item.name}</h1>
        <p className="compendium-intro">
          {categoriesOf(item)
            .map((c) => c.name)
            .join(" · ")}
        </p>
      </header>
      {item.image ? (
        <ItemArt image={item.image} name={item.name} large />
      ) : null}
      <dl className="item-reference-stats">
        {item.rarity ? (
          <div>
            <dt>{t("Raridade")}</dt>
            <dd>{item.rarity.name}</dd>
          </div>
        ) : null}
        {item.cost ? (
          <div>
            <dt>{t("Preço de referência")}</dt>
            <dd>
              {item.cost.quantity}{" "}
              {(
                {
                  cp: t("cobre"),
                  sp: t("prata"),
                  ep: t("electro"),
                  gp: t("ouro"),
                  pp: t("platina"),
                } as Record<string, string>
              )[item.cost.unit] || item.cost.unit}
            </dd>
          </div>
        ) : null}
        {item.weight !== undefined ? (
          <div>
            <dt>{t("Peso")}</dt>
            <dd>
              {item.weight} {t("lb")}
            </dd>
          </div>
        ) : null}
        {item.armor_class ? (
          <div>
            <dt>{t("Classe de armadura")}</dt>
            <dd>
              {item.armor_class.base}
              {item.armor_class.dex_bonus ? " + " + t("Destreza") : ""}
              {item.armor_class.dex_bonus && item.armor_class.max_bonus != null
                ? " (" + t("máximo {0}", [item.armor_class.max_bonus]) + ")"
                : ""}
            </dd>
          </div>
        ) : null}
        {item.damage ? (
          <div>
            <dt>{t("Dano")}</dt>
            <dd>
              {item.damage.damage_dice} · {item.damage.damage_type.name}
            </dd>
          </div>
        ) : null}
        {item.two_handed_damage ? (
          <div>
            <dt>{t("Duas mãos")}</dt>
            <dd>{item.two_handed_damage.damage_dice}</dd>
          </div>
        ) : null}
        {item.range ? (
          <div>
            <dt>{t("Alcance")}</dt>
            <dd>
              {item.range.normal}
              {item.range.long ? "/" + item.range.long : ""} {t("pés")}
            </dd>
          </div>
        ) : null}
        {item.str_minimum ? (
          <div>
            <dt>{t("Força mínima")}</dt>
            <dd>{item.str_minimum}</dd>
          </div>
        ) : null}
        {item.stealth_disadvantage ? (
          <div>
            <dt>{t("Furtividade")}</dt>
            <dd>{t("Desvantagem")}</dd>
          </div>
        ) : null}
        {item.attunement ? (
          <div>
            <dt>{t("Sintonização")}</dt>
            <dd>{t("Necessária; consulte os requisitos na descrição.")}</dd>
          </div>
        ) : null}
      </dl>
      {[
        ...(item.desc || []),
        ...(item.description || []),
        ...(item.notes || []),
      ].length ? (
        <section className="item-reference-section">
          <h2>{t("Descrição")}</h2>
          <RulesText
            text={[
              ...(item.desc || []),
              ...(item.description || []),
              ...(item.notes || []),
            ].join("\n\n")}
          />
        </section>
      ) : null}
      {properties.length ? (
        <section className="item-reference-section">
          <h2>{t("Propriedades")}</h2>
          {properties.map((ref) => (
            <article key={ref.index}>
              <h3>{ref.name}</h3>
              <RulesText
                text={
                  ref.desc?.join("\n\n") ||
                  (Array.isArray(ref.description)
                    ? ref.description.join("\n\n")
                    : ref.description)
                }
              />
            </article>
          ))}
        </section>
      ) : null}
      {mastery ? (
        <section className="item-reference-section">
          <h2>
            {t("Maestria")}: {mastery.name}
          </h2>
          <RulesText
            text={
              mastery.desc?.join("\n\n") ||
              (Array.isArray(mastery.description)
                ? mastery.description.join("\n\n")
                : mastery.description)
            }
          />
        </section>
      ) : null}
      {item.variants?.length ? (
        <section className="item-reference-section">
          <h2>{t("Variantes")}</h2>
          <ul>
            {item.variants.map((ref) => {
              const variant = catalogue.items.find(
                (i) => i.kind === "magic" && i.index === ref.index,
              );
              return (
                <li key={ref.index}>
                  {variant ? (
                    <Link href={itemPath(variant)}>{variant.name}</Link>
                  ) : (
                    ref.name
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      {item.contents?.length ? (
        <section className="item-reference-section">
          <h2>{t("Conteúdo")}</h2>
          <ul>
            {item.contents.map((row, i) => (
              <li key={i}>
                {row.quantity} × {row.item.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="item-reference-section">
        <h2>{t("Levar para a aventura")}</h2>
        <p>
          {t(
            "Abra o inventário de um personagem para adicionar este item manualmente.",
          )}
        </p>
        {session ? (
          <AddItemToInventory itemId={item.id} characters={owned} />
        ) : (
          <Link className="button primary" href="/entrar">
            {t("Entre para adicionar ao inventário")}
          </Link>
        )}
      </section>
      <p className="small-note">
        {t("Fonte: SRD {0}, edição 2024.", [catalogue.srdVersion])}{" "}
        <a
          href={"https://www.dnd5eapi.co" + item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Ver dados da API")}
        </a>
      </p>
    </main>
  );
}
