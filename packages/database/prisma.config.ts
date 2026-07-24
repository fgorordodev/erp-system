import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "node:path";

config({
  path: resolve(__dirname, "../../.env"),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
