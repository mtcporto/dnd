import { redirect } from "next/navigation";
import { googleEnabled } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { GoogleSignIn } from "@/components/google-sign-in";
export const metadata = { title: "Entrar" };
export default async function Page() {
  if (await getSession()) redirect("/personagens");
  return (
    <main id="main" className="page sign-in">
      <p className="eyebrow">Sua conta, suas histórias</p>
      <h1>
        Leve seus personagens
        <br />
        para a próxima aventura.
      </h1>
      <p>
        Entre para salvar seus rascunhos e acessar suas fichas em outros
        dispositivos.
      </p>
      {googleEnabled ? (
        <GoogleSignIn />
      ) : (
        <div className="notice">
          <h2>Acesso às contas em preparação</h2>
          <p>
            Você já pode experimentar a criação de personagens e baixar seus
            rascunhos. O login ficará disponível quando o acesso às contas for
            ativado.
          </p>
          <a href="/personagens/novo" className="button secondary">
            Experimentar a criação
          </a>
        </div>
      )}
    </main>
  );
}
