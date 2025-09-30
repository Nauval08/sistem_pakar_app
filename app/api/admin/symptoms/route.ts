import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  await requireAdmin()
  const rows = await sql /* sql */`select id, name, type, help from symptoms order by id asc`
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  await requireAdmin()
  const ct = req.headers.get("content-type") || ""
  let body: any
  if (ct.includes("application/json")) {
    body = await req.json().catch(() => ({}))
  } else {
    const form = await req.formData()
    body = Object.fromEntries(form.entries())
  }
  const id = String(body.id ?? "").trim()
  const name = String(body.name ?? "").trim()
  const type = body.type === "severity" ? "severity" : "boolean"
  const help = body.help ? String(body.help) : null
  if (!id || !name) return NextResponse.json({ error: "id dan name wajib" }, { status: 400 })
  await sql /* sql */`insert into symptoms (id, name, type, help) values (${id}, ${name}, ${type}, ${help})`
  return NextResponse.redirect(new URL("/admin/symptoms", "http://localhost"))
}
