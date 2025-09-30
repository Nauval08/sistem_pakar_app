import { requireAdmin } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Disease = { id: string; name: string; serious: boolean; description: string | null; recommendation: string | null }

export default async function DiseasesPage() {
  await requireAdmin()
  const diseases = await sql<Disease[]> /* sql */`
    select id, name, serious, description, recommendation from diseases order by id asc
  `
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diseases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-wrap items-end gap-2" action="/api/admin/diseases" method="POST">
            <input name="id" placeholder="D01" className="w-24 rounded-md border p-2" />
            <input name="name" placeholder="Nama penyakit" className="min-w-40 flex-1 rounded-md border p-2" />
            <select name="serious" className="w-28 rounded-md border p-2">
              <option value="false">Tidak serius</option>
              <option value="true">Serius</option>
            </select>
            <input name="description" placeholder="Deskripsi" className="min-w-40 flex-1 rounded-md border p-2" />
            <input name="recommendation" placeholder="Rekomendasi" className="min-w-40 flex-1 rounded-md border p-2" />
            <Button type="submit">Tambah</Button>
          </form>
          <div className="divide-y rounded-md border">
            {diseases.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <div className="font-medium">
                    {d.id} — {d.name} {d.serious ? "• Serius" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d.description || "-"} {d.recommendation ? `• ${d.recommendation}` : ""}
                  </div>
                </div>
                <form action={`/api/admin/diseases/${d.id}`} method="POST">
                  <input type="hidden" name="_method" value="DELETE" />
                  <Button variant="destructive">Hapus</Button>
                </form>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
