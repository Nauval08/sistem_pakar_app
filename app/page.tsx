import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-pretty text-3xl font-semibold md:text-4xl">Sistem Pakar Batuk</h1>
        <p className="mt-2 text-muted-foreground">
          Bantu identifikasi jenis batuk berdasarkan gejala menggunakan metode forward chaining dan certainty factor.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mulai Diagnosa</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-pretty">
            Jawab beberapa pertanyaan tentang gejala Anda untuk melihat kemungkinan diagnosis dan rekomendasi tindakan.
          </p>
          <Link href="/diagnose">
            <Button className="bg-primary text-primary-foreground">Mulai</Button>
          </Link>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        Disclaimer: Hasil hanya alat bantu, bukan pengganti dokter. Jika kondisi memburuk atau Anda curiga penyakit
        serius, segera kunjungi fasilitas kesehatan.
      </p>
    </main>
  )
}
