import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
const memoryDb = await MongoMemoryServer.create({ instance: { port: 27018 } });
process.env.NODE_ENV ??= "development";
process.env.MONGODB_URI = memoryDb.getUri("logistics_dev");
process.env.JWT_ACCESS_SECRET ??= randomBytes(32).toString("base64url");
process.env.WEB_ORIGIN ??= "http://127.0.0.1:5173";
const { Organization, User } = await import("../models/index.js");
await mongoose.connect(process.env.MONGODB_URI);
const organization = await Organization.create({
  name: "Fleetline Demo",
  slug: `fleetline-demo-${randomBytes(3).toString("hex")}`,
});
const email = `admin-${randomBytes(3).toString("hex")}@fleetline.local`;
const password = randomBytes(15).toString("base64url");
await User.create({
  organizationId: organization._id,
  name: "Demo Administrator",
  email,
  passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
  role: "ADMIN",
});
await mongoose.disconnect();
console.log(`Temporary demo login — email: ${email} | password: ${password}`);
console.log(`MongoDB Compass URI: ${memoryDb.getUri("logistics_dev")}`);
console.log(
  "This database is in memory and will be erased when this process stops.",
);
await import("../server.js");
async function shutdown() {
  await memoryDb.stop();
  process.exit(0);
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
