import argon2 from "argon2";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Organization, User } from "../models/index.js";
const [orgName, email, password] = process.argv.slice(2);
if (!orgName || !email || !password || password.length < 16) {
  console.error(
    'Usage: npm run seed:admin -w @logistics/api -- "Organization name" admin@example.com "at-least-16-char-password"',
  );
  process.exit(1);
}
await mongoose.connect(env.MONGODB_URI);
const slug = orgName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
let org = await Organization.findOne({ slug });
if (!org) org = await Organization.create({ name: orgName, slug });
const existing = await User.findOne({
  organizationId: org._id,
  email: email.toLowerCase(),
});
if (existing) {
  console.error(
    "An account with that email already exists in this organization",
  );
  await mongoose.disconnect();
  process.exit(1);
}
const user = await User.create({
  organizationId: org._id,
  name: "Organization Administrator",
  email,
  passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
  role: "ADMIN",
});
console.log(`Created organization ${org.name} and admin ${user.email}`);
await mongoose.disconnect();
