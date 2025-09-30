# Expert System Web App (Cough Diagnosis)

Full-stack Next.js app with Neon (Postgres). Forward-chaining expert system for cough types using certainty factor combination.

Features:
- Landing page, diagnosis form, results (Top 3, scores, explanations, recommendations)
- Admin login (email/password), CRUD: symptoms, diseases, rules
- POST /api/diagnose endpoint with rate limiting
- Cases history saved server-side
- Soft blue/green theme, mobile-first, shadcn/ui

Environment:
- DATABASE_URL (from Neon integration)

Setup:
1) Run SQL migration in scripts/sql/001_init.sql (v0 can execute scripts directly).
2) Publish in Vercel from v0.

API:
- POST /api/diagnose
  Request:
  {
    "symptoms": { "S02":"medium", "S01":"low", "S07": true }
  }
  Response:
  {
    "case_id":"<uuid>",
    "results":[ { "disease": { "id":"D01","name":"..." }, "score": 0.74, "matched_rules":[...]} ]
  }

curl example:
curl -X POST http://localhost:3000/api/diagnose \
 -H "content-type: application/json" \
 -d '{"symptoms":{"S02":"medium","S01":"low"}}'

Security/Ethics:
- Disclaimer: Results are a tool, not a medical diagnosis.
- We avoid collecting sensitive data without consent.
