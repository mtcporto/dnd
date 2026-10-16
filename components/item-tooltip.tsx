"use client";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n/client";
import { categoriesOf, type Item } from "@/domain/items";
import { itemRarity } from "@/domain/item-rarity";
import { RulesText } from "@/components/rules-text";

export function ItemTooltip({
  item,
  children,
  inline = false,
}: {
  item: Item;
  children: ReactNode;
  inline?: boolean;
}) {
  const { t } = useI18n();
  const id = useId();
  const trigger = useRef<HTMLDivElement & HTMLSpanElement>(null),
    panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false),
    [position, setPosition] = useState({ left: 8, top: 8 });
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const show = () => {
    cancel();
    setOpen(true);
  };
  const hide = () => {
    cancel();
    timer.current = setTimeout(() => {
      if (!trigger.current?.contains(document.activeElement)) setOpen(false);
    }, 120);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const outside = (e: PointerEvent) => {
      if (
        !trigger.current?.contains(e.target as Node) &&
        !panel.current?.contains(e.target as Node)
      )
        close();
    };
    window.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!trigger.current || !panel.current) return;
      const anchor = trigger.current.getBoundingClientRect(),
        box = panel.current.getBoundingClientRect();
      const width = document.documentElement.clientWidth,
        height = window.innerHeight;
      if (
        (anchor.bottom < 0 || anchor.top > height) &&
        !trigger.current.contains(document.activeElement)
      ) {
        setOpen(false);
        return;
      }
      let left = anchor.right + 12;
      if (left + box.width > width - 8) left = anchor.left - box.width - 12;
      if (left < 8) left = Math.min(anchor.left, width - box.width - 8);
      setPosition({
        left: Math.max(8, left),
        top: Math.max(8, Math.min(anchor.top, height - box.height - 8)),
      });
    };
    place();
    window.addEventListener("scroll", place);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [open, item.id]);
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      ref={trigger}
      className={
        inline
          ? "item-tooltip-trigger item-tooltip-inline"
          : "item-tooltip-trigger"
      }
      role="group"
      aria-label={item.name}
      aria-describedby={open ? id : undefined}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") show();
      }}
      onPointerLeave={hide}
      onFocusCapture={(e) => {
        if (!(e.target as HTMLElement).closest("[data-tooltip-toggle]")) show();
      }}
      onBlurCapture={hide}
    >
      {children}
      <button
        type="button"
        className="item-tooltip-toggle"
        data-tooltip-toggle
        aria-describedby={open ? id : undefined}
        aria-label={t("Ver prévia de {0}", [item.name])}
        aria-expanded={open}
        onClick={() => {
          cancel();
          setOpen(!open);
        }}
      >
        ⓘ
      </button>
      {open &&
        createPortal(
          <div
            id={id}
            ref={panel}
            role="tooltip"
            className="item-hover-tooltip"
            data-rarity={itemRarity(item)}
            style={position}
            onPointerEnter={cancel}
            onPointerLeave={hide}
          >
            <strong className="item-tooltip-name">{item.name}</strong>
            <div className="item-tooltip-kind">
              <span>{categoriesOf(item)[0]?.name}</span>
              {item.rarity ? (
                <span className="item-tooltip-rarity">{item.rarity.name}</span>
              ) : null}
            </div>
            {item.attunement ? (
              <p className="item-tooltip-muted">
                {t("Sintonização")}:{" "}
                {t("Necessária; consulte os requisitos na descrição.")}
              </p>
            ) : null}
            {item.armor_class ? (
              <p>
                {t("Classe de armadura")}: {item.armor_class.base}
                {item.armor_class.dex_bonus ? " + " + t("Destreza") : ""}
                {item.armor_class.dex_bonus &&
                item.armor_class.max_bonus != null
                  ? " (" + t("máximo {0}", [item.armor_class.max_bonus]) + ")"
                  : ""}
              </p>
            ) : null}
            {item.damage ? (
              <p>
                {item.damage.damage_dice} {item.damage.damage_type.name}
              </p>
            ) : null}
            {item.two_handed_damage ? (
              <p>
                {t("Duas mãos")}: {item.two_handed_damage.damage_dice}
              </p>
            ) : null}
            {item.properties?.length ? (
              <p className="item-tooltip-muted">
                {item.properties.map((p) => p.name).join(", ")}
              </p>
            ) : null}
            {item.range ? (
              <p>
                {t("Alcance")}: {item.range.normal}
                {item.range.long ? "/" + item.range.long : ""} {t("pés")}
              </p>
            ) : null}
            {item.str_minimum ? (
              <p>
                {t("Força mínima")}: {item.str_minimum}
              </p>
            ) : null}
            {item.stealth_disadvantage ? (
              <p>
                {t("Furtividade")}: {t("Desvantagem")}
              </p>
            ) : null}
            <div className="item-tooltip-description">
              <RulesText
                text={[
                  ...(item.desc || []),
                  ...(item.description || []),
                  ...(item.notes || []),
                ].join("\n\n")}
              />
            </div>
            {item.weight !== undefined ? (
              <p className="item-tooltip-muted">
                {t("Peso")}: {item.weight} {t("lb")}
              </p>
            ) : null}
            {item.cost ? (
              <p>
                {t("Preço de referência")}: {item.cost.quantity}{" "}
                {(
                  {
                    cp: t("cobre"),
                    sp: t("prata"),
                    ep: t("electro"),
                    gp: t("ouro"),
                    pp: t("platina"),
                  } as Record<string, string>
                )[item.cost.unit] || item.cost.unit}
              </p>
            ) : null}
          </div>,
          document.body,
        )}
    </Tag>
  );
}
