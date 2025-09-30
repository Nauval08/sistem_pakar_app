import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  await requireAdmin()
  const rows = await sql /* sql */`
    select id, name, serious, description, recommendation from diseases order by id asc
  `
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
  const serious = String(body.serious ?? "false") === "true"
  const description = body.description ? String(body.description) : null
  const recommendation = body.recommendation ? String(body.recommendation) : null
  if (!id || !name) return NextResponse.json({ error: "id dan name wajib" }, { status: 400 })
  await sql /* sql */`
    insert into diseases (id, name, serious, description, recommendation)
    values (${id}, ${name}, ${serious}, ${description}, ${recommendation})
  `
  return NextResponse.redirect(new URL("/admin/diseases", "http://localhost"))
}
