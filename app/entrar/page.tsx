import { redirect } from "next/navigation";
import { googleEnabled } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { GoogleSignIn } from "@/components/google-sign-in";
import { CampfireBackdrop } from "@/components/campfire-backdrop";
import Link from "next/link";
export const metadata = { title: "Entrar" };
export default async function Page() {
  if (await getSession()) redirect("/personagens");
  return (
    <main id="main" className="character-space login-page">
      <section className="login-hero" aria-labelledby="login-title">
        <div className="login-copy">
          <p className="stage-kicker">Sua conta, suas histórias</p>
          <h1 id="login-title">
            Toda história merece<br />
            um próximo <em>capítulo.</em>
          </h1>
          <p className="login-description">
            Entre para salvar seus personagens e reencontrar suas fichas,
            origens e histórias em qualquer dispositivo.
          </p>
          <div className="login-actions">
            {googleEnabled ? (
              <GoogleSignIn />
            ) : (
              <div className="notice">
                <h2>Acesso às contas em preparação</h2>
                <p>Enquanto isso, você pode criar seu personagem e baixar o rascunho.</p>
              </div>
            )}
            <Link href="/personagens/novo" className="adventure-home-secondary">
              Explorar sem entrar <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="login-note">Um lugar para guardar os aventureiros que você criou.</p>
        </div>
        <CampfireBackdrop />
      </section>
    </main>
  );
}
