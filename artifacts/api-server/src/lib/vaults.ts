import { and, eq } from "drizzle-orm";
import { db, vaultMembersTable, vaultsTable } from "@workspace/db";
import { clerkClient } from "./auth";

export type VaultRole = "admin" | "member";

export async function getUserMembership(userId: string) {
  const [membership] = await db
    .select({ vault: vaultsTable, member: vaultMembersTable })
    .from(vaultMembersTable)
    .innerJoin(vaultsTable, eq(vaultMembersTable.vaultId, vaultsTable.id))
    .where(eq(vaultMembersTable.userId, userId))
    .limit(1);
  return membership ?? null;
}

export async function getUserVault(userId: string) {
  return (await getUserMembership(userId))?.vault ?? null;
}

export async function isBootstrapAdmin(userId: string): Promise<boolean> {
  const user = await clerkClient.users.getUser(userId);
  return user.username?.toLowerCase() === "admin";
}

export async function isVaultAdmin(userId: string, vaultId: number): Promise<boolean> {
  const [member] = await db
    .select({ role: vaultMembersTable.role })
    .from(vaultMembersTable)
    .where(
      and(
        eq(vaultMembersTable.vaultId, vaultId),
        eq(vaultMembersTable.userId, userId),
      ),
    )
    .limit(1);
  return member?.role === "admin";
}

export async function isVaultMember(vaultId: number, userId: string) {
  const [member] = await db
    .select({ id: vaultMembersTable.id })
    .from(vaultMembersTable)
    .where(
      and(
        eq(vaultMembersTable.vaultId, vaultId),
        eq(vaultMembersTable.userId, userId),
      ),
    )
    .limit(1);
  return Boolean(member);
}

export async function getVaultResponse(vaultId: number, currentUserId: string) {
  const [vault] = await db
    .select()
    .from(vaultsTable)
    .where(eq(vaultsTable.id, vaultId))
    .limit(1);
  if (!vault) return null;

  const members = await db
    .select()
    .from(vaultMembersTable)
    .where(eq(vaultMembersTable.vaultId, vaultId));

  return {
    id: vault.id,
    name: vault.name,
    inviteCode: vault.inviteCode,
    createdAt: vault.createdAt,
    members: members.map((member, index) => ({
      id: member.userId,
      name: member.userId === currentUserId ? "You" : index === 1 ? "Your partner" : "Member",
      email: member.userId === currentUserId ? "Your account" : "Private member",
      role: member.role as VaultRole,
      isCurrentUser: member.userId === currentUserId,
    })),
  };
}