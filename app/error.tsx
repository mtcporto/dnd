"use client";
import { useI18n } from "@/lib/i18n/client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useI18n();

  return (
    <main id="main" className="page empty-state">
      <h1>{t("Não foi possível abrir esta página.")}</h1>
      <p>{t("Tente novamente em instantes.")}</p>
      <button className="button primary" onClick={reset}>
        {t(" Tentar novamente ")}
      </button>
    </main>
  );
}
