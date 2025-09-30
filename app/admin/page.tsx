import { requireAdmin } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

async function getCounts() {
  const [sym] = await sql<{ count: string }[]> /* sql */`select count(*)::text as count from symptoms`
  const [dis] = await sql<{ count: string }[]> /* sql */`select count(*)::text as count from diseases`
  const [rls] = await sql<{ count: string }[]> /* sql */`select count(*)::text as count from rules`
  const [cases] = await sql<{ count: string }[]> /* sql */`select count(*)::text as count from cases`
  return {
    symptoms: sym?.count ?? "0",
    diseases: dis?.count ?? "0",
    rules: rls?.count ?? "0",
    cases: cases?.count ?? "0",
  }
}

export default async function AdminPage() {
  await requireAdmin()
  const counts = await getCounts()
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="text-muted-foreground">Kelola data gejala, penyakit, dan rules.</p>
        <form action="/api/admin/logout" method="POST" className="mt-3">
          <Button type="submit" variant="secondary">
            Logout
          </Button>
        </form>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Symptoms ({counts.symptoms})</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/admin/symptoms">
              <Button variant="secondary">Kelola</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Diseases ({counts.diseases})</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/admin/diseases">
              <Button variant="secondary">Kelola</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rules ({counts.rules})</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/admin/rules">
              <Button variant="secondary">Kelola</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cases ({counts.cases})</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/admin/cases">
              <Button variant="secondary">Lihat</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
