"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { armorBases, magicArmorProfile } from "@/domain/armor";
import type { Item, ItemCatalogue } from "@/domain/items";
export function ArmorEquipControl({
  item,
  catalogue,
  busy,
  equipped,
  baseItemId,
  onEquip,
}: {
  item: Item;
  catalogue: ItemCatalogue;
  busy: boolean;
  equipped: boolean;
  baseItemId?: string;
  onEquip: (baseItemId?: string) => void;
}) {
  const { t } = useI18n();
  const bases = armorBases(item, catalogue),
    profile = magicArmorProfile(item);
  const [base, setBase] = useState(
    baseItemId || (bases.length === 1 ? bases[0].id : ""),
  );
  return (
    <div className="armor-equip-control">
      {profile?.slot === "armor" ? (
        <label>
          {t("Modelo de armadura")}
          <select
            aria-label={t("Modelo de armadura de {0}", [item.name])}
            value={base}
            disabled={busy}
            onChange={(e) => setBase(e.target.value)}
          >
            <option value="">{t("Escolha o modelo…")}</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        className="inventory-equip-action"
        disabled={busy || (!!profile && !base && bases.length !== 1)}
        onClick={() => onEquip(profile ? base || bases[0]?.id : undefined)}
      >
        {equipped ? t("Atualizar equipamento") : t("Equipar")}
      </button>
      {equipped ? (
        <span className="inventory-equipped-badge">{t("Equipado")}</span>
      ) : null}
      {profile?.slot === "armor" ? (
        <small>
          {t("O modelo define a CA, o peso e os requisitos desta armadura.")}
        </small>
      ) : null}
    </div>
  );
}
