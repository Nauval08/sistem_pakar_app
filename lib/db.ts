import { neon } from "@neondatabase/serverless"

declare global {
  // eslint-disable-next-line no-var
  var __neon_sql__: ReturnType<typeof neon> | undefined
}

export const sql = globalThis.__neon_sql__ ?? neon(process.env.DATABASE_URL as string)

if (!globalThis.__neon_sql__) {
  globalThis.__neon_sql__ = sql
}
