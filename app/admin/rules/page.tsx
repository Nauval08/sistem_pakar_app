import { requireAdmin } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Rule = { id: number; disease_id: string; cf: number; conditions: any; explanation: string | null }
type Disease = { id: string; name: string }

export default async function RulesPage() {
  await requireAdmin()
  const rules = await sql<
    Rule[]
  > /* sql */`select id, disease_id, cf, conditions, explanation from rules order by id asc`
  const diseases = await sql<Disease[]> /* sql */`select id, name from diseases order by id asc`
  const symptoms = await sql<{ id: string; name: string }[]> /* sql */`select id, name from symptoms order by id asc`

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid grid-cols-1 gap-2 md:grid-cols-2" action="/api/admin/rules" method="POST">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Disease</span>
              <select name="disease_id" className="rounded-md border p-2">
                {diseases.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} — {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">CF (0..1)</span>
              <input name="cf" step="0.01" min="0" max="1" type="number" className="rounded-md border p-2" />
            </label>
            <label className="col-span-full flex flex-col gap-1">
              <span className="text-sm">Conditions JSON</span>
              <textarea
                name="conditions"
                className="min-h-28 rounded-md border p-2 font-mono text-sm"
                placeholder='{"S01": true, "S02": "high"}'
              />
              <span className="text-xs text-muted-foreground">
                Gunakan ID gejala berikut: {symptoms.map((s) => s.id).join(", ")}
              </span>
            </label>
            <label className="col-span-full flex flex-col gap-1">
              <span className="text-sm">Penjelasan (opsional)</span>
              <input name="explanation" className="rounded-md border p-2" />
            </label>
            <div className="col-span-full">
              <Button type="submit">Tambah Rule</Button>
            </div>
          </form>

          <div className="divide-y rounded-md border">
            {rules.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-4 p-3">
                <div className="min-w-0">
                  <div className="font-medium">
                    #{r.id} • {r.disease_id} • CF {r.cf}
                  </div>
                  <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                    {JSON.stringify(r.conditions, null, 2)}
                  </pre>
                  {r.explanation ? <div className="text-xs text-muted-foreground">Alasan: {r.explanation}</div> : null}
                </div>
                <form action={`/api/admin/rules/${r.id}`} method="POST">
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
