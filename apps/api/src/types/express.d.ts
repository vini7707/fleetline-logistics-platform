import type { Types } from "mongoose";
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        organizationId: string;
        role: string;
        sessionId: string;
      };
      requestId?: string;
    }
  }
}
export {};
