"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export function GoogleSignIn() {
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
        throw Error("Não foi possível iniciar o acesso com Google.");
    } catch (error) {
      setBusy(false);
      setError(error instanceof Error ? error.message : "Tente novamente.");
    }
  }
  return (
    <>
      <button className="button primary" onClick={signIn} disabled={busy}>
        {busy ? "Conectando…" : "Continuar com Google"}
      </button>
      {error ? (
        <p role="alert" className="form-error">
          {error}
        </p>
      ) : null}
    </>
  );
}
