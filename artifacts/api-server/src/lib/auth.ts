import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import type { NextFunction, Request, Response } from "express";

export type AuthenticatedRequest = Request & { userId: string };
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export function getCurrentUserId(req: Request): string | null {
  return getAuth(req).userId ?? null;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = getCurrentUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as AuthenticatedRequest).userId = userId;
  next();
}