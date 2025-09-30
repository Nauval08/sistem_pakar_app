import { requireAdmin } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Symptom = { id: string; name: string; type: "boolean" | "severity"; help: string | null }

export default async function SymptomsPage() {
  await requireAdmin()
  const symptoms = await sql<Symptom[]> /* sql */`select id, name, type, help from symptoms order by id asc`
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Symptoms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-wrap items-end gap-2" action="/api/admin/symptoms" method="POST">
            <input name="id" placeholder="S01" className="w-24 rounded-md border p-2" />
            <input name="name" placeholder="Nama gejala" className="min-w-40 flex-1 rounded-md border p-2" />
            <select name="type" className="w-36 rounded-md border p-2">
              <option value="boolean">boolean</option>
              <option value="severity">severity</option>
            </select>
            <input name="help" placeholder="Bantuan (opsional)" className="min-w-40 flex-1 rounded-md border p-2" />
            <Button type="submit">Tambah</Button>
          </form>
          <div className="divide-y rounded-md border">
            {symptoms.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <div className="font-medium">
                    {s.id} — {s.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.type}
                    {s.help ? ` • ${s.help}` : ""}
                  </div>
                </div>
                <form action={`/api/admin/symptoms/${s.id}`} method="POST">
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
