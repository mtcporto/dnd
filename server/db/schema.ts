import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
  real,
} from "drizzle-orm/sqlite-core";
import type { CharacterDraft } from "../../domain/character.ts";
import type { Catalogue } from "../../domain/character.ts";

import type { Monster } from "../../domain/monster.ts";

export const bestiaryEntries = sqliteTable("bestiary_entries", {
  edition: text("edition").notNull(),
  locale: text("locale").notNull(),
  monsterIndex: text("monster_index").notNull(),
  name: text("name").notNull(),
  canonicalName: text("canonical_name").notNull(),
  creatureType: text("creature_type").notNull(),
  creatureSize: text("creature_size").notNull(),
  challengeRating: real("challenge_rating").notNull(),
  payload: text("payload", {mode: "json"}).$type<Monster>().notNull(),
  sourceHash: text("source_hash").notNull(),
  updatedAt: integer("updated_at", {mode:"timestamp_ms"}).notNull(),
}, table => [primaryKey({columns:[table.edition,table.locale,table.monsterIndex]})]);

export const catalogueSnapshots = sqliteTable(
  "catalogue_snapshots",
  {
    edition: text("edition").notNull(),
    locale: text("locale").notNull(),
    payload: text("payload", { mode: "json" }).$type<Catalogue>().notNull(),
    sourceHash: text("source_hash").notNull(),
    sourceUrl: text("source_url").notNull(),
    translationModel: text("translation_model"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.edition, table.locale] })],
);
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_idx").on(table.userId)],
);
export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("account_user_idx").on(table.userId)],
);
export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
export const characters = sqliteTable(
  "characters",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    edition: text("edition").notNull().default("2024"),
    status: text("status").notNull().default("draft"),
    draft: text("draft", { mode: "json" }).$type<CharacterDraft>().notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("character_owner_idx").on(table.userId)],
);

export const bestiaryImageAssets = sqliteTable("bestiary_image_assets", {
  monsterIndex: text("monster_index").primaryKey(),
  sourceUrl: text("source_url").notNull(),
  objectKey: text("object_key").notNull(),
  publicUrl: text("public_url").notNull(),
  sha256: text("sha256").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  originalBytes: integer("original_bytes").notNull(),
  webpBytes: integer("webp_bytes").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const imageAssets = sqliteTable("image_assets", {
  sourcePath: text("source_path").primaryKey(),
  sourceUrl: text("source_url").notNull(),
  objectKey: text("object_key").notNull(),
  publicUrl: text("public_url").notNull(),
  sha256: text("sha256").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  originalBytes: integer("original_bytes").notNull(),
  webpBytes: integer("webp_bytes").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
