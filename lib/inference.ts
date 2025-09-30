export type ConditionValue = boolean | "low" | "medium" | "high"
export type Conditions = Record<string, ConditionValue>

export type Rule = {
  id: number
  disease_id: string
  cf: number
  conditions: Conditions
  explanation: string | null
}

export type Disease = {
  id: string
  name: string
  description: string | null
  serious: boolean
  recommendation: string | null
}

export type InferenceResult = {
  disease: Disease
  score: number
  matched_rules: Rule[]
}

function matchesCondition(provided: ConditionValue | undefined, required: ConditionValue) {
  if (typeof required === "boolean") {
    return provided === required
  }
  // severity ordering
  const order = ["low", "medium", "high"]
  const pv = typeof provided === "string" ? provided : null
  if (!pv) return false
  // require at least the severity level
  return order.indexOf(pv) >= order.indexOf(required)
}

export function matchRule(conditions: Conditions, facts: Conditions) {
  for (const [symId, expected] of Object.entries(conditions)) {
    if (!matchesCondition(facts[symId], expected)) return false
  }
  return true
}

export function combineCF(cfs: number[]) {
  // combined = 1 - Π(1 - cf_i)
  return 1 - cfs.reduce((prod, cf) => prod * (1 - Math.max(0, Math.min(1, cf))), 1)
}

export function infer(rules: Rule[], diseasesById: Record<string, Disease>, facts: Conditions): InferenceResult[] {
  const byDisease: Record<string, { cfs: number[]; matched: Rule[] }> = Object.create(null)

  for (const r of rules) {
    if (matchRule(r.conditions, facts)) {
      if (!byDisease[r.disease_id]) byDisease[r.disease_id] = { cfs: [], matched: [] }
      byDisease[r.disease_id].cfs.push(r.cf)
      byDisease[r.disease_id].matched.push(r)
    }
  }

  const results: InferenceResult[] = []
  for (const [diseaseId, { cfs, matched }] of Object.entries(byDisease)) {
    const disease = diseasesById[diseaseId]
    if (!disease) continue
    const score = combineCF(cfs)
    results.push({ disease, score, matched_rules: matched })
  }

  results.sort((a, b) => b.score - a.score)
  return results
}
