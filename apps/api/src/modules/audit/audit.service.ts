import { AuditLog } from "../../models/index.js";
import type { Request } from "express";
export async function audit(
  req: Request,
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
) {
  if (!req.auth) return;
  await AuditLog.create({
    organizationId: req.auth.organizationId,
    userId: req.auth.userId,
    action,
    resourceType,
    resourceId,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    requestId: req.requestId,
    metadata,
  });
}
