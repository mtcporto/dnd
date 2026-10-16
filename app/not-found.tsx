import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/image-assets";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();

  return (
    <main id="main" className="character-space login-page lost-page">
      <section className="login-hero lost-hero" aria-labelledby="lost-title">
        <div className="login-art" aria-hidden="true">
          <Image
            src={imageUrl("/images/heroes/lost-in-the-hoard-wide.webp")}
            alt=""
            fill
            sizes="100vw"
            preload
          />
        </div>
        <div className="login-copy">
          <p className="stage-kicker">404</p>
          <h1 id="lost-title">{t("Esta página não foi encontrada.")}</h1>
          <p className="login-description">
            {t("Volte aos personagens para continuar.")}
          </p>
          <div className="login-actions">
            <Link href="/personagens" className="button primary">
              {t(" Meus personagens ")}
            </Link>
            <Link href="/" className="adventure-home-secondary">
              {t("← D&D Aventuras")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
