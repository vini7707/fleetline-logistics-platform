import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z
    .string()
    .min(1)
    .default("mongodb://127.0.0.1:27017/logistics_dev"),
  JWT_ACCESS_SECRET: z.string().min(32).optional(),
});
// Fail early with a readable message instead of starting with a broken configuration.
export const env = envSchema.parse(process.env);
if (env.NODE_ENV === "production" && !env.JWT_ACCESS_SECRET)
  throw new Error("JWT_ACCESS_SECRET is required in production");
