# Prompts
- `generateTestFromJD` asks Claude to return strict JSON including 10 true variants per question (no paraphrase), rubric per question, and anti-cheat rules.
- For safety: we parse JSON, sanitize, and store server-side only.
