"use client";
import { useI18n } from "@/lib/i18n/client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export function AccountMenu({
  name,
  googleEnabled,
}: {
  name?: string;
  googleEnabled: boolean;
}) {
  const { t, l } = useI18n();

  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function signOut() {
    setBusy(true);
    const result = await authClient.signOut();
    if (result.error) {
      setError(t("Não foi possível sair."));
      setBusy(false);
    } else location.assign("/");
  }
  return (
    <div className="account-menu">
      {l(
        name ? (
          <>
            <span>{name}</span>
            <button className="text-button" onClick={signOut} disabled={busy}>
              {t(" Sair ")}
            </button>
          </>
        ) : (
          <a className="nav-account" href="/entrar">
            {l(googleEnabled ? t("Entrar com Google") : t("Acesso à conta"))}
          </a>
        ),
      )}
      {l(error ? <span role="alert">{l(error)}</span> : null)}
    </div>
  );
}
