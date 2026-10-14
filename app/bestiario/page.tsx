import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import {
  bestiarySource,
  getMonsterSummaries,
  getBestiaryLabels,
  monsterImage,
} from "@/lib/bestiary";
import {
  challengeLabel,
  filterMonsters,
  queryHref,
  type BestiaryQuery,
} from "@/domain/monster";
import { MonsterImage } from "@/components/monster-image";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("Bestiário") };
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { t, locale } = await getI18n();
  const { t: term } = await getBestiaryLabels();
  const summaries = await getMonsterSummaries();
  const params = await searchParams;
  const query: BestiaryQuery = Object.fromEntries(
    ["q", "type", "size", "cr", "sort", "page"].map((key) => [
      key,
      typeof params[key] === "string" ? params[key] : undefined,
    ]),
  );
  const result = filterMonsters(summaries, query, locale);
  const types = [...new Set(summaries.map((m) => m.type))].sort((a, b) =>
    term(a).localeCompare(term(b), locale),
  );
  const sizes = [
    "Tiny",
    "Small",
    "Medium",
    "Medium or small",
    "Large",
    "Huge",
    "Gargantuan",
  ].filter((size) => summaries.some((monster) => monster.size === size));
  const ratings = [...new Set(summaries.map((m) => m.challengeRating))].sort(
    (a, b) => a - b,
  );
  const returnQuery =
    queryHref({ ...query, page: String(result.page) }).split("?")[1] || "";
  return (
    <main id="main" className="character-space compendium-page bestiary-page">
      <header className="bestiary-heading">
        <p className="stage-kicker">{t("Bestiário · Regras de 2024")}</p>
        <h1>{t("Criaturas para descobrir")}</h1>
        <p className="compendium-intro">
          {t(
            "Explore as {0} criaturas do SRD: características, habilidades e ações para consultar durante suas aventuras.",
            [bestiarySource.count],
          )}
        </p>
        <Link className="back-link" href="/regras">
          {t("← Compêndio")}
        </Link>
      </header>
      <form
        key={queryHref(query)}
        className="bestiary-filters"
        action="/bestiario"
        method="get"
      >
        <label>
          {t("Buscar criatura")}
          <input
            type="search"
            name="q"
            defaultValue={query.q || ""}
            maxLength={120}
            placeholder={t("Nome da criatura")}
          />
        </label>
        <label>
          {t("Tipo")}
          <select name="type" defaultValue={query.type || ""}>
            <option value="">{t("Todos os tipos")}</option>
            {types.map((type) => (
              <option value={type} key={type}>
                {term(type)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Tamanho")}
          <select name="size" defaultValue={query.size || ""}>
            <option value="">{t("Todos os tamanhos")}</option>
            {sizes.map((size) => (
              <option value={size} key={size}>
                {term(size)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Nível de desafio")}
          <select name="cr" defaultValue={query.cr || ""}>
            <option value="">{t("Todos os níveis")}</option>
            {ratings.map((cr) => (
              <option value={cr} key={cr}>
                {challengeLabel(cr)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Ordenar por")}
          <select name="sort" defaultValue={query.sort || "name"}>
            <option value="name">{t("Nome")}</option>
            <option value="cr-asc">{t("Desafio: menor primeiro")}</option>
            <option value="cr-desc">{t("Desafio: maior primeiro")}</option>
          </select>
        </label>
        <button className="button primary" type="submit">
          {t("Aplicar filtros")}
        </button>
        <Link className="text-button" href="/bestiario">
          {t("Limpar filtros")}
        </Link>
      </form>
      <p className="bestiary-result-count" role="status">
        {t("{0} criaturas encontradas", [result.total])}
      </p>
      {result.entries.length ? (
        <div className="compendium-class-grid bestiary-grid">
          {result.entries.map((monster, index) => (
            <Link
              className="compendium-class-card monster-card"
              href={`/bestiario/${monster.index}${returnQuery ? "?from=" + encodeURIComponent(returnQuery) : ""}`}
              key={monster.index}
              prefetch={false}
            >
              <div className="compendium-class-art monster-card-art">
                <MonsterImage
                  src={monsterImage(monster.index)}
                  name={monster.name}
                  eager={index < 4}
                />
              </div>
              <div className="compendium-class-copy">
                <span className="stage-kicker">
                  {term(monster.type)} · {term(monster.size)}
                </span>
                <h2>{monster.name}</h2>
                <p>
                  {t("Nível de desafio")}:{" "}
                  {challengeLabel(monster.challengeRating)}
                </p>
                <span className="compendium-card-action">
                  {t("Conhecer criatura")} <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bestiary-empty">
          <h2>{t("Nenhuma criatura encontrada")}</h2>
          <p>{t("Tente outro nome ou ajuste os filtros.")}</p>
        </div>
      )}
      <nav
        className="bestiary-pagination"
        aria-label={t("Páginas do bestiário")}
      >
        {result.page > 1 ? (
          <Link
            className="button secondary"
            href={queryHref({ ...query, page: String(result.page - 1) })}
          >
            {t("← Anterior")}
          </Link>
        ) : (
          <span />
        )}
        <span>{t("Página {0} de {1}", [result.page, result.pages])}</span>
        {result.page < result.pages ? (
          <Link
            className="button secondary"
            href={queryHref({ ...query, page: String(result.page + 1) })}
          >
            {t("Próxima →")}
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <p className="small-note">
        {t(
          "Fonte: SRD {0}, edição 2024. As imagens disponíveis são fornecidas pela API.",
          [bestiarySource.srdVersion],
        )}
      </p>
    </main>
  );
}
