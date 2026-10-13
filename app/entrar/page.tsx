import { getI18n } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { googleEnabled } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { GoogleSignIn } from "@/components/google-sign-in";
import { IllustratedBackdrop } from "@/components/illustrated-backdrop";
import Link from "next/link";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("Entrar") };
}
export default async function Page() {
  const { t, l } = await getI18n();

  if (await getSession()) redirect("/personagens");
  return (
    <main id="main" className="character-space login-page">
      <section className="login-hero" aria-labelledby="login-title">
        <div className="login-copy">
          <p className="stage-kicker">{t("Sua conta, suas histórias")}</p>
          <h1 id="login-title">
            {t(" Toda história merece")}
            <br />
            {t(" um próximo ")}
            <em>{t("capítulo.")}</em>
          </h1>
          <p className="login-description">
            {t(
              " Entre para salvar seus personagens e reencontrar suas fichas, origens e histórias em qualquer dispositivo. ",
            )}
          </p>
          <div className="login-actions">
            {l(
              googleEnabled ? (
                <GoogleSignIn />
              ) : (
                <div className="notice">
                  <h2>{t("Acesso às contas em preparação")}</h2>
                  <p>
                    {t(
                      "Enquanto isso, você pode criar seu personagem e baixar o rascunho.",
                    )}
                  </p>
                </div>
              ),
            )}
            <Link href="/personagens/novo" className="adventure-home-secondary">
              {t(" Explorar sem entrar ")}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="login-note">
            {t("Um lugar para guardar os aventureiros que você criou.")}
          </p>
        </div>
        <IllustratedBackdrop
          image="/images/heroes/adventurers-campfire-wide.webp"
          mobileImage="/images/heroes/adventurers-campfire.webp"
          caption={t("Histórias que começam ao redor de uma fogueira.")}
        />
      </section>
    </main>
  );
}
