import { sql } from "./db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import crypto from "crypto"

const SESSION_COOKIE = "session_token"
const SESSION_TTL_HOURS = 24

export type AdminUser = {
  id: string
  email: string
  name: string | null
  is_admin: boolean
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(24).toString("hex")
  const expires_at = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000)
  await sql /* sql */`
    insert into sessions (user_id, token, created_at, expires_at)
    values (${userId}, ${token}, now(), ${expires_at.toISOString()})
  `
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expires_at,
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await sql /* sql */`delete from sessions where token = ${token}`
    cookieStore.delete(SESSION_COOKIE)
  }
}

export async function getSessionUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const rows = await sql<
    {
      id: string
      email: string
      name: string | null
      is_admin: boolean
    }[]
  > /* sql */`
    select u.id, u.email, u.name, coalesce(u.is_admin, false) as is_admin
    from users u
    join sessions s on s.user_id = u.id
    where s.token = ${token}
      and (s.expires_at is null or s.expires_at > now())
    limit 1
  `
  return rows[0] ?? null
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getSessionUser()
  if (!user || !user.is_admin) {
    throw new Error("Unauthorized")
  }
  return user
}
