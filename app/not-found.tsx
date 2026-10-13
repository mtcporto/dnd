import { getI18n } from "@/lib/i18n/server";
export default async function NotFound() {
  const { t } = await getI18n();

  return (
    <main id="main" className="page empty-state">
      <h1>{t("Esta página não foi encontrada.")}</h1>
      <p>{t("Volte aos personagens para continuar.")}</p>
      <a href="/personagens" className="button primary">
        {t(" Meus personagens ")}
      </a>
    </main>
  );
}
