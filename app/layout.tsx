import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { googleEnabled } from "@/lib/auth";
import { AccountMenu } from "@/components/account-menu";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "D&D Aventuras", template: "%s · D&D Aventuras" },
  description:
    "Crie seu personagem e prepare sua próxima aventura com as regras revisadas de D&D 5e.",
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#main">
          Ir para o conteúdo
        </a>
        <header className="site-header">
          <a className="brand" href="/">
            <span className="brand-die">20</span>
            <span>
              D&D <b>Aventuras</b>
            </span>
          </a>
          <nav aria-label="Principal">
            <a href="/personagens">Personagens</a>
            <a href="/regras">Compêndio</a>
          </nav>
          <AccountMenu
            name={session?.user.name}
            googleEnabled={googleEnabled}
          />
        </header>
        {children}
        <footer className="site-footer">
          <span>D&D Aventuras · Regras de 2024</span>
          <span>
            Conteúdo baseado no{" "}
            <a href="https://www.dndbeyond.com/srd">SRD 5.2.1</a> de Wizards of
            the Coast · CC BY 4.0. Dados de{" "}
            <a href="https://www.dnd5eapi.co/">5e-bits</a>.
          </span>
        </footer>
      </body>
    </html>
  );
}
