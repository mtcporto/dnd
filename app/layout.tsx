import { getI18n } from "@/lib/i18n/server";
import { getSession } from "@/lib/session";
import { googleEnabled } from "@/lib/auth";
import { AccountMenu } from "@/components/account-menu";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/client";
import { LocaleSwitcher } from "@/components/locale-switcher";
export async function generateMetadata() {
  const { t } = await getI18n();
  return {
    title: { default: t("D&D Aventuras"), template: t("%s · D&D Aventuras") },
    description: t(
      "Crie seu personagem e prepare sua próxima aventura com as regras revisadas de D&D 5e.",
    ),
  };
}
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, l, locale, dictionary } = await getI18n();

  const session = await getSession();
  return (
    <html lang={locale === "pt" ? "pt-BR" : locale}>
      <body>
        <I18nProvider locale={locale} dictionary={dictionary}>
          <a className="skip-link" href="#main">
            {t(" Ir para o conteúdo ")}
          </a>
          <header className="site-header">
            <a className="brand" href="/">
              <span className="brand-die">20</span>
              <span>
                {t(" D&D ")}
                <b>{t("Aventuras")}</b>
              </span>
            </a>
            <nav aria-label={t("Principal")}>
              <a href="/personagens">{t("Personagens")}</a>
              <a href="/regras">{t("Compêndio")}</a>
              <a href="/bestiario">{t("Bestiário")}</a>
            </nav>
            <LocaleSwitcher />
            <AccountMenu
              name={session?.user.name}
              googleEnabled={googleEnabled}
            />
          </header>
          {children}
          <footer className="site-footer">
            <span>{t("D&D Aventuras · Regras de 2024")}</span>
            <span>
              {t(" Conteúdo baseado no")}
              {l(" ")}
              <a href="https://www.dndbeyond.com/srd">{t("SRD 5.2.1")}</a>{" "}
              {t(" de Wizards of the Coast · CC BY 4.0. Dados de")}
              {l(" ")}
              <a href="https://www.dnd5eapi.co/">{t("5e-bits")}</a>.
            </span>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
