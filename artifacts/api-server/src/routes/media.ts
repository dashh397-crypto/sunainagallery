import { and, desc, eq, ilike } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateMediaBody,
  CreateMediaResponse,
  DeleteMediaParams,
  ListMediaQueryParams,
  ListMediaResponse,
} from "@workspace/api-zod";
import { db, mediaItemsTable } from "@workspace/db";
import { AuthenticatedRequest, requireAuth } from "../lib/auth";
import { getUserVault } from "../lib/vaults";

const router: IRouter = Router();

function toMediaResponse(item: typeof mediaItemsTable.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    kind: item.kind,
    contentType: item.contentType,
    sizeBytes: item.sizeBytes,
    objectPath: item.objectPath,
    uploadedBy: item.uploadedBy,
    createdAt: item.createdAt,
    url: `/api/storage${item.objectPath}`,
  };
}

router.get("/media", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;
  const vault = await getUserVault(userId);
  if (!vault) {
    res.json([]);
    return;
  }
  const parsed = ListMediaQueryParams.safeParse(req.query);
  const type = parsed.success ? parsed.data.type : "all";
  const search = parsed.success ? parsed.data.search : undefined;
  const filters = [eq(mediaItemsTable.vaultId, vault.id)];
  if (type !== "all") filters.push(eq(mediaItemsTable.kind, type));
  const items = await db
    .select()
    .from(mediaItemsTable)
    .where(search ? and(...filters, ilike(mediaItemsTable.name, `%${search}%`)) : and(...filters))
    .orderBy(desc(mediaItemsTable.createdAt));
  res.json(ListMediaResponse.parse(items.map(toMediaResponse)));
});

router.post("/media", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;
  const vault = await getUserVault(userId);
  if (!vault) {
    res.status(400).json({ error: "Create or join a vault first" });
    return;
  }
  const parsed = CreateMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid media metadata" });
    return;
  }
  if (!parsed.data.objectPath.startsWith("/objects/")) {
    res.status(400).json({ error: "Invalid private object path" });
    return;
  }
  const [item] = await db
    .insert(mediaItemsTable)
    .values({
      vaultId: vault.id,
      uploadedBy: userId,
      name: parsed.data.name,
      kind: parsed.data.kind,
      contentType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
      objectPath: parsed.data.objectPath,
    })
    .returning();
  res.status(201).json(CreateMediaResponse.parse(toMediaResponse(item)));
});

router.delete("/media/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;
  const params = DeleteMediaParams.safeParse(req.params);
  const vault = await getUserVault(userId);
  if (!params.success || !vault) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  const [deleted] = await db
    .delete(mediaItemsTable)
    .where(and(eq(mediaItemsTable.id, params.data.id), eq(mediaItemsTable.vaultId, vault.id)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;