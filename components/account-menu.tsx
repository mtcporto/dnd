"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export function AccountMenu({
  name,
  googleEnabled,
}: {
  name?: string;
  googleEnabled: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function signOut() {
    setBusy(true);
    const result = await authClient.signOut();
    if (result.error) {
      setError("Não foi possível sair.");
      setBusy(false);
    } else location.assign("/");
  }
  return (
    <div className="account-menu">
      {name ? (
        <>
          <span>{name}</span>
          <button className="text-button" onClick={signOut} disabled={busy}>
            Sair
          </button>
        </>
      ) : (
        <a className="nav-account" href="/entrar">
          {googleEnabled ? "Entrar com Google" : "Acesso à conta"}
        </a>
      )}
      {error ? <span role="alert">{error}</span> : null}
    </div>
  );
}
