import {
  readDatabase,
  transientDatabaseError,
} from "@/domain/database-transport";
import { randomInt } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { authConfigured, getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { characters, characterInventories } from "@/server/db/schema";
import { getInventory } from "@/lib/inventory";
import { canonicalItems } from "@/lib/items";
import {
  applyInventoryCommand,
  emptyInventory,
  inventoryCommandSchema,
} from "@/domain/inventory";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const headers = { "Cache-Control": "private, no-store" };
async function owned(request: Request, id: string) {
  if (!authConfigured)
    return {
      error: Response.json(
        { error: "Acesso às contas em preparação." },
        { status: 503, headers },
      ),
    };
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session)
    return {
      error: Response.json(
        { error: "Entre para acessar seus personagens." },
        { status: 401, headers },
      ),
    };
  const [row] = await readDatabase(() =>
    getDb()
      .select()
      .from(characters)
      .where(
        and(eq(characters.id, id), eq(characters.userId, session.user.id)),
      ),
  );
  if (!row)
    return {
      error: Response.json(
        { error: "Personagem não encontrado." },
        { status: 404, headers },
      ),
    };
  return { row };
}
async function readInventory(request: Request, { params }: Context) {
  const { id } = await params;
  const result = await owned(request, id);
  if (result.error) return result.error;
  return Response.json(await getInventory(id, result.row!.draft), { headers });
}
async function updateInventory(request: Request, { params }: Context) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json(
      { error: "Origem inválida." },
      { status: 403, headers },
    );
  const { id } = await params;
  const result = await owned(request, id);
  if (result.error) return result.error;
  const draft = result.row!.draft;
  let parsed;
  try {
    const raw = await request.text();
    if (raw.length > 3000)
      return Response.json(
        { error: "Dados muito grandes." },
        { status: 413, headers },
      );
    parsed = inventoryCommandSchema.safeParse(JSON.parse(raw));
  } catch {
    return Response.json(
      { error: "Dados inválidos." },
      { status: 400, headers },
    );
  }
  if (!parsed.success)
    return Response.json(
      { error: "Revise os dados do inventário." },
      { status: 400, headers },
    );
  const db = getDb();
  // Only the owner may initialize storage; concurrent first writes converge on one row.
  await db
    .insert(characterInventories)
    .values({
      characterId: id,
      state: emptyInventory(draft),
      revision: 0,
      updatedAt: new Date(),
    })
    .onConflictDoNothing();
  const current = await getInventory(id, draft);
  if (parsed.data.revision !== current.revision)
    return Response.json(
      {
        error:
          "O inventário mudou em outra janela. Recarregue e tente novamente.",
      },
      { status: 409, headers },
    );
  let next;
  try {
    next = applyInventoryCommand(
      current.state,
      parsed.data,
      draft,
      canonicalItems,
      (sides) => randomInt(1, sides + 1),
    );
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Não foi possível atualizar o inventário.",
      },
      { status: 400, headers },
    );
  }
  const updated = await db
    .update(characterInventories)
    .set({
      state: next.state,
      revision: current.revision + 1,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(characterInventories.characterId, id),
        eq(characterInventories.revision, current.revision),
      ),
    )
    .returning({ revision: characterInventories.revision });
  if (!updated.length)
    return Response.json(
      {
        error:
          "O inventário mudou em outra janela. Recarregue e tente novamente.",
      },
      { status: 409, headers },
    );
  return Response.json(
    {
      state: next.state,
      revision: updated[0].revision,
      recovered: next.recovered,
    },
    { headers },
  );
}

async function respond(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    const sessionFailure = error as {
      statusCode?: number;
      body?: { code?: string };
    };
    if (
      !transientDatabaseError(error) &&
      !(
        sessionFailure?.statusCode === 500 &&
        sessionFailure?.body?.code === "FAILED_TO_GET_SESSION"
      )
    )
      throw error;
    return Response.json(
      {
        error:
          "A conexão com o banco foi interrompida. Recarregue o inventário para conferir se a alteração foi salva antes de tentar novamente.",
      },
      { status: 503, headers },
    );
  }
}
export async function GET(request: Request, context: Context) {
  return respond(() => readInventory(request, context));
}
export async function POST(request: Request, context: Context) {
  return respond(() => updateInventory(request, context));
}
