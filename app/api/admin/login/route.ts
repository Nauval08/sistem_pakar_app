import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { createSession, verifyPassword } from "@/lib/auth"

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}))
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib" }, { status: 400 })
  }
  const rows = await sql<{ id: string; email: string; password_hash: string; is_admin: boolean }[]> /* sql */`
    select id, email, password_hash, coalesce(is_admin, false) as is_admin
    from users where email = ${email} limit 1
  `
  const user = rows[0]
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await createSession(user.id)
  return NextResponse.json({ ok: true })
}
