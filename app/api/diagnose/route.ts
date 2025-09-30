import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getClientIp, rateLimit } from "@/lib/rate-limit"
import { infer, type Disease, type Rule, type Conditions } from "@/lib/inference"

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`diagnose:${ip}`, 30, 60_000)
  if (!rl.ok) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "retry-after": String(Math.ceil((rl.retryAfterMs || 0) / 1000)) },
    })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const symptoms: Conditions = body?.symptoms || {}
  if (typeof symptoms !== "object" || Array.isArray(symptoms)) {
    return NextResponse.json({ error: "symptoms must be an object" }, { status: 400 })
  }

  // Load rules and diseases
  const rulesRows = await sql<
    { id: number; disease_id: string; cf: number; conditions: any; explanation: string | null }[]
  > /* sql */`select id, disease_id, cf, conditions, explanation from rules`
  const diseaseRows = await sql<
    { id: string; name: string; description: string | null; serious: boolean; recommendation: string | null }[]
  > /* sql */`select id, name, description, serious, recommendation from diseases`

  const diseasesById: Record<string, Disease> = Object.fromEntries(diseaseRows.map((d) => [d.id, d]))

  const rules: Rule[] = rulesRows.map((r) => ({
    ...r,
    conditions: r.conditions as Conditions,
  }))

  const results = infer(rules, diseasesById, symptoms)
  const top = results[0]

  // Save case
  const inserted = await sql<{ id: string }[]> /* sql */`
    insert into cases (symptoms, results, top_disease_id, top_score)
    values (${JSON.stringify(symptoms)}::jsonb,
            ${JSON.stringify(results)}::jsonb,
            ${top ? top.disease.id : null},
            ${top ? top.score : null})
    returning id
  `

  return NextResponse.json({
    case_id: inserted[0].id,
    results,
  })
}
