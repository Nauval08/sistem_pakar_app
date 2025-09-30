"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Symptom = {
  id: string
  name: string
  type: "boolean" | "severity"
  help: string | null
}

export default function DiagnosisForm({ symptoms }: { symptoms: Symptom[] }) {
  const [values, setValues] = useState<Record<string, boolean | "low" | "medium" | "high">>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function setVal(id: string, v: boolean | "low" | "medium" | "high") {
    setValues((prev) => ({ ...prev, [id]: v }))
  }

  function applyQuickTips() {
    // Simple helper: pre-fill common cold/viral cough defaults as example
    const presets: Record<string, boolean | "low" | "medium" | "high"> = {}
    for (const s of symptoms) {
      if (s.type === "boolean") {
        presets[s.id] = false
      } else {
        presets[s.id] = "low"
      }
    }
    setValues(presets)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ symptoms: values }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || "Failed")
      }
      const data = await res.json()
      // redirect to results page with case_id
      router.push(`/results/${data.case_id}`)
    } catch (err) {
      console.error("[v0] diagnose submit error:", err)
      alert("Gagal memproses diagnosa. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" onClick={applyQuickTips}>
          Bantu pilih
        </Button>
        <p className="text-sm text-muted-foreground">Preset ringan (bisa diubah kapan saja)</p>
      </div>

      <TooltipProvider>
        <div className="grid grid-cols-1 gap-4">
          {symptoms.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{s.name}</Label>
                  {s.help ? (
                    <Tooltip>
                      <TooltipTrigger className="text-sm text-muted-foreground underline underline-offset-4">
                        bantuan
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-sm">{s.help}</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">ID: {s.id}</span>
              </div>

              <div className="shrink-0">
                {s.type === "boolean" ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={s.id}
                      checked={values[s.id] === true}
                      onCheckedChange={(v) => setVal(s.id, v === true)}
                    />
                    <Label htmlFor={s.id}>Ya</Label>
                  </div>
                ) : (
                  <Select
                    value={typeof values[s.id] === "string" ? (values[s.id] as string) : undefined}
                    onValueChange={(v) => setVal(s.id, v as "low" | "medium" | "high")}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Ringan</SelectItem>
                      <SelectItem value="medium">Sedang</SelectItem>
                      <SelectItem value="high">Berat</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
          {loading ? "Memproses..." : "Lihat Hasil"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Kami tidak menyimpan data sensitif tanpa persetujuan. Hasil bukan pengganti diagnosis dokter.
      </p>
    </form>
  )
}
