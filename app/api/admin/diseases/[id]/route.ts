import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin()
  const form = await req.formData()
  const method = form.get("_method")
  if (method === "DELETE") {
    await sql /* sql */`delete from diseases where id = ${params.id}`
    return NextResponse.redirect(new URL("/admin/diseases", "http://localhost"))
  }
  return NextResponse.json({ error: "Unsupported" }, { status: 400 })
}
