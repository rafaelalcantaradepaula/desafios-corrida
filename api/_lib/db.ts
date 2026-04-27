import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./env.js";

let sqlClient: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!sqlClient) {
    sqlClient = neon(getDatabaseUrl());
  }

  return sqlClient;
}
