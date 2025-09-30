import { sql } from "@/lib/db"
import DiagnosisForm from "@/components/diagnosis-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Symptom = {
  id: string
  name: string
  type: "boolean" | "severity"
  help: string | null
}

export default async function DiagnosePage() {
  const rows = await sql<Symptom[]> /* sql */`
    select id, name, type, help from symptoms order by id asc
  `
  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <Card>
        <CardHeader>
          <CardTitle>Form Diagnosa</CardTitle>
        </CardHeader>
        <CardContent>
          <DiagnosisForm symptoms={rows} />
        </CardContent>
      </Card>
    </main>
  )
}
