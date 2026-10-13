"use client";
import { useI18n } from "@/lib/i18n/client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export function GoogleSignIn() {
  const { t, l } = useI18n();

  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function signIn() {
    setBusy(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/personagens/novo",
      });
      if (result.error)
        throw Error(t("Não foi possível iniciar o acesso com Google."));
    } catch (error) {
      setBusy(false);
      setError(error instanceof Error ? error.message : t("Tente novamente."));
    }
  }
  return (
    <>
      <button className="button primary" onClick={signIn} disabled={busy}>
        {l(busy ? t("Conectando…") : t("Continuar com Google"))}
      </button>
      {l(
        error ? (
          <p role="alert" className="form-error">
            {l(error)}
          </p>
        ) : null,
      )}
    </>
  );
}
