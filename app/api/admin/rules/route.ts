import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  await requireAdmin()
  const rows = await sql /* sql */`select id, disease_id, cf, conditions, explanation from rules order by id asc`
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
  const disease_id = String(body.disease_id ?? "").trim()
  const cf = Math.max(0, Math.min(1, Number.parseFloat(String(body.cf ?? "0"))))
  const explanation = body.explanation ? String(body.explanation) : null
  let conditions: any = {}
  try {
    conditions = JSON.parse(String(body.conditions ?? "{}"))
  } catch {
    return NextResponse.json({ error: "conditions harus JSON" }, { status: 400 })
  }
  if (!disease_id) return NextResponse.json({ error: "disease_id wajib" }, { status: 400 })
  await sql /* sql */`
    insert into rules (disease_id, cf, conditions, explanation)
    values (${disease_id}, ${cf}, ${JSON.stringify(conditions)}::jsonb, ${explanation})
  `
  return NextResponse.redirect(new URL("/admin/rules", "http://localhost"))
}
