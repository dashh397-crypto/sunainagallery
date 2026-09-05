import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const vaultsTable = pgTable(
  "vaults",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    inviteCode: text("invite_code").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    inviteCodeIdx: uniqueIndex("vaults_invite_code_idx").on(table.inviteCode),
  }),
);

export const vaultMembersTable = pgTable(
  "vault_members",
  {
    id: serial("id").primaryKey(),
    vaultId: integer("vault_id")
      .notNull()
      .references(() => vaultsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    vaultUserIdx: uniqueIndex("vault_members_vault_user_idx").on(
      table.vaultId,
      table.userId,
    ),
  }),
);

export const insertVaultSchema = createInsertSchema(vaultsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertVault = z.infer<typeof insertVaultSchema>;
export type Vault = typeof vaultsTable.$inferSelect;
export type VaultMember = typeof vaultMembersTable.$inferSelect;