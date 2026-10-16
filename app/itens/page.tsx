import { itemRarity } from "@/domain/item-rarity";
import { ItemArt } from "@/components/item-art";
import Link from "next/link";
import { getItems } from "@/lib/items";
import { getI18n } from "@/lib/i18n/server";
import { filterItems, categoriesOf, itemPath } from "@/domain/items";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("Arsenal") };
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [catalogue, { t, locale }, raw] = await Promise.all([
    getItems(),
    getI18n(),
    searchParams,
  ]);
  const query = Object.fromEntries(
    ["q", "kind", "category", "rarity", "page"].map((key) => [
      key,
      typeof raw[key] === "string" ? raw[key] : undefined,
    ]),
  );
  const result = filterItems(catalogue.items, query, locale);
  const categories = [
    ...new Map(
      catalogue.items.flatMap(categoriesOf).map((c) => [c.index, c]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name, locale));
  const rarities = [
    ...new Map(
      catalogue.items
        .filter((i) => i.rarity)
        .map((i) => [
          i.rarityKey || i.rarity!.name,
          { key: i.rarityKey || i.rarity!.name, name: i.rarity!.name },
        ]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name, locale));
  const href = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...query, page: String(page) }))
      if (value) params.set(key, value);
    return "/itens?" + params.toString();
  };
  return (
    <main id="main" className="character-space compendium-page">
      <header className="bestiary-heading">
        <p className="stage-kicker">{t("Arsenal · Regras de 2024")}</p>
        <h1>{t("Prepare sua próxima aventura")}</h1>
        <p className="compendium-intro">
          {t("{0} equipamentos e {1} registros de itens mágicos do SRD.", [
            catalogue.equipmentCount,
            catalogue.magicCount,
          ])}
        </p>
        <Link className="back-link" href="/regras">
          {t("← Compêndio")}
        </Link>
      </header>
      <form
        key={JSON.stringify(query)}
        className="bestiary-filters"
        method="get"
        action="/itens"
      >
        <label>
          {t("Buscar item")}
          <input
            name="q"
            type="search"
            maxLength={120}
            defaultValue={query.q}
            placeholder={t("Nome do item")}
          />
        </label>
        <label>
          {t("Tipo")}
          <select name="kind" defaultValue={query.kind || ""}>
            <option value="">{t("Todos os tipos")}</option>
            <option value="equipment">{t("Equipamento")}</option>
            <option value="magic">{t("Item mágico")}</option>
          </select>
        </label>
        <label>
          {t("Categoria")}
          <select name="category" defaultValue={query.category || ""}>
            <option value="">{t("Todas as categorias")}</option>
            {categories.map((c) => (
              <option key={c.index} value={c.index}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Raridade")}
          <select name="rarity" defaultValue={query.rarity || ""}>
            <option value="">{t("Todas as raridades")}</option>
            {rarities.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <button className="button primary" type="submit">
          {t("Aplicar filtros")}
        </button>
        <Link className="text-button" href="/itens">
          {t("Limpar filtros")}
        </Link>
      </form>
      <p className="bestiary-result-count" role="status">
        {t("{0} itens encontrados", [result.total])}
      </p>
      <div className="compendium-class-grid item-catalogue-grid">
        {result.items.map((item) => (
          <Link
            className="compendium-class-card item-card"
            key={item.id}
            href={itemPath(item)}
            prefetch={false}
          >
            <div className="compendium-class-copy">
              <ItemArt item={item} image={item.image} name={item.name} />
              <p className="stage-kicker">
                {item.kind === "magic" ? t("Item mágico") : t("Equipamento")}
              </p>
              <h2 className="item-rarity-name" data-rarity={itemRarity(item)}>
                {item.name}
              </h2>
              <p className="item-rarity-name" data-rarity={itemRarity(item)}>
                {item.rarity?.name || categoriesOf(item)[0]?.name}
              </p>
              <span className="compendium-card-action">{t("Ver item")} ↗</span>
            </div>
          </Link>
        ))}
      </div>
      {!result.total ? <p>{t("Nenhum item encontrado.")}</p> : null}
      <nav
        className="bestiary-pagination"
        aria-label={t("Páginas do catálogo de itens")}
      >
        {result.page > 1 ? (
          <Link href={href(result.page - 1)}>{t("← Anterior")}</Link>
        ) : (
          <span />
        )}
        <span>{t("Página {0} de {1}", [result.page, result.pages])}</span>
        {result.page < result.pages ? (
          <Link href={href(result.page + 1)}>{t("Próxima →")}</Link>
        ) : (
          <span />
        )}
      </nav>
      <p className="small-note">
        {t(
          "Alguns registros representam famílias ou variantes de itens. Consulte os detalhes de cada item.",
        )}
      </p>
    </main>
  );
}
