"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { weaponBases } from "@/domain/weapons";
import { isTwoHanded, type Item, type ItemCatalogue } from "@/domain/items";
export function WeaponEquipControl({
  item,
  catalogue,
  baseItemId,
  busy,
  equipped = false,
  slot = "mainHand",
  onEquip,
}: {
  item: Item;
  catalogue: ItemCatalogue;
  baseItemId?: string;
  busy: boolean;
  equipped?: boolean;
  slot?: "mainHand" | "offHand";
  onEquip: (baseItemId: string, grip: "one" | "two") => void;
}) {
  const { t } = useI18n();
  const bases = weaponBases(item, catalogue);
  const [base, setBase] = useState(
    baseItemId || (bases.length === 1 ? bases[0].id : ""),
  );
  const weapon = bases.find((b) => b.id === base);
  return (
    <div className="armor-equip-control">
      <label>
        {t("Tipo de arma")}
        <select
          aria-label={t("Tipo de arma de {0}", [item.name])}
          value={base}
          disabled={busy}
          onChange={(e) => setBase(e.target.value)}
        >
          <option value="">{t("Escolha o tipo…")}</option>
          {bases
            .filter((b) => slot !== "offHand" || !isTwoHanded(b))
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>
      </label>
      <button
        className="inventory-equip-action"
        disabled={
          busy || !weapon || (slot === "offHand" && isTwoHanded(weapon))
        }
        onClick={() =>
          onEquip(base, weapon && isTwoHanded(weapon) ? "two" : "one")
        }
      >
        {equipped ? t("Atualizar equipamento") : t("Equipar")}
      </button>
      {equipped ? (
        <span className="inventory-equipped-badge">{t("Equipado")}</span>
      ) : null}
      {slot === "mainHand" && weapon?.two_handed_damage ? (
        <button disabled={busy} onClick={() => onEquip(base, "two")}>
          {t("Duas mãos")}
        </button>
      ) : null}
      <small>
        {t(
          "O tipo define o dano e a empunhadura. Os efeitos mágicos e a sintonia ainda não são automatizados.",
        )}
      </small>
    </div>
  );
}
