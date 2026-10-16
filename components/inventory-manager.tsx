"use client";
import { itemRarity } from "@/domain/item-rarity";
import { WeaponEquipControl } from "@/components/weapon-equip-control";
import { isMagicWeapon, weaponBases } from "@/domain/weapons";
import { ArmorEquipControl } from "@/components/armor-equip-control";
import { magicArmorProfile } from "@/domain/armor";
import { ItemArt } from "@/components/item-art";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import type { CharacterDraft } from "@/domain/character";
import {
  itemPath,
  isArmor,
  isShield,
  isWeapon,
  isTwoHanded,
  type ItemCatalogue,
} from "@/domain/items";
import {
  inventoryStats,
  healingDice,
  type InventoryCommand,
  type InventoryView,
} from "@/domain/inventory";
export function InventoryManager({
  characterId,
  draft,
  initial,
  catalogue,
}: {
  characterId: string;
  draft: CharacterDraft;
  initial: InventoryView;
  catalogue: ItemCatalogue;
}) {
  const { t, locale } = useI18n(),
    router = useRouter();
  const [inventory, setInventory] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [search, setSearch] = useState("");
  const stats = inventoryStats(inventory.state, draft, catalogue),
    byId = new Map(catalogue.items.map((i) => [i.id, i]));
  const [slotSelection, setSlotSelection] = useState<Record<string, string>>(
    {},
  );
  const slotNames = {
    armor: t("Armadura"),
    mainHand: t("Mão principal"),
    offHand: t("Mão secundária"),
  };
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const matching = search.trim()
    ? catalogue.items
        .filter((i) => normalize(i.name).includes(normalize(search.trim())))
        .slice(0, 12)
    : [];
  async function command(
    value:
      | Omit<Extract<InventoryCommand, { action: "add" }>, "revision">
      | Omit<Extract<InventoryCommand, { action: "quantity" }>, "revision">
      | Omit<Extract<InventoryCommand, { action: "equip" }>, "revision">
      | Omit<Extract<InventoryCommand, { action: "unequip" }>, "revision">
      | Omit<Extract<InventoryCommand, { action: "health" }>, "revision">
      | Omit<Extract<InventoryCommand, { action: "wallet" }>, "revision">
      | Omit<Extract<InventoryCommand, { action: "use" }>, "revision">,
  ) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        "/api/personagens/" + characterId + "/inventario",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...value, revision: inventory.revision }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          const fresh = await fetch(
            "/api/personagens/" + characterId + "/inventario",
            { cache: "no-store" },
          );
          if (fresh.ok) setInventory(await fresh.json());
        }
        throw Error(
          body.error || t("Não foi possível atualizar o inventário."),
        );
      }
      setInventory({ state: body.state, revision: body.revision });
      setMessage(
        body.recovered !== undefined
          ? t("Você recuperou {0} pontos de vida.", [body.recovered])
          : t("Inventário atualizado."),
      );
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? t(e.message)
          : t("Não foi possível atualizar o inventário."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="inventory-manager">
      <div className="inventory-stats">
        <div>
          <span>{t("Pontos de vida")}</span>
          <strong>
            {inventory.state.currentHP} / {draft.hitPoints}
          </strong>
        </div>
        <div>
          <span>{t("Classe de armadura")}</span>
          <strong>{stats.armorClass}</strong>
        </div>
        <div>
          <span>{t("Peso conhecido dos itens")}</span>
          <strong>
            {new Intl.NumberFormat(locale).format(stats.weight)} {t("lb")}
          </strong>
        </div>
        <div>
          <span>{t("Moedas")}</span>
          <strong>
            {Math.floor(inventory.state.copper / 100)} {t("ouro")} ·{" "}
            {Math.floor((inventory.state.copper % 100) / 10)} {t("prata")} ·{" "}
            {inventory.state.copper % 10} {t("cobre")}
          </strong>
        </div>
      </div>
      <p className="small-note">
        {t(
          "Edição manual da ficha: adicionar itens não é uma compra nem uma recompensa de aventura.",
        )}
      </p>
      {error ? (
        <p role="alert" className="inventory-message inventory-error">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="inventory-message">
          {message}
        </p>
      ) : null}
      <p className="small-note">
        {t("Os itens sem peso informado não entram no total.")}
      </p>
      <section aria-label={t("Itens equipados")}>
        <h2>{t("Itens equipados")}</h2>
        <p className="small-note">
          {t(
            "Guardar um item não o equipa. Selecione abaixo o item que deseja usar e clique em Equipar.",
          )}
        </p>
        <div className="inventory-equipment">
          {(["armor", "mainHand", "offHand"] as const).map((slot) => (
            <div className="inventory-slot" key={slot}>
              <h3>{slotNames[slot]}</h3>
              <p>
                {inventory.state.equipment[slot] ? (
                  <span
                    className="item-rarity-name"
                    data-rarity={
                      byId.get(inventory.state.equipment[slot]!)
                        ? itemRarity(
                            byId.get(inventory.state.equipment[slot]!)!,
                          )
                        : undefined
                    }
                  >
                    {byId.get(inventory.state.equipment[slot]!)?.name}
                  </span>
                ) : (
                  t("Nenhum item equipado")
                )}
                {slot === "mainHand" &&
                inventory.state.equipment.mainHand &&
                inventory.state.grip === "two"
                  ? " · " + t("Duas mãos")
                  : null}
              </p>
              {(() => {
                const candidates = inventory.state.entries
                  .map((entry) => ({ entry, item: byId.get(entry.itemId)! }))
                  .filter(
                    ({ item }) =>
                      item &&
                      (slot === "armor"
                        ? isArmor(item) ||
                          magicArmorProfile(item)?.slot === "armor"
                        : slot === "mainHand"
                          ? isWeapon(item) || isMagicWeapon(item)
                          : isShield(item) ||
                            (isWeapon(item) && !isTwoHanded(item)) ||
                            (isMagicWeapon(item) &&
                              weaponBases(item, catalogue).some(
                                (b) => !isTwoHanded(b),
                              )) ||
                            magicArmorProfile(item)?.slot === "offHand"),
                  );
                const selected =
                  slotSelection[slot] ||
                  inventory.state.equipment[slot] ||
                  (candidates.length === 1 ? candidates[0].item.id : "");
                const candidate = candidates.find(
                  (c) => c.item.id === selected,
                );
                return candidates.length ? (
                  <div className="inventory-slot-picker">
                    <label>
                      {t("Escolher item do inventário")}
                      <select
                        aria-label={slotNames[slot]}
                        value={selected}
                        disabled={busy}
                        onChange={(e) =>
                          setSlotSelection((current) => ({
                            ...current,
                            [slot]: e.target.value,
                          }))
                        }
                      >
                        <option value="">{t("Selecione um item…")}</option>
                        {candidates.map(({ item }) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {candidate ? (
                      isMagicWeapon(candidate.item) && slot !== "armor" ? (
                        <WeaponEquipControl
                          key={
                            candidate.item.id +
                            ":" +
                            candidate.entry.baseItemId +
                            ":" +
                            slot
                          }
                          item={candidate.item}
                          catalogue={catalogue}
                          baseItemId={candidate.entry.baseItemId}
                          busy={busy}
                          slot={slot}
                          equipped={
                            inventory.state.equipment[slot] ===
                            candidate.item.id
                          }
                          onEquip={(baseItemId, grip) =>
                            command({
                              action: "equip",
                              itemId: candidate.item.id,
                              slot,
                              baseItemId,
                              grip,
                            })
                          }
                        />
                      ) : slot === "armor" ||
                        isShield(candidate.item) ||
                        magicArmorProfile(candidate.item) ? (
                        <ArmorEquipControl
                          key={
                            candidate.item.id + ":" + candidate.entry.baseItemId
                          }
                          item={candidate.item}
                          catalogue={catalogue}
                          busy={busy}
                          equipped={
                            inventory.state.equipment[slot] ===
                            candidate.item.id
                          }
                          baseItemId={candidate.entry.baseItemId}
                          onEquip={(baseItemId) =>
                            command({
                              action: "equip",
                              itemId: candidate.item.id,
                              slot,
                              grip: "one",
                              ...(baseItemId ? { baseItemId } : {}),
                            })
                          }
                        />
                      ) : (
                        <button
                          className="inventory-equip-action"
                          disabled={busy}
                          onClick={() =>
                            command({
                              action: "equip",
                              itemId: candidate.item.id,
                              slot,
                              grip: isTwoHanded(candidate.item) ? "two" : "one",
                            })
                          }
                        >
                          {t("Equipar")}
                        </button>
                      )
                    ) : null}
                  </div>
                ) : (
                  <p className="small-note">
                    {t(
                      "Adicione um item compatível ao inventário para equipá-lo aqui.",
                    )}
                  </p>
                );
              })()}
              {inventory.state.equipment[slot] ? (
                <button
                  disabled={busy}
                  onClick={() => command({ action: "unequip", slot })}
                >
                  {t("Desequipar")}
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {stats.weapon ? (
          <p>
            {t("Arma principal")}: {byId.get(stats.weapon.id)?.name} ·{" "}
            {t("Bônus de ataque")}: {stats.weapon.attackBonus >= 0 ? "+" : ""}
            {stats.weapon.attackBonus} · {t("Dano")}: {stats.weapon.damageDice}{" "}
            {stats.weapon.damageBonus >= 0 ? "+" : "−"}{" "}
            {Math.abs(stats.weapon.damageBonus)}
            {!stats.weapon.proficient ? " · " + t("Sem proficiência") : null}
          </p>
        ) : null}
        {stats.warnings.length ? (
          <ul className="small-note">
            {stats.warnings.map((w) => (
              <li key={w}>{t(w)}</li>
            ))}
          </ul>
        ) : null}
        <p className="small-note">
          {t(
            "A defesa considera a armadura, o escudo e a defesa sem armadura. Efeitos mágicos especiais seguem a descrição do item e ainda não são aplicados automaticamente.",
          )}
        </p>
      </section>
      <div className="inventory-tools">
        <form
          key={"health-" + inventory.revision}
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            command({ action: "health", currentHP: Number(data.get("hp")) });
          }}
        >
          <label>
            {t("Ajustar pontos de vida")}
            <input
              name="hp"
              type="number"
              min={0}
              max={draft.hitPoints}
              defaultValue={inventory.state.currentHP}
              required
            />
          </label>
          <button disabled={busy} type="submit">
            {t("Salvar")}
          </button>
        </form>
        <form
          key={"coins-" + inventory.revision}
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            command({ action: "wallet", copper: Number(data.get("copper")) });
          }}
        >
          <label>
            {t("Saldo em peças de cobre")}
            <input
              name="copper"
              type="number"
              min={0}
              max={1000000000}
              defaultValue={inventory.state.copper}
              required
            />
          </label>
          <button disabled={busy} type="submit">
            {t("Salvar")}
          </button>
          <small className="small-note">
            {t("1 peça de ouro = 100 peças de cobre.")}
          </small>
        </form>
      </div>
      <section className="inventory-add">
        <h2>{t("Adicionar item")}</h2>
        <label>
          {t("Buscar no catálogo")}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={120}
            placeholder={t("Nome do item")}
          />
        </label>
        <div className="inventory-add-results">
          {matching.map((item) => (
            <button
              key={item.id}
              disabled={busy}
              onClick={() =>
                command({ action: "add", itemId: item.id, quantity: 1 })
              }
            >
              <strong
                className="item-rarity-name"
                data-rarity={itemRarity(item)}
              >
                {item.name}
              </strong>
              <span>
                {item.kind === "magic" ? t("Item mágico") : t("Equipamento")} ·{" "}
                {t("Adicionar uma unidade")}
              </span>
            </button>
          ))}
        </div>
        {search.trim() && !matching.length ? (
          <p>{t("Nenhum item encontrado.")}</p>
        ) : null}
        <Link href="/itens">{t("Explorar o arsenal")} ↗</Link>
      </section>
      <section>
        <h2>
          {t("Itens guardados")}{" "}
          <small>({inventory.state.entries.length})</small>
        </h2>
        {!inventory.state.entries.length ? (
          <p>
            {t(
              "Seu inventário está vazio. Busque um item no catálogo para começar.",
            )}
          </p>
        ) : (
          inventory.state.entries.map((entry) => {
            const item = byId.get(entry.itemId);
            if (!item) return null;
            return (
              <article className="inventory-row" key={entry.itemId}>
                <div>
                  <ItemArt item={item} image={item.image} name={item.name} />
                  <h3>
                    <Link
                      className="item-rarity-name"
                      data-rarity={itemRarity(item)}
                      href={itemPath(item)}
                    >
                      {item.name}
                    </Link>
                  </h3>
                  <p>
                    {item.weight !== undefined
                      ? `${item.weight} ${t("lb")} · `
                      : ""}
                    {item.kind === "magic"
                      ? t("Item mágico")
                      : t("Equipamento")}
                  </p>
                  {entry.baseItemId ? (
                    <p>
                      {isMagicWeapon(item)
                        ? t("Tipo de arma")
                        : t("Modelo de armadura")}
                      : {byId.get(entry.baseItemId)?.name}
                    </p>
                  ) : null}
                  {item.kind === "magic" ? (
                    <p>
                      {t(
                        "Consulte as regras e os requisitos na ficha do item.",
                      )}
                    </p>
                  ) : null}
                </div>
                <div>
                  <span className="sr-only">{t("Quantidade")}</span>
                  <button
                    disabled={busy}
                    aria-label={t("Remover uma unidade de {0}", [item.name])}
                    onClick={() =>
                      command({
                        action: "quantity",
                        itemId: item.id,
                        quantity: entry.quantity - 1,
                      })
                    }
                  >
                    −
                  </button>{" "}
                  <strong aria-label={t("Quantidade")}>{entry.quantity}</strong>{" "}
                  <button
                    disabled={busy || entry.quantity >= 999}
                    aria-label={t("Adicionar uma unidade de {0}", [item.name])}
                    onClick={() =>
                      command({
                        action: "quantity",
                        itemId: item.id,
                        quantity: entry.quantity + 1,
                      })
                    }
                  >
                    +
                  </button>
                </div>
                <div className="inventory-row-controls">
                  {isArmor(item) ||
                  isShield(item) ||
                  magicArmorProfile(item) ? (
                    <ArmorEquipControl
                      key={item.id + ":" + entry.baseItemId}
                      item={item}
                      catalogue={catalogue}
                      busy={busy}
                      equipped={
                        inventory.state.equipment.armor === item.id ||
                        inventory.state.equipment.offHand === item.id
                      }
                      baseItemId={entry.baseItemId}
                      onEquip={(baseItemId) =>
                        command({
                          action: "equip",
                          itemId: item.id,
                          slot:
                            isShield(item) ||
                            magicArmorProfile(item)?.slot === "offHand"
                              ? "offHand"
                              : "armor",
                          grip: "one",
                          ...(baseItemId ? { baseItemId } : {}),
                        })
                      }
                    />
                  ) : null}
                  {isMagicWeapon(item) ? (
                    <WeaponEquipControl
                      key={item.id + ":" + entry.baseItemId}
                      item={item}
                      catalogue={catalogue}
                      baseItemId={entry.baseItemId}
                      busy={busy}
                      equipped={
                        inventory.state.equipment.mainHand === item.id ||
                        inventory.state.equipment.offHand === item.id
                      }
                      onEquip={(baseItemId, grip) =>
                        command({
                          action: "equip",
                          itemId: item.id,
                          slot: "mainHand",
                          baseItemId,
                          grip,
                        })
                      }
                    />
                  ) : null}
                  {isWeapon(item) ? (
                    <>
                      <button
                        disabled={busy}
                        onClick={() =>
                          command({
                            action: "equip",
                            itemId: item.id,
                            slot: "mainHand",
                            grip: isTwoHanded(item) ? "two" : "one",
                          })
                        }
                      >
                        {t("Mão principal")}
                      </button>
                      {item.two_handed_damage ? (
                        <button
                          disabled={busy}
                          onClick={() =>
                            command({
                              action: "equip",
                              itemId: item.id,
                              slot: "mainHand",
                              grip: "two",
                            })
                          }
                        >
                          {t("Duas mãos")}
                        </button>
                      ) : null}
                      {!isTwoHanded(item) ? (
                        <button
                          disabled={busy}
                          onClick={() =>
                            command({
                              action: "equip",
                              itemId: item.id,
                              slot: "offHand",
                              grip: "one",
                            })
                          }
                        >
                          {t("Mão secundária")}
                        </button>
                      ) : null}
                    </>
                  ) : null}
                  {healingDice(item) ? (
                    <button
                      disabled={
                        busy ||
                        inventory.state.currentHP === 0 ||
                        inventory.state.currentHP >= draft.hitPoints
                      }
                      onClick={() =>
                        command({ action: "use", itemId: item.id })
                      }
                    >
                      {t("Beber poção")}
                    </button>
                  ) : null}
                  <button
                    disabled={busy}
                    onClick={() =>
                      command({
                        action: "quantity",
                        itemId: item.id,
                        quantity: 0,
                      })
                    }
                  >
                    {t("Remover item")}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
