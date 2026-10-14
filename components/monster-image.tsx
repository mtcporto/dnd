"use client";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
export function MonsterImage({
  src,
  name,
  priority = false,
  eager = false,
}: {
  src?: string;
  name: string;
  priority?: boolean;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const { t } = useI18n();
  if (!src || failed)
    return (
      <div className="monster-image-placeholder">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <path
            d="M40 8 68 24v32L40 72 12 56V24Z M40 8v64 M12 24l56 32 M68 24 12 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span>{t("Imagem não disponível")}</span>
      </div>
    );
  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
      unoptimized
      loading={eager ? "eager" : undefined}
      preload={priority}
      onError={() => setFailed(true)}
    />
  );
}
