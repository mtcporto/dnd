"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
export function LocaleSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [pending, startTransition] = useTransition(),
    [error, setError] = useState(false);
  return (
    <div className="locale-switcher">
      <label>
        <span className="sr-only">{t("Idioma")}</span>
        <select
          aria-label={t("Escolha o idioma")}
          value={locale}
          disabled={busy || pending}
          onChange={async (event) => {
            setBusy(true);
            setError(false);
            try {
              const response = await fetch("/api/locale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ locale: event.target.value }),
              });
              if (!response.ok) throw Error();
              startTransition(() => router.refresh());
            } catch {
              setError(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <option value="en">English</option>
          <option value="pt">Português</option>
          <option value="es">Español</option>
        </select>
      </label>
      {error && (
        <span role="alert">
          {t("Não foi possível mudar o idioma. Tente novamente.")}
        </span>
      )}
    </div>
  );
}
