import crypto from "node:crypto";
import { and, count, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateVaultBody,
  CreateVaultResponse,
  GetVaultResponse,
  GetVaultSummaryResponse,
} from "@workspace/api-zod";
import {
  db,
  mediaItemsTable,
  vaultMembersTable,
  vaultsTable,
} from "@workspace/db";
import { AuthenticatedRequest, requireAuth } from "../lib/auth";
import { getUserVault, getVaultResponse, isBootstrapAdmin } from "../lib/vaults";

const router: IRouter = Router();

function createInviteCode(): string {
  return crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

router.get("/vault", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;
  let vault = await getUserVault(userId);
  if (!vault && (await isBootstrapAdmin(userId))) {
    let inviteCode = createInviteCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const [existing] = await db
        .select({ id: vaultsTable.id })
        .from(vaultsTable)
        .where(eq(vaultsTable.inviteCode, inviteCode))
        .limit(1);
      if (!existing) break;
      inviteCode = createInviteCode();
    }
    const [createdVault] = await db
      .insert(vaultsTable)
      .values({ name: "Our little world", inviteCode })
      .returning();
    await db.insert(vaultMembersTable).values({
      vaultId: createdVault.id,
      userId,
      role: "admin",
    });
    vault = createdVault;
  }
  if (!vault) {
    res.status(404).json({ error: "No vault found" });
    return;
  }
  res.json(GetVaultResponse.parse(await getVaultResponse(vault.id, userId)));
});

router.post("/vault", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!(await isBootstrapAdmin(userId))) {
    res.status(403).json({ error: "Vault access is managed by the admin" });
    return;
  }
  const parsed = CreateVaultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a vault name" });
    return;
  }
  if (await getUserVault(userId)) {
    res.status(409).json({ error: "You already belong to a vault" });
    return;
  }

  let inviteCode = createInviteCode();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const [existing] = await db
      .select({ id: vaultsTable.id })
      .from(vaultsTable)
      .where(eq(vaultsTable.inviteCode, inviteCode))
      .limit(1);
    if (!existing) break;
    inviteCode = createInviteCode();
  }

  const [vault] = await db
    .insert(vaultsTable)
    .values({ name: parsed.data.name.trim(), inviteCode })
    .returning();
  await db.insert(vaultMembersTable).values({ vaultId: vault.id, userId, role: "admin" });
  res.status(201).json(CreateVaultResponse.parse(await getVaultResponse(vault.id, userId)));
});

router.post("/vault/join", requireAuth, async (req, res): Promise<void> => {
  res.status(403).json({ error: "Vault access is managed by the admin" });
});

router.get("/vault/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;
  const vault = await getUserVault(userId);
  if (!vault) {
    res.status(404).json({ error: "No vault found" });
    return;
  }

  const [photoCount] = await db
    .select({ value: count() })
    .from(mediaItemsTable)
    .where(and(eq(mediaItemsTable.vaultId, vault.id), eq(mediaItemsTable.kind, "image")));
  const [videoCount] = await db
    .select({ value: count() })
    .from(mediaItemsTable)
    .where(and(eq(mediaItemsTable.vaultId, vault.id), eq(mediaItemsTable.kind, "video")));
  const items = await db
    .select()
    .from(mediaItemsTable)
    .where(eq(mediaItemsTable.vaultId, vault.id))
    .orderBy(mediaItemsTable.createdAt);
  const latest = items.at(-1);

  res.json(
    GetVaultSummaryResponse.parse({
      photoCount: Number(photoCount?.value ?? 0),
      videoCount: Number(videoCount?.value ?? 0),
      totalBytes: items.reduce((sum, item) => sum + item.sizeBytes, 0),
      latestUpload: latest
        ? {
            id: latest.id,
            name: latest.name,
            kind: latest.kind,
            contentType: latest.contentType,
            sizeBytes: latest.sizeBytes,
            objectPath: latest.objectPath,
            uploadedBy: latest.uploadedBy,
            createdAt: latest.createdAt,
            url: `/api/storage${latest.objectPath}`,
          }
        : null,
    }),
  );
});

export default router;