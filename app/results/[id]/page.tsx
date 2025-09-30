import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type CaseRow = {
  id: string
  results: any
}

export default async function ResultPage({ params }: { params: { id: string } }) {
  const rows = await sql<CaseRow[]> /* sql */`select id, results from cases where id = ${params.id} limit 1`
  if (!rows[0]) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>Data tidak ditemukan.</p>
      </main>
    )
  }
  const results = (rows[0].results || []) as Array<{
    disease: { id: string; name: string; serious: boolean; recommendation: string | null; description: string | null }
    score: number
    matched_rules: Array<{ id: number; explanation: string | null }>
  }>

  const top3 = results.slice(0, 3)
  const seriousHit = top3.find((r) => r.disease.serious && r.score >= 0.6)

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-pretty text-2xl font-semibold">Hasil Diagnosa</h1>
        <p className="text-muted-foreground">Berikut kemungkinan diagnosis berdasarkan gejala yang Anda pilih.</p>
      </header>

      <div className="space-y-4">
        {top3.map((r, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{r.disease.name}</span>
                <Badge variant="secondary">{Math.round(r.score * 100)}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {r.disease.description ? <p className="text-sm text-muted-foreground">{r.disease.description}</p> : null}
              <div>
                <p className="text-sm font-medium">Kenapa sistem menyarankan ini?</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {r.matched_rules.map((mr) => (
                    <li key={mr.id}>{mr.explanation || `Rule #${mr.id} terpenuhi`}</li>
                  ))}
                </ul>
              </div>
              {r.disease.recommendation ? (
                <p className="text-sm">
                  Rekomendasi: <span className="text-muted-foreground">{r.disease.recommendation}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {seriousHit ? (
        <div className="mt-6 rounded-md border bg-accent p-4">
          <p className="text-pretty">
            Peringatan: Kemungkinan kondisi serius terdeteksi. Segera konsultasi ke dokter atau fasilitas kesehatan.
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <Link href="/diagnose">
          <Button variant="secondary">Diagnosa ulang</Button>
        </Link>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">Disclaimer: Hasil hanya alat bantu, bukan pengganti dokter.</p>
    </main>
  )
}
