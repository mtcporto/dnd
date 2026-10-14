"use client";
import { imageUrl } from "@/lib/image-assets";

import { useI18n } from "@/lib/i18n/client";
import { localizeRecord } from "@/lib/i18n/shared";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { classOrder } from "@/lib/class-presentation";
import { classNames as base_classNames } from "@/lib/labels";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeToMotionPreference(callback: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getMotionPreference = () => window.matchMedia(reducedMotionQuery).matches;
const getServerMotionPreference = () => false;

const cards = [0, 1, 2];
const modulo = (value: number, length: number) =>
  ((value % length) + length) % length;
export function HomeCharacterCarousel() {
  const { t, l } = useI18n();
  const classNames = localizeRecord(base_classNames, t);

  const classes = classOrder.map((id) => ({ id, name: classNames[id] }));
  const [frame, setFrame] = useState({ turn: 0, previous: 0 });
  const [manualPaused, setManualPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const reduced = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const scene = useRef<HTMLDivElement>(null);
  const paused =
    manualPaused || hovered || focused || !visible || !pageVisible || !!reduced;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (scene.current) observer.observe(scene.current);
    const visibilityChanged = () => setPageVisible(!document.hidden);
    visibilityChanged();
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () =>
        setFrame((current) => ({
          turn: current.turn + 1,
          previous: current.turn,
        })),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [paused, frame.turn]);

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={scene}
        className="adventure-home-scene home-carousel"
        role="region"
        aria-roledescription={t("carrossel")}
        aria-label={t("Arquétipos de aventureiros")}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onFocusCapture={(event) =>
          setFocused(
            event.target instanceof Element &&
              !!event.target.closest(".home-carousel-card"),
          )
        }
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        <div className="home-scene-halo" aria-hidden="true" />
        <div className="home-carousel-orbit">
          {l(
            cards.map((index) => {
              const slot = modulo(index - frame.turn, cards.length);
              const oldSlot = modulo(index - frame.previous, cards.length);
              const card =
                classes[
                  modulo(
                    frame.turn + (slot === 1 ? 1 : slot === 2 ? -1 : 0),
                    classes.length,
                  )
                ];
              const centered = slot === 0;
              const wraps = oldSlot !== 0 && slot !== 0 && oldSlot !== slot;
              const x = slot === 1 ? "-48%" : slot === 2 ? "48%" : "0%";
              return (
                <m.button
                  key={index}
                  type="button"
                  className="home-carousel-card"
                  data-slot={slot}
                  data-class={card.id}
                  aria-label={t("Destacar {0}", [card.name])}
                  aria-pressed={centered}
                  onClick={() => {
                    if (!centered)
                      setFrame((current) => ({
                        turn: current.turn + (slot === 1 ? 1 : -1),
                        previous: current.turn,
                      }));
                  }}
                  initial={false}
                  animate={{
                    x:
                      wraps && !reduced
                        ? [oldSlot === 1 ? "-48%" : "48%", "0%", x]
                        : x,
                    z:
                      wraps && !reduced ? [-85, -230, -85] : centered ? 0 : -85,
                    scale:
                      wraps && !reduced
                        ? [0.78, 0.63, 0.78]
                        : centered
                          ? 1
                          : 0.78,
                    rotateY: centered ? 0 : slot === 1 ? 18 : -18,
                    rotateZ: centered ? 0 : slot === 1 ? -3 : 3,
                    opacity: 1,
                  }}
                  style={{ zIndex: centered ? 3 : 1 }}
                  transition={{
                    duration: reduced ? 0 : 1.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <AnimatePresence initial={false} mode="wait">
                    <m.span
                      key={card.id}
                      className="home-carousel-image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.2 }}
                    >
                      <Image
                        src={imageUrl(`/images/classes/${card.id}.webp`)}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 65vw, 36vw"
                        preload={card.id === "fighter"}
                        draggable={false}
                      />
                    </m.span>
                  </AnimatePresence>
                </m.button>
              );
            }),
          )}
        </div>
        <div className="home-scene-caption home-carousel-caption">
          <span>
            {l(classes[modulo(frame.turn, classes.length)].name)}{" "}
            {t(" · Uma escolha. Muitas possibilidades. ")}
          </span>
          <span className="portrait-rule" aria-hidden="true" />
          {l(
            !reduced ? (
              <button
                type="button"
                className="home-carousel-pause"
                aria-pressed={manualPaused}
                onClick={() => setManualPaused((value) => !value)}
              >
                {l(manualPaused ? t("Retomar rotação") : t("Pausar rotação"))}
                <span aria-hidden="true">{l(manualPaused ? "▷" : "Ⅱ")}</span>
              </button>
            ) : null,
          )}
        </div>
      </div>
    </LazyMotion>
  );
}
