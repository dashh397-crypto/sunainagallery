import { and, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  ChangeAdminUserPasswordBody,
  ChangeOwnPasswordBody,
  CreateAdminUserBody,
  CreateAdminUserResponse,
  ListAdminUsersResponse,
} from "@workspace/api-zod";
import { db, vaultMembersTable } from "@workspace/db";
import { AuthenticatedRequest, clerkClient, requireAuth } from "../lib/auth";
import { getUserMembership, isVaultAdmin } from "../lib/vaults";

const router: IRouter = Router();

function accountResponse(user: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
}, role: "admin" | "member") {
  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Vault member",
    email: user.emailAddresses[0]?.emailAddress ?? "",
    username: user.username ?? "",
    role,
  };
}

async function adminContext(req: AuthenticatedRequest) {
  const membership = await getUserMembership(req.userId);
  if (!membership || !(await isVaultAdmin(req.userId, membership.vault.id))) {
    return null;
  }
  return membership;
}

router.get("/admin/users", requireAuth, async (req, res): Promise<void> => {
  const context = await adminContext(req as AuthenticatedRequest);
  if (!context) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  const members = await db
    .select()
    .from(vaultMembersTable)
    .where(eq(vaultMembersTable.vaultId, context.vault.id));
  const users = await Promise.all(
    members.map(async (member) => {
      const user = await clerkClient.users.getUser(member.userId);
      return accountResponse(user, member.role as "admin" | "member");
    }),
  );
  res.json(ListAdminUsersResponse.parse(users));
});

router.post("/admin/users", requireAuth, async (req, res): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const context = await adminContext(request);
  if (!context) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  const parsed = CreateAdminUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email, username, and password" });
    return;
  }
  const existingMembers = await db
    .select()
    .from(vaultMembersTable)
    .where(eq(vaultMembersTable.vaultId, context.vault.id));
  if (existingMembers.length >= 2) {
    res.status(409).json({ error: "This private room already has two seats" });
    return;
  }

  let createdUserId: string | null = null;
  try {
    const byEmail = await clerkClient.users.getUserList({
      emailAddress: [parsed.data.email.trim().toLowerCase()],
      limit: 1,
    });
    const byUsername = await clerkClient.users.getUserList({
      username: [parsed.data.username.trim()],
      limit: 1,
    });
    const emailUser = byEmail.data[0];
    const usernameUser = byUsername.data[0];
    if (emailUser && usernameUser && emailUser.id !== usernameUser.id) {
      res.status(409).json({ error: "That email and username belong to different accounts" });
      return;
    }
    const user = emailUser ?? usernameUser ?? await clerkClient.users.createUser({
      emailAddress: [parsed.data.email.trim().toLowerCase()],
      username: parsed.data.username.trim(),
      password: parsed.data.password,
    });
    createdUserId = user.id;
    if (user.id === request.userId) {
      res.status(400).json({ error: "Use a different account for the second seat" });
      return;
    }
    if (existingMembers.some((member) => member.userId === user.id)) {
      res.status(409).json({ error: "That account is already in this vault" });
      return;
    }
    await db.insert(vaultMembersTable).values({
      vaultId: context.vault.id,
      userId: user.id,
      role: "member",
    });
    res.status(201).json(CreateAdminUserResponse.parse(accountResponse(user, "member")));
  } catch {
    if (createdUserId && !existingMembers.some((member) => member.userId === createdUserId)) {
      try {
        await clerkClient.users.deleteUser(createdUserId);
      } catch {
        // Keep the original account-creation error response generic.
      }
    }
    res.status(400).json({ error: "We couldn't add that account. Check the details and try again." });
  }
});

router.delete("/admin/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const context = await adminContext(request);
  if (!context) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  const targetUserId = typeof req.params.userId === "string" ? req.params.userId : null;
  if (!targetUserId) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  if (targetUserId === request.userId) {
    res.status(400).json({ error: "The admin account cannot be deleted here" });
    return;
  }
  const [member] = await db
    .select()
    .from(vaultMembersTable)
    .where(
      and(
        eq(vaultMembersTable.vaultId, context.vault.id),
        eq(vaultMembersTable.userId, targetUserId),
      ),
    )
    .limit(1);
  if (!member) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  try {
    await clerkClient.users.deleteUser(targetUserId);
    await db.delete(vaultMembersTable).where(eq(vaultMembersTable.id, member.id));
    res.sendStatus(204);
  } catch {
    res.status(400).json({ error: "We couldn't delete that account" });
  }
});

router.patch("/admin/users/:userId/password", requireAuth, async (req, res): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const context = await adminContext(request);
  if (!context) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  const parsed = ChangeAdminUserPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Use a password with at least eight characters" });
    return;
  }
  const targetUserId = typeof req.params.userId === "string" ? req.params.userId : null;
  if (!targetUserId) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  const [member] = await db
    .select({ id: vaultMembersTable.id })
    .from(vaultMembersTable)
    .where(
      and(
        eq(vaultMembersTable.vaultId, context.vault.id),
        eq(vaultMembersTable.userId, targetUserId),
      ),
    )
    .limit(1);
  if (!member) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  try {
    await clerkClient.users.updateUser(targetUserId, {
      password: parsed.data.newPassword,
      signOutOfOtherSessions: true,
    });
    res.sendStatus(204);
  } catch {
    res.status(400).json({ error: "That password was not accepted. Try a stronger one." });
  }
});

router.patch("/account/password", requireAuth, async (req, res): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const parsed = ChangeOwnPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter your current password and a new password" });
    return;
  }
  try {
    await clerkClient.users.verifyPassword({
      userId: request.userId,
      password: parsed.data.currentPassword,
    });
    await clerkClient.users.updateUser(request.userId, {
      password: parsed.data.newPassword,
      signOutOfOtherSessions: true,
    });
    res.sendStatus(204);
  } catch {
    res.status(400).json({ error: "Your current password was not accepted" });
  }
});

export default router;