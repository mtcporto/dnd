"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
export function AddItemToInventory({
  itemId,
  characters,
}: {
  itemId: string;
  characters: { id: string; name: string }[];
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [target, setTarget] = useState("");
  if (!characters.length)
    return (
      <Link className="button secondary" href="/personagens/novo">
        {t("Criar personagem")}
      </Link>
    );
  return (
    <>
      <form
        className="item-add-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          const data = new FormData(e.currentTarget),
            id = String(data.get("character"));
          setBusy(true);
          setError("");
          setTarget("");
          try {
            const endpoint = "/api/personagens/" + id + "/inventario",
              current = await fetch(endpoint, { cache: "no-store" });
            if (!current.ok)
              throw Error(t("Não foi possível carregar o inventário."));
            const state = await current.json();
            const r = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "add",
                revision: state.revision,
                itemId,
                quantity: Number(data.get("quantity")),
              }),
            });
            const body = await r.json();
            if (!r.ok) throw Error(body.error);
            setTarget(id);
          } catch (e) {
            setError(
              e instanceof Error
                ? t(e.message)
                : t("Não foi possível atualizar o inventário."),
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          {t("Personagem")}
          <select name="character" required>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Quantidade")}
          <input
            name="quantity"
            type="number"
            min={1}
            max={999}
            defaultValue={1}
            required
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? t("Adicionando…") : t("Adicionar ao inventário")}
        </button>
      </form>
      {error ? (
        <p role="alert" className="inventory-error">
          {error}
        </p>
      ) : null}
      {target ? (
        <p role="status">
          {t("Item adicionado.")}{" "}
          <Link href={"/personagens/" + target + "/inventario"}>
            {t("Abrir inventário")} ↗
          </Link>
        </p>
      ) : null}
      <p className="small-note">
        {t("Adição manual à ficha; nenhuma moeda será descontada.")}
      </p>
    </>
  );
}
