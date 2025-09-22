export async function generateTestFromJD(jdText: string, seniority: 'Junior'|'Intermédiaire'|'Senior'){
  // Anthropic Claude 3.x style REST call
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers: {
      'content-type':'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version':'2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        { role:'user', content: buildPrompt(jdText, seniority) }
      ]
    })
  })
  if(!res.ok) throw new Error('Claude API error: '+res.statusText)
  const data = await res.json()
  const text = data?.content?.[0]?.text || ''
  return JSON.parse(text)
}

function buildPrompt(jd: string, seniority: string){
  return `You are an assessment designer. Create a 25-minute pre-interview test tailored to the job description and seniority.
Return strict JSON with keys: questions (array of 6 objects: id,type,title,hint,choices?,variants:10 distinct versions per question), scoring (rubric per question), antiCheat (rules).
Job description:
${jd}
Seniority: ${seniority}.`
}
