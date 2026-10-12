import { authConfigured, getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { characters } from "@/server/db/schema";
import { draftInputSchema, deriveDraft } from "@/domain/character";
import { catalogue } from "@/lib/catalogue";
import { eq, desc } from "drizzle-orm";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!authConfigured)
    return Response.json({ error: "Acesso às contas em preparação." }, { status: 503 });
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session)
    return Response.json(
      { error: "Entre para acessar seus personagens." },
      { status: 401 },
    );
  const rows = await getDb()
    .select()
    .from(characters)
    .where(eq(characters.userId, session.user.id))
    .orderBy(desc(characters.updatedAt));
  return Response.json(rows, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin)
    return Response.json({ error: "Origem inválida." }, { status: 403 });
  if (!authConfigured)
    return Response.json({ error: "Acesso às contas em preparação." }, { status: 503 });
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session)
    return Response.json(
      { error: "Entre para salvar seu personagem." },
      { status: 401 },
    );
  try {
    const raw = await request.text();
    if (raw.length > 12000)
      return Response.json({ error: "Ficha muito grande." }, { status: 413 });
    const parsed = draftInputSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return Response.json(
        { error: "Revise os dados da ficha." },
        { status: 400 },
      );
    const draft = deriveDraft(parsed.data, catalogue),
      id = crypto.randomUUID(),
      now = new Date();
    await getDb()
      .insert(characters)
      .values({
        id,
        userId: session.user.id,
        name: parsed.data.name,
        draft,
        createdAt: now,
        updatedAt: now,
      });
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof SyntaxError
            ? "Dados inválidos."
            : error instanceof Error && /Escolha|matriz/.test(error.message)
              ? error.message
              : "Não foi possível salvar a ficha.",
      },
      {
        status:
          error instanceof SyntaxError ||
          (error instanceof Error && /Escolha|matriz/.test(error.message))
            ? 400
            : 500,
      },
    );
  }
}
